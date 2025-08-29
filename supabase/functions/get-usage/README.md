# Get Usage Edge Function

This Edge Function retrieves user usage statistics and subscription information for the GrantSnap platform.

## Overview

The `get-usage` function provides comprehensive usage tracking for Pro features including:
- AI answer refinements
- HyperBrowser deep scans
- Current subscription status and quotas
- Progress tracking towards monthly limits

## API Endpoint

```
GET /functions/v1/get-usage
```

## Authentication

Requires a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "current_month": "2024-01-01",
    "usage_stats": {
      "user_id": "uuid",
      "month_start_date": "2024-01-01",
      "ai_generations_used": 15,
      "deep_scans_used": 8,
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "subscription": {
      "tier": "pro",
      "status": "active",
      "current_period_start": "2024-01-01T00:00:00Z",
      "current_period_end": "2024-02-01T00:00:00Z"
    },
    "quotas": {
      "ai_generations": 100,
      "deep_scans": 50
    },
    "progress": {
      "ai_generations": 15,
      "deep_scans": 16
    }
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authorization header is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Features

### Automatic Usage Record Creation
- Creates usage records for new months automatically
- Handles first-time users seamlessly

### Subscription Quotas
- **Basic**: 0 AI generations, 0 deep scans
- **Pro**: 100 AI generations, 50 deep scans
- **Enterprise**: 500 AI generations, 200 deep scans

### Progress Calculation
- Returns percentage usage for each feature
- Capped at 100% for display purposes
- Real-time tracking of usage against limits

## Database Schema

The function interacts with:
- `usage_stats` table for tracking monthly usage
- `subscriptions` table for plan information
- `auth.users` for user verification

## Security

- JWT token validation
- User isolation (users can only see their own data)
- Service role authentication for database operations

## Usage Examples

### Frontend Integration
```typescript
const response = await fetch('/functions/v1/get-usage', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
});

const usageData = await response.json();
```

### Display Usage Progress
```typescript
const { usage_stats, quotas, progress } = usageData.data;

// Show progress bars
<Progress value={progress.ai_generations} />
<Progress value={progress.deep_scans} />

// Display usage counts
<p>{usage_stats.ai_generations_used} / {quotas.ai_generations} AI generations</p>
<p>{usage_stats.deep_scans_used} / {quotas.deep_scans} deep scans</p>
```

## Deployment

Deploy using Supabase CLI:
```bash
supabase functions deploy get-usage
```

## Environment Variables

Required:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

## Monitoring

The function logs:
- Successful usage retrievals
- Authentication errors
- Database operation failures
- Usage statistics for debugging

## Related Functions

- `trigger-deep-scan`: Increments deep scan usage
- `refine-ai-answer`: Increments AI generation usage
- Both functions automatically update usage stats when called
