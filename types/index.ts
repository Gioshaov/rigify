export interface BusinessHours {
  [day: string]: { open: string; close: string } | null;
}

export interface Business {
  id: string;
  owner_id?: string | null;
  slug: string;
  name: string;
  name_ka?: string | null;
  name_ru?: string | null;
  description?: string | null;
  description_ka?: string | null;
  description_ru?: string | null;
  category: string;
  city: string;
  district?: string | null;
  address: string;
  address_ka?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  cover_image_url?: string | null;
  logo_url?: string | null;
  hours: BusinessHours;
  is_active: boolean;
  salome_enabled: boolean;
  salome_phone?: string | null;
  vapi_agent_id?: string | null;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  services?: Service[];
  staff?: StaffMember[];
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  name_ka?: string | null;
  name_ru?: string | null;
  description?: string | null;
  category?: string | null;
  duration_minutes: number;
  price_min: number;
  price_max?: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface StaffMember {
  id: string;
  business_id: string;
  name: string;
  name_ka?: string | null;
  specialty?: string | null;
  specialty_ka?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  calendar_id?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";
export type BookingSource = "web" | "voice" | "instagram" | "facebook";

export interface Booking {
  id: string;
  business_id: string;
  service_id: string | null;
  staff_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  appointment_datetime: string;
  duration_minutes: number;
  end_datetime: string;
  status: BookingStatus;
  booking_source: BookingSource;
  call_id?: string | null;
  notes?: string | null;
  price?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  booking_id?: string | null;
  customer_name: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export type SubscriptionPlan = "starter" | "growth" | "clinic";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";

export interface Subscription {
  id: string;
  business_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  salome_enabled: boolean;
  salome_plan?: "basic" | "standard" | null;
  languages: string[];
  monthly_call_limit?: number | null;
  calls_this_month: number;
}

export type Locale = "ka" | "en" | "ru";
