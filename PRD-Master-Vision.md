# GrantSnap: The Definitive Master PRD

This document is the single source of truth for the GrantSnap project. It outlines our vision, the current state of our live application, and the detailed plan for our next phase of development.

## Part 1: The Master Vision

### 1. Project Vision & Goal
**Project**: GrantSnap (Grantsnap.pro)  
**Vision**: To build the indispensable "Funding Command Center" for entrepreneurs.  
**Problem We Solve**: We eliminate the chaos, manual labor, and high cost associated with finding and applying for grants and VC funding.  
**Our Solution**: GrantSnap is a premium, AI-powered SaaS platform that automates research, provides deep insights, and dramatically accelerates the application process. We sell clarity, speed, and a competitive edge.

### 2. The GrantSnap Ecosystem
GrantSnap is a single service comprised of three core components:

- **The Web Application (Dashboard)**: The central hub at Grantsnap.pro for account management, billing (Stripe), and building the user's "Autofill Data Hub."
- **The Chrome Extension**: The lightweight, intelligent "clipper" for capturing opportunities and triggering our AI Co-pilot.
- **The Supabase Backend**: The unified engine for authentication, database, file storage, and secure server-side logic (Edge Functions).

### 3. Current Project Status
**Backend**: A dedicated Supabase project is live and fully operational. This includes a complete database schema, working user authentication (email & Google OAuth) with active users, and all necessary tables for profiles, documents, and opportunities.

**Frontend**: The entire frontend, including the marketing landing page and the user dashboard UI, is complete and live. It is a professionally built React/Vite application.

**The Gap**: The live frontend is not yet fully connected to the live backend. Some parts of the dashboard are still using mock data.

**Immediate Goal**: Our next phase of development is to fix critical bugs in the live onboarding flow, execute a strategic pivot to simplify the dashboard, and then build the Chrome Extension and its integration bridge.

### 4. Tech Stack
- **Framework**: Vite + React 18
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Payment**: Stripe (Future)
- **AI**: Gemini

### 5. Strategic Pivot: Simplified Dashboard
In response to user feedback and to focus on core value, we are simplifying the dashboard by removing complex team management and AI teammate features. This pivot will:

- Streamline the user experience
- Focus on the core funding pipeline functionality
- Reduce development complexity
- Prepare for the Chrome Extension integration
- Replace removed features with a "Virtual CFO - Coming Soon" placeholder

### 6. Chrome Extension: The Game Changer
The Chrome Extension represents our primary technical advantage and will be the core differentiator:

- **Seamless Authentication**: Uses secure cookie bridge to maintain user session
- **AI Co-pilot**: Instant grant analysis and application assistance
- **Real-time Sync**: Captured opportunities appear instantly in the dashboard
- **Two-Mode UI**: Quick capture mode and detailed analysis mode

### 7. Success Metrics
- **User Onboarding**: 95%+ completion rate for new users
- **Extension Adoption**: 80%+ of web app users install the extension
- **AI Engagement**: 70%+ of captured opportunities use AI features
- **User Retention**: 60%+ monthly active user retention 