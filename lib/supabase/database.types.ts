export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          admin_email: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_email: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          appointment_datetime: string
          booking_source: string
          business_id: string
          call_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          duration_minutes: number
          end_datetime: string
          id: string
          notes: string | null
          price: number | null
          reschedule_count: number | null
          service_id: string | null
          staff_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_datetime: string
          booking_source: string
          business_id: string
          call_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          duration_minutes: number
          end_datetime: string
          id?: string
          notes?: string | null
          price?: number | null
          reschedule_count?: number | null
          service_id?: string | null
          staff_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_datetime?: string
          booking_source?: string
          business_id?: string
          call_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          duration_minutes?: number
          end_datetime?: string
          id?: string
          notes?: string | null
          price?: number | null
          reschedule_count?: number | null
          service_id?: string | null
          staff_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          business_id: string
          category_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          business_id: string
          category_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          business_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          address_ka: string | null
          category: string
          city: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          description_ka: string | null
          description_ru: string | null
          district: string | null
          email: string | null
          hours: Json | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_test: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          name_ka: string | null
          name_ru: string | null
          onboarded_by: string | null
          owner_id: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          salome_enabled: boolean | null
          salome_phone: string | null
          slug: string
          status: string | null
          subdomain: string | null
          updated_at: string | null
          vapi_agent_id: string | null
          website: string | null
        }
        Insert: {
          address: string
          address_ka?: string | null
          category: string
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ka?: string | null
          description_ru?: string | null
          district?: string | null
          email?: string | null
          hours?: Json | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          name_ka?: string | null
          name_ru?: string | null
          onboarded_by?: string | null
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          salome_enabled?: boolean | null
          salome_phone?: string | null
          slug: string
          status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          vapi_agent_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          address_ka?: string | null
          category?: string
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ka?: string | null
          description_ru?: string | null
          district?: string | null
          email?: string | null
          hours?: Json | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          name_ka?: string | null
          name_ru?: string | null
          onboarded_by?: string | null
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          salome_enabled?: boolean | null
          salome_phone?: string | null
          slug?: string
          status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          vapi_agent_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          has_used_emergency_cancel: boolean
          id: string
          name: string
          phone: string
          preferences: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          has_used_emergency_cancel?: boolean
          id: string
          name: string
          phone: string
          preferences?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          has_used_emergency_cancel?: boolean
          id?: string
          name?: string
          phone?: string
          preferences?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          business_name: string
          city: string | null
          created_at: string | null
          id: string
          message: string | null
          name: string
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_name: string
          city?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          city?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          business_id: string
          comment: string | null
          created_at: string | null
          customer_name: string
          id: string
          rating: number
        }
        Insert: {
          booking_id?: string | null
          business_id: string
          comment?: string | null
          created_at?: string | null
          customer_name: string
          id?: string
          rating: number
        }
        Update: {
          booking_id?: string | null
          business_id?: string
          comment?: string | null
          created_at?: string | null
          customer_name?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          name_ka: string | null
          name_ru: string | null
          price: number | null
          price_max: number | null
          price_min: number
          sort_order: number | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          name_ka?: string | null
          name_ru?: string | null
          price?: number | null
          price_max?: number | null
          price_min: number
          sort_order?: number | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          name_ka?: string | null
          name_ru?: string | null
          price?: number | null
          price_max?: number | null
          price_min?: number
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_id: string
          calendar_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ka: string | null
          role: string | null
          sort_order: number | null
          specialty: string | null
          specialty_ka: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_id: string
          calendar_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ka?: string | null
          role?: string | null
          sort_order?: number | null
          specialty?: string | null
          specialty_ka?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_id?: string
          calendar_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ka?: string | null
          role?: string | null
          sort_order?: number | null
          specialty?: string | null
          specialty_ka?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_permissions: {
        Row: {
          can_edit_appointments: boolean | null
          can_edit_salome: boolean | null
          can_edit_services: boolean | null
          can_edit_settings: boolean | null
          can_edit_staff: boolean | null
          can_view_appointments: boolean | null
          can_view_customers: boolean | null
          can_view_salome: boolean | null
          can_view_services: boolean | null
          can_view_settings: boolean | null
          can_view_staff: boolean | null
          created_at: string | null
          id: string
          staff_id: string
          updated_at: string | null
        }
        Insert: {
          can_edit_appointments?: boolean | null
          can_edit_salome?: boolean | null
          can_edit_services?: boolean | null
          can_edit_settings?: boolean | null
          can_edit_staff?: boolean | null
          can_view_appointments?: boolean | null
          can_view_customers?: boolean | null
          can_view_salome?: boolean | null
          can_view_services?: boolean | null
          can_view_settings?: boolean | null
          can_view_staff?: boolean | null
          created_at?: string | null
          id?: string
          staff_id: string
          updated_at?: string | null
        }
        Update: {
          can_edit_appointments?: boolean | null
          can_edit_salome?: boolean | null
          can_edit_services?: boolean | null
          can_edit_settings?: boolean | null
          can_edit_staff?: boolean | null
          can_view_appointments?: boolean | null
          can_view_customers?: boolean | null
          can_view_salome?: boolean | null
          can_view_services?: boolean | null
          can_view_settings?: boolean | null
          can_view_staff?: boolean | null
          created_at?: string | null
          id?: string
          staff_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_permissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          business_id: string
          calls_this_month: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          languages: string[] | null
          monthly_call_limit: number | null
          plan: string
          salome_enabled: boolean | null
          salome_plan: string | null
          status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          calls_this_month?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          languages?: string[] | null
          monthly_call_limit?: number | null
          plan: string
          salome_enabled?: boolean | null
          salome_plan?: string | null
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          calls_this_month?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          languages?: string[] | null
          monthly_call_limit?: number | null
          plan?: string
          salome_enabled?: boolean | null
          salome_plan?: string | null
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_booking_with_emergency_check: {
        Args: { p_booking_id: string; p_customer_id: string }
        Returns: {
          error_code: string
          error_message: string
          success: boolean
        }[]
      }
      get_business_id_from_storage_path: {
        Args: { path: string }
        Returns: string
      }
      get_operating_cities_count: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
