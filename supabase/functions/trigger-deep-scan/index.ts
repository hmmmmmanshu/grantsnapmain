import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { isProUser } from '../_shared/pro-user-check.ts';

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

    // Check if user is Pro user
    const isPro = await isProUser(authHeader);
    if (!isPro) {
      return new Response(JSON.stringify({
        error: 'Upgrade Required',
        message: 'Upgrade to Pro to use this feature'
      }), {
        status: 403,
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
    if (!requestBody.grant_id || !requestBody.url_to_scan) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'grant_id and url_to_scan are required fields'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get HyperBrowser API key from environment
    const hyperBrowserApiKey = Deno.env.get('HYPERBROWSER_API_KEY');
    if (!hyperBrowserApiKey) {
      console.error('Missing HYPERBROWSER_API_KEY environment variable');
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

    // Extract the JWT token and get user information
    const token = authHeader.replace('Bearer ', '');
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

    // Verify the grant belongs to the user
    const { data: grant, error: grantError } = await supabase
      .from('tracked_grants')
      .select('*')
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .single();

    if (grantError || !grant) {
      console.error('Grant not found or access denied:', grantError);
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Grant not found or access denied'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Call HyperBrowser API
    const hyperBrowserPrompt = `Go to the URL: ${requestBody.url_to_scan}. Analyze the content to identify the funder's core mission, their stated values, and the types of projects they have funded in the past. Return a structured JSON object with the keys: funder_mission, funder_values, and past_project_examples.`;

    const hyperBrowserResponse = await fetch('https://api.hyperbrowser.io/v1/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hyperBrowserApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: requestBody.url_to_scan,
        prompt: hyperBrowserPrompt,
        format: 'json'
      })
    });

    if (!hyperBrowserResponse.ok) {
      console.error('HyperBrowser API error:', await hyperBrowserResponse.text());
      return new Response(JSON.stringify({
        error: 'External Service Error',
        message: 'Failed to analyze the URL with HyperBrowser'
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const hyperBrowserData = await hyperBrowserResponse.json();

    // Update the grant with the funder profile data
    const { data: updatedGrant, error: updateError } = await supabase
      .from('tracked_grants')
      .update({
        application_data: {
          ...grant.application_data,
          funder_profile: hyperBrowserData
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating grant with funder profile:', updateError);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to save funder profile to database'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Increment usage stats
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthString = currentMonthStart.toISOString().split('T')[0];

    const { error: usageError } = await supabase
      .from('usage_stats')
      .upsert({
        user_id: user.id,
        month_start_date: currentMonthString,
        deep_scans_used: 1
      }, {
        onConflict: 'user_id,month_start_date',
        ignoreDuplicates: false
      });

    if (usageError) {
      console.error('Error updating usage stats:', usageError);
      // Don't fail the request for usage tracking errors
    }

    // Success response
    const responseData = {
      success: true,
      message: 'Deep scan completed successfully',
      data: {
        grant_id: requestBody.grant_id,
        funder_profile: hyperBrowserData,
        updated_grant: updatedGrant
      }
    };

    console.log(`✅ Deep scan completed for grant ${requestBody.grant_id} by user ${user.id}`);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error in trigger-deep-scan function:', error);
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