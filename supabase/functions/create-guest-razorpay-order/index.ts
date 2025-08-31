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
    if (!requestBody.planId || !requestBody.email) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'planId and email are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestBody.email)) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid email format'
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

    // Plan configurations with correct Razorpay plan IDs
    const planConfigs = {
      'pro': {
        plan_id: 'plan_RC4Oy32XyvwR1b', // Proof plan
        amount: 3900, // ₹39.00 in paise
        currency: 'INR',
        interval: 'monthly',
        name: 'Proof Plan'
      },
      'enterprise': {
        plan_id: 'plan_RC4Q5IDADCw9lu', // Growth plan
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

    // Create Supabase client for guest order tracking
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
          guest_email: requestBody.email,
          plan_name: planConfig.name,
          is_guest_checkout: 'true'
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

    // Create guest order record in our database for tracking
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null, // No user_id for guest orders
        plan_id: requestBody.planId,
        razorpay_subscription_id: razorpayData.id,
        razorpay_plan_id: planConfig.plan_id,
        amount: planConfig.amount,
        currency: planConfig.currency,
        status: 'created',
        // Store guest email in a separate field
        guest_email: requestBody.email
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating guest order record:', orderError);
      // Don't fail the request for database tracking errors
    }

    // Success response
    const responseData = {
      success: true,
      message: 'Guest Razorpay subscription created successfully',
      data: {
        subscription_id: razorpayData.id,
        plan_id: requestBody.planId,
        amount: planConfig.amount,
        currency: planConfig.currency,
        razorpay_key_id: keyId,
        guest_email: requestBody.email,
        order_record: orderRecord
      }
    };

    console.log(`✅ Guest Razorpay subscription created for email ${requestBody.email}: ${razorpayData.id}`);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error in create-guest-razorpay-order function:', error);
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
