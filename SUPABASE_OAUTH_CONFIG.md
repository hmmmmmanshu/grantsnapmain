# Supabase OAuth Configuration Guide

## 🚨 Current Issue
Google OAuth is failing because the redirect URLs in Supabase don't match your actual production domain.

## 🔧 Required Configuration Changes

### 1. Update Site URL
**Location:** Supabase Dashboard → Authentication → URL Configuration

**Change from:**
```
https://grantsnapmain.vercel.app
```

**To:**
```
https://grantsnap.pro
```

### 2. Update Redirect URLs
**Location:** Supabase Dashboard → Authentication → URL Configuration

**Remove these URLs:**
- ❌ `https://grantsnapmain.vercel.app/auth/callback`
- ❌ `https://grantsnapmain.vercel.app/dashboard`

**Add these URLs:**
- ✅ `https://grantsnap.pro/auth/callback`
- ✅ `https://www.grantsnap.pro/auth/callback`
- ✅ `https://grantsnap.pro/dashboard`
- ✅ `https://www.grantsnap.pro/dashboard`
- ✅ `http://localhost:5173/auth/callback` (for development)

### 3. Update Google OAuth Provider
**Location:** Supabase Dashboard → Authentication → Providers → Google

**Redirect URL should be:**
```
https://grantsnap.pro/auth/v1/callback
```

## 📝 What We Fixed in Code

### Updated `src/hooks/useAuth.ts`
- Added `getRedirectUrl()` helper function
- Uses `https://grantsnap.pro` for production
- Uses `http://localhost:5173` for development
- Applied to all OAuth redirects:
  - Google OAuth sign-in
  - Email verification
  - Password reset
  - Email resend

### The `getRedirectUrl()` Function
```typescript
const getRedirectUrl = (path: string) => {
  if (import.meta.env.DEV) {
    return `http://localhost:5173${path}`
  }
  // Production domain
  return `https://grantsnap.pro${path}`
}
```

## 🎯 Expected Result
After updating Supabase configuration:
1. ✅ Google OAuth will work in production
2. ✅ Users will be redirected to `https://grantsnap.pro/auth/callback`
3. ✅ OAuth flow will complete successfully
4. ✅ Users will land on the dashboard

## 🧪 Testing
1. **Development:** OAuth should work on `localhost:5173`
2. **Production:** OAuth should work on `grantsnap.pro`
3. **Both environments** should redirect to the correct callback URL

## 📋 Checklist
- [ ] Update Supabase Site URL to `https://grantsnap.pro`
- [ ] Remove old redirect URLs with `grantsnapmain.vercel.app`
- [ ] Add new redirect URLs with `grantsnap.pro`
- [ ] Verify Google OAuth provider redirect URL
- [ ] Test OAuth flow in development
- [ ] Test OAuth flow in production
- [ ] Verify successful redirects to dashboard

## 🔍 Why This Fixes the Issue
The problem was a mismatch between:
- **Code:** Using `window.location.origin` (which was `grantsnapmain.vercel.app`)
- **Supabase:** Expecting redirects to `grantsnapmain.vercel.app`
- **Reality:** Your actual domain is `grantsnap.pro`

Now everything is aligned to use your correct production domain.
