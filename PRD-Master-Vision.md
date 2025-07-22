# Project Vision & Goal

**Project:** GrantSnap (Grantsnap.pro)

**Vision:** To build the indispensable "Funding Command Center" for entrepreneurs.

**Problem We Solve:** We eliminate the chaos, manual labor, and high cost associated with finding and applying for grants and VC funding.

**Our Solution:** GrantSnap is a premium, AI-powered SaaS platform that automates research, provides deep insights, and dramatically accelerates the application process. We sell clarity, speed, and a competitive edge.

## The GrantSnap Ecosystem
GrantSnap is a single service comprised of three core components:

- **The Web Application (Dashboard):** The central hub at Grantsnap.pro for account management, billing (Stripe), and building the user's "Autofill Data Hub."
- **The Chrome Extension:** The lightweight, intelligent "clipper" for capturing opportunities and triggering autofill.
- **The Supabase Backend:** The unified engine for authentication, database, file storage, and secure server-side logic (Edge Functions).

## The High-Level User Journey
- **Onboarding:** A user signs up on the website and installs the extension.
- **Authentication:** The user logs in once on the website; the extension automatically syncs the session via a secure cookie bridge.
- **Usage:** The user saves opportunities with the extension, which appear instantly on their web dashboard. They build their profile on the dashboard.
- **Conversion:** The user is prompted to upgrade to a Pro plan to unlock the AI-powered autofill feature.

## Current Project Status
- **Frontend:** The entire frontend, including the marketing landing page and the user dashboard UI, is complete. It is currently running on mock data.
- **Backend:** A dedicated Supabase project has been created with the necessary tables (user_profiles, user_documents, tracked_grants).
- **Immediate Goal:** The next phase of development is to connect the existing frontend to the real Supabase backend, implementing all the logic for user authentication, data persistence, and the core features outlined in the technical PRD.

## Tech Stack
- **Framework:** Vite + React 18
- **Styling:** Tailwind CSS + Shadcn/UI
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Payment:** Stripe
- **AI:** OpenAI 