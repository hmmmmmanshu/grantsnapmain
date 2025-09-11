# Get User Session Data Edge Function

This Edge Function provides user session data for the Chrome Extension integration.

## Purpose

The Chrome Extension needs to authenticate users and fetch their profile data, usage statistics, and subscription information. This function serves as the bridge between the extension and the Supabase database.

## Authentication

The function expects a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

```json
{
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "email_confirmed_at": "2024-01-01T00:00:00Z",
    "startup_name": "My Startup",
    "one_line_pitch": "We build amazing things",
    // ... other profile fields
  },
  "usage_stats": {
    "monthly_autofills": 5,
    "daily_autofills": 1,
    "last_reset": "2024-01-01T00:00:00Z"
  },
  "subscription": {
    "tier": "free",
    "status": "active",
    "expires_at": null
  },
  "permissions": {
    "can_autofill": true,
    "max_monthly_autofills": 10,
    "max_daily_autofills": 2,
    "can_export": false,
    "can_team_collaborate": false,
    "can_advanced_analytics": false
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

- **401 Unauthorized**: Invalid or missing JWT token
- **500 Internal Server Error**: Database or server error

## CORS

The function includes CORS headers to allow requests from Chrome extensions.

## Usage

The Chrome Extension calls this function after successfully reading JWT tokens from cookies set by the main dashboard application.
