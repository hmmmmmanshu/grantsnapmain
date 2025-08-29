# 🔒 Pro User Security Implementation

## Overview

This document outlines the implementation of the Pro user security system that protects premium features behind a paywall. The system ensures that only users with active Pro subscriptions can access high-cost features like HyperBrowser deep scanning and AI answer refinement.

## 🏗️ Architecture

### Components

1. **Subscriptions Table**: Stores user subscription status and tier information
2. **Shared Helper Functions**: Reusable Pro user verification logic
3. **Protected Edge Functions**: Functions that check Pro status before execution
4. **Frontend Integration**: UI components that respect Pro user status

### Security Flow

```
User Request → JWT Token → Pro User Check → Feature Access
     ↓              ↓           ↓            ↓
  Frontend → Authorization → isProUser() → Allow/Block
```

## 📊 Database Schema

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Indexes

```sql
-- Efficient user lookup
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Fast Pro user queries
CREATE INDEX idx_subscriptions_status_tier ON subscriptions(status, tier);

-- Optimized Pro user check
CREATE INDEX idx_subscriptions_active_pro ON subscriptions(user_id) 
WHERE status = 'active' AND tier = 'pro';
```

### Row Level Security (RLS)

```sql
-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can manage subscriptions
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

## 🔧 Shared Helper Functions

### Location: `supabase/functions/_shared/pro-user-check.ts`

#### `isProUser(authHeader: string | null): Promise<boolean>`

**Purpose**: Checks if a user has active Pro access

**Parameters**:
- `authHeader`: The Authorization header from the request

**Returns**: `true` if user has Pro access, `false` otherwise

**Usage**:
```typescript
import { isProUser } from '../_shared/pro-user-check.ts'

// In your Edge Function
const isPro = await isProUser(req.headers.get('Authorization'))
if (!isPro) {
  return new Response(
    JSON.stringify({ 
      error: 'Pro Access Required',
      message: 'Upgrade to Pro to use this feature.' 
    }),
    { status: 403, headers: corsHeaders }
  )
}
```

#### `getUserWithProStatus(authHeader: string | null): Promise<{isPro: boolean, userId: string | null, error?: string}>`

**Purpose**: Gets user info along with Pro status for functions that need both

**Returns**: Object containing Pro status, user ID, and any error

**Usage**:
```typescript
import { getUserWithProStatus } from '../_shared/pro-user-check.ts'

const { isPro, userId, error } = await getUserWithProStatus(req.headers.get('Authorization'))
if (!isPro) {
  return new Response(
    JSON.stringify({ error: 'Pro Access Required', message: 'Upgrade to Pro to use this feature.' }),
    { status: 403, headers: corsHeaders }
  )
}
```

## 🛡️ Protected Edge Functions

### 1. trigger-deep-scan

**Feature**: HyperBrowser deep URL analysis
**Pro Required**: ✅ Yes
**Implementation**:

```typescript
// Check if user has Pro access
const isPro = await isProUser(req.headers.get('Authorization'))
if (!isPro) {
  return new Response(
    JSON.stringify({ 
      error: 'Pro Access Required',
      message: 'Upgrade to Pro to use this feature.' 
    }),
    { 
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
```

### 2. refine-ai-answer

**Feature**: AI-powered answer refinement
**Pro Required**: ✅ Yes
**Implementation**: Same Pro check as above

## 🔐 Security Features

### Authentication Verification

- **JWT Token Validation**: Verifies user identity via Supabase Auth
- **Token Extraction**: Safely extracts Bearer token from Authorization header
- **User Lookup**: Queries user information from auth.users table

### Subscription Validation

- **Active Status Check**: Ensures subscription is currently active
- **Tier Verification**: Confirms user has 'pro' tier access
- **Period Validation**: Checks if subscription is within current billing period

### Access Control

- **User Isolation**: Users can only access their own subscription data
- **Service Role Protection**: Only service role can modify subscriptions
- **Graceful Degradation**: Returns clear error messages for unauthorized access

## 📱 Frontend Integration

### Pro Status Hook

```typescript
import { useProStatus } from '@/hooks/useProStatus'

function MyComponent() {
  const { isPro, loading, error } = useProStatus()
  
  if (loading) return <div>Loading...</div>
  if (!isPro) return <UpgradeToProBanner />
  
  return <ProFeatureComponent />
}
```

### Pro Feature Components

```typescript
function ProFeatureComponent() {
  return (
    <div className="pro-feature">
      <div className="pro-badge">PRO</div>
      <h3>Deep Scan Analysis</h3>
      <p>Use HyperBrowser to analyze funder websites</p>
      <DeepScanButton />
    </div>
  )
}
```

### Upgrade Prompts

```typescript
function UpgradeToProBanner() {
  return (
    <div className="upgrade-banner">
      <h3>Upgrade to Pro</h3>
      <p>Unlock advanced features like deep scanning and AI refinement</p>
      <button onClick={handleUpgrade}>Upgrade Now</button>
    </div>
  )
}
```

## 🧪 Testing

### Test Scenarios

1. **Pro User Access**: Should allow access to protected features
2. **Basic User Access**: Should block access with 403 status
3. **Invalid Token**: Should block access with 403 status
4. **No Token**: Should block access with 403 status

### Test Script

Use the provided `test-pro-user-check.js` script to verify functionality:

```bash
# Update the script with your actual Supabase URL and test tokens
node test-pro-user-check.js
```

### Manual Testing

```bash
# Test with Pro user
curl -X POST https://your-project.supabase.co/functions/v1/trigger-deep-scan \
  -H "Authorization: Bearer PRO_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"grant_id": "test", "url_to_scan": "https://example.com"}'

# Test with basic user (should return 403)
curl -X POST https://your-project.supabase.co/functions/v1/trigger-deep-scan \
  -H "Authorization: Bearer BASIC_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"grant_id": "test", "url_to_scan": "https://example.com"}'
```

## 🚀 Deployment

### 1. Deploy Database Changes

```bash
# Apply the subscriptions table migration
supabase db push
```

### 2. Deploy Shared Helper

```bash
# The _shared folder will be deployed with each function
# No separate deployment needed
```

### 3. Deploy Protected Functions

```bash
# Deploy functions with Pro checks
supabase functions deploy trigger-deep-scan
supabase functions deploy refine-ai-answer
```

### 4. Set Environment Variables

Ensure these are set in your Supabase project:

```bash
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Monitoring

### Logs to Watch

- `✅ User {id} has active Pro subscription`
- `ℹ️ User {id} does not have Pro subscription`
- `❌ Authentication failed: {error}`
- `❌ Subscription query error: {error}`

### Metrics to Track

- Pro user access attempts
- Blocked access attempts
- Subscription status changes
- Feature usage by tier

## 🔄 Maintenance

### Subscription Management

```sql
-- Update user to Pro tier
UPDATE subscriptions 
SET tier = 'pro', status = 'active', updated_at = now()
WHERE user_id = 'user-uuid';

-- Cancel subscription
UPDATE subscriptions 
SET status = 'cancelled', updated_at = now()
WHERE user_id = 'user-uuid';
```

### Adding New Protected Features

1. Import the Pro check helper
2. Add the check at the beginning of your function
3. Return 403 for non-Pro users
4. Test with both Pro and basic users

## 🚨 Troubleshooting

### Common Issues

1. **403 Errors for Pro Users**
   - Check subscription status in database
   - Verify JWT token is valid
   - Check environment variables

2. **Authentication Failures**
   - Verify service role key is correct
   - Check Supabase URL configuration
   - Ensure JWT token format is correct

3. **Subscription Queries Failing**
   - Check RLS policies
   - Verify table structure
   - Check database permissions

### Debug Commands

```sql
-- Check user subscription status
SELECT s.*, u.email 
FROM subscriptions s 
JOIN auth.users u ON s.user_id = u.id 
WHERE u.email = 'user@example.com';

-- Check all Pro users
SELECT s.*, u.email 
FROM subscriptions s 
JOIN auth.users u ON s.user_id = u.id 
WHERE s.tier = 'pro' AND s.status = 'active';
```

## 🔮 Future Enhancements

### Planned Features

- **Usage Tracking**: Monitor feature usage per user
- **Rate Limiting**: Prevent abuse of Pro features
- **Trial Periods**: Allow temporary Pro access
- **Enterprise Tiers**: Support for team subscriptions

### Scalability Considerations

- **Caching**: Cache Pro status to reduce database queries
- **Batch Checks**: Check multiple users at once
- **Webhook Integration**: Real-time subscription updates
- **Analytics Dashboard**: Monitor Pro feature usage

---

## 📚 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Security](https://supabase.com/docs/guides/functions/security)
- [JWT Token Management](https://supabase.com/docs/guides/auth/jwt)

## 🤝 Support

For issues or questions about the Pro user security system:

1. Check the Supabase logs in your dashboard
2. Verify subscription data in the database
3. Test with the provided test script
4. Check environment variable configuration
5. Review RLS policies and permissions
