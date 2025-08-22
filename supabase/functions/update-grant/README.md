# Update Grant Edge Function

This Supabase Edge Function allows users to update existing grant information in the `tracked_grants` table.

## 🚀 Deployment

### Prerequisites
- Supabase CLI installed
- Authenticated with your Supabase project

### Deploy Command
```bash
supabase functions deploy update-grant
```

### Environment Variables
Make sure these are set in your Supabase project:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)

## 📡 API Endpoint

**URL**: `https://[PROJECT_REF].supabase.co/functions/v1/update-grant`

**Method**: `PUT`

**Headers**:
```
Authorization: Bearer [USER_JWT_TOKEN]
Content-Type: application/json
```

## 📝 Request Body

```json
{
  "grant_id": "uuid-of-grant-to-update",
  "grant_name": "Updated Grant Name",
  "status": "Applied",
  "notes": "Updated notes about the grant",
  "funding_amount": 75000.00,
  "eligibility_criteria": "Updated eligibility requirements"
}
```

### Required Fields
- `grant_id`: UUID of the grant to update

### Optional Fields (only update what you want to change)
- `grant_name`: Updated name of the grant opportunity
- `grant_url`: Updated URL to the grant details page
- `status`: Updated status (e.g., "Interested", "Applied", "Won", "Lost")
- `application_deadline`: Updated application deadline (YYYY-MM-DD format)
- `notes`: Updated notes about the grant
- `funding_amount`: Updated grant amount in decimal format
- `eligibility_criteria`: Updated eligibility requirements

## ✅ Response

### Success (200)
```json
{
  "success": true,
  "message": "Grant updated successfully",
  "data": {
    "id": "uuid-here",
    "user_id": "user-uuid",
    "grant_name": "Updated Grant Name",
    "grant_url": "https://example.com/updated-grant-details",
    "status": "Applied",
    "application_deadline": "2024-12-31",
    "notes": "Updated notes about the grant",
    "funding_amount": 75000.00,
    "eligibility_criteria": "Updated eligibility requirements",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
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
  "message": "grant_id is required"
}
```

#### Not Found (404)
```json
{
  "error": "Not Found",
  "message": "Grant not found or access denied"
}
```

#### Internal Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "Failed to update grant in database",
  "details": "Error details here"
}
```

## 🔐 Authentication

The function requires a valid JWT token from Supabase Auth in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Database Schema

The function updates the `tracked_grants` table:

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
curl -X PUT https://[PROJECT_REF].supabase.co/functions/v1/update-grant \
  -H "Authorization: Bearer [USER_JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_id": "uuid-of-grant",
    "status": "Applied",
    "notes": "Updated notes for testing"
  }'
```

### Using JavaScript
```javascript
const response = await fetch('https://[PROJECT_REF].supabase.co/functions/v1/update-grant', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_id: 'uuid-of-grant',
    status: 'Applied',
    notes: 'Updated notes for testing'
  })
});

const result = await response.json();
```

## 🔒 Security Features

- **JWT Authentication**: Validates user tokens
- **Row Level Security**: Users can only update their own grants
- **Ownership Verification**: Checks grant ownership before allowing updates
- **Partial Updates**: Only updates provided fields
- **Input Validation**: Validates required fields
- **CORS Support**: Configured for Chrome Extension access
- **Error Handling**: Comprehensive error responses
- **Logging**: Console logging for debugging

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if the JWT token is valid and not expired
2. **400 Bad Request**: Ensure grant_id is provided in the request body
3. **404 Not Found**: Verify the grant exists and belongs to the authenticated user
4. **500 Internal Server Error**: Check Supabase logs and environment variables

### Debug Logs

The function logs important events to the console:
- ✅ Successful grant updates
- ❌ Authentication errors
- ❌ Ownership verification failures
- ❌ Database update errors
- ❌ Unexpected errors

Check your Supabase Edge Function logs for debugging information.

## 📱 Chrome Extension Integration

This function is designed to work seamlessly with the GrantSnap Chrome Extension:

1. **Extension calls function** with grant ID and updated fields
2. **Function validates ownership** to ensure user can only update their grants
3. **Partial updates supported** for efficient data modification
4. **Real-time sync** with dashboard and other extension features
5. **Status tracking** for grant application progress

## 🔄 Update Scenarios

### Status Updates
```json
{
  "grant_id": "uuid",
  "status": "Applied"
}
```

### Adding Notes
```json
{
  "grant_id": "uuid",
  "notes": "Submitted application on 2024-01-15"
}
```

### Multiple Field Updates
```json
{
  "grant_id": "uuid",
  "status": "Won",
  "funding_amount": 100000.00,
  "notes": "Grant awarded! Starting project in Q2 2024"
}
```

### Deadline Updates
```json
{
  "grant_id": "uuid",
  "application_deadline": "2024-06-30"
}
```
