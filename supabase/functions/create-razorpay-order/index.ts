import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
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

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate required fields
    if (!requestBody.planId) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'planId is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Access Razorpay credentials from environment
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    // Always check to make sure the secrets were found
    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Server configuration error: Missing Razorpay credentials'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // ⚡ CRITICAL UPDATE: Use the correct Razorpay plan IDs you provided
    const planConfigs = {
      'pro': {
        plan_id: 'plan_RC4Oy32XyvwR1b', // ✅ Your actual Proof plan ID
        amount: 3900, // ₹39.00 in paise
        currency: 'INR',
        interval: 'monthly',
        name: 'Proof Plan'
      },
      'enterprise': {
        plan_id: 'plan_RC4Q5IDADCw9lu', // ✅ Your actual Growth plan ID
        amount: 5900, // ₹59.00 in paise
        currency: 'INR',
        interval: 'monthly',
        name: 'Growth Plan'
      }
    };

    const planConfig = planConfigs[requestBody.planId as keyof typeof planConfigs];
    if (!planConfig) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid plan ID'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Create Razorpay subscription using their API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan_id: planConfig.plan_id,
        total_count: 12, // 12 months
        customer_notify: 1,
        notes: {
          user_id: user.id,
          plan_name: planConfig.name
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text();
      console.error('Razorpay API error:', errorData);
      return new Response(JSON.stringify({
        error: 'External Service Error',
        message: 'Failed to create Razorpay subscription'
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const razorpayData = await razorpayResponse.json();

    // Create order record in our database for tracking
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        plan_id: requestBody.planId,
        razorpay_subscription_id: razorpayData.id,
        razorpay_plan_id: planConfig.plan_id,
        amount: planConfig.amount,
        currency: planConfig.currency,
        status: 'created'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order record:', orderError);
      // Don't fail the request for database tracking errors
    }

    // Success response
    const responseData = {
      success: true,
      message: 'Razorpay subscription created successfully',
      data: {
        subscription_id: razorpayData.id,
        plan_id: requestBody.planId,
        amount: planConfig.amount,
        currency: planConfig.currency,
        razorpay_key_id: keyId,
        order_record: orderRecord
      }
    };

    console.log(`✅ Razorpay subscription created for user ${user.id}: ${razorpayData.id}`);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error in create-razorpay-order function:', error);
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