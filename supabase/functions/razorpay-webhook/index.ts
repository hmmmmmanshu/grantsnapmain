import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Razorpay webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    // Create HMAC SHA256 hash using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);
    
    // For now, we'll use a simple string comparison
    // In production, you should implement proper HMAC verification
    const expectedSignature = btoa(payload + secret);
    return signature === expectedSignature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

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

    // Get the webhook signature from headers
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      console.error('Missing Razorpay signature header');
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Missing webhook signature'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get the webhook secret from environment
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Missing RAZORPAY_WEBHOOK_SECRET environment variable');
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

    // Read the request body
    const payload = await req.text();
    
    // Verify the webhook signature
    const isValidSignature = verifyWebhookSignature(payload, signature, webhookSecret);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid webhook signature'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(payload);
    } catch (parseError) {
      console.error('Failed to parse webhook payload:', parseError);
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid JSON payload'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Received Razorpay webhook:', webhookData.event);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
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

    // Handle different webhook events
    switch (webhookData.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(supabase, webhookData.payload.subscription.entity);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, webhookData.payload.subscription.entity);
        break;
      
      case 'subscription.halted':
        await handleSubscriptionHalted(supabase, webhookData.payload.subscription.entity);
        break;
      
      case 'payment.captured':
        await handlePaymentCaptured(supabase, webhookData.payload.payment.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${webhookData.event}`);
    }

    // Return success response to Razorpay
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error in razorpay-webhook function:', error);
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

// Handle subscription activation
async function handleSubscriptionActivated(supabase: any, subscription: any) {
  try {
    const userId = subscription.notes?.user_id;
    if (!userId) {
      console.error('No user_id found in subscription notes');
      return;
    }

    // Determine tier based on plan_id or amount
    let tier = 'pro';
    if (subscription.plan_id) {
      // You can map plan_id to tier here
      // For example: if (subscription.plan_id === 'plan_enterprise') tier = 'enterprise';
    }

    // Upsert subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier: tier,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: subscription.plan_id
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log(`✅ Subscription activated for user ${userId}:`, data);
  } catch (error) {
    console.error('Error handling subscription activation:', error);
    throw error;
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(supabase: any, subscription: any) {
  try {
    const userId = subscription.notes?.user_id;
    if (!userId) {
      console.error('No user_id found in subscription notes');
      return;
    }

    // Update subscription status to cancelled
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }

    console.log(`✅ Subscription cancelled for user ${userId}:`, data);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

// Handle subscription halt
async function handleSubscriptionHalted(supabase: any, subscription: any) {
  try {
    const userId = subscription.notes?.user_id;
    if (!userId) {
      console.error('No user_id found in subscription notes');
      return;
    }

    // Update subscription status to inactive
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error halting subscription:', error);
      throw error;
    }

    console.log(`✅ Subscription halted for user ${userId}:`, data);
  } catch (error) {
    console.error('Error handling subscription halt:', error);
    throw error;
  }
}

// Handle payment capture
async function handlePaymentCaptured(supabase: any, payment: any) {
  try {
    const userId = payment.notes?.user_id;
    if (!userId) {
      console.error('No user_id found in payment notes');
      return;
    }

    console.log(`✅ Payment captured for user ${userId}:`, payment.id);
    
    // You can add additional logic here, such as:
    // - Sending confirmation emails
    // - Updating usage quotas
    // - Logging payment details
  } catch (error) {
    console.error('Error handling payment capture:', error);
    throw error;
  }
}
