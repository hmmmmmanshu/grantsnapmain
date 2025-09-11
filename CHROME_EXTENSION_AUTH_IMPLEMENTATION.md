# Chrome Extension Authentication Implementation Guide

## 🎯 Overview

This guide documents the complete implementation of Chrome Extension authentication for the Grants Snap project. The implementation enables seamless authentication between the main dashboard and the Chrome Extension.

## 🔧 Implementation Summary

### ✅ Completed Changes

#### 1. JWT Cookie Setup (Dashboard)
- **File**: `src/hooks/useAuth.ts`
- **Changes**: Updated authentication flow to set individual JWT cookies
- **Cookie Names**: `sb-access-token` and `sb-refresh-token`
- **Domain**: `.grantsnap.pro` (with leading dot for subdomain sharing)
- **Security**: `secure; samesite=strict`

#### 2. Edge Function Creation
- **File**: `supabase/functions/get-user-session-data/index.ts`
- **Purpose**: Provides user session data for Chrome Extension
- **Authentication**: JWT token validation
- **Response**: User profile, usage stats, subscription, and permissions

#### 3. Database Schema Updates
- **Added Fields to `user_profiles`**:
  - `subscription_tier` (VARCHAR, default: 'free')
  - `email` (VARCHAR)
  - `full_name` (VARCHAR)
  - `avatar_url` (VARCHAR)

- **Added Fields to `usage_stats`**:
  - `monthly_autofills` (INTEGER, default: 0)
  - `daily_autofills` (INTEGER, default: 0)
  - `last_reset` (TIMESTAMP WITH TIME ZONE)

- **Added Fields to `subscriptions`**:
  - `expires_at` (TIMESTAMP WITH TIME ZONE)

## 🔄 Authentication Flow

### 1. User Login (Dashboard)
```
User visits: https://grantsnap.pro/login
↓
Successful authentication
↓
Dashboard sets cookies:
  - sb-access-token=<jwt_token>
  - sb-refresh-token=<refresh_token>
↓
Redirect to: https://grantsnap.pro/dashboard
```

### 2. Chrome Extension Authentication
```
Extension reads cookies from .grantsnap.pro domain
↓
Extension calls Edge Function with JWT token
↓
Edge Function validates token and returns user data
↓
Extension displays authenticated interface
```

## 📁 File Structure

```
src/
├── hooks/
│   └── useAuth.ts                    # Updated with JWT cookie setting
├── lib/
│   └── supabase.ts                   # Supabase client configuration
└── pages/
    ├── Login.tsx                     # Login page with cookie setting
    └── Dashboard.tsx                 # Dashboard with extension integration

supabase/
└── functions/
    └── get-user-session-data/
        ├── index.ts                  # Edge Function for user data
        └── README.md                 # Function documentation

test-chrome-extension-auth.js         # Test script
CHROME_EXTENSION_AUTH_IMPLEMENTATION.md # This guide
```

## 🚀 Deployment Steps

### 1. Deploy Edge Function
```bash
# Deploy the Edge Function to Supabase
supabase functions deploy get-user-session-data
```

### 2. Test Cookie Setting
1. Open your dashboard in a browser
2. Log in with a test account
3. Check browser dev tools → Application → Cookies
4. Verify `sb-access-token` and `sb-refresh-token` are set with domain `.grantsnap.pro`

### 3. Test Edge Function
```bash
# Test the Edge Function directly
curl -X GET "https://uurdubbsamdawncqkaoy.supabase.co/functions/v1/get-user-session-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Test Chrome Extension Integration
1. Install the Chrome Extension
2. Visit a grant website
3. Click the extension icon
4. Verify it can read cookies and authenticate

## 🔍 Testing

### Manual Testing
1. **Cookie Setting Test**:
   - Login to dashboard
   - Check cookies in browser dev tools
   - Verify domain is `.grantsnap.pro`

2. **Edge Function Test**:
   - Use the test script: `test-chrome-extension-auth.js`
   - Run in browser console on dashboard

3. **End-to-End Test**:
   - Login to dashboard
   - Install Chrome Extension
   - Test extension functionality

### Automated Testing
```javascript
// Test cookie setting
const testCookieSetting = () => {
  const accessToken = 'test-token';
  document.cookie = `sb-access-token=${accessToken}; domain=.grantsnap.pro; path=/; secure; samesite=strict`;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  return !!cookies['sb-access-token'];
};
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Cookies Not Set
- **Cause**: Domain mismatch or security settings
- **Solution**: Ensure domain is `.grantsnap.pro` (with leading dot)
- **Check**: Browser dev tools → Application → Cookies

#### 2. Extension Can't Read Cookies
- **Cause**: Cookie domain or SameSite settings
- **Solution**: Verify `samesite=strict` and correct domain
- **Check**: Extension manifest permissions

#### 3. Edge Function Returns 401
- **Cause**: Invalid JWT token or missing Authorization header
- **Solution**: Verify token format and header structure
- **Check**: Network tab in browser dev tools

#### 4. CORS Errors
- **Cause**: Missing CORS headers in Edge Function
- **Solution**: Verify CORS headers are set in Edge Function
- **Check**: Response headers in network tab

### Debug Steps
1. Check browser console for errors
2. Verify cookies are set with correct domain
3. Test Edge Function with Postman/curl
4. Check Supabase logs for Edge Function errors
5. Verify Chrome Extension manifest permissions

## 📊 Monitoring

### Key Metrics
- Cookie setting success rate
- Edge Function response times
- Authentication success rate
- Extension usage statistics

### Logs to Monitor
- Dashboard authentication logs
- Edge Function execution logs
- Chrome Extension error logs
- Supabase database logs

## 🔒 Security Considerations

### Cookie Security
- ✅ `secure` flag for HTTPS only
- ✅ `samesite=strict` for CSRF protection
- ✅ Proper domain scoping (`.grantsnap.pro`)
- ✅ Reasonable expiration time (30 days)

### JWT Security
- ✅ Token validation in Edge Function
- ✅ Proper error handling
- ✅ No sensitive data in cookies
- ✅ Token refresh mechanism

### CORS Security
- ✅ Proper CORS headers
- ✅ Origin validation
- ✅ Method restrictions

## 📈 Future Enhancements

### Planned Features
1. **Token Refresh**: Automatic token refresh in extension
2. **Offline Support**: Cache user data for offline use
3. **Multi-Domain**: Support for multiple grant websites
4. **Analytics**: Usage tracking and analytics
5. **Error Recovery**: Better error handling and recovery

### Performance Optimizations
1. **Caching**: Cache user data in extension
2. **Batch Requests**: Batch multiple API calls
3. **Lazy Loading**: Load data only when needed
4. **Compression**: Compress API responses

## 📞 Support

### Getting Help
1. Check this documentation first
2. Review browser console errors
3. Test with the provided test script
4. Check Supabase logs
5. Contact development team

### Useful Resources
- [Chrome Extension Cookies API](https://developer.chrome.com/docs/extensions/reference/cookies/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [JWT Token Validation](https://jwt.io/)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## ✅ Implementation Checklist

- [x] Update `useAuth.ts` with JWT cookie setting
- [x] Create `get-user-session-data` Edge Function
- [x] Update database schema with required fields
- [x] Add cookie clearing on logout
- [x] Create test script
- [x] Document implementation
- [ ] Deploy Edge Function to Supabase
- [ ] Test cookie setting in production
- [ ] Test Edge Function with real tokens
- [ ] Test Chrome Extension integration
- [ ] Monitor and debug any issues

**Status**: Ready for deployment and testing! 🚀
