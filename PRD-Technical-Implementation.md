# PRD: Technical Implementation

## 1. Database Schema (The Single Source of Truth)
The following tables must exist in Supabase. All user-facing features will read from and write to these tables.

```sql
-- Stores core user startup info for AI autofill
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_name TEXT,
  one_line_pitch TEXT,
  problem_statement TEXT,
  solution_description TEXT,
  target_market TEXT,
  team_description TEXT
);
-- RLS Policy: Users can only manage their own profile.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.user_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Stores links to user-uploaded documents
CREATE TABLE public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT,
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
-- RLS Policy: Users can only manage their own documents.
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own documents" ON public.user_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Stores grants/opportunities the user is tracking
CREATE TABLE public.tracked_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_name TEXT,
  application_deadline DATE,
  status TEXT DEFAULT 'Interested',
  grant_url TEXT
);
-- RLS Policy: Users can only manage their own tracked grants.
ALTER TABLE public.tracked_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tracked grants" ON public.tracked_grants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 2. Core Technical Tasks

### Task A: Implement User Authentication
- **Location:** src/pages/Login.tsx
- **Goal:** Connect the UI to Supabase Auth.
- **Sub-tasks:**
  - Import the supabaseClient.
  - Implement the supabase.auth.signUp() function within the form's onSubmit handler when in "Sign Up" mode.
  - Implement the supabase.auth.signInWithPassword() function when in "Log In" mode.
  - Implement supabase.auth.signInWithOAuth({ provider: 'google' }) for the Google login button.
  - Provide clear user feedback for success (redirect to /dashboard) and errors (display error message).

### Task B: Implement Protected Routes
- **Location:** src/App.tsx or a custom routing component.
- **Goal:** Prevent non-logged-in users from accessing the /dashboard.
- **Sub-tasks:**
  - Create a ProtectedRoute component that wraps the dashboard route.
  - Inside this component, use a Supabase session listener (supabase.auth.onAuthStateChange) to check for an active user session.
  - If no session exists, redirect the user to the /login page.

### Task C: Connect the Dashboard to Real Data
- **Location:** src/pages/Dashboard.tsx and its child components.
- **Goal:** Replace all mock data with live data from the authenticated user's Supabase tables.
- **Sub-tasks:**
  - **Profile Hub:**
    - On component mount, fetch the user's data from the user_profiles table.
    - The "Save Profile" button must perform an upsert operation to the user_profiles table for that user.
  - **Grant Tracker:**
    - On component mount, fetch all records from the tracked_grants table where user_id matches the current user's ID.
    - Implement a Supabase Realtime subscription to this table so that new grants saved from the extension appear instantly.
    - The "Status" dropdown must trigger an update operation on the specific grant record.
  - **Document Library:**
    - The "Upload" button must use supabase.storage.from('user-documents').upload() to securely upload a file to a user-specific path (e.g., /{user_id}/{file_name}).
    - The component must list files by querying the user_documents table.

## 3. Environment Variables Required
The project must have a .env file with the following keys:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY 