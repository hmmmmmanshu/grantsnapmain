import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function isProUser(authHeader: string | null): Promise<boolean> {
  try {
    if (!authHeader) {
      return false;
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return false;
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return false;
    }

    // Check if user has an active Pro or Enterprise subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('tier', ['pro', 'enterprise'])
      .single();

    if (subError) {
      console.error('Error checking subscription:', subError);
      return false;
    }

    return !!(subscription && subscription.tier && subscription.status === 'active');
  } catch (error) {
    console.error('Error in isProUser check:', error);
    return false;
  }
}

export async function getUserSubscription(authHeader: string | null): Promise<{ tier: string; status: string } | null> {
  try {
    if (!authHeader) {
      return null;
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return null;
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
}