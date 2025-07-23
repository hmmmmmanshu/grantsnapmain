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
      setError(null)
      
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
      console.error('Error fetching opportunities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new opportunity
  const addOpportunity = async (opportunity: Omit<Opportunity, 'id' | 'date_saved'>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          user_id: user.id,
          status: opportunity.status,
          page_title: opportunity.page_title,
          funder_name: opportunity.funder_name,
          page_url: opportunity.page_url,
          application_deadline: opportunity.application_deadline,
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
      return { data: newOpportunity, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add opportunity'
      setError(errorMessage)
      console.error('Error adding opportunity:', err)
      return { data: null, error: errorMessage }
    }
  }

  // Update opportunity
  const updateOpportunity = async (id: string, updates: Partial<Opportunity>) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
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
      return { data: updatedOpportunity, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update opportunity'
      setError(errorMessage)
      console.error('Error updating opportunity:', err)
      return { data: null, error: errorMessage }
    }
  }

  // Delete opportunity
  const deleteOpportunity = async (id: string) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      setError(null)
      
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setOpportunities(prev => prev.filter(opp => opp.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete opportunity'
      setError(errorMessage)
      console.error('Error deleting opportunity:', err)
      return { error: errorMessage }
    }
  }

  // Update opportunity status
  const updateStatus = async (id: string, status: Opportunity['status']) => {
    return updateOpportunity(id, { status })
  }

  // Add sample data for testing
  const addSampleData = async () => {
    const sampleOpportunities = [
      {
        status: 'To Review' as const,
        page_title: 'AI for Social Good Grant',
        funder_name: 'The Future Foundation',
        page_url: 'https://futurefoundation.org/ai-grant',
        application_deadline: '2025-12-01',
        user_notes: 'This seems like a perfect fit for our AI project. Need to check the budget restrictions.',
        extracted_emails: ['grants@futurefoundation.org'],
        type: 'grant' as const,
        funding_amount: 500000
      },
      {
        status: 'In Progress' as const,
        page_title: 'Seed Funding for Climate Tech',
        funder_name: 'GreenTech Ventures',
        page_url: 'https://greentechvc.com/funding',
        application_deadline: '2025-07-20',
        user_notes: 'Early stage funding opportunity. Need to prepare pitch deck.',
        extracted_emails: ['hello@greentechvc.com', 'applications@greentechvc.com'],
        type: 'investor' as const,
        funding_amount: 2000000
      },
      {
        status: 'Applied' as const,
        page_title: 'Innovation Grant Program',
        funder_name: 'Tech Innovation Council',
        page_url: 'https://techcouncil.org/grants',
        application_deadline: '2025-08-15',
        user_notes: 'Application submitted. Follow up scheduled for next week.',
        extracted_emails: ['grants@techcouncil.org'],
        type: 'grant' as const,
        funding_amount: 250000
      }
    ]

    for (const opportunity of sampleOpportunities) {
      await addOpportunity(opportunity)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [user])

  return {
    opportunities,
    loading,
    error,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    updateStatus,
    addSampleData,
    refetch: fetchOpportunities,
  }
} 