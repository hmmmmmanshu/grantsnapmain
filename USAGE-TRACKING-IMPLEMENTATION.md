# Usage Tracking System Implementation

## Overview

This document outlines the complete implementation of the usage tracking system for GrantSnap, including backend infrastructure, frontend components, and integration with existing Pro user features.

## 🏗️ **Backend Infrastructure**

### **1. Database Schema**

#### **Usage Stats Table**
```sql
CREATE TABLE public.usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start_date DATE NOT NULL,
  ai_generations_used INTEGER DEFAULT 0,
  deep_scans_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one record per user per month
  UNIQUE(user_id, month_start_date)
);
```

**Key Features:**
- **Monthly tracking**: Resets usage counters monthly
- **Unique constraint**: One record per user per month
- **Automatic creation**: New months are created automatically
- **RLS policies**: Users can only see their own usage

#### **Indexes for Performance**
```sql
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_month ON usage_stats(month_start_date);
CREATE INDEX idx_usage_stats_user_month ON usage_stats(user_id, month_start_date);
```

### **2. Edge Functions**

#### **get-usage Function**
- **Endpoint**: `GET /functions/v1/get-usage`
- **Purpose**: Retrieve current month usage and subscription details
- **Features**:
  - Automatic usage record creation for new months
  - Subscription quota calculation
  - Progress percentage calculation
  - Comprehensive error handling

#### **Usage Tracking Integration**
- **trigger-deep-scan**: Increments `deep_scans_used` counter
- **refine-ai-answer**: Increments `ai_generations_used` counter
- **Automatic updates**: Usage tracking doesn't fail the main operation

### **3. Subscription Quotas**

| Plan | AI Generations | Deep Scans | Price |
|------|----------------|------------|-------|
| Basic | 0 | 0 | Free |
| Pro | 100 | 50 | $29/month |
| Enterprise | 500 | 200 | $99/month |

## 🎨 **Frontend Components**

### **1. Pro Badge Component**

#### **Features**
- **Elegant design**: Apple + Notion inspired styling
- **Dynamic display**: Only shows for Pro/Enterprise users
- **Multiple sizes**: Regular and small variants
- **Visual hierarchy**: Crown icon for Pro, Sparkles for Enterprise

#### **Usage**
```tsx
// In dashboard header
<ProBadge tier={subscription.tier} />

// Small variant for compact spaces
<ProBadgeSmall tier={subscription.tier} />
```

### **2. Usage Tracker Component**

#### **Features**
- **Real-time data**: Fetches usage from Edge Function
- **Progress bars**: Visual representation of usage limits
- **Subscription info**: Current plan details and renewal dates
- **Responsive design**: Works on all screen sizes

#### **Data Display**
- AI Generations usage with progress bar
- Deep Scans usage with progress bar
- Current month billing period
- Days until renewal
- Refresh functionality

### **3. Enhanced Billing Section**

#### **Features**
- **Current plan overview**: Visual plan representation
- **Billing details**: Start dates, renewal dates, status
- **Plan comparison**: Side-by-side feature comparison
- **Action buttons**: Upgrade, change plan, manage billing

#### **Plan Features Display**
- **Basic**: Core grant management, templates, email support
- **Pro**: AI features, deep scans, priority support, analytics
- **Enterprise**: Team collaboration, custom integrations, white-label

## 🔄 **Data Flow**

### **1. Usage Tracking Flow**
```
User Action → Edge Function → Database Update → Usage Stats
     ↓
Frontend Fetch → Display Update → Progress Bars
```

### **2. Real-time Updates**
- Usage counters increment immediately after feature use
- Dashboard refreshes show updated counts
- Progress bars update in real-time
- Subscription status updates automatically

### **3. Monthly Reset**
- New month automatically creates new usage record
- Previous month data preserved for analytics
- Seamless transition between billing periods

## 🛡️ **Security Features**

### **1. Authentication**
- JWT token validation on all requests
- User isolation (users only see their own data)
- Service role authentication for database operations

### **2. Data Protection**
- Row Level Security (RLS) policies
- Encrypted data transmission
- Secure environment variable handling

### **3. Access Control**
- Pro features protected by subscription checks
- Usage limits enforced at function level
- Graceful degradation for unauthorized access

## 📱 **User Experience**

### **1. Visual Design**
- **Apple + Notion aesthetic**: Clean, modern interface
- **Progress indicators**: Clear visual feedback on usage
- **Responsive layout**: Works on all devices
- **Loading states**: Smooth transitions and feedback

### **2. Information Architecture**
- **Usage overview**: Quick glance at current status
- **Detailed breakdown**: Feature-by-feature usage
- **Subscription details**: Plan information and billing
- **Action items**: Clear next steps for users

### **3. Accessibility**
- **Color coding**: Visual indicators for usage levels
- **Progress bars**: Clear representation of limits
- **Responsive text**: Readable on all screen sizes
- **Interactive elements**: Clear hover and focus states

## 🚀 **Deployment**

### **1. Backend Deployment**
```bash
# Deploy database changes
supabase db push

# Deploy Edge Functions
supabase functions deploy get-usage
supabase functions deploy trigger-deep-scan
supabase functions deploy refine-ai-answer
```

### **2. Frontend Integration**
- Components automatically imported and used
- No additional build steps required
- Responsive design works out of the box

### **3. Environment Variables**
```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 📊 **Monitoring & Analytics**

### **1. Usage Metrics**
- Monthly feature usage per user
- Subscription tier distribution
- Feature adoption rates
- Billing cycle analytics

### **2. Error Tracking**
- Authentication failures
- Database operation errors
- Function execution logs
- User experience issues

### **3. Performance Metrics**
- Response times for usage queries
- Database query performance
- Function execution times
- User interaction patterns

## 🔮 **Future Enhancements**

### **1. Advanced Analytics**
- Usage trend analysis
- Feature popularity metrics
- User behavior insights
- Predictive analytics

### **2. Billing Integration**
- Stripe payment processing
- Automated billing cycles
- Usage-based pricing
- Invoice generation

### **3. Team Features**
- Team usage aggregation
- Admin dashboards
- Usage reporting
- Cost allocation

## 📋 **Testing**

### **1. Unit Tests**
- Component rendering
- Data fetching logic
- Error handling
- Edge cases

### **2. Integration Tests**
- End-to-end workflows
- API interactions
- Database operations
- User flows

### **3. User Acceptance Tests**
- Pro user workflows
- Basic user limitations
- Upgrade processes
- Billing management

## 🎯 **Success Metrics**

### **1. User Engagement**
- Feature usage rates
- Subscription upgrades
- User retention
- Support ticket reduction

### **2. Business Impact**
- Revenue generation
- Customer satisfaction
- Feature adoption
- Market positioning

### **3. Technical Performance**
- System reliability
- Response times
- Error rates
- Scalability metrics

## 📚 **Documentation**

### **1. API Documentation**
- Complete endpoint specifications
- Request/response examples
- Error handling guides
- Integration tutorials

### **2. User Guides**
- Feature usage instructions
- Billing management
- Upgrade processes
- Troubleshooting guides

### **3. Developer Resources**
- Component library
- Code examples
- Best practices
- Architecture diagrams

---

This implementation provides a robust, scalable, and user-friendly usage tracking system that enhances the GrantSnap platform's Pro user experience while maintaining security and performance standards.
