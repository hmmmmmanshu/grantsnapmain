import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isProUser } from '../_shared/pro-user-check.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeepScanRequest {
  grant_id: string
  url_to_scan: string
}

interface HyperBrowserResponse {
  funder_mission: string
  funder_values: string
  past_project_examples: string
}

interface FunderProfile {
  funder_mission: string
  funder_values: string
  past_project_examples: string
  scanned_at: string
  source_url: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed',
          message: 'Only POST requests are supported' 
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user has Pro access
    const isPro = await isProUser(req.headers.get('Authorization'))
    if (!isPro) {
      return new Response(
        JSON.stringify({ 
          error: 'Pro Access Required',
          message: 'Upgrade to Pro to use this feature.' 
        }),
        { 
          status: 403,
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

    // Parse request body
    const requestBody: DeepScanRequest = await req.json()
    
    if (!requestBody.grant_id || !requestBody.url_to_scan) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'grant_id and url_to_scan are required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the grant belongs to the authenticated user
    const { data: grant, error: grantError } = await supabase
      .from('tracked_grants')
      .select('id, user_id, grant_name')
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .single()

    if (grantError || !grant) {
      console.error('Grant access error:', grantError)
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden',
          message: 'Grant not found or access denied' 
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get HyperBrowser API key from Supabase secrets
    const hyperBrowserApiKey = Deno.env.get('HYPERBROWSER_API_KEY')
    if (!hyperBrowserApiKey) {
      console.error('Missing HYPERBROWSER_API_KEY environment variable')
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: 'HyperBrowser service not configured' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Construct the prompt for HyperBrowser
    const hyperBrowserPrompt = `Go to the URL: ${requestBody.url_to_scan}. Analyze the content to identify the funder's core mission, their stated values, and the types of projects they have funded in the past. Return a structured JSON object with the keys: funder_mission, funder_values, and past_project_examples.`

    console.log('🔍 Initiating HyperBrowser deep scan for:', requestBody.url_to_scan)

    // Call HyperBrowser API
    const hyperBrowserResponse = await fetch('https://api.hyperbrowser.ai/v1/scan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hyperBrowserApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: requestBody.url_to_scan,
        prompt: hyperBrowserPrompt,
        max_depth: 3,
        include_metadata: true
      })
    })

    if (!hyperBrowserResponse.ok) {
      const errorText = await hyperBrowserResponse.text()
      console.error('HyperBrowser API error:', hyperBrowserResponse.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'HyperBrowser Service Error',
          message: 'Failed to analyze the URL',
          details: errorText
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse HyperBrowser response
    const hyperBrowserData = await hyperBrowserResponse.json()
    console.log('✅ HyperBrowser analysis completed')

    // Extract the structured response
    let funderProfile: FunderProfile
    
    try {
      // Try to parse the response content as JSON
      const responseContent = hyperBrowserData.content || hyperBrowserData.response || hyperBrowserData
      let parsedContent: HyperBrowserResponse
      
      if (typeof responseContent === 'string') {
        // Extract JSON from markdown or text response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON content found in response')
        }
      } else {
        parsedContent = responseContent
      }

      funderProfile = {
        funder_mission: parsedContent.funder_mission || 'Mission not identified',
        funder_values: parsedContent.funder_values || 'Values not identified',
        past_project_examples: parsedContent.past_project_examples || 'No past projects identified',
        scanned_at: new Date().toISOString(),
        source_url: requestBody.url_to_scan
      }
    } catch (parseError) {
      console.error('Failed to parse HyperBrowser response:', parseError)
      // Create a fallback profile with raw response
      funderProfile = {
        funder_mission: 'Analysis completed but structured data unavailable',
        funder_values: 'Analysis completed but structured data unavailable',
        past_project_examples: 'Analysis completed but structured data unavailable',
        scanned_at: new Date().toISOString(),
        source_url: requestBody.url_to_scan
      }
    }

    // Update the tracked_grants table with the funder profile
    const { data: updatedGrant, error: updateError } = await supabase
      .from('tracked_grants')
      .update({
        application_data: supabase.sql`COALESCE(application_data, '{}'::jsonb) || ${JSON.stringify({ funder_profile: funderProfile })}::jsonb`,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Database Error',
          message: 'Failed to save funder profile' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('💾 Funder profile saved to database for grant:', grant.grant_name)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deep scan completed successfully',
        grant_id: requestBody.grant_id,
        funder_profile: funderProfile,
        scanned_url: requestBody.url_to_scan,
        updated_at: updatedGrant.updated_at
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in trigger-deep-scan:', error)
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
