import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Simple in-memory rate limiter (5 requests per IP per 15 minutes)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  // Rate limiting by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'

  if (!checkRateLimit(ip)) {
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
