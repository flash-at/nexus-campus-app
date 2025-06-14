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
      academic_info: {
        Row: {
          cgpa: number | null
          created_at: string | null
          current_semester: number | null
          id: string
          mentor_email: string | null
          mentor_name: string | null
          subjects_enrolled: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cgpa?: number | null
          created_at?: string | null
          current_semester?: number | null
          id?: string
          mentor_email?: string | null
          mentor_name?: string | null
          subjects_enrolled?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cgpa?: number | null
          created_at?: string | null
          current_semester?: number | null
          id?: string
          mentor_email?: string | null
          mentor_name?: string | null
          subjects_enrolled?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_allocations: {
        Row: {
          allocated_at: string | null
          allocated_by: string | null
          club_id: string | null
          id: string
          points: number
          reason: string | null
          student_id: string | null
        }
        Insert: {
          allocated_at?: string | null
          allocated_by?: string | null
          club_id?: string | null
          id?: string
          points: number
          reason?: string | null
          student_id?: string | null
        }
        Update: {
          allocated_at?: string | null
          allocated_by?: string | null
          club_id?: string | null
          id?: string
          points?: number
          reason?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_allocations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_applications: {
        Row: {
          approved_at: string | null
          business_name: string
          category: string
          created_at: string
          description: string
          email: string
          full_name: string
          id: string
          phone_number: string
          rejected_at: string | null
          rejection_reason: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          business_name: string
          category: string
          created_at?: string
          description: string
          email: string
          full_name: string
          id?: string
          phone_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Relationships: []
      }
      club_memberships: {
        Row: {
          club_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          category: string | null
          chair_id: string | null
          created_at: string | null
          description: string | null
          id: string
          max_members: number | null
          name: string
          password: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          chair_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          password: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          chair_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          password?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_chair_id_fkey"
            columns: ["chair_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          doc_type: string
          doc_url: string
          file_name: string
          id: string
          updated_at: string | null
          user_id: string
          verified_by_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          doc_url: string
          file_name: string
          id?: string
          updated_at?: string | null
          user_id: string
          verified_by_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          doc_url?: string
          file_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          verified_by_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement: {
        Row: {
          activity_points: number | null
          badges: Json | null
          created_at: string | null
          events_attended: string[] | null
          feedback_count: number | null
          id: string
          last_login: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_points?: number | null
          badges?: Json | null
          created_at?: string | null
          events_attended?: string[] | null
          feedback_count?: number | null
          id?: string
          last_login?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_points?: number | null
          badges?: Json | null
          created_at?: string | null
          events_attended?: string[] | null
          feedback_count?: number | null
          id?: string
          last_login?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          location: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          decline_reason: string | null
          estimated_pickup: string | null
          id: string
          items: Json
          payment_method: string
          service_type: string
          status: string
          subtotal: number
          surge_fee: number
          total: number
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          decline_reason?: string | null
          estimated_pickup?: string | null
          id?: string
          items: Json
          payment_method?: string
          service_type: string
          status?: string
          subtotal: number
          surge_fee?: number
          total: number
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          decline_reason?: string | null
          estimated_pickup?: string | null
          id?: string
          items?: Json
          payment_method?: string
          service_type?: string
          status?: string
          subtotal?: number
          surge_fee?: number
          total?: number
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      preferences: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: Database["public"]["Enums"]["theme_type"] | null
          updated_at: string | null
          user_id: string
          widgets_enabled: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: Database["public"]["Enums"]["theme_type"] | null
          updated_at?: string | null
          user_id: string
          widgets_enabled?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: Database["public"]["Enums"]["theme_type"] | null
          updated_at?: string | null
          user_id?: string
          widgets_enabled?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          academic_year: string
          created_at: string | null
          department: string
          email: string
          email_verified: boolean | null
          firebase_uid: string
          full_name: string
          hall_ticket: string
          id: string
          is_active: boolean | null
          phone_number: string
          profile_picture_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          department: string
          email: string
          email_verified?: boolean | null
          firebase_uid: string
          full_name: string
          hall_ticket: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          profile_picture_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          department?: string
          email?: string
          email_verified?: boolean | null
          firebase_uid?: string
          full_name?: string
          hall_ticket?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          profile_picture_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          approved_at: string | null
          business_name: string
          category: string
          created_at: string | null
          description: string | null
          firebase_uid: string
          id: string
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          business_name: string
          category: string
          created_at?: string | null
          description?: string | null
          firebase_uid: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          business_name?: string
          category?: string
          created_at?: string | null
          description?: string | null
          firebase_uid?: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      theme_type: "Light" | "Dark" | "System"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      theme_type: ["Light", "Dark", "System"],
    },
  },
} as const
