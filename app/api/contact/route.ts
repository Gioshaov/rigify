/**
 * Contact Form API Route
 *
 * Rate Limiting Setup (Production):
 * 1. In Vercel Dashboard → Project → Storage → Create Database
 * 2. Choose "Upstash Redis" (KV storage)
 * 3. Environment variables are auto-set: KV_REST_API_URL, KV_REST_API_TOKEN, etc.
 * 4. Redeploy to apply changes
 *
 * For local development without Redis:
 * - Rate limiting gracefully fails open (allows requests)
 * - Check console for "Rate limit check failed" errors
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { kv } from '@vercel/kv'

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 15 * 60 // 15 minutes in seconds

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rate-limit:contact:${ip}`

    // Increment atomically (avoids race condition with concurrent requests)
    const count = await kv.incr(key)

    // Set expiry on first increment (when count === 1)
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW)
    }

    // Check if over limit
    if (count > RATE_LIMIT) {
      return false
    }

    return true
  } catch (error) {
    // If Redis is unavailable, log error and allow request
    // Better to allow legitimate traffic than block everyone on Redis failure
    console.error('Rate limit check failed:', error)
    return true
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'

  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { name, business_name, phone, city, message } = body

  if (!name || !business_name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Basic input validation
  if (
    name.length > 100 ||
    business_name.length > 100 ||
    phone.length > 50 ||
    (city?.length ?? 0) > 100 ||
    (message?.length ?? 0) > 2000
  ) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  // Validate phone format (must start with + and have at least 10 digits)
  const phoneDigits = phone.replace(/\D/g, '')
  if (!phone.startsWith('+') || phoneDigits.length < 10) {
    return NextResponse.json(
      { error: 'Invalid phone format. Must start with + and contain at least 10 digits (e.g., +995555123456)' },
      { status: 400 }
    )
  }

  // Store lead in Supabase
  const admin = createAdminClient()
  const { error } = await admin.from('leads').insert({
    name: name.trim(),
    business_name: business_name.trim(),
    phone: phone.trim(),
    city,
    message: message?.trim() || null,
  })

  if (error) {
    console.error('Lead insert error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  // Optional: send yourself a WhatsApp or email notification here
  // e.g. POST to an n8n webhook with the lead data

  return NextResponse.json({ success: true })
}
