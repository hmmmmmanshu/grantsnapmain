import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Helper function to get default usage stats based on subscription tier
const getDefaultUsageStats = (subscriptionTier: string = 'free') => {
  const limits = {
    free: { 
      monthly_autofills: 10, 
      daily_autofills: 2,
      ai_generations_used: 0,
      deep_scans_used: 0,
      last_reset: new Date().toISOString()
    },
    pro: { 
      monthly_autofills: 1000, 
      daily_autofills: 50,
      ai_generations_used: 0,
      deep_scans_used: 0,
      last_reset: new Date().toISOString()
    },
    enterprise: { 
      monthly_autofills: 10000, 
      daily_autofills: 500,
      ai_generations_used: 0,
      deep_scans_used: 0,
      last_reset: new Date().toISOString()
    }
  }
  
  return limits[subscriptionTier as keyof typeof limits] || limits.free
}

// Helper function to get default subscription based on tier
const getDefaultSubscription = (subscriptionTier: string = 'free') => {
  return {
    tier: subscriptionTier,
    status: 'active',
    expires_at: subscriptionTier === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_start: new Date().toISOString(),
    current_period_end: subscriptionTier === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

// Helper function to get permissions based on subscription tier
const getPermissionsByTier = (subscriptionTier: string = 'free') => {
  const permissions = {
    free: {
      can_autofill: true,
      max_monthly_autofills: 10,
      max_daily_autofills: 2,
      can_export: false,
      can_team_collaborate: false,
      can_advanced_analytics: false
    },
    pro: {
      can_autofill: true,
      max_monthly_autofills: 1000,
      max_daily_autofills: 50,
      can_export: true,
      can_team_collaborate: true,
      can_advanced_analytics: true
    },
    enterprise: {
      can_autofill: true,
      max_monthly_autofills: 10000,
      max_daily_autofills: 500,
      can_export: true,
      can_team_collaborate: true,
      can_advanced_analytics: true
    }
  }
  
  return permissions[subscriptionTier as keyof typeof permissions] || permissions.free
}

Deno.serve(async (req) => {
  // Handle CORS for Chrome extension
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from JWT token in Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized - invalid token' }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('✅ User authenticated:', user.id, user.email)

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // If profile doesn't exist, create a basic one
    if (!profile && !profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          subscription_tier: 'free'
        })
        .select()
        .single()

      if (createError) {
        console.error('Profile creation error:', createError)
      } else {
        console.log('✅ Created new profile for user:', user.id)
      }
    }

    // Fetch usage stats
    const { data: usageStats, error: usageError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (usageError) {
      console.error('Usage stats fetch error:', usageError)
    }

    // Fetch subscription data
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subscriptionError) {
      console.error('Subscription fetch error:', subscriptionError)
    }

    // Determine subscription tier from profile or default to free
    const subscriptionTier = profile?.subscription_tier || 'free'

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        ...profile
      },
      usage_stats: usageStats || getDefaultUsageStats(subscriptionTier),
      subscription: subscription || getDefaultSubscription(subscriptionTier),
      permissions: getPermissionsByTier(subscriptionTier),
      timestamp: new Date().toISOString()
    }

    console.log('✅ Returning user session data for:', user.email)

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
