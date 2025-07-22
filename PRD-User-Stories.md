# PRD: User Stories

## Epic 1: User Onboarding & Authentication

### Story 1: Email & Password Sign-Up
As a new user,
I want to sign up for an account using my email and a password,
so that I can create a secure account with GrantSnap.

**Acceptance Criteria:**
- Given I am on the /login page and in "Sign Up" mode,
- When I enter a valid email and password and click "Sign Up",
- Then a new user is created in the Supabase auth.users table, and I see a confirmation message to check my email.

### Story 2: Email & Password Login
As an existing user,
I want to log in using my email and password,
so that I can access my dashboard.

**Acceptance Criteria:**
- Given I have a verified account and am on the /login page,
- When I enter my correct credentials and click "Log In",
- Then I am redirected to the /dashboard page.

### Story 3: Secure Route Access
As a logged-in user,
I want the /dashboard page to be accessible to me,
so that I can use the application.

**Acceptance Criteria:**
- Given I am not logged in,
- When I try to navigate to /dashboard,
- Then I am redirected to the /login page.

## Epic 2: Profile & Autofill Hub Management

### Story 4: View My Profile
As a logged-in user,
I want to see my saved startup information when I open the "Profile Hub",
so that I know what data the autofill will use.

**Acceptance Criteria:**
- Given I am on the /dashboard,
- When I open the Profile Hub,
- Then the form fields are populated with my data from the user_profiles table.

### Story 5: Edit My Profile
As a logged-in user,
I want to edit the information in my Profile Hub and save the changes,
so that I can keep my autofill data up-to-date.

**Acceptance Criteria:**
- Given I have changed the text in the "Startup Name" field,
- When I click "Save Profile",
- Then the corresponding record in the user_profiles table is updated in Supabase.

## Epic 3: Opportunity Tracking

### Story 6: View My Tracked Grants
As a logged-in user,
I want to see a list of all the grants I have saved,
so that I can manage my application pipeline.

**Acceptance Criteria:**
- Given I am on the /dashboard,
- When the page loads,
- Then the "Opportunity Table" is populated with all my records from the tracked_grants table.

### Story 7: See Realtime Updates
As a logged-in user with my dashboard open,
I want a new grant I save with the Chrome Extension to appear in my Opportunity Table instantly,
so that I don't have to manually refresh the page.

**Acceptance Criteria:**
- Given my dashboard is open,
- When a new record is added to the tracked_grants table for my user ID,
- Then the new grant appears at the top of my Opportunity Table without a page reload. 