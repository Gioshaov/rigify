import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Simple in-memory rate limiting (5 attempts per IP per 15 minutes)
// NOTE: This is for preview/staging only. On serverless platforms (Vercel), this map
// resets on cold starts and is per-function-instance, so rate limiting is not
// guaranteed across different workers. For production, use external storage
// (Upstash Redis, Vercel KV, etc.)
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { attempts: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  record.attempts++;
  return true;
}

// Create HMAC-based cookie value (Node.js crypto - runs in Node runtime)
// NOTE: This uses Node.js crypto because API routes run in Node Runtime.
// The middleware uses Web Crypto API (see middleware.ts).
// Both implementations produce identical SHA-256 hex output - verified in tests.
// If you modify this function, update the middleware version to match.
function createCookieValue(secret: string): string {
  return crypto.createHmac('sha256', secret).update('rigify_admin_access').digest('hex');
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - extract leftmost IP from x-forwarded-for to prevent bypass
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    if (!checkRateLimit(ip)) {
      console.warn(`Admin password rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    // Validate input
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Prevent DoS via oversized password submissions
    if (password.length > 1024) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const correctPassword = process.env.ADMIN_PREVIEW_PASSWORD;

    if (!correctPassword) {
      console.error('ADMIN_PREVIEW_PASSWORD environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Timing-safe password comparison (use byte length to handle multibyte characters correctly)
    const pwBytes = Buffer.from(password, 'utf8');
    const cpBytes = Buffer.from(correctPassword, 'utf8');
    const maxLen = Math.max(pwBytes.length, cpBytes.length);
    const passwordBuf = Buffer.alloc(maxLen);
    const correctBuf = Buffer.alloc(maxLen);
    pwBytes.copy(passwordBuf);
    cpBytes.copy(correctBuf);

    const isValid = crypto.timingSafeEqual(passwordBuf, correctBuf) &&
                    pwBytes.length === cpBytes.length;

    if (isValid) {
      const cookieStore = await cookies();
      const cookieValue = createCookieValue(correctPassword);

      cookieStore.set('rigify_admin_access', cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Admin panel has no cross-site flows, strict is appropriate
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? 'admin.rigify.ge' : undefined, // Scope to admin subdomain only
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin password verification error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
