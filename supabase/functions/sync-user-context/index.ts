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

    // Create a comprehensive context with ALL 30 fields for RAG-powered grant autofill
    const summarizedContext = {
      // Basic Info (2 fields)
      startup_name: profileData?.startup_name || 'Not provided',
      one_line_pitch: profileData?.one_line_pitch || 'Not provided',
      
      // Business & Market (18 fields)
      problem_statement: profileData?.problem_statement || 'Not provided',
      golden_retriever_explanation: profileData?.golden_retriever_explanation || 'Not provided',
      dream_customer: profileData?.target_market || 'Not provided',
      market_size: profileData?.market_size || 'Not provided',
      industry: profileData?.industry || 'Not provided',
      unfair_advantage: profileData?.unfair_advantage || 'Not provided',
      top_competitors: profileData?.top_competitors || 'Not provided',
      traction_story: profileData?.traction_story || 'Not provided',
      current_stage: profileData?.current_stage || 'Not provided',
      funding_stage: profileData?.funding_stage || 'Not provided',
      funding_amount: profileData?.funding_amount || 'Not provided',
      funding_unlock: profileData?.funding_unlock || 'Not provided',
      twelve_month_goal: profileData?.twelve_month_goal || 'Not provided',
      why_now: profileData?.why_now || 'Not provided',
      biggest_risk: profileData?.biggest_risk || 'Not provided',
      customer_acquisition: profileData?.customer_acquisition || 'Not provided',
      
      // Pitch Deck
      pitch_deck_summary: profileData?.pitch_deck_summary || 'Not provided',
      pitch_deck_analyzed: !!profileData?.pitch_deck_summary,
      
      // Founders (7 fields per founder)
      founders_count: foundersData?.length || 0,
      founders_detailed: foundersData?.map(f => ({
        name: f.full_name || 'Not provided',
        title: f.title || 'Not provided',
        linkedin: f.linkedin_url || 'Not provided',
        background: f.background || 'Not provided',
        coolest_thing_built: f.coolest_thing_built || 'Not provided',
        biggest_accomplishment: f.biggest_accomplishment || 'Not provided',
        time_commitment: f.time_commitment || 'Not provided'
      })) || [],
      
      // Documents & Metadata
      documents_count: documentsData?.length || 0,
      documents_list: documentsData?.map(d => ({
        name: d.document_name,
        type: d.document_type,
        uploaded: d.uploaded_at
      })) || [],
      grants_tracked: grantsData?.length || 0
    }

    // Create a comprehensive prompt for Gemini using ALL 30 fields
    const prompt = `You are an expert startup analyst with 15+ years of experience evaluating startups for grants, accelerators, and investors.

Analyze this comprehensive startup profile (30 detailed fields) and generate strategic insights for grant applications.

**STARTUP PROFILE:**

**Basic Information:**
- Name: ${summarizedContext.startup_name}
- One-liner: ${summarizedContext.one_line_pitch}
- Industry: ${summarizedContext.industry}
- Stage: ${summarizedContext.current_stage}
- Funding Stage: ${summarizedContext.funding_stage}

**Problem & Solution:**
- Problem Statement: ${summarizedContext.problem_statement}
- Simple Explanation: ${summarizedContext.golden_retriever_explanation}

**Market Opportunity:**
- Dream Customer: ${summarizedContext.dream_customer}
- Market Size: ${summarizedContext.market_size}
- Why Now: ${summarizedContext.why_now}

**Competitive Position:**
- Unfair Advantage: ${summarizedContext.unfair_advantage}
- Top Competitors: ${summarizedContext.top_competitors}

**Traction & Growth:**
- Traction Story: ${summarizedContext.traction_story}
- Customer Acquisition: ${summarizedContext.customer_acquisition}

**Funding & Vision:**
- Raising: ${summarizedContext.funding_amount}
- Will Unlock: ${summarizedContext.funding_unlock}
- 12-Month Goal: ${summarizedContext.twelve_month_goal}
- Biggest Risk: ${summarizedContext.biggest_risk}

**Team (${summarizedContext.founders_count} Founder${summarizedContext.founders_count !== 1 ? 's' : ''}):**
${summarizedContext.founders_detailed.map((f, i) => `
Founder ${i + 1}: ${f.name} (${f.title})
- Background: ${f.background}
- Coolest Thing Built: ${f.coolest_thing_built}
- Biggest Accomplishment: ${f.biggest_accomplishment}
- Commitment: ${f.time_commitment}
- LinkedIn: ${f.linkedin}
`).join('\n')}

**Pitch Deck:** ${summarizedContext.pitch_deck_analyzed ? 'Analyzed ✓' : 'Not uploaded'}
${summarizedContext.pitch_deck_analyzed ? `Summary: ${summarizedContext.pitch_deck_summary}` : ''}

**Documents:** ${summarizedContext.documents_count} uploaded
**Grants Tracked:** ${summarizedContext.grants_tracked}

**YOUR TASK:**
Generate a comprehensive AI insights summary optimized for grant applications. Output as JSON:

{
  "executive_summary": "3-4 paragraph deep analysis covering:
    - What problem they're solving and why it matters NOW (reference why_now)
    - Their unique approach and unfair advantage (be specific!)
    - Team credibility (reference coolest things built & accomplishments by name)
    - Current traction and market validation (use specific metrics from traction_story)
    - Funding readiness and what the funding will unlock
    Include concrete data points, not generic statements.",
    
  "key_strengths": [
    "5 specific, evidence-based strengths that would impress grant reviewers",
    "Reference ACTUAL achievements from profile (founder names, metrics, advantages)",
    "Focus on what makes them uniquely positioned to succeed",
    "Mention specific competitive advantages that can't be easily replicated",
    "Highlight team expertise relevant to the problem they're solving"
  ],
  
  "funding_readiness": "2-3 sentence assessment based on:
    - Traction metrics (be specific if provided)
    - Team experience (what have they built before that's relevant?)
    - Market timing (why now? is this compelling?)
    - Risk mitigation (do they acknowledge and address their biggest risk?)
    Be honest - if readiness is low, say so constructively.",
    
  "recommended_actions": [
    "5 specific, prioritized next steps to strengthen grant applications",
    "Be tactical: 'Get 3 letters of support from target customers' not 'improve traction'",
    "Reference specific gaps: 'Quantify market size with TAM/SAM/SOM data'",
    "Suggest proof points: 'Document customer validation interviews'",
    "Prioritize high-impact actions that can be done in 30-60 days"
  ],
  
  "profile_completeness": "Honest assessment:
    - Strong areas (e.g., 'Excellent founder track record with specific prior wins')
    - Missing critical info (e.g., 'Need concrete traction metrics')
    - Impact on grant success (be direct about weaknesses)
    - What would make the biggest difference if added",
    
  "ai_insights": "3-4 sentences on:
    - Market fit potential (is the golden_retriever_explanation clear and compelling?)
    - Scalability prospects (does customer_acquisition strategy make sense?)
    - Grant readiness score (1-10 with reasoning)
    - Unique positioning (what makes them stand out?)
    Reference specific profile fields to back up claims."
}

**CRITICAL ANALYSIS GUIDELINES:**
1. BE SPECIFIC - use names, numbers, and concrete examples from the profile
2. BE HONEST - call out weaknesses constructively (grants need credibility)
3. BE INSIGHTFUL - provide value beyond obvious observations
4. PRIORITIZE GRANT SUCCESS - what makes them fundable vs just interesting?
5. USE THE DATA - don't ignore rich fields like coolest_thing_built or why_now

Generate the JSON analysis now:`

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

