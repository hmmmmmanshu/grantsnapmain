import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
interface AnalyzePitchDeckRequest {
  file_path: string
  file_name: string
  file_size: number
}
interface PitchDeckSummary {
  problem_statement: string
  solution_overview: string
  target_market: string
  business_model: string
  team_strengths: string
  key_metrics_and_traction: string
  funding_ask: string
}
// Function to convert file to base64 for Gemini Vision API
async function convertFileToBase64(fileBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  try {
    const bytes = new Uint8Array(fileBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    throw new Error(`File conversion to base64 failed: ${error.message}`)
  }
}
// Function to generate AI prompt for pitch deck analysis
function generateAnalysisPrompt(): string {
  return `You are a startup analyst and grant writing expert with 15+ years of experience. 
Analyze the provided pitch deck document (PDF or PowerPoint) and generate a concise, structured summary in JSON format.

**ANALYSIS REQUIREMENTS:**
Analyze the document and extract the following key information:
1. **problem_statement**: What problem is the startup solving? (2-3 sentences)
2. **solution_overview**: What is their solution/product? (2-3 sentences)
3. **target_market**: Who is their target market/customer? (2-3 sentences)
4. **business_model**: How do they make money? (2-3 sentences)
5. **team_strengths**: What are the key team strengths/credentials? (2-3 sentences)
6. **key_metrics_and_traction**: What traction, metrics, or progress have they shown? (2-3 sentences)
7. **funding_ask**: What funding are they seeking and for what purpose? (2-3 sentences)

**IMPORTANT INSTRUCTIONS:**
- Provide ONLY the JSON response with the exact keys specified above
- Keep each field concise but informative (2-3 sentences max)
- If information is missing for any field, use "Information not provided in pitch deck"
- Ensure the JSON is valid and properly formatted
- Focus on extracting factual information, not making assumptions
- Use clear, professional language suitable for grant applications

**OUTPUT FORMAT:**
Your response must be ONLY valid JSON with the exact structure:
{
  "problem_statement": "...",
  "solution_overview": "...",
  "target_market": "...",
  "business_model": "...",
  "team_strengths": "...",
  "key_metrics_and_traction": "...",
  "funding_ask": "..."
}`
}
// Function to call Gemini Vision API for pitch deck analysis
async function callGeminiVisionAPI(fileData: string, prompt: string): Promise<string> {
  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }
    
    console.log("Calling Gemini Vision API...")
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: fileData.startsWith('data:application/pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  data: fileData.split(',')[1] // Remove the data:mime_type;base64, prefix
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          responseMimeType: "application/json"
        }
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || "Unknown error"}`)
    }
    
    const data = await response.json()
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response format from Gemini API")
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text
    if (!aiResponse) {
      throw new Error("Empty response from Gemini API")
    }
    
    console.log("Gemini Vision API call successful")
    return aiResponse
  } catch (error) {
    console.error("Gemini API call failed:", error)
    throw new Error(`AI model call failed: ${error.message}`)
  }
}
// Function to parse and validate AI response
function parseAIResponse(aiResponse: string): PitchDeckSummary {
  try {
    // Clean the response and parse JSON
    const cleanedResponse = aiResponse.trim()
    const parsed = JSON.parse(cleanedResponse)
    // Validate required fields
    const requiredFields = [
      "problem_statement", "solution_overview", "target_market", 
      "business_model", "team_strengths", "key_metrics_and_traction", "funding_ask"
    ]
    for (const field of requiredFields) {
      if (!parsed[field] || typeof parsed[field] !== "string") {
        throw new Error(`Missing or invalid field: ${field}`)
      }
    }
    return parsed as PitchDeckSummary
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`)
  }
}
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ 
          error: "Method not allowed",
          message: "Only POST requests are supported" 
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Get the authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized",
          message: "Authorization header is required" 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Extract the JWT token from the Authorization header
    const token = authHeader.replace("Bearer ", "")
    if (!token) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized",
          message: "Valid Bearer token is required" 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
      return new Response(
        JSON.stringify({ 
          error: "Internal Server Error",
          message: "Server configuration error" 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error("Authentication error:", authError)
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized",
          message: "Invalid or expired token" 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Parse the request body
    let requestBody: AnalyzePitchDeckRequest
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return new Response(
        JSON.stringify({ 
          error: "Bad Request",
          message: "Invalid JSON in request body" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Validate required fields
    if (!requestBody.file_path || !requestBody.file_name || !requestBody.file_size) {
      return new Response(
        JSON.stringify({ 
          error: "Bad Request",
          message: "All fields are required: file_path, file_name, file_size" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (requestBody.file_size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: "Bad Request",
          message: "File size exceeds 50MB limit" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    console.log(`Starting pitch deck analysis for user ${user.id}`)
    console.log(`File: ${requestBody.file_name} (${requestBody.file_size} bytes)`)
    console.log(`Path: ${requestBody.file_path}`)
    // Download the file from storage
    console.log("Downloading file from storage...")
    // Try 'pitch-decks' first, then fall back to legacy 'documents' bucket
    let fileData: Blob | null = null
    let lastError: any = null
    const attempt = async (bucket: string) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(requestBody.file_path)
      if (data) return data
      lastError = error
      return null
    }
    fileData = await attempt("pitch-decks")
    if (!fileData) {
      console.log("Fallback to 'documents' bucket...")
      fileData = await attempt("documents")
    }
    if (!fileData) {
      console.error("File download failed:", lastError)
      return new Response(
        JSON.stringify({ 
          error: "File Download Failed",
          message: `Failed to download file: ${lastError?.message || 'Unknown error'}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    if (!fileData) {
      return new Response(
        JSON.stringify({ 
          error: "File Download Failed",
          message: "No file data received" 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    // Convert file to base64 for Gemini Vision API
    console.log("Converting file to base64 for Gemini Vision API...")
    let fileBase64: string
    let mimeType: string
    
    if (requestBody.file_name.toLowerCase().endsWith(".pdf")) {
      mimeType = "application/pdf"
      fileBase64 = await convertFileToBase64(await fileData.arrayBuffer(), mimeType)
    } else if (requestBody.file_name.toLowerCase().match(/\.(pptx?|ppt)$/)) {
      mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      fileBase64 = await convertFileToBase64(await fileData.arrayBuffer(), mimeType)
    } else {
      return new Response(
        JSON.stringify({ 
          error: "Unsupported File Type",
          message: "Only PDF and PowerPoint files are supported" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    console.log(`File conversion complete. Base64 length: ${fileBase64.length}`)

    // Generate AI prompt
    console.log("Generating AI analysis prompt...")
    const aiPrompt = generateAnalysisPrompt()

    // Call Gemini Vision API
    console.log("Calling Gemini Vision API for analysis...")
    const aiResponse = await callGeminiVisionAPI(fileBase64, aiPrompt)
    console.log("Gemini Vision analysis complete")
    // Parse AI response
    console.log("Parsing AI response...")
    const summary = parseAIResponse(aiResponse)
    console.log("Response parsing complete")
    // Convert summary to JSON string for storage
    const summaryJson = JSON.stringify(summary, null, 2)
    // Update user profile with the summary
    console.log("Updating user profile with pitch deck summary...")
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ 
        pitch_deck_summary: summaryJson,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
    if (updateError) {
      console.error("Profile update failed:", updateError)
      return new Response(
        JSON.stringify({ 
          error: "Profile Update Failed",
          message: `Failed to update profile: ${updateError.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    console.log(`? Pitch deck analysis completed successfully for user ${user.id}`)
    // Success response
    const responseData = {
      success: true,
      message: "Pitch deck analyzed successfully using Gemini Vision",
      data: {
        file_name: requestBody.file_name,
        file_size: requestBody.file_size,
        analysis_completed: true,
        summary: summary,
        summary_length: summaryJson.length,
        user_id: user.id,
        ai_provider: "Gemini 1.5 Flash Vision"
      }
    }
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Unexpected error in analyze-pitch-deck function:", error)
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
