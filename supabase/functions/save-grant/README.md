# Save Grant Edge Function

This Supabase Edge Function handles saving new grants from the Chrome Extension to the `tracked_grants` table.

## 🚀 Deployment

### Prerequisites
- Supabase CLI installed
- Authenticated with your Supabase project

### Deploy Command
```bash
supabase functions deploy save-grant
```

### Environment Variables
Make sure these are set in your Supabase project:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)

## 📡 API Endpoint

**URL**: `https://[PROJECT_REF].supabase.co/functions/v1/save-grant`

**Method**: `POST`

**Headers**:
```
Authorization: Bearer [USER_JWT_TOKEN]
Content-Type: application/json
```

## 📝 Request Body

```json
{
  "grant_name": "Small Business Innovation Research Grant",
  "grant_url": "https://example.com/grant-details",
  "notes": "AI-focused grant for small businesses",
  "application_deadline": "2024-12-31",
  "funding_amount": 50000.00,
  "eligibility_criteria": "Startups in tech sector with AI focus"
}
```

### Required Fields
- `grant_name`: Name of the grant opportunity
- `grant_url`: URL to the grant details page

### Optional Fields
- `notes`: Additional notes about the grant
- `application_deadline`: Application deadline (YYYY-MM-DD format)
- `funding_amount`: Grant amount in decimal format
- `eligibility_criteria`: Eligibility requirements and criteria

## ✅ Response

### Success (200)
```json
{
  "success": true,
  "message": "Grant saved successfully",
  "data": {
    "id": "uuid-here",
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

#### Bad Request (400)
```json
{
  "error": "Bad Request",
  "message": "grant_name and grant_url are required fields"
}
```

#### Internal Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "Failed to save grant to database",
  "details": "Error details here"
}
```

## 🔐 Authentication

The function requires a valid JWT token from Supabase Auth in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Database Schema

The function inserts data into the `tracked_grants` table:

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

-- Indexes for performance
CREATE INDEX idx_grants_user_id ON tracked_grants(user_id);
CREATE INDEX idx_grants_status ON tracked_grants(status);
CREATE INDEX idx_grants_created_at ON tracked_grants(created_at);

-- Row Level Security
ALTER TABLE tracked_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own grants" ON tracked_grants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grants" ON tracked_grants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grants" ON tracked_grants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grants" ON tracked_grants
  FOR DELETE USING (auth.uid() = user_id);
```

## 🧪 Testing

### Using cURL
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/save-grant \
  -H "Authorization: Bearer [USER_JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_name": "Test Grant",
    "grant_url": "https://example.com/test",
    "notes": "Test grant for development",
    "application_deadline": "2024-12-31",
    "funding_amount": 25000.00,
    "eligibility_criteria": "Early-stage startups in technology sector"
  }'
```

### Using JavaScript
```javascript
const response = await fetch('https://[PROJECT_REF].supabase.co/functions/v1/save-grant', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_name: 'Test Grant',
    grant_url: 'https://example.com/test',
    notes: 'Test grant for development',
    application_deadline: '2024-12-31',
    funding_amount: 25000.00,
    eligibility_criteria: 'Early-stage startups in technology sector'
  })
});

const result = await response.json();
```

## 🔒 Security Features

- **JWT Authentication**: Validates user tokens
- **Input Validation**: Validates required fields and URL format
- **CORS Support**: Configured for Chrome Extension access
- **Error Handling**: Comprehensive error responses
- **Logging**: Console logging for debugging

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if the JWT token is valid and not expired
2. **400 Bad Request**: Ensure all required fields are provided
3. **500 Internal Server Error**: Check Supabase logs and environment variables

### Debug Logs
The function logs important events to the console:
- ✅ Successful grant saves
- ❌ Authentication errors
- ❌ Database errors
- ❌ Unexpected errors

Check your Supabase Edge Function logs for debugging information.
