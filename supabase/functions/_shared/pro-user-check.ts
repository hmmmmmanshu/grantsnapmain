import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Shared helper function to check if a user has Pro access
 * This function verifies the user's subscription status in the subscriptions table
 */
export async function isProUser(authHeader: string | null): Promise<boolean> {
  if (!authHeader) {
    console.log('❌ No authorization header provided')
    return false
  }

  try {
    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.log('❌ Invalid authorization header format')
      return false
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message)
      return false
    }

    // Query the subscriptions table to check Pro status
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('tier', 'pro')
      .single()

    if (subError) {
      if (subError.code === 'PGRST116') { // No rows returned
        console.log(`ℹ️ User ${user.id} does not have Pro subscription`)
        return false
      }
      console.error('❌ Subscription query error:', subError)
      return false
    }

    if (subscription && subscription.tier === 'pro' && subscription.status === 'active') {
      console.log(`✅ User ${user.id} has active Pro subscription`)
      return true
    }

    console.log(`ℹ️ User ${user.id} subscription: ${subscription?.tier} - ${subscription?.status}`)
    return false

  } catch (error) {
    console.error('❌ Error checking Pro user status:', error)
    return false
  }
}

/**
 * Alternative function that returns user info along with Pro status
 * Useful for functions that need both authentication and Pro status
 */
export async function getUserWithProStatus(authHeader: string | null): Promise<{
  isPro: boolean
  userId: string | null
  error?: string
}> {
  if (!authHeader) {
    return { isPro: false, userId: null, error: 'No authorization header' }
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return { isPro: false, userId: null, error: 'Invalid authorization header' }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return { isPro: false, userId: null, error: 'Server configuration error' }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return { isPro: false, userId: null, error: 'Authentication failed' }
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('tier', 'pro')
      .single()

    if (subError && subError.code !== 'PGRST116') {
      return { isPro: false, userId: user.id, error: 'Subscription query failed' }
    }

    const isPro = !!(subscription && subscription.tier === 'pro' && subscription.status === 'active')
    
    return { 
      isPro, 
      userId: user.id,
      error: isPro ? undefined : 'Pro subscription required'
    }

  } catch (error) {
    return { 
      isPro: false, 
      userId: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
