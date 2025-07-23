import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_team_recommendations: {
        Row: {
          ai_generated_at: string | null
          created_at: string | null
          description: string
          id: string
          implemented_at: string | null
          priority: string | null
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          implemented_at?: string | null
          priority?: string | null
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          implemented_at?: string | null
          priority?: string | null
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          ai_recommendations: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          grant_deadline_reminders: boolean | null
          id: string
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_frequency: string | null
          team_updates: boolean | null
          updated_at: string | null
          user_id: string | null
          weekly_summary: boolean | null
        }
        Insert: {
          ai_recommendations?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          grant_deadline_reminders?: boolean | null
          id?: string
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_frequency?: string | null
          team_updates?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weekly_summary?: boolean | null
        }
        Update: {
          ai_recommendations?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          grant_deadline_reminders?: boolean | null
          id?: string
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_frequency?: string | null
          team_updates?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_deadline: string
          created_at: string | null
          date_saved: string | null
          extracted_emails: string[] | null
          funder_name: string
          funding_amount: number | null
          id: string
          page_title: string
          page_url: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          application_deadline: string
          created_at?: string | null
          date_saved?: string | null
          extracted_emails?: string[] | null
          funder_name: string
          funding_amount?: number | null
          id?: string
          page_title: string
          page_url: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          application_deadline?: string
          created_at?: string | null
          date_saved?: string | null
          extracted_emails?: string[] | null
          funder_name?: string
          funding_amount?: number | null
          id?: string
          page_title?: string
          page_url?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      team_member_skills: {
        Row: {
          created_at: string | null
          id: string
          is_primary_skill: boolean | null
          proficiency_level: number | null
          skill_id: string | null
          team_member_id: string | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary_skill?: boolean | null
          proficiency_level?: number | null
          skill_id?: string | null
          team_member_id?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary_skill?: boolean | null
          proficiency_level?: number | null
          skill_id?: string | null
          team_member_id?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_skills_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          github_url: string | null
          id: string
          is_active: boolean | null
          joined_date: string | null
          linkedin_url: string | null
          name: string
          portfolio_url: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          github_url?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          linkedin_url?: string | null
          name: string
          portfolio_url?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          github_url?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          linkedin_url?: string | null
          name?: string
          portfolio_url?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      team_project_assignments: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          hours_allocated: number | null
          id: string
          is_lead: boolean | null
          responsibilities: string | null
          role: string
          team_member_id: string | null
          team_project_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          hours_allocated?: number | null
          id?: string
          is_lead?: boolean | null
          responsibilities?: string | null
          role: string
          team_member_id?: string | null
          team_project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          hours_allocated?: number | null
          id?: string
          is_lead?: boolean | null
          responsibilities?: string | null
          role?: string
          team_member_id?: string | null
          team_project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_project_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_project_assignments_team_project_id_fkey"
            columns: ["team_project_id"]
            isOneToOne: false
            referencedRelation: "team_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          opportunity_id: string | null
          project_name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          opportunity_id?: string | null
          project_name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          opportunity_id?: string | null
          project_name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_projects_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_grants: {
        Row: {
          application_deadline: string | null
          created_at: string | null
          grant_name: string | null
          grant_url: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_deadline?: string | null
          created_at?: string | null
          grant_name?: string | null
          grant_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_deadline?: string | null
          created_at?: string | null
          grant_name?: string | null
          grant_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          document_name: string | null
          id: string
          storage_path: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          document_name?: string | null
          id?: string
          storage_path?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          document_name?: string | null
          id?: string
          storage_path?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          one_line_pitch: string | null
          problem_statement: string | null
          solution_description: string | null
          startup_name: string | null
          target_market: string | null
          team_description: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          one_line_pitch?: string | null
          problem_statement?: string | null
          solution_description?: string | null
          startup_name?: string | null
          target_market?: string | null
          team_description?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          one_line_pitch?: string | null
          problem_statement?: string | null
          solution_description?: string | null
          startup_name?: string | null
          target_market?: string | null
          team_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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