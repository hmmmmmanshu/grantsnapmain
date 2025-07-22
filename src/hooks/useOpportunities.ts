import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Opportunity } from '@/types/dashboard'
import { useAuth } from './useAuth'

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch opportunities
  const fetchOpportunities = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match our Opportunity type
      const transformedData: Opportunity[] = data.map(item => ({
        id: item.id,
        status: item.status,
        page_title: item.page_title,
        funder_name: item.funder_name,
        page_url: item.page_url,
        application_deadline: item.application_deadline,
        date_saved: item.date_saved,
        user_notes: item.user_notes || '',
        extracted_emails: item.extracted_emails || [],
        type: item.type,
        funding_amount: item.funding_amount,
      }))

      setOpportunities(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities')
    } finally {
      setLoading(false)
    }
  }

  // Add new opportunity
  const addOpportunity = async (opportunity: Omit<Opportunity, 'id' | 'date_saved'>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          user_id: user.id,
          status: opportunity.status,
          page_title: opportunity.page_title,
          funder_name: opportunity.funder_name,
          page_url: opportunity.page_url,
          application_deadline: opportunity.application_deadline,
          date_saved: new Date().toISOString(),
          user_notes: opportunity.user_notes,
          extracted_emails: opportunity.extracted_emails,
          type: opportunity.type,
          funding_amount: opportunity.funding_amount,
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      const newOpportunity: Opportunity = {
        id: data.id,
        status: data.status,
        page_title: data.page_title,
        funder_name: data.funder_name,
        page_url: data.page_url,
        application_deadline: data.application_deadline,
        date_saved: data.date_saved,
        user_notes: data.user_notes || '',
        extracted_emails: data.extracted_emails || [],
        type: data.type,
        funding_amount: data.funding_amount,
      }

      setOpportunities(prev => [newOpportunity, ...prev])
      return { data: newOpportunity }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add opportunity'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Update opportunity
  const updateOpportunity = async (id: string, updates: Partial<Opportunity>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      const updatedOpportunity: Opportunity = {
        id: data.id,
        status: data.status,
        page_title: data.page_title,
        funder_name: data.funder_name,
        page_url: data.page_url,
        application_deadline: data.application_deadline,
        date_saved: data.date_saved,
        user_notes: data.user_notes || '',
        extracted_emails: data.extracted_emails || [],
        type: data.type,
        funding_amount: data.funding_amount,
      }

      setOpportunities(prev => 
        prev.map(opp => opp.id === id ? updatedOpportunity : opp)
      )
      return { data: updatedOpportunity }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update opportunity'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Delete opportunity
  const deleteOpportunity = async (id: string) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setOpportunities(prev => prev.filter(opp => opp.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete opportunity'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Fetch opportunities when user changes
  useEffect(() => {
    if (user) {
      fetchOpportunities()
    } else {
      setOpportunities([])
      setLoading(false)
    }
  }, [user])

  return {
    opportunities,
    loading,
    error,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    refetch: fetchOpportunities,
  }
} 