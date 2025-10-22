# GrantSnap: The Definitive Master PRD

This document is the single source of truth for the GrantSnap project. It outlines our vision, the current state of our live application, and the detailed plan for our next phase of development.

## Part 1: The Master Vision

### 1. Project Vision & Goal
**Project**: GrantSnap (Grantsnap.pro)  
**Vision**: To build the indispensable "AI-Powered Funding Command Center" for entrepreneurs.  
**Problem We Solve**: We eliminate the chaos, manual labor, and high cost associated with finding and applying for grants and VC funding.  
**Our Solution**: GrantSnap is a premium, AI-powered SaaS platform that uses Gemini 2.5 Computer Use agents to automate research, provide deep insights, and dramatically accelerate the application process. We sell clarity, speed, and a competitive edge through intelligent automation.

### 2. The GrantSnap Multi-Project Ecosystem
GrantSnap is now a sophisticated multi-project architecture comprised of three interconnected components:

- **The Dashboard Project**: The central hub at Grantsnap.pro for account management, billing (Razorpay), profile management, and building the user's "Autofill Data Hub" with RAG capabilities.
- **The Chrome Extension Project**: An AI-powered intelligent agent using Gemini 2.5 Computer Use for deep site exploration, comprehensive analysis, and automated form filling.
- **The Shared Supabase Backend**: The unified engine for authentication, database, file storage, vector embeddings (RAG), and secure server-side logic (Edge Functions).

### 3. Current Project Status

#### **Dashboard Project (Current Focus)**
- **Status**: Complete React/Vite application with professional UI
- **Features**: User authentication, profile management, grant tracking, billing integration
- **Integration Gap**: Needs to integrate with new AI agent backend infrastructure
- **Critical Updates Needed**: RAG vectorization, usage tracking, Computer Use data display

#### **Chrome Extension Project (Recently Completed)**
- **Status**: Fully functional AI-powered agent using Gemini 2.5 Computer Use
- **Features**: Deep site exploration, comprehensive analysis, automated form filling
- **Architecture**: Service layer, state management, beautiful UI components
- **Integration**: Connected to shared Supabase backend via Edge Functions

#### **Shared Supabase Backend (Fully Operational)**
- **Status**: Complete with new AI agent infrastructure
- **Database**: Enhanced schema with pgvector, embeddings table, Computer Use data storage
- **Edge Functions**: 16+ functions including AI agents, vectorization, usage tracking
- **Authentication**: Working email/Google OAuth with Chrome Extension cookie bridge

**The Gap**: Dashboard needs critical updates to support the new AI agent infrastructure and RAG capabilities.

**Immediate Goal**: Integrate Dashboard with new AI agent backend, implement RAG vectorization, and display Computer Use analysis data.

### 4. Tech Stack

#### **Dashboard Project**
- **Framework**: Vite + React 18 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth with Chrome Extension cookie bridge
- **Payment**: Razorpay integration

#### **Chrome Extension Project**
- **Framework**: Vanilla JavaScript with TypeScript
- **UI**: Modern popup interface with service layer architecture
- **AI Integration**: Gemini 2.5 Computer Use API
- **State Management**: Custom auth store with usage tracking
- **Communication**: Chrome runtime messaging

#### **Shared Backend Infrastructure**
- **Database**: Supabase PostgreSQL with pgvector extension
- **Authentication**: Supabase Auth (email/Google OAuth)
- **Storage**: Supabase Storage for documents and screenshots
- **AI Services**: Gemini 2.5 Computer Use, Gemini text-embedding-004
- **Edge Functions**: 16+ Deno functions for AI agents and vectorization
- **RAG**: Vector embeddings with cosine similarity search

### 5. Strategic Transformation: AI-Powered Agent Architecture

The project has undergone a major architectural transformation from basic form-filling to an AI-powered intelligent agent system:

#### **Old Approach (Replaced)**
- Manual form detection and simple HTML scraping
- Generic LLM prompts without personalization
- Expensive HyperBrowser API ($0.10+ per scan)
- High maintenance due to site changes

#### **New Approach (Current)**
- **Gemini 2.5 Computer Use Agents**: Multi-page exploration and intelligent interaction
- **RAG (Retrieval-Augmented Generation)**: Personalized answers using user profile + pitch deck
- **70% Cost Reduction**: $0.03 vs $0.10 per scan
- **90%+ Accuracy**: vs 70% before
- **Zero Maintenance**: AI adapts to site changes automatically

#### **Strategic Benefits**
- Streamline the user experience with one-click automation
- Focus on core AI-powered funding pipeline functionality
- Reduce development complexity through intelligent automation
- Prepare for seamless Chrome Extension integration
- Replace manual processes with "Apple-like" user experience

### 6. Chrome Extension: The AI-Powered Game Changer
The Chrome Extension is now fully operational and represents our primary technical advantage:

- **Seamless Authentication**: Uses secure cookie bridge to maintain user session
- **AI Computer Use Agent**: Gemini 2.5 explores entire grant sites automatically
- **Deep Site Analysis**: Reads main page, FAQ, eligibility, past winners, evaluation criteria
- **Intelligent Form Filling**: RAG-powered personalized answers using user profile + pitch deck
- **Real-time Sync**: Captured opportunities and analysis appear instantly in dashboard
- **Two-Mode UI**: Quick capture mode and comprehensive AI analysis mode
- **Audit Trail**: Screenshots and logs for compliance and debugging

### 7. Success Metrics & Business Model

#### **Updated Pricing Tiers**
| Tier | Price | Deep Scans | AI Autofills | Target Market |
|------|-------|------------|--------------|---------------|
| Free | $0 | 0 | 0 | Trial users |
| Starter | $59/mo | 50 | 30 | Small startups |
| Pro | $99/mo | 150 | 100 | Growing companies |
| Enterprise | $199/mo | 500 | 300 | Large organizations |

#### **Cost Comparison**
- **vs Consultants**: Save $1,500-3,000/month
- **vs Interns**: Save $800-1,200/month
- **vs Manual Process**: Save 40+ hours per application

#### **Success Metrics**
- **User Onboarding**: 95%+ completion rate for new users
- **Extension Adoption**: 80%+ of web app users install the extension
- **AI Engagement**: 70%+ of captured opportunities use AI features
- **User Retention**: 60%+ monthly active user retention 
- **Cost Efficiency**: 70% reduction in operational costs vs manual processes
- **Accuracy Improvement**: 90%+ accuracy vs 70% with manual processes 