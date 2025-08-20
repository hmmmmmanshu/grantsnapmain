import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RefineAIAnswerRequest {
  original_answer: string
  refinement_style: string
  question_context: string
  limit_object: {
    type: 'words' | 'characters'
    value: number
  }
}

interface RefinementStyleTemplate {
  name: string
  description: string
  prompt_template: string
  examples: string[]
}

// Predefined refinement style templates
const REFINEMENT_STYLES: Record<string, RefinementStyleTemplate> = {
  'persuasive': {
    name: 'Persuasive and Compelling',
    description: 'Makes the text more convincing and engaging',
    prompt_template: 'Rewrite the following text to be more persuasive and compelling, using strong action verbs, emotional appeals, and clear benefits. Focus on creating urgency and demonstrating value.',
    examples: [
      'Use power words like "transform," "revolutionize," "breakthrough"',
      'Include specific metrics and success stories',
      'End with a strong call to action'
    ]
  },
  'concise': {
    name: 'Concise and Clear',
    description: 'Simplifies and clarifies the text while maintaining impact',
    prompt_template: 'Rewrite the following text to be more concise and clear. Remove unnecessary words, use simple language, and get straight to the point while maintaining the core message.',
    examples: [
      'Use active voice instead of passive',
      'Break complex sentences into shorter ones',
      'Eliminate redundant phrases'
    ]
  },
  'professional': {
    name: 'Professional and Formal',
    description: 'Elevates the tone to be more business-like and authoritative',
    prompt_template: 'Rewrite the following text to be more professional and formal. Use industry terminology, maintain a serious tone, and demonstrate expertise and credibility.',
    examples: [
      'Use formal business language',
      'Include relevant industry terms',
      'Maintain objective, factual tone'
    ]
  },
  'creative': {
    name: 'Creative and Engaging',
    description: 'Makes the text more imaginative and memorable',
    prompt_template: 'Rewrite the following text to be more creative and engaging. Use vivid imagery, metaphors, and storytelling elements while maintaining the core message.',
    examples: [
      'Use metaphors and analogies',
      'Create vivid mental images',
      'Tell a mini-story or scenario'
    ]
  },
  'technical': {
    name: 'Technical and Detailed',
    description: 'Adds technical depth and specificity',
    prompt_template: 'Rewrite the following text to be more technical and detailed. Include specific technical terms, methodologies, and data points while maintaining clarity.',
    examples: [
      'Include technical specifications',
      'Add relevant data and metrics',
      'Use industry-standard terminology'
    ]
  },
  'casual': {
    name: 'Casual and Friendly',
    description: 'Makes the text more approachable and conversational',
    prompt_template: 'Rewrite the following text to be more casual and friendly. Use conversational language, contractions, and a warm tone while maintaining professionalism.',
    examples: [
      'Use contractions (don\'t, can\'t, won\'t)',
      'Include friendly phrases and greetings',
      'Maintain a warm, approachable tone'
    ]
  }
}

// Function to count words and characters
function countText(text: string): { words: number; characters: number } {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const characters = text.length
  return { words, characters }
}

// Function to validate text against limits
function validateTextLength(text: string, limitObject: { type: 'words' | 'characters'; value: number }): {
  isValid: boolean
  current: number
  limit: number
  type: string
} {
  const counts = countText(text)
  const current = limitObject.type === 'words' ? counts.words : counts.characters
  const isValid = current <= limitObject.value
  
  return {
    isValid,
    current,
    limit: limitObject.value,
    type: limitObject.type
  }
}

// Function to generate the AI prompt
function generateAIPrompt(request: RefineAIAnswerRequest, userProfile?: any): string {
  const style = REFINEMENT_STYLES[request.refinement_style] || REFINEMENT_STYLES['persuasive']
  
  let contextSection = ''
  
  // Add pitch deck summary if available
  if (userProfile?.pitch_deck_summary) {
    try {
      const summary = JSON.parse(userProfile.pitch_deck_summary)
      contextSection = `
**STARTUP CONTEXT FROM PITCH DECK:**
- Problem: ${summary.problem_statement}
- Solution: ${summary.solution_overview}
- Target Market: ${summary.target_market}
- Business Model: ${summary.business_model}
- Team Strengths: ${summary.team_strengths}
- Traction: ${summary.key_metrics_and_traction}
- Funding Ask: ${summary.funding_ask}

**ADDITIONAL PROFILE INFORMATION:**
- Startup Name: ${userProfile.startup_name || 'Not specified'}
- One Line Pitch: ${userProfile.one_line_pitch || 'Not specified'}
- Problem Statement: ${userProfile.problem_statement || 'Not specified'}
- Solution Description: ${userProfile.solution_description || 'Not specified'}
- Target Market: ${userProfile.target_market || 'Not specified'}
- Team Description: ${userProfile.team_description || 'Not specified'}

`
    } catch (error) {
      console.warn('Failed to parse pitch deck summary:', error)
      // Fallback to basic profile info
      contextSection = `
**USER PROFILE INFORMATION:**
- Startup Name: ${userProfile?.startup_name || 'Not specified'}
- One Line Pitch: ${userProfile?.one_line_pitch || 'Not specified'}
- Problem Statement: ${userProfile?.problem_statement || 'Not specified'}
- Solution Description: ${userProfile?.solution_description || 'Not specified'}
- Target Market: ${userProfile?.target_market || 'Not specified'}
- Team Description: ${userProfile?.team_description || 'Not specified'}

`
    }
  } else if (userProfile) {
    // No pitch deck summary, but profile exists
    contextSection = `
**USER PROFILE INFORMATION:**
- Startup Name: ${userProfile.startup_name || 'Not specified'}
- One Line Pitch: ${userProfile.one_line_pitch || 'Not specified'}
- Problem Statement: ${userProfile.problem_statement || 'Not specified'}
- Solution Description: ${userProfile.solution_description || 'Not specified'}
- Target Market: ${userProfile.target_market || 'Not specified'}
- Team Description: ${userProfile.team_description || 'Not specified'}

`
  }
  
  const basePrompt = `You are an expert grant writer and editor with 15+ years of experience. Your task is to rewrite text according to specific requirements while strictly adhering to length constraints.

${contextSection}
**ORIGINAL QUESTION CONTEXT:**
${request.question_context}

**ORIGINAL ANSWER:**
${request.original_answer}

**REFINEMENT STYLE:** ${style.name}
${style.description}

**STYLE INSTRUCTIONS:**
${style.prompt_template}

**CRITICAL CONSTRAINTS:**
- The final output MUST be under ${request.limit_object.value} ${request.limit_object.type}
- This is a HARD LIMIT - do not exceed it under any circumstances
- If the original text is already under the limit, you may expand it slightly but stay within bounds
- If the original text exceeds the limit, you MUST reduce it to fit

**STYLE EXAMPLES:**
${style.examples.map(example => `- ${example}`).join('\n')}

**OUTPUT REQUIREMENTS:**
1. Rewrite the text according to the specified style
2. Ensure it directly addresses the original question context
3. Maintain the core message and key points
4. Stay within the ${request.limit_object.value} ${request.limit_object.type} limit
5. Provide a polished, ready-to-use result
6. Use the startup context above to make the response more specific and relevant to the user's business

**IMPORTANT:** Your response should be ONLY the rewritten text, with no additional explanations, markdown, or formatting.`
  
  return basePrompt
}

// Function to call the AI model (placeholder - replace with your actual AI service)
async function callAIModel(prompt: string, refinementStyle: string): Promise<string> {
  // This is a placeholder implementation
  // Replace this with your actual AI service call (e.g., OpenAI, Gemini, etc.)
  
  try {
    // Example: OpenAI API call
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [{ role: 'user', content: prompt }],
    //     max_tokens: 1000,
    //     temperature: 0.7,
    //   }),
    // })
    // 
    // const data = await response.json()
    // return data.choices[0].message.content
    
    // For now, return a mock response that demonstrates the refinement
    const mockResponses = {
      'persuasive': 'This innovative solution will revolutionize your approach, delivering unprecedented results that transform your organization. Our proven methodology ensures measurable success with immediate impact.',
      'concise': 'This solution delivers results. It works. You succeed.',
      'professional': 'This comprehensive solution implements industry best practices to optimize outcomes and maximize return on investment.',
      'creative': 'Imagine unlocking a world where every challenge becomes an opportunity. This solution is your key to that transformation.',
      'technical': 'This solution employs advanced algorithms with 99.9% accuracy, utilizing machine learning models trained on 10M+ data points.',
      'casual': 'Hey there! This solution is pretty awesome and will definitely help you out. Give it a shot!'
    }
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return mockResponses[refinementStyle] || mockResponses['persuasive']
  } catch (error) {
    throw new Error(`AI model call failed: ${error.message}`)
  }
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

    // Fetch user profile including pitch deck summary
    console.log('Fetching user profile and pitch deck summary...')
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.warn('Failed to fetch user profile:', profileError)
      // Continue without profile data - this is not a critical error
    }

    // Parse the request body
    let requestBody: RefineAIAnswerRequest
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'Invalid JSON in request body' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate required fields
    if (!requestBody.original_answer || !requestBody.refinement_style || !requestBody.question_context || !requestBody.limit_object) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'All fields are required: original_answer, refinement_style, question_context, limit_object' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate limit_object structure
    if (!requestBody.limit_object.type || !requestBody.limit_object.value || 
        !['words', 'characters'].includes(requestBody.limit_object.type) || 
        typeof requestBody.limit_object.value !== 'number' || 
        requestBody.limit_object.value <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'limit_object must have type: "words" or "characters" and value: positive number' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate refinement_style
    if (!REFINEMENT_STYLES[requestBody.refinement_style]) {
      const availableStyles = Object.keys(REFINEMENT_STYLES).join(', ')
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: `Invalid refinement_style. Available styles: ${availableStyles}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Count original text
    const originalCounts = countText(requestBody.original_answer)
    console.log(`Original text: ${originalCounts.words} words, ${originalCounts.characters} characters`)

    // Generate AI prompt
    const aiPrompt = generateAIPrompt(requestBody, userProfile)
    console.log('Generated AI prompt:', aiPrompt)

    // Call AI model
    console.log('Calling AI model...')
    const refinedText = await callAIModel(aiPrompt, requestBody.refinement_style)
    console.log('AI response received:', refinedText)

    // Validate refined text against limits
    const validation = validateTextLength(refinedText, requestBody.limit_object)
    console.log('Text validation:', validation)

    // If the AI didn't respect the limit, truncate the text
    let finalText = refinedText
    if (!validation.isValid) {
      console.warn(`AI output exceeded limit. Truncating from ${validation.current} to ${validation.limit} ${validation.type}`)
      
      if (requestBody.limit_object.type === 'words') {
        const words = refinedText.split(/\s+/)
        finalText = words.slice(0, requestBody.limit_object.value).join(' ')
      } else {
        finalText = refinedText.substring(0, requestBody.limit_object.value)
      }
      
      // Re-validate after truncation
      const finalValidation = validateTextLength(finalText, requestBody.limit_object)
      console.log('Final validation after truncation:', finalValidation)
    }

    // Get final counts
    const finalCounts = countText(finalText)

    // Success response
    const responseData = {
      success: true,
      message: 'Text refined successfully',
      data: {
        original_text: requestBody.original_answer,
        refined_text: finalText,
        refinement_style: requestBody.refinement_style,
        question_context: requestBody.question_context,
        limit_object: requestBody.limit_object,
        original_counts: originalCounts,
        final_counts: finalCounts,
        validation: {
          ...validation,
          isValid: true, // Always true after truncation
          was_truncated: !validation.isValid
        },
        ai_prompt_used: aiPrompt
      }
    }

    console.log(`✅ Text refined successfully for user ${user.id}`)
    console.log(`Original: ${originalCounts.words} words, ${originalCounts.characters} characters`)
    console.log(`Final: ${finalCounts.words} words, ${finalCounts.characters} characters`)
    console.log(`Style: ${requestBody.refinement_style}`)
    console.log(`Limit: ${requestBody.limit_object.value} ${requestBody.limit_object.type}`)

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in refine-ai-answer function:', error)
    
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
