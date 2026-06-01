export type CategoryId = 'hair' | 'nails' | 'skin' | 'massage' | 'brows' | 'makeup' | 'barber';

export interface BusinessCategory {
  id: string;
  business_id: string;
  category_id: CategoryId;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  category: string; // Legacy: primary category
  city: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  salome_enabled: boolean;
  hours?: Record<string, any>;
  business_categories?: BusinessCategory[];
}

export interface StaffPermissions {
  id: string;
  staff_id: string;
  can_view_appointments: boolean;
  can_edit_appointments: boolean;
  can_view_customers: boolean;
  can_view_services: boolean;
  can_edit_services: boolean;
  can_view_staff: boolean;
  can_edit_staff: boolean;
  can_view_settings: boolean;
  can_edit_settings: boolean;
  can_view_salome: boolean;
  can_edit_salome: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  business_id: string;
  user_id?: string | null;
  name: string;
  role: 'staff' | 'manager';
  specialty?: string | null;
  is_active: boolean;
  staff_permissions?: StaffPermissions[];
}
