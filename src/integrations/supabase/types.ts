export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auth_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          backup_date: string
          backup_name: string
          backup_size: number | null
          created_by: string | null
          details: Json | null
          id: string
          status: string
        }
        Insert: {
          backup_date?: string
          backup_name: string
          backup_size?: number | null
          created_by?: string | null
          details?: Json | null
          id?: string
          status: string
        }
        Update: {
          backup_date?: string
          backup_name?: string
          backup_size?: number | null
          created_by?: string | null
          details?: Json | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      booking_attendees: {
        Row: {
          booking_id: string
          id: string
          status: Database["public"]["Enums"]["attendee_status"]
          user_id: string
        }
        Insert: {
          booking_id: string
          id?: string
          status?: Database["public"]["Enums"]["attendee_status"]
          user_id: string
        }
        Update: {
          booking_id?: string
          id?: string
          status?: Database["public"]["Enums"]["attendee_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_attendees_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          recurring_id: string | null
          room_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          recurring_id?: string | null
          room_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          recurring_id?: string | null
          room_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_recurring_id_fkey"
            columns: ["recurring_id"]
            isOneToOne: false
            referencedRelation: "recurring_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_messages: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          message: string | null
          sender_id: number | null
          type: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          message?: string | null
          sender_id?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          message?: string | null
          sender_id?: number | null
          type?: string | null
        }
        Relationships: []
      }
      directory_integrations: {
        Row: {
          config: Json
          created_at: string | null
          enabled: boolean | null
          id: string
          last_sync: string | null
          provider: string
          sync_interval: number | null
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_sync?: string | null
          provider: string
          sync_interval?: number | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_sync?: string | null
          provider?: string
          sync_interval?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jwt_claim_mappings: {
        Row: {
          created_at: string | null
          directory_attribute: string
          id: string
          is_active: boolean | null
          jwt_claim: string
          transform_function: string | null
        }
        Insert: {
          created_at?: string | null
          directory_attribute: string
          id?: string
          is_active?: boolean | null
          jwt_claim: string
          transform_function?: string | null
        }
        Update: {
          created_at?: string | null
          directory_attribute?: string
          id?: string
          is_active?: boolean | null
          jwt_claim?: string
          transform_function?: string | null
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          created_at: string | null
          is_enabled: boolean | null
          methods: Json | null
          recovery_codes: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          is_enabled?: boolean | null
          methods?: Json | null
          recovery_codes?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          is_enabled?: boolean | null
          methods?: Json | null
          recovery_codes?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          delivery_methods: Json
          enabled: boolean
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_methods?: Json
          enabled?: boolean
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_methods?: Json
          enabled?: boolean
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          is_read: boolean
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_patterns: {
        Row: {
          days_of_week: Json | null
          end_date: string | null
          exception_dates: Json | null
          id: string
          interval: number
          occurrence_count: number | null
          pattern_type: Database["public"]["Enums"]["pattern_type"]
          start_date: string
          user_id: string
        }
        Insert: {
          days_of_week?: Json | null
          end_date?: string | null
          exception_dates?: Json | null
          id?: string
          interval?: number
          occurrence_count?: number | null
          pattern_type: Database["public"]["Enums"]["pattern_type"]
          start_date: string
          user_id: string
        }
        Update: {
          days_of_week?: Json | null
          end_date?: string | null
          exception_dates?: Json | null
          id?: string
          interval?: number
          occurrence_count?: number | null
          pattern_type?: Database["public"]["Enums"]["pattern_type"]
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      report_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          report_id: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          report_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_data_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_favorites: {
        Row: {
          created_at: string | null
          id: string
          report_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          report_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_favorites_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_history: {
        Row: {
          id: string
          report_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          report_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          report_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_shares: {
        Row: {
          access_level: string | null
          id: string
          report_id: string | null
          shared_at: string | null
          shared_by: string | null
          shared_with: string | null
        }
        Insert: {
          access_level?: string | null
          id?: string
          report_id?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_with?: string | null
        }
        Update: {
          access_level?: string | null
          id?: string
          report_id?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_shares_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          category: string
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          config: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_run_at: string | null
          name: string
          parameters: Json | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_run_at?: string | null
          name: string
          parameters?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_run_at?: string | null
          name?: string
          parameters?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      room_amenities: {
        Row: {
          amenity_id: string
          id: string
          room_id: string
          status: Database["public"]["Enums"]["amenity_status"]
        }
        Insert: {
          amenity_id: string
          id?: string
          room_id: string
          status?: Database["public"]["Enums"]["amenity_status"]
        }
        Update: {
          amenity_id?: string
          id?: string
          room_id?: string
          status?: Database["public"]["Enums"]["amenity_status"]
        }
        Relationships: [
          {
            foreignKeyName: "room_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_amenities_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          floor: string | null
          id: string
          image_url: string | null
          name: string
          number: string | null
          status: Database["public"]["Enums"]["room_status"]
        }
        Insert: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          floor?: string | null
          id?: string
          image_url?: string | null
          name: string
          number?: string | null
          status?: Database["public"]["Enums"]["room_status"]
        }
        Update: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          floor?: string | null
          id?: string
          image_url?: string | null
          name?: string
          number?: string | null
          status?: Database["public"]["Enums"]["room_status"]
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          export_format: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          recipients: Json | null
          report_id: string | null
          time_of_day: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          export_format?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          recipients?: Json | null
          report_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          export_format?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          recipients?: Json | null
          report_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health: {
        Row: {
          category: string
          details: Json | null
          id: string
          last_check: string
          status: string
        }
        Insert: {
          category: string
          details?: Json | null
          id?: string
          last_check?: string
          status: string
        }
        Update: {
          category?: string
          details?: Json | null
          id?: string
          last_check?: string
          status?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_role_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          password: string
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          password?: string
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          password?: string
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_booking_conflicts: {
        Args: {
          p_room_id: string
          p_start_time: string
          p_end_time: string
          p_booking_id?: string
        }
        Returns: {
          conflicting_booking_id: string
          title: string
          start_time: string
          end_time: string
          user_id: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_password_strength: {
        Args: {
          password: string
        }
        Returns: boolean
      }
    }
    Enums: {
      amenity_status: "available" | "unavailable"
      attendee_status: "invited" | "confirmed" | "declined"
      booking_status: "confirmed" | "cancelled" | "completed"
      notification_type:
        | "confirmation"
        | "reminder"
        | "cancellation"
        | "modification"
      pattern_type: "daily" | "weekly" | "monthly"
      room_status: "active" | "maintenance" | "inactive"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
