import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface UsageStats {
  user_id: string
  month_start_date: string
  ai_generations_used: number
  deep_scans_used: number
  updated_at: string
}

interface SubscriptionInfo {
  tier: string
  status: string
  current_period_start: string
  current_period_end: string
}

interface UsageResponse {
  success: boolean
  data: {
    current_month: string
    usage_stats: UsageStats
    subscription: SubscriptionInfo
    quotas: {
      ai_generations: number
      deep_scans: number
    }
    progress: {
      ai_generations: number // percentage
      deep_scans: number // percentage
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed',
          message: 'Only GET requests are supported' 
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Authorization header is required' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Valid Bearer token is required' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: 'Server configuration error' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current month start date
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)
    const monthStartString = currentMonthStart.toISOString().split('T')[0]

    // Get user's subscription information
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_start, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError) {
      console.error('Subscription query error:', subError)
      return new Response(
        JSON.stringify({ 
          error: 'Subscription Error',
          message: 'Failed to retrieve subscription information' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get or create usage stats for current month
    let { data: usageStats, error: usageError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_start_date', monthStartString)
      .single()

    if (usageError) {
      if (usageError.code === 'PGRST116') { // No rows returned
        // Create new usage record for current month
        const { data: newUsage, error: createError } = await supabase
          .from('usage_stats')
          .insert({
            user_id: user.id,
            month_start_date: monthStartString,
            ai_generations_used: 0,
            deep_scans_used: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create usage stats:', createError)
          return new Response(
            JSON.stringify({ 
              error: 'Database Error',
              message: 'Failed to create usage statistics' 
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        usageStats = newUsage
      } else {
        console.error('Usage stats query error:', usageError)
        return new Response(
          JSON.stringify({ 
            error: 'Database Error',
            message: 'Failed to retrieve usage statistics' 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Define quotas based on subscription tier
    const quotas = getQuotasForTier(subscription.tier)
    
    // Calculate progress percentages
    const progress = {
      ai_generations: Math.round((usageStats.ai_generations_used / quotas.ai_generations) * 100),
      deep_scans: Math.round((usageStats.deep_scans_used / quotas.deep_scans) * 100)
    }

    // Cap progress at 100%
    progress.ai_generations = Math.min(progress.ai_generations, 100)
    progress.deep_scans = Math.min(progress.deep_scans, 100)

    const response: UsageResponse = {
      success: true,
      data: {
        current_month: monthStartString,
        usage_stats: usageStats,
        subscription: subscription,
        quotas: quotas,
        progress: progress
      }
    }

    console.log(`✅ Usage stats retrieved for user ${user.id}:`, {
      ai_generations: `${usageStats.ai_generations_used}/${quotas.ai_generations}`,
      deep_scans: `${usageStats.deep_scans_used}/${quotas.deep_scans}`
    })

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in get-usage:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Get feature quotas based on subscription tier
 */
function getQuotasForTier(tier: string): { ai_generations: number; deep_scans: number } {
  switch (tier) {
    case 'basic':
      return { ai_generations: 0, deep_scans: 0 }
    case 'pro':
      return { ai_generations: 100, deep_scans: 50 }
    case 'enterprise':
      return { ai_generations: 500, deep_scans: 200 }
    default:
      return { ai_generations: 0, deep_scans: 0 }
  }
}
