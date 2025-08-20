# Auth Status Edge Function

## Overview
The `auth-status` Edge Function provides a secure endpoint for the Chrome extension to check user authentication status and retrieve user profile data. This is a critical component of **Phase 1: Dashboard Side Implementation** for the GrantSnap extension integration.

## Purpose
- **Extension Polling**: Allows the extension to check if the user is authenticated without parsing complex web pages
- **Token Validation**: Verifies JWT tokens and provides current session information
- **Profile Access**: Returns user profile data for extension context
- **Real-time Status**: Provides up-to-date authentication information

## API Endpoint
```
GET /functions/v1/auth-status
```

## Authentication
- **Required**: `Authorization: Bearer <JWT_TOKEN>` header
- **Token Source**: User's access token from Supabase Auth
- **Validation**: Token is verified against Supabase Auth service

## Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Response Format

### Success Response (200)
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "profile": {
    "id": "uuid",
    "organization_name": "Example Corp",
    "mission_statement": "Our mission...",
    "pitch_deck_summary": "AI-generated summary...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_at": "2024-01-15T11:30:00Z"
  },
  "last_updated": "2024-01-15T10:30:00Z",
  "source": "grantsnap-auth-status-endpoint"
}
```

### Error Responses

#### 401 - Missing Authorization Header
```json
{
  "error": "Missing Authorization Header",
  "message": "Authorization header is required"
}
```

#### 401 - Invalid Token Format
```json
{
  "error": "Invalid Token Format",
  "message": "Bearer token is required"
}
```

#### 401 - Authentication Failed
```json
{
  "error": "Authentication Failed",
  "message": "Invalid or expired token"
}
```

#### 500 - Server Configuration Error
```json
{
  "error": "Server Configuration Error",
  "message": "Missing required environment variables"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred while checking authentication status",
  "details": "Error details..."
}
```

## Environment Variables Required
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Usage in Extension

### 1. Check Authentication Status
```javascript
// Extension background script
async function checkAuthStatus() {
  try {
    const response = await fetch('https://your-project.supabase.co/functions/v1/auth-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const authStatus = await response.json();
      
      if (authStatus.authenticated) {
        // User is authenticated
        console.log('User authenticated:', authStatus.user.email);
        
        // Store updated tokens
        if (authStatus.session) {
          localStorage.setItem('access_token', authStatus.session.access_token);
          localStorage.setItem('refresh_token', authStatus.session.refresh_token);
        }
        
        // Update extension UI
        updateExtensionStatus('connected', authStatus.user);
      } else {
        // User not authenticated
        updateExtensionStatus('disconnected');
      }
    } else {
      // Handle error
      console.error('Auth check failed:', response.status);
      updateExtensionStatus('error');
    }
  } catch (error) {
    console.error('Auth status check error:', error);
    updateExtensionStatus('error');
  }
}
```

### 2. Polling Strategy
```javascript
// Poll every 30 seconds
setInterval(checkAuthStatus, 30000);

// Poll when popup opens
chrome.action.onClicked.addListener(() => {
  checkAuthStatus();
});

// Poll when user manually checks
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'check_auth') {
    checkAuthStatus().then(() => sendResponse({ success: true }));
    return true; // Keep message channel open for async response
  }
});
```

## Security Considerations

### 1. Token Validation
- JWT tokens are verified against Supabase Auth service
- Expired tokens return 401 Unauthorized
- Invalid tokens are rejected immediately

### 2. CORS Protection
- Function includes proper CORS headers
- Only authenticated requests are processed
- No sensitive data exposed without valid tokens

### 3. Rate Limiting
- Consider implementing rate limiting for production use
- Monitor for abuse patterns
- Implement exponential backoff for failed requests

## Integration with Dashboard

### 1. Authentication Broadcasting
This endpoint works in conjunction with the dashboard's authentication broadcasting:
- Dashboard broadcasts `USER_AUTHENTICATED` messages to extension
- Extension can poll this endpoint to verify/refresh authentication status
- Provides fallback mechanism if real-time communication fails

### 2. Profile Synchronization
- Extension receives user profile updates via this endpoint
- Profile data includes pitch deck summaries and business context
- Enables AI-enhanced grant assistance

## Deployment

### 1. Deploy Function
```bash
cd supabase/functions/auth-status
supabase functions deploy auth-status
```

### 2. Set Environment Variables
```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Test Endpoint
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/auth-status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Monitoring and Debugging

### 1. Function Logs
Check Supabase dashboard → Edge Functions → auth-status → Logs

### 2. Common Issues
- **401 Errors**: Check JWT token validity and expiration
- **500 Errors**: Verify environment variables are set
- **CORS Issues**: Ensure proper headers are sent

### 3. Performance
- Function response time: typically < 100ms
- Database queries are optimized with single queries
- Minimal data transfer for efficiency

## Future Enhancements

### 1. Caching
- Implement Redis caching for frequently accessed user data
- Cache user profiles with TTL
- Reduce database load for active users

### 2. Webhook Support
- Send real-time updates to extension when profile changes
- Eliminate need for polling in some scenarios
- Improve user experience with instant updates

### 3. Analytics
- Track authentication check frequency
- Monitor extension usage patterns
- Identify potential security issues

## Support
For issues or questions about this function:
1. Check Supabase function logs
2. Verify environment variables
3. Test with valid JWT tokens
4. Review CORS configuration
