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
    if (!requestBody.grant_id || !requestBody.question || !requestBody.current_answer) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'grant_id, question, and current_answer are required fields'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
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

    // Get user profile for context
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Prepare context for AI refinement
    const context = {
      grant_name: grant.grant_name,
      grant_url: grant.grant_url,
      funding_amount: grant.funding_amount,
      eligibility_criteria: grant.eligibility_criteria,
      user_profile: userProfile || {},
      funder_profile: grant.application_data?.funder_profile || {}
    };

    // Create refinement prompt for Gemini
    const refinementPrompt = `
You are an expert grant writing assistant. Please refine the following answer to make it more compelling and aligned with the grant opportunity.

CONTEXT:
Grant: ${context.grant_name}
Funding Amount: ${context.funding_amount || 'Not specified'}
Eligibility: ${context.eligibility_criteria || 'Not specified'}
Funder Mission: ${context.funder_profile?.funder_mission || 'Not available'}
Funder Values: ${context.funder_profile?.funder_values || 'Not available'}

USER PROFILE:
Startup: ${context.user_profile?.startup_name || 'Not specified'}
Problem: ${context.user_profile?.problem_statement || 'Not specified'}
Solution: ${context.user_profile?.solution_description || 'Not specified'}
Target Market: ${context.user_profile?.target_market || 'Not specified'}

QUESTION: ${requestBody.question}

CURRENT ANSWER: ${requestBody.current_answer}

Please provide a refined, more compelling answer that:
1. Better aligns with the funder's mission and values
2. Incorporates relevant details from the user's startup profile
3. Is more specific and impactful
4. Maintains the original intent while improving clarity and persuasiveness

Return only the refined answer, no additional commentary.
`;

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: refinementPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      return new Response(JSON.stringify({
        error: 'External Service Error',
        message: 'Failed to refine answer with AI'
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const geminiData = await geminiResponse.json();
    const refinedAnswer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || requestBody.current_answer;

    // Update the grant with the refined answer
    const updatedApplicationData = {
      ...grant.application_data,
      [requestBody.question]: refinedAnswer
    };

    const { data: updatedGrant, error: updateError } = await supabase
      .from('tracked_grants')
      .update({
        application_data: updatedApplicationData,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating grant with refined answer:', updateError);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to save refined answer to database'
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
        ai_generations_used: 1
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
      message: 'Answer refined successfully',
      data: {
        grant_id: requestBody.grant_id,
        question: requestBody.question,
        original_answer: requestBody.current_answer,
        refined_answer: refinedAnswer,
        updated_grant: updatedGrant
      }
    };

    console.log(`✅ Answer refined for grant ${requestBody.grant_id} by user ${user.id}`);
    return new Response(JSON.stringify(responseData), {
        status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error in refine-ai-answer function:', error);
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