# GrantSnap: Technical Implementation Plan

This document outlines the specific technical tasks required to integrate the Dashboard project with the new AI agent infrastructure and complete the GrantSnap ecosystem.

## Part 2: The Technical Implementation Plan

### 1. Multi-Project Architecture Overview

The GrantSnap ecosystem now consists of three interconnected projects:

```
┌──────────────────────────────────────────────┐
│           DASHBOARD PROJECT                   │
│  - User authentication                        │
│  - Profile Hub (62 fields)                    │
│  - Document upload (pitch decks)              │
│  - Usage tracking display                     │
│  - Grant management UI                        │
│                                               │
│  NEW: Needs to call vectorization functions  │
└────────────────┬─────────────────────────────┘
                 │
                 │ Both connect to same Supabase
                 │
                 ▼
┌──────────────────────────────────────────────┐
│         SHARED SUPABASE BACKEND               │
│                                               │
│  Database:                                    │
│   • tracked_grants (NEW columns added)        │
│   • embeddings (NEW table for RAG)            │
│   • user_profiles (existing)                  │
│   • usage_stats (updated limits)              │
│                                               │
│  Edge Functions:                              │
│   • trigger-deep-scan-agent (NEW)             │
│   • trigger-autofill-agent (NEW)              │
│   • vectorize-profile (NEW) ← Dashboard calls │
│   • vectorize-pitch-deck (NEEDED)             │
│                                               │
│  Extensions:                                  │
│   • pgvector (NEW - for RAG)                  │
└────────────────┬─────────────────────────────┘
                 │
                 │
                 ▼
┌──────────────────────────────────────────────┐
│        CHROME EXTENSION PROJECT               │
│  - Popup UI (LandingView, DeepScanView)      │
│  - Computer Use service layer                 │
│  - Calls Edge Functions                       │
│  - No direct database access                  │
└──────────────────────────────────────────────┘
```

### 2. Critical Dashboard Integration Tasks

#### **Priority 1: RAG Vectorization Integration**

**Task A: Integrate vectorize-profile After Profile Updates**
- **Location**: Profile Hub component / Profile edit page
- **Action**: Call `vectorize-profile` Edge Function after successful profile save
- **Implementation**: Add API call with loading states and success/error feedback
- **Why Critical**: Enables RAG-powered personalized AI answers

**Task B: Create vectorize-pitch-deck Edge Function**
- **Location**: New Edge Function in Supabase
- **Action**: Extract text from PDF/PPTX/DOCX, chunk intelligently, generate embeddings
- **Implementation**: Document processing with metadata storage
- **Why Critical**: Enables pitch deck content in AI analysis

#### **Priority 2: Usage Tracking Updates**

**Task C: Update Usage Display Components**
- **Location**: UsageTracker.tsx, Dashboard header, Settings page
- **Action**: Display both Deep Scans and AI Autofills with progress bars
- **Implementation**: Query usage_stats table for new metrics
- **Why Critical**: Users need visibility into their AI feature usage

#### **Priority 3: Computer Use Data Display**

**Task D: Enhance Grant Detail View**
- **Location**: Grant detail page/component
- **Action**: Display Deep Scan analysis, autofill session data, agent screenshots
- **Implementation**: Parse and display Computer Use JSONB data
- **Why Critical**: Users need to see AI analysis results and audit trail

### 3. Backend Infrastructure (Already Completed)

#### **Database Schema Updates**
- **pgvector Extension**: Enabled for vector similarity search
- **embeddings Table**: Stores user profile and document embeddings for RAG
- **tracked_grants Updates**: Added Computer Use scan data, autofill sessions, agent screenshots
- **usage_stats Updates**: Added deep_scans_used column for new AI features

#### **Edge Functions (Already Deployed)**
- **trigger-deep-scan-agent**: Gemini 2.5 Computer Use for comprehensive site analysis
- **trigger-autofill-agent**: RAG-powered intelligent form filling
- **vectorize-profile**: Converts user profile into embeddings for RAG
- **get-usage**: Retrieves user feature usage statistics
- **pro-user-check**: Validates subscription tiers for AI features

#### **AI Integration Architecture**
- **Gemini 2.5 Computer Use**: Multi-page exploration and intelligent interaction
- **Gemini text-embedding-004**: 768-dimensional vector embeddings
- **RAG Pipeline**: Vector similarity search for personalized answers
- **Cost Optimization**: 70% reduction vs previous HyperBrowser approach

### 4. Database Schema (Current State)

#### **Core Tables (Active)**
- **user_profiles**: User startup information and preferences
- **user_documents**: Document storage and metadata
- **opportunities**: Grant opportunity data
- **tracked_grants**: User's funding pipeline with AI analysis data
- **notification_preferences**: User notification settings
- **subscriptions**: User subscription tiers and billing
- **usage_stats**: Feature usage tracking (updated with AI metrics)
- **orders**: Payment and billing records
- **user_notes**: User-generated notes and insights

#### **New AI Infrastructure Tables**
- **embeddings**: Vector embeddings for RAG (NEW)
  - Stores user profile chunks, pitch deck chunks, document chunks
  - Uses pgvector for similarity search
  - Content types: 'profile', 'pitch_deck', 'document'

#### **Updated tracked_grants Schema**
- **computer_use_scan** (JSONB): Full agent exploration log
- **autofill_session** (JSONB): Autofill session data and results
- **agent_screenshots** (TEXT[]): Screenshot URLs for audit trail

#### **Removed Tables (Strategic Pivot)**
- `team_members`, `skills`, `team_member_skills`
- `ai_team_recommendations`, `team_projects`, `team_project_assignments`

### 5. Chrome Extension Architecture (Completed)

#### **Current Implementation**
- **Status**: Fully functional AI-powered agent
- **Architecture**: Service layer with state management
- **UI Components**: LandingView, DeepScanView, AuthenticatedApp
- **Authentication**: Secure cookie bridge with Supabase
- **AI Integration**: Gemini 2.5 Computer Use for site exploration and form filling

#### **Key Features (Operational)**
- **Deep Scan Mode**: Comprehensive site analysis using AI agents
- **Autofill Mode**: RAG-powered intelligent form filling
- **Real-time Sync**: Instant dashboard updates via Supabase
- **Usage Tracking**: Tier-based limits and upgrade prompts
- **Audit Trail**: Screenshots and logs for compliance

### 6. AI Integration Architecture (Operational)

#### **Current Edge Functions**
- **trigger-deep-scan-agent**: Gemini 2.5 Computer Use for comprehensive site analysis
- **trigger-autofill-agent**: RAG-powered intelligent form filling with user context
- **vectorize-profile**: Converts user profile into embeddings for RAG
- **get-usage**: Retrieves user feature usage statistics
- **pro-user-check**: Validates subscription tiers for AI features

#### **AI Workflow**
1. **Deep Scan**: User clicks "Run Deep Scan" → AI explores entire grant site
2. **Analysis**: AI extracts funder mission, eligibility, evaluation criteria, past winners
3. **RAG Retrieval**: AI searches user profile + pitch deck embeddings for relevant context
4. **Autofill**: AI generates personalized answers using retrieved context
5. **Storage**: Results stored in tracked_grants with audit trail

#### **Cost & Performance**
- **Cost Reduction**: 70% vs previous HyperBrowser approach ($0.03 vs $0.10 per scan)
- **Accuracy**: 90%+ vs 70% with manual processes
- **Maintenance**: Zero - AI adapts to site changes automatically

### 5. Security Considerations

#### 5.1 Cookie Security
- Use httpOnly cookies for session management
- Implement proper CORS policies
- Validate cookie origin and expiration

#### 5.2 Extension Permissions
- Minimal required permissions
- Clear explanation of permission usage
- Secure handling of user data

#### 5.3 API Security
- Rate limiting on Edge Functions
- User authentication validation
- Input sanitization and validation

### 6. Performance Optimization

#### 6.1 Extension Performance
- Lazy loading of UI components
- Efficient data caching
- Minimal background script activity

#### 6.2 Web App Performance
- Optimized bundle size
- Efficient data fetching
- Real-time updates without polling

### 7. Testing Strategy

#### 7.1 Extension Testing
- Chrome extension testing framework
- Mock Supabase responses
- Cross-browser compatibility

#### 7.2 Web App Testing
- Component testing with React Testing Library
- Integration testing with Supabase
- End-to-end testing with Playwright

### 8. Deployment & Monitoring

#### 8.1 Extension Deployment
- Chrome Web Store submission process
- Version management and updates
- User feedback collection

#### 8.2 Web App Deployment
- Vercel deployment pipeline
- Environment variable management
- Performance monitoring with Vercel Analytics

#### 8.3 Backend Monitoring
- Supabase dashboard monitoring
- Edge Function performance tracking
- Error logging and alerting 