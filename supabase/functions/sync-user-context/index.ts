import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UserContextSummary {
  user_id: string
  context_summary: string
  aggregated_data: {
    profile_fields: number
    pitch_deck_analyzed: boolean
    documents_uploaded: number
    grants_tracked: number
    founders_added: number
    completion_percentage: number
  }
  ai_generated_summary: string
  last_updated: string
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

    // Extract the JWT token
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

    console.log(`Starting context sync for user ${user.id}`)

    // 1. Fetch user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 2. Fetch founders data
    const { data: foundersData, error: foundersError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', user.id)

    // 3. Fetch documents
    const { data: documentsData, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)

    // 4. Fetch tracked grants
    const { data: grantsData, error: grantsError } = await supabase
      .from('tracked_grants')
      .select('*')
      .eq('user_id', user.id)

    // Aggregate all data into a comprehensive context
    const aggregatedContext = {
      user_id: user.id,
      email: user.email,
      profile: profileData || {},
      founders: foundersData || [],
      documents: documentsData || [],
      grants: grantsData || [],
      aggregated_stats: {
        profile_fields_completed: profileData ? Object.values(profileData).filter(v => v !== null && v !== '').length : 0,
        pitch_deck_analyzed: !!profileData?.pitch_deck_summary,
        documents_uploaded: documentsData?.length || 0,
        grants_tracked: grantsData?.length || 0,
        founders_added: foundersData?.length || 0,
        completion_percentage: profileData?.completion_percentage || 0
      }
    }

    // Generate AI summary using Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }

    // Create a summarized version of the context for the AI (to avoid token limits)
    const summarizedContext = {
      startup_name: profileData?.startup_name || 'Not provided',
      one_line_pitch: profileData?.one_line_pitch || 'Not provided',
      problem_statement: profileData?.problem_statement || 'Not provided',
      solution_description: profileData?.solution_description || 'Not provided',
      target_market: profileData?.target_market || 'Not provided',
      industry: profileData?.industry || 'Not provided',
      funding_stage: profileData?.funding_stage || 'Not provided',
      team_size: profileData?.team_size || 'Not provided',
      pitch_deck_summary: profileData?.pitch_deck_summary ? 'Available' : 'Not provided',
      founders_count: foundersData?.length || 0,
      documents_count: documentsData?.length || 0,
      grants_tracked: grantsData?.length || 0,
      completion_percentage: profileData?.completion_percentage || 0
    }

    // Create a comprehensive prompt for Gemini
    const prompt = `You are an AI assistant helping to create a comprehensive context summary for a startup user. 
Analyze the following user data and generate a concise, professional summary that captures the essence of their startup, goals, and current status.

**USER DATA:**
${JSON.stringify(summarizedContext, null, 2)}

**INSTRUCTIONS:**
Generate a structured summary in the following format (output as JSON):

{
  "executive_summary": "2-3 paragraph overview of the startup, its mission, and current stage",
  "key_strengths": ["List of 3-5 key strengths or unique selling points"],
  "funding_readiness": "Assessment of how ready they are for funding (1-2 sentences)",
  "recommended_actions": ["List of 3-5 recommended next steps"],
  "profile_completeness": "Brief assessment of profile completeness and missing information",
  "ai_insights": "AI-generated insights about their startup potential and market fit (2-3 sentences)"
}

Focus on:
1. Extracting key information from their profile
2. Understanding their problem-solution fit
3. Assessing their market opportunity
4. Identifying gaps in their information
5. Providing actionable recommendations

Be professional, constructive, and insightful. If information is missing, mention what would strengthen their profile.`

    console.log('Calling Gemini API for context analysis...')
    // Use Gemini 2.0 Flash Experimental (Free tier) for simple context generation
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json'
          }
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}))
      throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const geminiData = await geminiResponse.json()
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API')
    }

    const aiSummary = geminiData.candidates[0].content.parts[0].text
    console.log('Gemini API call successful')

    // Parse the AI response
    let parsedSummary
    try {
      const rawParsed = JSON.parse(aiSummary)
      
      // Normalize the response to ensure arrays are always arrays
      parsedSummary = {
        executive_summary: rawParsed.executive_summary || '',
        key_strengths: Array.isArray(rawParsed.key_strengths) ? rawParsed.key_strengths : [],
        funding_readiness: rawParsed.funding_readiness || 'Unable to assess',
        recommended_actions: Array.isArray(rawParsed.recommended_actions) ? rawParsed.recommended_actions : [],
        profile_completeness: rawParsed.profile_completeness || 'Unable to assess',
        ai_insights: rawParsed.ai_insights || 'Analysis in progress'
      }
    } catch (error) {
      console.error('Failed to parse AI summary:', error)
      parsedSummary = {
        executive_summary: aiSummary,
        key_strengths: [],
        funding_readiness: 'Unable to assess',
        recommended_actions: [],
        profile_completeness: 'Unable to assess',
        ai_insights: 'Analysis in progress'
      }
    }

    // Prepare context summary for storage
    const contextSummary: UserContextSummary = {
      user_id: user.id,
      context_summary: JSON.stringify(aggregatedContext),
      aggregated_data: aggregatedContext.aggregated_stats,
      ai_generated_summary: JSON.stringify(parsedSummary),
      last_updated: new Date().toISOString()
    }

    // Store the context summary in user_profiles table
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ai_context_summary: contextSummary.ai_generated_summary,
        context_last_updated: contextSummary.last_updated,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update profile with context summary:', updateError)
      throw updateError
    }

    console.log(`✅ Context sync completed successfully for user ${user.id}`)

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User context synchronized successfully',
        data: {
          user_id: user.id,
          aggregated_data: aggregatedContext.aggregated_stats,
          ai_summary: parsedSummary,
          last_updated: contextSummary.last_updated
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in sync-user-context function:', error)
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

