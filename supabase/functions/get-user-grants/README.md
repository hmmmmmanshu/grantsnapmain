# Get User Grants Edge Function

This Supabase Edge Function retrieves user's saved grants from the `tracked_grants` table with pagination and filtering support.

## 🚀 Deployment

### Prerequisites
- Supabase CLI installed
- Authenticated with your Supabase project

### Deploy Command
```bash
supabase functions deploy get-user-grants
```

### Environment Variables
Make sure these are set in your Supabase project:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)

## 📡 API Endpoint

**URL**: `https://[PROJECT_REF].supabase.co/functions/v1/get-user-grants`

**Method**: `GET`

**Headers**:
```
Authorization: Bearer [USER_JWT_TOKEN]
Content-Type: application/json
```

## 🔍 Query Parameters

### Pagination
- `limit`: Number of grants to return (default: 50, max: 100)
- `offset`: Number of grants to skip (default: 0)

### Filtering
- `status`: Filter by grant status (e.g., "Interested", "Applied", "Won", "Lost")

### Example URLs
```
GET /functions/v1/get-user-grants?limit=20&offset=0
GET /functions/v1/get-user-grants?status=Interested&limit=10
GET /functions/v1/get-user-grants?limit=25&offset=50
```

## ✅ Response

### Success (200)
```json
{
  "success": true,
  "message": "Grants retrieved successfully",
  "data": {
    "grants": [
      {
        "id": "uuid-here",
        "user_id": "user-uuid",
        "grant_name": "Small Business Innovation Research Grant",
        "grant_url": "https://example.com/grant-details",
        "status": "Interested",
        "application_deadline": "2024-12-31",
        "notes": "AI-focused grant for small businesses",
        "funding_amount": 50000.00,
        "eligibility_criteria": "Startups in tech sector with AI focus",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Error Responses

#### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "message": "Authorization header is required"
}
```

#### Internal Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch grants from database",
  "details": "Error details here"
}
```

## 🔐 Authentication

The function requires a valid JWT token from Supabase Auth in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Database Schema

The function queries the `tracked_grants` table:

```sql
CREATE TABLE tracked_grants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_name TEXT NOT NULL,
  grant_url TEXT NOT NULL,
  status TEXT DEFAULT 'Interested',
  application_deadline DATE,
  notes TEXT,
  funding_amount DECIMAL(15,2),
  eligibility_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testing

### Using cURL
```bash
curl -X GET "https://[PROJECT_REF].supabase.co/functions/v1/get-user-grants?limit=10" \
  -H "Authorization: Bearer [USER_JWT_TOKEN]" \
  -H "Content-Type: application/json"
```

### Using JavaScript
```javascript
const response = await fetch('https://[PROJECT_REF].supabase.co/functions/v1/get-user-grants?limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
```

## 🔒 Security Features

- **JWT Authentication**: Validates user tokens
- **Row Level Security**: Users can only access their own grants
- **Input Validation**: Validates query parameters
- **CORS Support**: Configured for Chrome Extension access
- **Error Handling**: Comprehensive error responses
- **Logging**: Console logging for debugging

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if the JWT token is valid and not expired
2. **500 Internal Server Error**: Check Supabase logs and environment variables
3. **Empty Results**: Verify user has grants and check status filters

### Debug Logs

The function logs important events to the console:
- ✅ Successful grant retrievals
- ❌ Authentication errors
- ❌ Database errors
- ❌ Unexpected errors

Check your Supabase Edge Function logs for debugging information.

## 📱 Chrome Extension Integration

This function is designed to work seamlessly with the GrantSnap Chrome Extension:

1. **Extension calls function** with user's JWT token
2. **Function validates token** and retrieves user's grants
3. **Returns paginated results** for efficient data loading
4. **Supports filtering** by status for better organization
5. **Real-time updates** when grants are modified via other functions
