# GrantSnap: User Stories

This document breaks down our development tasks into user-centric stories. User is everything.

## Epic 1: A Streamlined, Stable Web App

### Story 1: Simplify My Dashboard
**As a user,**
I want to see a simpler dashboard focused on my funding pipeline,
so that I am not overwhelmed by features I don't need yet.

**Acceptance Criteria**: 
- The Team Management and AI Teammate sections are replaced by a "Virtual CFO - Coming Soon" placeholder.
- The dashboard focuses on core funding pipeline functionality.
- Navigation is streamlined and intuitive.

**Technical Notes**:
- Remove Team Management, Skill Matrix, and AI Recommendations tabs
- Add styled placeholder for "Your Virtual CFO" section
- Clean up unused components and routes

### Story 2: Fix Onboarding Data Loss
**As a new user,**
I want the information I enter during onboarding to be saved if I switch browser tabs,
so that I don't lose my work and get frustrated.

**Acceptance Criteria**: 
- localStorage auto-save is implemented in the onboarding form.
- Form data persists across browser sessions.
- Users can resume onboarding from where they left off.

**Technical Notes**:
- Implement useEffect with react-hook-form watch function
- Save form data to localStorage on every change
- Load saved data when component mounts
- Clear saved data after successful submission

### Story 3: Enable Onboarding Skip
**As a new user in a hurry,**
I want the "Skip for now" button to work,
so that I can explore the dashboard immediately.

**Acceptance Criteria**: 
- The "Skip" button correctly redirects to `/dashboard`.
- Users can access the dashboard without completing onboarding.
- Onboarding can be completed later from the dashboard.

**Technical Notes**:
- Add working onClick handler to skip button
- Use react-router-dom navigation
- Ensure proper route protection

## Epic 2: The Seamless Extension Experience

### Story 4: Log In Once
**As a user,**
I want the GrantSnap extension to automatically know I'm logged in after I've logged in on the website,
so that I don't have to enter my password twice.

**Acceptance Criteria**: 
- The extension's background.js successfully reads the session cookie from grantsnap.pro and authenticates.
- Users remain logged in across browser sessions.
- Authentication is seamless and secure.

**Technical Notes**:
- Implement secure cookie bridge between web app and extension
- Use httpOnly cookies for session management
- Implement session hydration in extension background script
- Handle authentication state changes gracefully

### Story 5: Get Instant Insights
**As a user who just found a grant,**
I want to click "Suggest Notes" in the extension,
so that I can get an instant AI-powered summary and have it automatically saved to my dashboard.

**Acceptance Criteria**: 
- The extension calls the suggest-and-save-notes Edge Function.
- New grant with AI notes appears in the OpportunityTable in real-time.
- AI-generated summaries are accurate and actionable.

**Technical Notes**:
- Implement Gemini AI integration via Edge Functions
- Use Firecrawl for content scraping
- Implement real-time Supabase subscriptions
- Handle AI processing errors gracefully

### Story 6: Use the AI Co-pilot
**As a Pro user,**
I want to click "Analyze & Answer" in the extension,
so that I can get AI-generated answers to the application's questions.

**Acceptance Criteria**: 
- The extension UI transitions to "Co-pilot Mode".
- Displays a list of questions and answers returned from the get-grant-answers Edge Function.
- Users can refine and edit AI-generated responses.

**Technical Notes**:
- Implement two-mode UI (Quick Capture and Co-pilot)
- Use Gemini API for Q&A generation
- Implement answer refinement functionality
- Sync refined answers back to dashboard

## Epic 3: Core Dashboard Functionality

### Story 7: Manage My Funding Pipeline
**As a user,**
I want to see all my tracked grants in one organized view,
so that I can manage my funding opportunities effectively.

**Acceptance Criteria**: 
- All captured grants appear in the OpportunityTable.
- Users can update grant status and add notes.
- Real-time updates when grants are captured via extension.

**Technical Notes**:
- Connect OpportunityTable to real Supabase data
- Implement real-time subscriptions
- Handle CRUD operations for tracked grants
- Implement proper error handling and loading states

### Story 8: Build My Profile
**As a user,**
I want to create and update my startup profile,
so that the AI can generate better grant application responses.

**Acceptance Criteria**: 
- Profile information is saved and persisted to Supabase.
- Users can upload and manage documents.
- Profile data is used to personalize AI responses.

**Technical Notes**:
- Connect ProfileHub to user_profiles table
- Implement document upload to Supabase storage
- Use profile data in AI prompt generation
- Implement profile validation and error handling

### Story 9: Get Notified About Deadlines
**As a user,**
I want to receive timely reminders about grant deadlines,
so that I never miss an important opportunity.

**Acceptance Criteria**: 
- Users can configure notification preferences.
- Deadline reminders are sent at appropriate times.
- Notification settings are respected (quiet hours, frequency).

**Technical Notes**:
- Implement notification preferences management
- Use Supabase Edge Functions for scheduled notifications
- Respect user notification settings
- Implement quiet hours functionality

## Epic 4: Performance and Reliability

### Story 10: Fast and Responsive Experience
**As a user,**
I want the dashboard to load quickly and respond instantly to my actions,
so that I can work efficiently without waiting.

**Acceptance Criteria**: 
- Dashboard loads in under 2 seconds.
- Real-time updates happen instantly.
- UI interactions are smooth and responsive.

**Technical Notes**:
- Optimize bundle size and loading
- Implement efficient data fetching
- Use React.memo and useMemo for performance
- Implement proper loading states and skeleton screens

### Story 11: Reliable Data Sync
**As a user,**
I want my data to always be in sync between the extension and dashboard,
so that I can trust the information I see.

**Acceptance Criteria**: 
- Data captured in extension appears instantly in dashboard.
- Changes made in dashboard are reflected everywhere.
- No data loss or duplication occurs.

**Technical Notes**:
- Implement robust real-time subscriptions
- Handle network interruptions gracefully
- Implement conflict resolution for concurrent updates
- Use optimistic updates for better UX

## Epic 5: User Experience and Onboarding

### Story 12: Intuitive First-Time Experience
**As a new user,**
I want to understand how to use GrantSnap quickly,
so that I can start capturing grants immediately.

**Acceptance Criteria**: 
- Clear onboarding flow guides users through setup.
- Extension installation instructions are clear.
- First-time users can capture their first grant within 5 minutes.

**Technical Notes**:
- Implement step-by-step onboarding flow
- Provide clear extension installation guidance
- Include interactive tutorials and tooltips
- Track onboarding completion rates

### Story 13: Seamless Extension Installation
**As a user,**
I want to easily install the GrantSnap extension,
so that I can start using it immediately.

**Acceptance Criteria**: 
- Extension is available on Chrome Web Store.
- Installation process is straightforward.
- Extension works immediately after installation.

**Technical Notes**:
- Prepare Chrome Web Store submission
- Implement proper extension permissions
- Test installation flow thoroughly
- Provide clear usage instructions

## Success Metrics and KPIs

### User Engagement
- **Onboarding Completion Rate**: Target 95%+
- **Extension Installation Rate**: Target 80%+
- **Daily Active Users**: Track user engagement patterns
- **Session Duration**: Measure time spent in dashboard

### Feature Adoption
- **Grant Capture Rate**: Percentage of users who capture grants
- **AI Feature Usage**: Percentage of users who use AI features
- **Profile Completion Rate**: Percentage of users with complete profiles
- **Document Upload Rate**: Percentage of users who upload documents

### Technical Performance
- **Page Load Time**: Target under 2 seconds
- **Real-time Sync Latency**: Target under 500ms
- **Error Rate**: Target under 1%
- **API Response Time**: Target under 200ms

### Business Metrics
- **User Retention**: 60%+ monthly active user retention
- **Conversion Rate**: Percentage of free users who upgrade
- **Customer Satisfaction**: NPS score target 50+
- **Support Ticket Volume**: Track user issues and feedback 