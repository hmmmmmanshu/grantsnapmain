import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authorization header is required'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Valid Bearer token is required'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Server configuration error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get current month start date
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthString = currentMonthStart.toISOString().split('T')[0];

    // Get or create usage stats for current month
    let { data: usageStats, error: usageError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_start_date', currentMonthString)
      .single();

    if (usageError && usageError.code === 'PGRST116') {
      // No usage stats found, create new record
      const { data: newUsageStats, error: createError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          month_start_date: currentMonthString,
          ai_generations_used: 0,
          deep_scans_used: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating usage stats:', createError);
        throw createError;
      }

      usageStats = newUsageStats;
    } else if (usageError) {
      console.error('Error fetching usage stats:', usageError);
      throw usageError;
    }

    // Get user's subscription info
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
      throw subError;
    }

    // Define quotas based on subscription tier
    const quotas = {
      basic: {
        ai_generations: 10,
        deep_scans: 5
      },
      pro: {
        ai_generations: 100,
        deep_scans: 50
      },
      enterprise: {
        ai_generations: 1000,
        deep_scans: 500
      }
    };

    const tier = subscription?.tier || 'basic';
    const userQuotas = quotas[tier as keyof typeof quotas] || quotas.basic;

    // Calculate progress percentages
    const progress = {
      ai_generations: Math.round((usageStats.ai_generations_used / userQuotas.ai_generations) * 100),
      deep_scans: Math.round((usageStats.deep_scans_used / userQuotas.deep_scans) * 100)
    };

    // Success response
    const responseData = {
      success: true,
      message: 'Usage data retrieved successfully',
      data: {
        current_month: currentMonthString,
        usage_stats: usageStats,
        subscription: subscription || {
          tier: 'basic',
          status: 'active',
          current_period_start: currentMonthStart.toISOString(),
          current_period_end: new Date(currentMonthStart.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        quotas: userQuotas,
        progress: progress
      }
    };

    console.log(`✅ Retrieved usage data for user ${user.id}`);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error in get-usage function:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});