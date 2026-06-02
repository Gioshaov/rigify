import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, business_name, phone, city, message } = body

  if (!name || !business_name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Store lead in Supabase
  const admin = createAdminClient()
  const { error } = await admin.from('leads').insert({
    name,
    business_name,
    phone,
    city,
    message,
  })

  if (error) {
    console.error('Lead insert error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  // Optional: send yourself a WhatsApp or email notification here
  // e.g. POST to an n8n webhook with the lead data

  return NextResponse.json({ success: true })
}
