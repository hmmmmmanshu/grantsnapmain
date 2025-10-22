# GrantSnap Dashboard: Required Code Changes Analysis

## Executive Summary

Based on the handoff document and codebase analysis, the Dashboard project needs critical updates to integrate with the new AI agent infrastructure. This analysis identifies all specific files and code changes required.

## Critical Integration Points

### 1. RAG Vectorization Integration

#### **File: `src/hooks/useProfile.ts`**
**Current State**: Handles profile saving to database
**Required Changes**: Add vectorization call after successful profile save

**Specific Changes Needed**:
```typescript
// Add after line 101 in saveProfile function
const vectorizeProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vectorize-profile`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          force_refresh: true
        })
      }
    )

    if (response.ok) {
      const result = await response.json()
      console.log(`Profile vectorized: ${result.data.chunks_created} chunks created`)
    }
  } catch (error) {
    console.error('Vectorization failed:', error)
  }
}

// Modify saveProfile function to call vectorization after successful save
// After line 101: return { data: result }
// Add: await vectorizeProfile()
```

#### **File: `src/components/dashboard/ProfileHub.tsx`**
**Current State**: Has `handleSave` function and `handlePitchDeckUpload` function
**Required Changes**: Add vectorization calls and loading states

**Specific Changes Needed**:
1. **Add vectorization state**:
```typescript
// Add after line 72
const [vectorizing, setVectorizing] = useState(false)
```

2. **Modify handleSave function** (around line 94):
```typescript
const handleSave = async () => {
  setSaving(true)
  try {
    const result = await saveProfile(formData)
    if (result.success) {
      // Add vectorization call
      await vectorizeProfile()
      toast({
        title: "Profile Saved",
        description: "Profile saved and processed for AI!",
      })
    }
  } catch (error) {
    // existing error handling
  } finally {
    setSaving(false)
  }
}
```

3. **Add vectorization function**:
```typescript
const vectorizeProfile = async () => {
  try {
    setVectorizing(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vectorize-profile`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          force_refresh: true
        })
      }
    )

    if (response.ok) {
      const result = await response.json()
      toast({
        title: "Profile Ready for AI",
        description: `${result.data.chunks_created} sections processed for AI autofill!`,
      })
    } else {
      throw new Error('Vectorization failed')
    }
  } catch (error) {
    toast({
      title: "AI Processing Failed",
      description: "Profile saved but AI processing failed. Please try again.",
      variant: "destructive",
    })
  } finally {
    setVectorizing(false)
  }
}
```

4. **Add loading state to Save button** (around line 879):
```typescript
<Button onClick={handleSave} disabled={saving || loading || vectorizing}>
  {vectorizing ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Preparing for AI...
    </>
  ) : saving ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Saving...
    </>
  ) : (
    <>
      <Save className="w-4 h-4 mr-2" />
      Save Profile
    </>
  )}
</Button>
```

#### **File: `src/hooks/useDocuments.ts`** (if exists)
**Current State**: Handles document uploads
**Required Changes**: Add pitch deck vectorization after upload

**Specific Changes Needed**:
```typescript
// Add after successful document upload
const vectorizePitchDeck = async (fileUrl: string, fileName: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vectorize-pitch-deck`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_url: fileUrl,
          user_id: user.id,
          file_name: fileName
        })
      }
    )

    if (response.ok) {
      const result = await response.json()
      toast({
        title: "Pitch Deck Analyzed",
        description: `${result.data.chunks_created} sections processed for AI!`,
      })
    }
  } catch (error) {
    toast({
      title: "Analysis Failed",
      description: "Pitch deck uploaded but AI analysis failed.",
      variant: "destructive",
    })
  }
}
```

### 2. Usage Tracking Updates

#### **File: `src/components/dashboard/UsageTracker.tsx`**
**Current State**: Shows mock usage data with `ai_generations_used` and `deep_scans_used`
**Required Changes**: Update to show both Deep Scans and AI Autofills with real data

**Specific Changes Needed**:
1. **Update interface** (around line 12):
```typescript
interface UsageStats {
  user_id: string;
  month_start_date: string;
  ai_generations_used: number;
  deep_scans_used: number;
  monthly_autofills: number; // Add this field
  updated_at: string;
}
```

2. **Update mock data** (around line 90):
```typescript
const mockUsageData = {
  current_month: new Date().toISOString().slice(0, 7),
  usage_stats: {
    user_id: user?.id || '',
    month_start_date: new Date().toISOString().split('T')[0],
    ai_generations_used: 3,
    deep_scans_used: 1,
    monthly_autofills: 2, // Add this field
    updated_at: new Date().toISOString()
  },
  // ... rest of mock data
}
```

3. **Add AI Autofills display section** (after Deep Scans section around line 350):
```typescript
{/* AI Autofills Section */}
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
        <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">AI Autofills</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Automated form filling</p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {usageData?.usage_stats.monthly_autofills || 0}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        / {usageData?.quotas.monthly_autofills || 0}
      </div>
    </div>
  </div>
  
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">Usage</span>
      <span className="text-gray-900 dark:text-gray-100">
        {usageData?.progress.monthly_autofills || 0}%
      </span>
    </div>
    <Progress 
      value={usageData?.progress.monthly_autofills || 0} 
      className="h-2"
    />
  </div>
  
  {usageData?.progress.monthly_autofills >= 80 && (
    <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
      <AlertTriangle className="h-4 w-4" />
      <span>Approaching limit</span>
    </div>
  )}
</div>
```

4. **Update planUtils.ts** (if exists) to include monthly_autofills quotas:
```typescript
// Add to plan quotas
const planQuotas = {
  basic: { ai_generations: 0, deep_scans: 0, monthly_autofills: 0 },
  starter: { ai_generations: 50, deep_scans: 50, monthly_autofills: 30 },
  pro: { ai_generations: 150, deep_scans: 150, monthly_autofills: 100 },
  enterprise: { ai_generations: 500, deep_scans: 500, monthly_autofills: 300 }
}
```

### 3. Computer Use Data Display

#### **File: `src/components/dashboard/DetailPanel.tsx`**
**Current State**: Shows basic grant information and user notes
**Required Changes**: Add sections for Deep Scan analysis and autofill session data

**Specific Changes Needed**:
1. **Add Deep Scan Analysis Section** (after line 200, before user notes):
```typescript
{/* Deep Scan Analysis Section */}
{opportunity.computer_use_scan && (
  <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
    <h3 className="font-semibold mb-3 flex items-center">
      <span className="mr-2">🔍</span>
      Deep Scan Analysis
    </h3>
    
    {/* Confidence Score */}
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Confidence Score</span>
        <span className={`px-2 py-1 rounded text-sm font-medium ${
          opportunity.computer_use_scan.confidence_score >= 90 
            ? 'bg-green-100 text-green-800'
            : opportunity.computer_use_scan.confidence_score >= 70
            ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {opportunity.computer_use_scan.confidence_score}% Match
        </span>
      </div>
    </div>
    
    {/* Analysis Sections */}
    <div className="space-y-4">
      {opportunity.computer_use_scan.funder_mission && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Funder Mission</h4>
          <p className="text-sm text-gray-600">
            {opportunity.computer_use_scan.funder_mission}
          </p>
        </div>
      )}
      
      {opportunity.computer_use_scan.eligibility_criteria && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility Criteria</h4>
          <p className="text-sm text-gray-600">
            {opportunity.computer_use_scan.eligibility_criteria}
          </p>
        </div>
      )}
      
      {opportunity.computer_use_scan.key_themes && opportunity.computer_use_scan.key_themes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Themes</h4>
          <div className="flex flex-wrap gap-2">
            {opportunity.computer_use_scan.key_themes.map((theme, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

2. **Add Autofill Session Section** (after Deep Scan section):
```typescript
{/* AI Autofill Session Section */}
{opportunity.autofill_session && (
  <div className="bg-white rounded-lg p-4 border border-purple-100 mb-4">
    <h3 className="font-semibold mb-3 flex items-center">
      <span className="mr-2">✨</span>
      AI Autofill Session
    </h3>
    
    {/* Session Stats */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {opportunity.autofill_session.fields_filled || 0}
        </div>
        <div className="text-xs text-gray-600">Fields Filled</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {opportunity.autofill_session.pages_navigated?.length || 0}
        </div>
        <div className="text-xs text-gray-600">Pages</div>
      </div>
      <div className="text-center">
        <div className={`text-2xl font-bold ${
          opportunity.autofill_session.status === 'completed' 
            ? 'text-green-600' 
            : opportunity.autofill_session.status === 'partial'
            ? 'text-yellow-600'
            : 'text-red-600'
        }`}>
          {opportunity.autofill_session.status}
        </div>
        <div className="text-xs text-gray-600">Status</div>
      </div>
    </div>
    
    {/* Session Details */}
    {opportunity.autofill_session.started_at && (
      <div className="text-xs text-gray-500 mb-2">
        Started: {new Date(opportunity.autofill_session.started_at).toLocaleString()}
      </div>
    )}
    
    {opportunity.autofill_session.completed_at && (
      <div className="text-xs text-gray-500 mb-2">
        Completed: {new Date(opportunity.autofill_session.completed_at).toLocaleString()}
      </div>
    )}
  </div>
)}
```

3. **Add Agent Screenshots Section** (after Autofill Session):
```typescript
{/* Agent Screenshots Section */}
{opportunity.agent_screenshots && opportunity.agent_screenshots.length > 0 && (
  <div className="bg-white rounded-lg p-4 border border-gray-100 mb-4">
    <h3 className="font-semibold mb-3 flex items-center">
      <span className="mr-2">📸</span>
      Agent Activity Log
    </h3>
    <div className="grid grid-cols-3 gap-2">
      {opportunity.agent_screenshots.map((url, index) => (
        <img 
          key={index}
          src={url} 
          alt={`Screenshot ${index + 1}`}
          className="rounded border cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(url, '_blank')}
        />
      ))}
    </div>
  </div>
)}
```

#### **File: `src/types/dashboard.ts`**
**Current State**: Defines `Opportunity` interface
**Required Changes**: Add Computer Use data fields

**Specific Changes Needed**:
```typescript
// Add to Opportunity interface
export interface Opportunity {
  // ... existing fields ...
  
  // Computer Use data (NEW)
  computer_use_scan?: {
    funder_mission?: string;
    eligibility_criteria?: string;
    evaluation_criteria?: string;
    past_winners?: string[];
    key_themes?: string[];
    confidence_score?: number;
    pages_visited?: string[];
  };
  
  autofill_session?: {
    started_at?: string;
    completed_at?: string;
    form_url?: string;
    fields_detected?: number;
    fields_filled?: number;
    pages_navigated?: string[];
    status?: 'completed' | 'partial' | 'failed';
    fields?: Array<{
      label: string;
      answer: string;
      confidence: number;
    }>;
  };
  
  agent_screenshots?: string[];
}
```

### 4. New Edge Function Creation

#### **File: `supabase/functions/vectorize-pitch-deck/index.ts`** (NEW FILE)
**Required**: Create new Edge Function for pitch deck vectorization

**Complete Implementation**:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { file_url, user_id, file_name } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

    // Extract text from document
    const text = await extractTextFromDocument(file_url)
    
    // Chunk text intelligently
    const chunks = chunkTextBySections(text, file_name)
    
    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks, model)
    
    // Store in database
    const result = await storeEmbeddings(supabaseClient, user_id, chunks, embeddings, file_name)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          chunks_created: result.length,
          file_name 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function extractTextFromDocument(fileUrl: string): Promise<string> {
  // Implementation for PDF, PPTX, DOCX text extraction
  // This would need actual implementation based on file type
  throw new Error('Text extraction not yet implemented')
}

function chunkTextBySections(text: string, fileName: string): Array<{text: string, metadata: any}> {
  // Implementation for intelligent text chunking
  // This would need actual implementation
  return []
}

async function generateEmbeddings(chunks: Array<{text: string, metadata: any}>, model: any): Promise<number[][]> {
  // Implementation for generating embeddings
  // This would need actual implementation
  return []
}

async function storeEmbeddings(supabaseClient: any, userId: string, chunks: any[], embeddings: number[][], fileName: string): Promise<any[]> {
  // Implementation for storing embeddings in database
  // This would need actual implementation
  return []
}
```

## Implementation Priority

### Week 1: Critical Path
1. **Profile Vectorization** - Modify `useProfile.ts` and `ProfileHub.tsx`
2. **Create vectorize-pitch-deck Edge Function**
3. **Test vectorization integration**

### Week 2: Usage & Display
1. **Update UsageTracker.tsx** with AI Autofills metric
2. **Enhance DetailPanel.tsx** with Computer Use data
3. **Update types/dashboard.ts** with new fields

### Week 3: Polish & Testing
1. **Add error handling and loading states**
2. **Test all integration points**
3. **Performance optimization**

## Testing Checklist

### Vectorization Integration
- [ ] Profile saves trigger vectorization
- [ ] Success toast appears after vectorization
- [ ] Embeddings appear in database (6 chunks for profile)
- [ ] Error handling works for network failures
- [ ] Pitch deck upload triggers vectorization
- [ ] Embeddings appear in database for pitch deck

### Usage Tracking
- [ ] Both Deep Scans and AI Autofills display correctly
- [ ] Progress bars show accurate percentages
- [ ] Different subscription tiers show correct limits
- [ ] Upgrade prompts appear when approaching limits

### Computer Use Data Display
- [ ] Deep Scan analysis displays correctly
- [ ] Autofill session data shows properly
- [ ] Agent screenshots display in grid
- [ ] Grants without AI data still work normally

## Database Validation

After implementation, verify with these queries:

```sql
-- Check embeddings for a user
SELECT 
  content_type,
  COUNT(*) as chunk_count,
  AVG(LENGTH(chunk_text)) as avg_chunk_length
FROM embeddings 
WHERE user_id = 'USER_UUID'
GROUP BY content_type;

-- Check Computer Use data
SELECT 
  id,
  grant_name,
  computer_use_scan IS NOT NULL as has_deep_scan,
  autofill_session IS NOT NULL as has_autofill,
  array_length(agent_screenshots, 1) as screenshot_count
FROM tracked_grants
WHERE user_id = 'USER_UUID'
LIMIT 10;
```

This analysis provides the complete roadmap for integrating the Dashboard with the new AI agent infrastructure, ensuring all critical functionality is properly connected.
