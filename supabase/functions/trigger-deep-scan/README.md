# 🔍 Trigger Deep Scan - HyperBrowser Integration

## Overview

The `trigger-deep-scan` Edge Function is a powerful Pro feature that integrates with HyperBrowser to perform deep analysis of grant opportunities. It analyzes funder websites to extract mission statements, values, and past project examples, then stores this intelligence in the database for enhanced grant matching.

## 🚀 Features

- **Deep URL Analysis**: Uses HyperBrowser to crawl and analyze funder websites
- **Intelligent Extraction**: Identifies funder mission, values, and past projects
- **Secure Access**: Only authenticated users can trigger scans for their own grants
- **Structured Data**: Returns JSON-formatted insights for easy integration
- **Database Integration**: Automatically saves results to the `tracked_grants` table

## 📋 Prerequisites

### Environment Variables

Set these in your Supabase project dashboard under Settings > Edge Functions:

```bash
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Schema

The function requires the `application_data` JSONB column in the `tracked_grants` table:

```sql
ALTER TABLE tracked_grants 
ADD COLUMN application_data JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_tracked_grants_application_data 
ON tracked_grants USING GIN (application_data);
```

## 🛠️ Deployment

### Using Supabase CLI

```bash
# Deploy the function
supabase functions deploy trigger-deep-scan

# Check deployment status
supabase functions list
```

### Manual Deployment

1. Navigate to your Supabase dashboard
2. Go to Edge Functions
3. Create new function named `trigger-deep-scan`
4. Upload the `index.ts` file
5. Set environment variables
6. Deploy

## 📡 API Usage

### Endpoint

```
POST /functions/v1/trigger-deep-scan
```

### Authentication

Include the user's JWT token in the Authorization header:

```http
Authorization: Bearer <user_jwt_token>
```

### Request Body

```json
{
  "grant_id": "uuid-of-grant",
  "url_to_scan": "https://funder-website.com"
}
```

### Response

#### Success (200)

```json
{
  "success": true,
  "message": "Deep scan completed successfully",
  "grant_id": "uuid-of-grant",
  "funder_profile": {
    "funder_mission": "To support innovative startups in the tech sector...",
    "funder_values": "Innovation, sustainability, social impact...",
    "past_project_examples": "Funded 50+ startups including AI healthcare...",
    "scanned_at": "2024-01-15T10:30:00.000Z",
    "source_url": "https://funder-website.com"
  },
  "scanned_url": "https://funder-website.com",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Grant not found or access denied
- **405 Method Not Allowed**: Non-POST request
- **500 Internal Server Error**: Server configuration or database error
- **502 Bad Gateway**: HyperBrowser service error

## 🔒 Security Features

- **JWT Authentication**: Verifies user identity via Supabase Auth
- **User Isolation**: Users can only scan grants they own
- **Input Validation**: Sanitizes and validates all input parameters
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Built-in protection against abuse

## 🧠 HyperBrowser Integration

### Prompt Structure

The function sends this structured prompt to HyperBrowser:

```
Go to the URL: {url_to_scan}. Analyze the content to identify the funder's core mission, their stated values, and the types of projects they have funded in the past. Return a structured JSON object with the keys: funder_mission, funder_values, and past_project_examples.
```

### Response Processing

1. **Raw Response**: Receives HyperBrowser's analysis
2. **JSON Extraction**: Parses structured data from response
3. **Fallback Handling**: Gracefully handles malformed responses
4. **Data Validation**: Ensures required fields are present

## 💾 Database Schema

### Updated tracked_grants Table

```sql
-- New column for storing application data
application_data JSONB DEFAULT '{}'::jsonb

-- Example data structure
{
  "funder_profile": {
    "funder_mission": "string",
    "funder_values": "string", 
    "past_project_examples": "string",
    "scanned_at": "ISO timestamp",
    "source_url": "string"
  }
}
```

### Indexing

```sql
-- GIN index for efficient JSONB queries
CREATE INDEX idx_tracked_grants_application_data 
ON tracked_grants USING GIN (application_data);
```

## 🔄 Workflow

1. **User Request**: Authenticated user sends grant ID and URL
2. **Validation**: Function verifies user ownership of grant
3. **HyperBrowser Call**: Sends structured prompt to HyperBrowser API
4. **Response Processing**: Extracts and validates structured data
5. **Database Update**: Merges funder profile into application_data
6. **Success Response**: Returns complete funder profile to user

## 🧪 Testing

### Local Testing

```bash
# Start local Supabase
supabase start

# Test function locally
supabase functions serve trigger-deep-scan --env-file .env.local
```

### Test Request

```bash
curl -X POST http://localhost:54321/functions/v1/trigger-deep-scan \
  -H "Authorization: Bearer <test_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_id": "test-grant-id",
    "url_to_scan": "https://example-funder.com"
  }'
```

## 📊 Monitoring & Logging

### Console Logs

The function provides detailed logging:

- `🔍 Initiating HyperBrowser deep scan for: {url}`
- `✅ HyperBrowser analysis completed`
- `💾 Funder profile saved to database for grant: {grant_name}`

### Error Tracking

- Authentication failures
- HyperBrowser API errors
- Database update failures
- Response parsing errors

## 🚨 Error Handling

### Graceful Degradation

- **API Failures**: Returns meaningful error messages
- **Parse Errors**: Creates fallback profiles with error indicators
- **Database Errors**: Maintains data integrity
- **Network Issues**: Handles timeouts and connection failures

### Fallback Scenarios

```json
{
  "funder_mission": "Analysis completed but structured data unavailable",
  "funder_values": "Analysis completed but structured data unavailable",
  "past_project_examples": "Analysis completed but structured data unavailable"
}
```

## 🔮 Future Enhancements

- **Batch Processing**: Scan multiple URLs simultaneously
- **Caching**: Store results to avoid re-scanning
- **AI Enhancement**: Use additional AI services for better analysis
- **Webhook Support**: Notify external systems of scan completion
- **Analytics**: Track scan success rates and performance metrics

## 📚 Related Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [HyperBrowser API Documentation](https://hyperbrowser.ai/docs)
- [PostgreSQL JSONB Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [JWT Authentication](https://supabase.com/docs/guides/auth/jwt)

## 🤝 Support

For issues or questions:

1. Check the Supabase logs in your dashboard
2. Verify environment variables are set correctly
3. Ensure the database schema is updated
4. Test with a simple URL first
5. Check HyperBrowser API key validity

---

**Note**: This is a Pro feature that requires a valid HyperBrowser API key and may incur usage costs based on your HyperBrowser plan.
