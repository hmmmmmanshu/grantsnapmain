import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
}

interface UpdateGrantRequest {
  grant_id: string
  grant_name?: string
  grant_url?: string
  status?: string
  application_deadline?: string
  notes?: string
  funding_amount?: number
  eligibility_criteria?: string
}

interface GrantRecord {
  id: string
  user_id: string
  grant_name: string
  grant_url: string
  status: string
  application_deadline?: string
  notes?: string
  funding_amount?: number
  eligibility_criteria?: string
  created_at: string
  updated_at: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow PUT requests
    if (req.method !== 'PUT') {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed',
          message: 'Only PUT requests are supported' 
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

    // Parse the request body
    let requestBody: UpdateGrantRequest
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
    if (!requestBody.grant_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'grant_id is required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First, verify the grant belongs to the user
    const { data: existingGrant, error: fetchError } = await supabase
      .from('tracked_grants')
      .select('*')
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGrant) {
      console.error('Grant not found or access denied:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Not Found',
          message: 'Grant not found or access denied' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare update data (only include fields that are provided)
    const updateData: Partial<GrantRecord> = {
      updated_at: new Date().toISOString()
    }

    if (requestBody.grant_name !== undefined) {
      updateData.grant_name = requestBody.grant_name.trim()
    }
    if (requestBody.grant_url !== undefined) {
      updateData.grant_url = requestBody.grant_url.trim()
    }
    if (requestBody.status !== undefined) {
      updateData.status = requestBody.status
    }
    if (requestBody.application_deadline !== undefined) {
      updateData.application_deadline = requestBody.application_deadline
    }
    if (requestBody.notes !== undefined) {
      updateData.notes = requestBody.notes
    }
    if (requestBody.funding_amount !== undefined) {
      updateData.funding_amount = requestBody.funding_amount
    }
    if (requestBody.eligibility_criteria !== undefined) {
      updateData.eligibility_criteria = requestBody.eligibility_criteria
    }

    // Update the grant
    const { data: updatedGrant, error: updateError } = await supabase
      .from('tracked_grants')
      .update(updateData)
      .eq('id', requestBody.grant_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: 'Failed to update grant in database',
          details: updateError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Success response
    const responseData = {
      success: true,
      message: 'Grant updated successfully',
      data: updatedGrant
    }

    console.log(`✅ Grant updated successfully for user ${user.id}: ${updatedGrant.grant_name}`)

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in update-grant function:', error)
    
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
