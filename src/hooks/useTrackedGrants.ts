import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface TrackedGrant {
  id: string;
  user_id: string;
  grant_name: string | null;
  grant_url: string | null;
  application_deadline: string | null;
  status: string | null;
  notes: string | null;
  funding_amount: number | null;
  eligibility_criteria: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Enhanced fields captured by extension (FREE features)
  opportunity_crux: string | null;
  application_data: any | null;
  confidence_scores: any | null;
  currency: string | null;
  funding_type: string | null;
  
  // Enhanced Analysis v2.0 fields (PREMIUM features)
  page_context: any | null;
  analysis_results: any | null;
  crux_summary: any | null;
  enhanced_analysis: boolean | null;
  analysis_version: string | null;
  data_quality_score: number | null;
}

export function useTrackedGrants() {
  const [grants, setGrants] = useState<TrackedGrant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch tracked grants
  const fetchGrants = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('tracked_grants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setGrants(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracked grants')
      console.error('Error fetching tracked grants:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new grant
  const addGrant = async (grant: Omit<TrackedGrant, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('tracked_grants')
        .insert({
          user_id: user.id,
          grant_name: grant.grant_name,
          grant_url: grant.grant_url,
          application_deadline: grant.application_deadline || null,
          status: grant.status || 'Interested',
          notes: grant.notes,
          funding_amount: grant.funding_amount,
          eligibility_criteria: grant.eligibility_criteria,
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setGrants(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add grant'
      setError(errorMessage)
      console.error('Error adding grant:', err)
      return { data: null, error: errorMessage }
    }
  }

  // Update grant
  const updateGrant = async (id: string, updates: Partial<TrackedGrant>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('tracked_grants')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setGrants(prev => 
        prev.map(grant => grant.id === id ? data : grant)
      )
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update grant'
      setError(errorMessage)
      console.error('Error updating grant:', err)
      return { data: null, error: errorMessage }
    }
  }

  // Delete grant
  const deleteGrant = async (id: string) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      setError(null)
      
      const { error } = await supabase
        .from('tracked_grants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setGrants(prev => prev.filter(grant => grant.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete grant'
      setError(errorMessage)
      console.error('Error deleting grant:', err)
      return { error: errorMessage }
    }
  }

  // Update grant status
  const updateStatus = async (id: string, status: string) => {
    return updateGrant(id, { status })
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchGrants()

    // Set up real-time subscription
    const channel = supabase
      .channel('tracked_grants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracked_grants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          
          if (payload.eventType === 'INSERT') {
            // New grant added
            setGrants(prev => [payload.new as TrackedGrant, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            // Grant updated
            setGrants(prev => 
              prev.map(grant => 
                grant.id === payload.new.id ? payload.new as TrackedGrant : grant
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // Grant deleted
            setGrants(prev => 
              prev.filter(grant => grant.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    grants,
    loading,
    error,
    addGrant,
    updateGrant,
    deleteGrant,
    updateStatus,
    refetch: fetchGrants,
  }
}
