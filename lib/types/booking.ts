export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type DayHours = {
  open: string
  close: string
  closed?: boolean
}

export type BusinessHours = Partial<Record<DayOfWeek, DayHours>> | null

export type Service = {
  id: string
  business_id: string
  name: string
  duration_minutes: number
  price: number
  description: string | null
  is_active: boolean
  created_at: string
}

export type Staff = {
  id: string
  business_id: string
  name: string
  email: string
  specialty: string | null
  is_active: boolean
  created_at: string
}

export type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  preferences: any
  created_at: string
}

export type Booking = {
  id: string
  business_id: string
  service_id: string
  staff_id: string | null
  customer_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  appointment_datetime: string
  end_datetime: string
  duration_minutes: number
  status: 'confirmed' | 'cancelled' | 'completed'
  price: number
  booking_source: 'web' | 'voice' | 'instagram' | 'facebook'
  call_id: string | null
  created_at: string
}
