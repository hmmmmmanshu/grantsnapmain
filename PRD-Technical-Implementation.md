# GrantSnap: Technical Implementation Plan

This document outlines the specific technical tasks required to refine our live application and build out the GrantSnap ecosystem.

## Part 2: The Technical Implementation Plan

### 1. The "Secure Cookie Bridge": The Core Extension Architecture
The seamless experience between the web app and the extension is our primary technical advantage.

- A user logs in on grantsnap.pro. Supabase sets a secure, httpOnly session cookie.
- The Chrome Extension's background.js script, granted cookies and host_permissions, securely reads this cookie.
- The background script uses the token from the cookie to initialize its own Supabase client. This "session hydration" makes the extension fully authenticated as the correct user.

### 2. Core Technical Tasks: Web App Refinement (Sprint 1)

#### Task A: Strategic Pivot - Simplify the Dashboard
**Location**: `src/pages/Dashboard.tsx`

**Goal**: Remove the complex team management and AI teammate features to streamline the product.

**Sub-tasks**:
1. Identify and completely remove all components related to the "Team Management," "Skill Matrix," and "AI Recommendations" tabs.
2. In their place, add a new, styled placeholder section with the title "Your Virtual CFO" and a "Coming Soon" message.
3. In Supabase, execute DROP TABLE commands to remove the now-redundant tables: `team_members`, `skills`, `team_member_skills`, `ai_team_recommendations`, `team_projects`, and `team_project_assignments`.

#### Task B: Fix Critical Onboarding Bugs
**Location**: `src/components/OnboardingFlow.tsx` (or equivalent)

**Goal**: Resolve the two known bugs affecting new users.

**Sub-tasks**:
1. **Fix Data Loss**: Implement an auto-save feature using localStorage. Use useEffect and the watch function from react-hook-form to save form data on every change and load it when the component mounts.
2. **Fix Skip Button**: Ensure the "Skip for now" button has a working onClick handler that uses react-router-dom to navigate the user to `/dashboard`.

### 3. Core Technical Tasks: Chrome Extension Build (Sprint 2 & 3)

#### Task C: Build the Extension Foundation
**Goal**: Create the extension's core files and UI.

**Sub-tasks**:
1. Create a new `grantsnap-extension` project folder.
2. Create the `manifest.json` file with cookies, storage, and host_permissions for `https://*.grantsnap.pro/*`.
3. Build the `popup.html` using our final "Apple + Notion" inspired mockup, including the two-mode UI.

#### Task D: Implement the Authentication Bridge
**Location**: `background.js`

**Goal**: Make the extension aware of the user's login status.

**Sub-tasks**:
1. Write the `authenticateFromCookie` function that reads the `sb-access-token` cookie from grantsnap.pro.
2. Use `supabase.auth.setSession()` to hydrate the client.
3. Create message listeners so the popup UI can check the auth status and update itself.

#### Task E: Implement the AI Co-pilot Backend
**Location**: Supabase Edge Functions

**Goal**: Build the secure backend logic for our killer feature.

**Sub-tasks**:
1. Create a `suggest-and-save-notes` Edge Function that uses Firecrawl and the Gemini API, and then upserts the result to the `tracked_grants` table.
2. Create a `get-grant-answers` Edge Function that takes a user's profile and scraped content and uses the Gemini API to generate the Q&A JSON.
3. Create a `refine-answer` Edge Function for one-click answer editing.

### 4. Technical Architecture Details

#### 4.1 Database Schema Simplification
**Tables to Remove**:
- `team_members` - Team member management
- `skills` - Skill catalog
- `team_member_skills` - Skill assignments
- `ai_team_recommendations` - Team optimization
- `team_projects` - Team project tracking
- `team_project_assignments` - Project assignments

**Tables to Keep**:
- `user_profiles` - User profile data
- `user_documents` - Document storage
- `opportunities` - Grant opportunities
- `tracked_grants` - User's tracked grants
- `notification_preferences` - User notifications

#### 4.2 Chrome Extension Architecture
**File Structure**:
```
grantsnap-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── content.js
├── styles/
│   ├── popup.css
│   └── content.css
└── assets/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

**Key Features**:
- **Quick Capture Mode**: One-click grant saving with basic metadata
- **Co-pilot Mode**: AI-powered analysis and application assistance
- **Real-time Sync**: Instant dashboard updates via Supabase real-time subscriptions

#### 4.3 AI Integration with Gemini
**Edge Functions**:
1. **`suggest-and-save-notes`**: Analyzes grant pages and generates structured summaries
2. **`get-grant-answers`**: Generates application Q&A based on user profile and grant requirements
3. **`refine-answer`**: Allows users to refine AI-generated responses

**AI Workflow**:
1. User captures grant opportunity via extension
2. Extension calls Gemini API to analyze content
3. AI generates structured notes and saves to database
4. User can request AI-generated application answers
5. All data syncs in real-time with the web dashboard

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