import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { calculateProfileCompletion } from '@/lib/profileUtils'

export interface Founder {
  id?: string
  founder_order: number
  full_name?: string
  title?: string
  email?: string
  phone?: string
  linkedin_url?: string
  twitter_handle?: string
  personal_website?: string
  github_url?: string
  background?: string
  work_experience?: string
  previous_startups?: string
  education_background?: string
  certifications?: string
  awards_recognition?: string
  cv_url?: string
  bio?: string
  personal_interests?: string
  languages_spoken?: string
  time_commitment?: string
  equity_percentage?: number
  is_primary_founder?: boolean
}

export interface UserProfile {
  id: string
  startup_name?: string
  one_line_pitch?: string
  problem_statement?: string
  solution_description?: string
  target_market?: string
  team_description?: string
  company_description?: string
  unique_value_proposition?: string
  mission_vision?: string
  pitch_deck_summary?: string
  elevator_pitch?: string
  standard_abstract?: string
  detailed_summary?: string
  impact?: string
  industry?: string
  competitors?: string
  traction?: string
  team_size?: string
  funding_stage?: string
  revenue_range?: string
  funding_goal?: string
  previous_funding?: string
  use_of_funds?: string
  demo_video?: string
  linkedin?: string
  press_kit?: string
  
  // Social Media & Online Presence
  website_url?: string
  twitter_handle?: string
  facebook_url?: string
  instagram_handle?: string
  youtube_channel?: string
  tiktok_handle?: string
  github_url?: string
  medium_url?: string
  substack_url?: string
  personal_website?: string
  
  // Company Details & Legal (Enhanced for International Support)
  company_website?: string
  business_registration_number?: string
  year_founded?: number
  number_of_employees?: number
  headquarters_location?: string
  legal_structure?: string
  incorporation_country?: string
  incorporation_date?: string
  tax_id?: string
  business_license?: string
  
  // International Incorporation Details
  incorporation_type?: string
  incorporation_state?: string
  incorporation_city?: string
  business_type?: string
  registration_authority?: string
  registration_number?: string
  pan_number?: string
  gst_number?: string
  cin_number?: string
  llp_number?: string
  partnership_deed_number?: string
  sole_proprietorship_number?: string
  foreign_registration_number?: string
  foreign_registration_country?: string
  foreign_registration_date?: string
  foreign_tax_id?: string
  foreign_business_license?: string
  compliance_status?: string
  regulatory_approvals?: string
  industry_licenses?: string
  export_import_license?: string
  fssai_license?: string
  drug_license?: string
  telecom_license?: string
  financial_services_license?: string
  insurance_license?: string
  real_estate_license?: string
  education_license?: string
  healthcare_license?: string
  technology_license?: string
  manufacturing_license?: string
  retail_license?: string
  service_license?: string
  other_licenses?: string
  
  // Financial Information
  annual_revenue?: string
  monthly_revenue?: string
  burn_rate?: string
  runway_months?: number
  total_funding_raised?: string
  last_valuation?: string
  revenue_model?: string
  pricing_strategy?: string
  financial_projections?: string
  key_metrics?: string
  
  // Founder Background & Experience
  founder_full_name?: string
  founder_title?: string
  founder_email?: string
  founder_phone?: string
  founder_linkedin?: string
  founder_twitter?: string
  founder_background?: string
  previous_startups?: string
  work_experience?: string
  education_background?: string
  certifications?: string
  awards_recognition?: string
  cv_url?: string
  founder_bio?: string
  personal_interests?: string
  languages_spoken?: string
  time_commitment?: string
  co_founders?: string
  
  // Product & Technology
  product_name?: string
  product_description?: string
  technology_stack?: string
  development_stage?: string
  mvp_status?: string
  beta_testers?: number
  user_feedback?: string
  product_roadmap?: string
  intellectual_property?: string
  patents?: string
  trademarks?: string
  copyrights?: string
  trade_secrets?: string
  technical_challenges?: string
  scalability_plan?: string
  
  // Market & Competition
  market_size?: string
  target_customers?: string
  customer_personas?: string
  customer_validation?: string
  market_research?: string
  competitive_analysis?: string
  market_entry_strategy?: string
  go_to_market_plan?: string
  sales_strategy?: string
  marketing_strategy?: string
  customer_acquisition_cost?: string
  lifetime_value?: string
  market_trends?: string
  regulatory_environment?: string
  
  // Team & Advisors
  key_team_members?: string
  advisors?: string
  mentors?: string
  board_members?: string
  investors?: string
  strategic_partners?: string
  hiring_plan?: string
  team_culture?: string
  remote_work_policy?: string
  equity_distribution?: string
  
  // Documents & Resources
  pitch_deck_url?: string
  business_plan_url?: string
  financial_model_url?: string
  market_research_url?: string
  legal_documents_url?: string
  press_kit_url?: string
  case_studies_url?: string
  testimonials_url?: string
  product_demo_url?: string
  investor_deck_url?: string
  
  // Additional Context Fields
  accelerator_programs_applied?: string
  accelerator_programs_accepted?: string
  grant_history?: string
  awards_won?: string
  press_mentions?: string
  media_coverage?: string
  speaking_engagements?: string
  publications?: string
  blog_posts?: string
  podcast_appearances?: string
  
  completion_percentage?: number
  created_at: string
  updated_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch profile
  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  // Fetch founders
  const fetchFounders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', user.id)
        .order('founder_order', { ascending: true })

      if (error) throw error
      setFounders(data || [])
    } catch (err) {
      console.error('Failed to fetch founders:', err)
      setFounders([])
    }
  }

  // Save founder
  const saveFounder = async (founderData: Partial<Founder>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      let result

      if (founderData.id) {
        // Update existing founder
        const { data, error } = await supabase
          .from('founders')
          .update({
            ...founderData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', founderData.id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new founder
        const { data, error } = await supabase
          .from('founders')
          .insert({
            user_id: user.id,
            ...founderData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Refresh founders list
      await fetchFounders()
      return { data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save founder'
      return { error: errorMessage }
    }
  }

  // Delete founder
  const deleteFounder = async (founderId: string) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('founders')
        .delete()
        .eq('id', founderId)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh founders list
      await fetchFounders()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete founder'
      return { error: errorMessage }
    }
  }

  // Create or update profile
  const saveProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      // Calculate completion percentage for the updated profile
      const tempProfile = { ...profile, ...profileData } as UserProfile
      const completion = calculateProfileCompletion(tempProfile)
      
      // Clean the data to ensure only valid fields are sent
      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([key, value]) => {
          // Only include fields that have actual values and are not undefined
          return value !== undefined && value !== null && value !== ''
        })
      )
      
      console.log('🔍 Saving profile data:', cleanedData)
      
      let result

      if (profile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...cleanedData,
            completion_percentage: completion.percentage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
          .select()
          .single()

        if (error) {
          console.error('❌ Profile update error:', error)
          throw error
        }
        result = data
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id, // Use user.id as the primary key
            ...cleanedData,
            completion_percentage: completion.percentage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Profile creation error:', error)
          throw error
        }
        result = data
      }

      setProfile(result)
      return { data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile'
      console.error('❌ Profile save error:', err)
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Upload file and get URL
  const uploadFile = async (file: File, bucket: string = 'documents') => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return { url: publicUrl }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
      return { error: errorMessage }
    }
  }

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchFounders()
    } else {
      setProfile(null)
      setFounders([])
      setLoading(false)
    }
  }, [user])

  return {
    profile,
    founders,
    loading,
    error,
    saveProfile,
    saveFounder,
    deleteFounder,
    uploadFile,
    refetch: fetchProfile,
    refetchFounders: fetchFounders,
  }
} 