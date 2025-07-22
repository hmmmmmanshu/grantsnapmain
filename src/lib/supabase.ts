import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export interface Database {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string
          user_id: string
          status: 'To Review' | 'In Progress' | 'Applied'
          page_title: string
          funder_name: string
          page_url: string
          application_deadline: string
          date_saved: string
          user_notes: string
          extracted_emails: string[]
          type: 'grant' | 'investor'
          funding_amount?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'To Review' | 'In Progress' | 'Applied'
          page_title: string
          funder_name: string
          page_url: string
          application_deadline: string
          date_saved?: string
          user_notes?: string
          extracted_emails?: string[]
          type: 'grant' | 'investor'
          funding_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'To Review' | 'In Progress' | 'Applied'
          page_title?: string
          funder_name?: string
          page_url?: string
          application_deadline?: string
          date_saved?: string
          user_notes?: string
          extracted_emails?: string[]
          type?: 'grant' | 'investor'
          funding_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          startup_name?: string
          one_line_pitch?: string
          problem_statement?: string
          solution_description?: string
          target_market?: string
          team_description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          startup_name?: string
          one_line_pitch?: string
          problem_statement?: string
          solution_description?: string
          target_market?: string
          team_description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_name?: string
          one_line_pitch?: string
          problem_statement?: string
          solution_description?: string
          target_market?: string
          team_description?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_documents: {
        Row: {
          id: string
          user_id: string
          document_name?: string
          storage_path?: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_name?: string
          storage_path?: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_name?: string
          storage_path?: string
          uploaded_at?: string
        }
      }
      tracked_grants: {
        Row: {
          id: string
          user_id: string
          grant_name?: string
          application_deadline?: string
          status?: string
          grant_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grant_name?: string
          application_deadline?: string
          status?: string
          grant_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grant_name?: string
          application_deadline?: string
          status?: string
          grant_url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 