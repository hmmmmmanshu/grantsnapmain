# Sync User Context Edge Function

## Purpose
This Edge Function aggregates all user data from multiple tables and generates an AI-powered comprehensive summary using Gemini AI. This context is essential for RAG (Retrieval-Augmented Generation) systems and personalized grant matching.

## What It Does

1. **Aggregates User Data** from multiple sources:
   - User profile information (62+ fields)
   - Pitch deck analysis
   - Uploaded documents
   - Tracked grants
   - Founder information

2. **Generates AI Summary** using Gemini 1.5 Flash:
   - Executive summary of the startup
   - Key strengths and unique selling points
   - Funding readiness assessment
   - Recommended next actions
   - Profile completeness analysis
   - AI-generated insights

3. **Stores Context** in `user_profiles` table:
   - Saves AI-generated summary as JSON
   - Updates `ai_context_summary` field
   - Records `context_last_updated` timestamp

## API Endpoint

```
POST /functions/v1/sync-user-context
```

## Authentication

Requires valid JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Request

No request body required. The function uses the authenticated user's ID to fetch all relevant data.

## Response

### Success (200)
```json
{
  "success": true,
  "message": "User context synchronized successfully",
  "data": {
    "user_id": "uuid",
    "aggregated_data": {
      "profile_fields_completed": 42,
      "pitch_deck_analyzed": true,
      "documents_uploaded": 3,
      "grants_tracked": 15,
      "founders_added": 2,
      "completion_percentage": 75
    },
    "ai_summary": {
      "executive_summary": "...",
      "key_strengths": ["...", "..."],
      "funding_readiness": "...",
      "recommended_actions": ["...", "..."],
      "profile_completeness": "...",
      "ai_insights": "..."
    },
    "last_updated": "2025-10-22T12:00:00Z"
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "details": "Error details here"
}
```

## Environment Variables Required

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `GEMINI_API_KEY`: Google Gemini API key for AI analysis

## Database Schema Updates

This function requires the following columns in `user_profiles` table:

```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ai_context_summary TEXT,
ADD COLUMN IF NOT EXISTS context_last_updated TIMESTAMP WITH TIME ZONE;
```

## Usage in Frontend

```typescript
const syncContext = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/sync-user-context`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const result = await response.json();
  console.log('Context synced:', result.data.ai_summary);
};
```

## Benefits for RAG System

1. **Unified Context**: Single source of truth for all user information
2. **AI-Enhanced**: Gemini analyzes and extracts key insights automatically
3. **Structured Data**: JSON format perfect for vector embeddings
4. **Real-time Updates**: Can be triggered whenever user updates their profile
5. **Grant Matching**: Provides rich context for personalized recommendations

## Future Enhancements

- [ ] Add vector embeddings generation for semantic search
- [ ] Implement incremental updates (only sync changed data)
- [ ] Add caching layer to reduce API calls
- [ ] Support for custom analysis prompts
- [ ] Integration with other AI models for comparison

