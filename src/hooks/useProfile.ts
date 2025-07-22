import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface UserProfile {
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

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
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

  // Create or update profile
  const saveProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      let result

      if (profile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            company_name: profileData.company_name || '',
            ...profileData,
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      setProfile(result)
      return { data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile'
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
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  return {
    profile,
    loading,
    error,
    saveProfile,
    uploadFile,
    refetch: fetchProfile,
  }
} 