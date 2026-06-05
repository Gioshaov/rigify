import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Simple in-memory rate limiting (5 attempts per IP per 15 minutes)
// NOTE: This is for staging only. On serverless platforms (Vercel), this map
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

function createCookieValue(secret: string): string {
  return crypto.createHmac('sha256', secret).update('rigify_access').digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
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

    const correctPassword = process.env.SITE_PASSWORD;

    if (!correctPassword) {
      console.error('SITE_PASSWORD environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Timing-safe password comparison (pad both to max length to prevent length oracle)
    const maxLen = Math.max(password.length, correctPassword.length);
    const passwordBuf = Buffer.alloc(maxLen);
    const correctBuf = Buffer.alloc(maxLen);
    passwordBuf.write(password);
    correctBuf.write(correctPassword);

    const isValid = crypto.timingSafeEqual(passwordBuf, correctBuf) &&
                    password.length === correctPassword.length;

    if (isValid) {
      const cookieStore = await cookies();
      const cookieValue = createCookieValue(correctPassword);

      cookieStore.set('rigify_access', cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days - intentional for staging environment
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
