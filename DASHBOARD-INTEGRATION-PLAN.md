# GrantSnap Dashboard Integration Plan

## Executive Summary

The GrantSnap Chrome Extension has been completed with AI-powered agents using Gemini 2.5 Computer Use. The Dashboard project now needs critical updates to integrate with this new infrastructure and enable RAG (Retrieval-Augmented Generation) capabilities.

## Critical Integration Requirements

### 1. RAG Vectorization Integration (Priority 1)

#### **Task 1A: Integrate vectorize-profile After Profile Updates**
**Location**: Profile Hub component (`src/components/dashboard/ProfileHub.tsx`)

**Implementation Steps**:
1. **Add vectorization call after profile save**:
   ```typescript
   // After successful profile save in ProfileHub
   const vectorizeProfile = async () => {
     try {
       setVectorizing(true);
       const response = await fetch(
         `${SUPABASE_URL}/functions/v1/vectorize-profile`,
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
       );
       
       if (response.ok) {
         const result = await response.json();
         toast.success(`Profile ready for AI! ${result.data.chunks_created} chunks created`);
       } else {
         throw new Error('Vectorization failed');
       }
     } catch (error) {
       toast.error('Failed to process profile for AI. Please try again.');
     } finally {
       setVectorizing(false);
     }
   };
   ```

2. **Add loading state UI**:
   ```tsx
   {vectorizing && (
     <div className="flex items-center space-x-2 text-sm text-blue-600">
       <Loader2 className="h-4 w-4 animate-spin" />
       <span>Preparing profile for AI...</span>
     </div>
   )}
   ```

3. **Call vectorization after successful save**:
   ```typescript
   const handleSave = async (data) => {
     const result = await saveProfile(data);
     if (result.success) {
       await vectorizeProfile(); // Add this call
     }
   };
   ```

#### **Task 1B: Create vectorize-pitch-deck Edge Function**
**Location**: New Edge Function (`supabase/functions/vectorize-pitch-deck/index.ts`)

**Implementation Steps**:
1. **Create Edge Function structure**:
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
       
       // Extract text from document
       const text = await extractTextFromDocument(file_url)
       
       // Chunk text intelligently
       const chunks = chunkTextBySections(text)
       
       // Generate embeddings
       const embeddings = await generateEmbeddings(chunks)
       
       // Store in database
       const result = await storeEmbeddings(user_id, chunks, embeddings, file_name)
       
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
   ```

2. **Add text extraction functions**:
   ```typescript
   async function extractTextFromDocument(fileUrl: string): Promise<string> {
     // For PDF files
     if (fileUrl.endsWith('.pdf')) {
       const response = await fetch(fileUrl)
       const arrayBuffer = await response.arrayBuffer()
       const pdf = await import('https://esm.sh/pdf-parse@1.1.1')
       const data = await pdf.default(arrayBuffer)
       return data.text
     }
     
     // For PowerPoint files
     if (fileUrl.endsWith('.pptx')) {
       // Implement PPTX text extraction
       // Use xml parsing or pptx library
     }
     
     // For Word documents
     if (fileUrl.endsWith('.docx')) {
       // Implement DOCX text extraction
       // Use mammoth library
     }
     
     throw new Error('Unsupported file format')
   }
   ```

3. **Integrate with Dashboard upload flow**:
   ```typescript
   // In ProfileHub or document upload component
   const handleDocumentUpload = async (file: File) => {
     try {
       // Upload to Supabase Storage
       const { data: uploadData, error: uploadError } = await supabase.storage
         .from('documents')
         .upload(`${user.id}/${file.name}`, file)
       
       if (uploadError) throw uploadError
       
       // Get public URL
       const { data: { publicUrl } } = supabase.storage
         .from('documents')
         .getPublicUrl(uploadData.path)
       
       // Call vectorization
       const response = await fetch(
         `${SUPABASE_URL}/functions/v1/vectorize-pitch-deck`,
         {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${session.access_token}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             file_url: publicUrl,
             user_id: user.id,
             file_name: file.name
           })
         }
       )
       
       if (response.ok) {
         const result = await response.json()
         toast.success(`Pitch deck analyzed! ${result.data.chunks_created} sections processed`)
       }
     } catch (error) {
       toast.error('Failed to process pitch deck')
     }
   }
   ```

### 2. Usage Tracking Updates (Priority 2)

#### **Task 2A: Update Usage Display Components**
**Location**: `src/components/dashboard/UsageTracker.tsx`

**Implementation Steps**:
1. **Update usage query to include Deep Scans**:
   ```typescript
   // In useUsageStats hook or similar
   const { data: usageStats } = useQuery({
     queryKey: ['usage-stats', user.id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('usage_stats')
         .select('deep_scans_used, monthly_autofills, month_start_date')
         .eq('user_id', user.id)
         .order('month_start_date', { ascending: false })
         .limit(1)
         .single()
       
       if (error) throw error
       return data
     }
   })
   ```

2. **Create enhanced usage display component**:
   ```tsx
   export function UsageTracker() {
     const { data: usageStats } = useUsageStats()
     const { subscription } = useAuth()
     
     const limits = {
       starter: { deepScans: 50, autofills: 30 },
       pro: { deepScans: 150, autofills: 100 },
       enterprise: { deepScans: 500, autofills: 300 }
     }[subscription?.tier] || { deepScans: 0, autofills: 0 }
     
     return (
       <div className="space-y-4">
         <UsageBar 
           label="Deep Scans"
           used={usageStats?.deep_scans_used || 0}
           limit={limits.deepScans}
           color="blue"
           icon="🔍"
         />
         <UsageBar 
           label="AI Autofills"
           used={usageStats?.monthly_autofills || 0}
           limit={limits.autofills}
           color="purple"
           icon="✨"
         />
       </div>
     )
   }
   
   function UsageBar({ label, used, limit, color, icon }) {
     const percentage = limit > 0 ? (used / limit) * 100 : 0
     const isNearLimit = percentage >= 80
     const isAtLimit = percentage >= 100
     
     return (
       <div className="space-y-2">
         <div className="flex justify-between items-center">
           <div className="flex items-center space-x-2">
             <span>{icon}</span>
             <span className="text-sm font-medium">{label}</span>
           </div>
           <div className="flex items-center space-x-2">
             <span className="text-sm text-gray-600">{used}/{limit}</span>
             {isNearLimit && (
               <span className="text-xs text-orange-600">Near limit</span>
             )}
             {isAtLimit && (
               <span className="text-xs text-red-600">At limit</span>
             )}
           </div>
         </div>
         
         <div className="w-full bg-gray-200 rounded-full h-2">
           <div 
             className={`h-2 rounded-full transition-all ${
               color === 'blue' ? 'bg-blue-600' : 'bg-purple-600'
             }`}
             style={{ width: `${Math.min(percentage, 100)}%` }}
           />
         </div>
         
         {isNearLimit && (
           <div className="text-xs text-orange-600">
             Consider upgrading to increase your limits
           </div>
         )}
       </div>
     )
   }
   ```

### 3. Computer Use Data Display (Priority 3)

#### **Task 3A: Enhance Grant Detail View**
**Location**: Grant detail component (likely in `src/components/dashboard/DetailPanel.tsx`)

**Implementation Steps**:
1. **Add Deep Scan Analysis Section**:
   ```tsx
   {grant.computer_use_scan && (
     <div className="border rounded-lg p-4 mb-4">
       <h3 className="font-semibold mb-3 flex items-center">
         <span className="mr-2">🔍</span>
         Deep Scan Analysis
       </h3>
       
       {/* Confidence Score */}
       <div className="mb-4">
         <div className="flex items-center justify-between mb-2">
           <span className="text-sm text-gray-600">Confidence Score</span>
           <span className={`px-2 py-1 rounded text-sm font-medium ${
             grant.computer_use_scan.confidence_score >= 90 
               ? 'bg-green-100 text-green-800'
               : grant.computer_use_scan.confidence_score >= 70
               ? 'bg-blue-100 text-blue-800'
               : 'bg-yellow-100 text-yellow-800'
           }`}>
             {grant.computer_use_scan.confidence_score}% Match
           </span>
         </div>
       </div>
       
       {/* Analysis Sections */}
       <div className="space-y-4">
         {grant.computer_use_scan.funder_mission && (
           <div>
             <h4 className="text-sm font-medium text-gray-900 mb-1">Funder Mission</h4>
             <p className="text-sm text-gray-600">
               {grant.computer_use_scan.funder_mission}
             </p>
           </div>
         )}
         
         {grant.computer_use_scan.eligibility_criteria && (
           <div>
             <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility Criteria</h4>
             <p className="text-sm text-gray-600">
               {grant.computer_use_scan.eligibility_criteria}
             </p>
           </div>
         )}
         
         {grant.computer_use_scan.key_themes && grant.computer_use_scan.key_themes.length > 0 && (
           <div>
             <h4 className="text-sm font-medium text-gray-900 mb-2">Key Themes</h4>
             <div className="flex flex-wrap gap-2">
               {grant.computer_use_scan.key_themes.map((theme, index) => (
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
         
         {grant.computer_use_scan.past_winners && grant.computer_use_scan.past_winners.length > 0 && (
           <div>
             <h4 className="text-sm font-medium text-gray-900 mb-2">Past Winners</h4>
             <div className="space-y-1">
               {grant.computer_use_scan.past_winners.slice(0, 3).map((winner, index) => (
                 <div key={index} className="text-sm text-gray-600">
                   • {winner}
                 </div>
               ))}
               {grant.computer_use_scan.past_winners.length > 3 && (
                 <div className="text-xs text-gray-500">
                   +{grant.computer_use_scan.past_winners.length - 3} more
                 </div>
               )}
             </div>
           </div>
         )}
       </div>
       
       {/* View Full Analysis Button */}
       <button 
         onClick={() => setShowFullAnalysis(true)}
         className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
       >
         View Full Analysis →
       </button>
     </div>
   )}
   ```

2. **Add Autofill Session Section**:
   ```tsx
   {grant.autofill_session && (
     <div className="border rounded-lg p-4 mb-4">
       <h3 className="font-semibold mb-3 flex items-center">
         <span className="mr-2">✨</span>
         AI Autofill Session
       </h3>
       
       {/* Session Stats */}
       <div className="grid grid-cols-3 gap-4 mb-4">
         <div className="text-center">
           <div className="text-2xl font-bold text-blue-600">
             {grant.autofill_session.fields_filled || 0}
           </div>
           <div className="text-xs text-gray-600">Fields Filled</div>
         </div>
         <div className="text-center">
           <div className="text-2xl font-bold text-purple-600">
             {grant.autofill_session.pages_navigated?.length || 0}
           </div>
           <div className="text-xs text-gray-600">Pages</div>
         </div>
         <div className="text-center">
           <div className={`text-2xl font-bold ${
             grant.autofill_session.status === 'completed' 
               ? 'text-green-600' 
               : grant.autofill_session.status === 'partial'
               ? 'text-yellow-600'
               : 'text-red-600'
           }`}>
             {grant.autofill_session.status}
           </div>
           <div className="text-xs text-gray-600">Status</div>
         </div>
       </div>
       
       {/* Session Details */}
       {grant.autofill_session.started_at && (
         <div className="text-xs text-gray-500 mb-2">
           Started: {new Date(grant.autofill_session.started_at).toLocaleString()}
         </div>
       )}
       
       {grant.autofill_session.completed_at && (
         <div className="text-xs text-gray-500 mb-2">
           Completed: {new Date(grant.autofill_session.completed_at).toLocaleString()}
         </div>
       )}
       
       {/* View Generated Answers Button */}
       <button 
         onClick={() => setShowGeneratedAnswers(true)}
         className="text-sm text-blue-600 hover:text-blue-700 font-medium"
       >
         View Generated Answers →
       </button>
     </div>
   )}
   ```

3. **Add Agent Screenshots Section**:
   ```tsx
   {grant.agent_screenshots && grant.agent_screenshots.length > 0 && (
     <div className="border rounded-lg p-4 mb-4">
       <h3 className="font-semibold mb-3 flex items-center">
         <span className="mr-2">📸</span>
         Agent Activity Log
       </h3>
       <div className="grid grid-cols-3 gap-2">
         {grant.agent_screenshots.map((url, index) => (
           <img 
             key={index}
             src={url} 
             alt={`Screenshot ${index + 1}`}
             className="rounded border cursor-pointer hover:scale-105 transition-transform"
             onClick={() => openScreenshotModal(url)}
           />
         ))}
       </div>
     </div>
   )}
   ```

## Implementation Timeline

### Week 1: Core Integration (Critical Path)
- **Day 1-2**: Integrate `vectorize-profile` call after profile saves
- **Day 3-5**: Create and deploy `vectorize-pitch-deck` Edge Function
- **Testing**: Verify embeddings are created and stored correctly

### Week 2: Usage Tracking & Display
- **Day 1-2**: Update usage display components with Deep Scans metric
- **Day 3-4**: Enhance Grant Detail View with Computer Use data
- **Testing**: Verify all data displays correctly across different subscription tiers

### Week 3: Polish & Enhancements
- **Day 1-2**: Add profile completion nudges and pitch deck reminders
- **Day 3-4**: Add RAG status indicators and error handling
- **Day 5**: Final testing and bug fixes

## Testing Checklist

### Vectorization Integration
- [ ] Profile saves trigger vectorization
- [ ] Success toast appears after vectorization
- [ ] Embeddings appear in database (6 chunks for profile)
- [ ] Error handling works for network failures
- [ ] Pitch deck upload triggers vectorization
- [ ] Embeddings appear in database for pitch deck
- [ ] Large files are handled gracefully

### Usage Tracking
- [ ] Both Deep Scans and Autofills display correctly
- [ ] Progress bars show accurate percentages
- [ ] Different subscription tiers show correct limits
- [ ] Upgrade prompts appear when approaching limits
- [ ] Monthly reset works correctly

### Computer Use Data Display
- [ ] Deep Scan analysis displays correctly
- [ ] Autofill session data shows properly
- [ ] Agent screenshots display in grid
- [ ] Grants without AI data still work normally
- [ ] All modals and expanded views work

## Database Validation Queries

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

-- Check usage stats
SELECT 
  user_id,
  deep_scans_used,
  monthly_autofills,
  month_start_date
FROM usage_stats
WHERE user_id = 'USER_UUID'
ORDER BY month_start_date DESC
LIMIT 1;
```

## Success Criteria

Dashboard integration is complete when:

- [ ] ✅ Profile saves trigger vectorization automatically
- [ ] ✅ Success toast shows after vectorization
- [ ] ✅ Embeddings appear in database after profile save
- [ ] ✅ Pitch deck upload triggers vectorization
- [ ] ✅ Embeddings appear in database after pitch deck upload
- [ ] ✅ Usage display shows both Deep Scans and Autofills
- [ ] ✅ Progress bars display correctly
- [ ] ✅ Grant details show Deep Scan analysis
- [ ] ✅ Grant details show autofill session data
- [ ] ✅ All features work across Free/Starter/Pro tiers
- [ ] ✅ No console errors
- [ ] ✅ No database errors
- [ ] ✅ All tests pass

## Next Steps

1. **Review this plan** with the Dashboard team
2. **Set up development environment** with access to Supabase Edge Functions
3. **Begin implementation** starting with Priority 1 tasks
4. **Coordinate with Extension team** for testing and validation
5. **Deploy incrementally** with thorough testing at each stage

This integration will complete the GrantSnap ecosystem, enabling users to leverage the full power of AI agents for grant research and application automation.
