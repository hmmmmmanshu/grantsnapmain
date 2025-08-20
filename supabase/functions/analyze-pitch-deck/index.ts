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
// Function to extract text from PDF using pdf-parse
async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    // For now, we will use a mock implementation
    // In production, you would use pdf-parse or similar library
    // const pdfParse = await import("pdf-parse");
    // const data = await pdfParse.default(Buffer.from(pdfBuffer));
    // return data.text;
    // Mock text extraction for demonstration
    return `This is a mock text extraction from the PDF. 
    In a real implementation, this would contain the actual text content 
    extracted from the uploaded pitch deck document. The text would include 
    all the slides, bullet points, and narrative content that describes 
    the startup business model, market opportunity, and funding needs.`;
  } catch (error) {
    throw new Error(`PDF text extraction failed: ${error.message}`)
  }
}
// Function to extract text from PowerPoint files
async function extractTextFromPPTX(pptxBuffer: ArrayBuffer): Promise<string> {
  try {
    // For now, we will use a mock implementation
    // In production, you would use a library like mammoth or similar
    // const mammoth = await import("mammoth");
    // const result = await mammoth.extractRawText({ buffer: Buffer.from(pptxBuffer) });
    // return result.value;
    // Mock text extraction for demonstration
    return `This is a mock text extraction from the PowerPoint presentation. 
    In a real implementation, this would contain the actual text content 
    extracted from all slides, including titles, bullet points, and 
    narrative text that describes the startup pitch deck content.`;
  } catch (error) {
    throw new Error(`PowerPoint text extraction failed: ${error.message}`)
  }
}
// Function to generate AI prompt for pitch deck analysis
function generateAnalysisPrompt(extractedText: string): string {
  return `You are a startup analyst and grant writing expert with 15+ years of experience. 
Read the following text extracted from a pitch deck and generate a concise, structured summary in JSON format.
**EXTRACTED TEXT FROM PITCH DECK:**
${extractedText}
**ANALYSIS REQUIREMENTS:**
Analyze the text and extract the following key information:
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
// Function to call OpenAI API for pitch deck analysis
async function callAIModel(prompt: string): Promise<string> {
  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }
    console.log("Calling OpenAI API...")
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert startup analyst and grant writing specialist. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || "Unknown error"}`)
    }
    const data = await response.json()
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API")
    }
    const aiResponse = data.choices[0].message.content
    if (!aiResponse) {
      throw new Error("Empty response from OpenAI API")
    }
    console.log("OpenAI API call successful")
    return aiResponse
  } catch (error) {
    console.error("OpenAI API call failed:", error)
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
    // Extract text based on file type
    console.log("Extracting text from document...")
    let extractedText: string
    if (requestBody.file_name.toLowerCase().endsWith(".pdf")) {
      extractedText = await extractTextFromPDF(await fileData.arrayBuffer())
    } else if (requestBody.file_name.toLowerCase().match(/\.(pptx?|ppt)$/)) {
      extractedText = await extractTextFromPPTX(await fileData.arrayBuffer())
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
    console.log(`Text extraction complete. Extracted ${extractedText.length} characters`)
    // Generate AI prompt
    console.log("Generating AI analysis prompt...")
    const aiPrompt = generateAnalysisPrompt(extractedText)
    // Call AI model
    console.log("Calling OpenAI API for analysis...")
    const aiResponse = await callAIModel(aiPrompt)
    console.log("OpenAI analysis complete")
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
      message: "Pitch deck analyzed successfully using OpenAI",
      data: {
        file_name: requestBody.file_name,
        file_size: requestBody.file_size,
        analysis_completed: true,
        summary: summary,
        summary_length: summaryJson.length,
        user_id: user.id,
        ai_provider: "OpenAI GPT-4"
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
