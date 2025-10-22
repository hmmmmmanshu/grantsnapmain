# GrantSnap: User Stories & Acceptance Criteria

This document outlines user stories for the GrantSnap Dashboard integration with the new AI agent infrastructure.

## Epic 1: RAG Vectorization Integration

### Story 1: Profile Vectorization After Save
**As a** user updating my startup profile  
**I want** my profile to be automatically processed for AI analysis  
**So that** I can get personalized answers when using AI autofill features

**Acceptance Criteria:**
- [ ] When I save my profile in the Profile Hub, a loading state appears: "Preparing profile for AI..."
- [ ] After successful vectorization, I see a success message: "✅ Profile ready for AI autofill!"
- [ ] If vectorization fails, I see an error message with retry option
- [ ] My profile data is converted into 6 semantic chunks and stored as embeddings
- [ ] The process happens automatically without requiring additional user action

### Story 2: Pitch Deck Vectorization After Upload
**As a** user uploading my pitch deck  
**I want** my pitch deck to be automatically analyzed and processed for AI  
**So that** AI can use my pitch deck content to generate better application answers

**Acceptance Criteria:**
- [ ] When I upload a pitch deck, I see a processing message: "Analyzing pitch deck... (may take 30-60 seconds)"
- [ ] The system extracts text from PDF, PPTX, and DOCX files
- [ ] Text is chunked by slide/section for better retrieval
- [ ] Embeddings are generated and stored with metadata (slide number, section title)
- [ ] I receive confirmation when processing is complete
- [ ] Large files (>10MB) are handled gracefully with progress indicators

## Epic 2: Usage Tracking Updates

### Story 3: Enhanced Usage Display
**As a** user with a subscription  
**I want** to see my usage of both Deep Scans and AI Autofills  
**So that** I can track my AI feature usage and know when I need to upgrade

**Acceptance Criteria:**
- [ ] I see both "Deep Scans" and "AI Autofills" metrics in my dashboard
- [ ] Progress bars show my usage vs limits (e.g., "15/50 Deep Scans")
- [ ] Different subscription tiers show correct limits (Starter: 50/30, Pro: 150/100)
- [ ] When I approach my limits, I see upgrade prompts
- [ ] Usage resets monthly and I can see my current month's usage
- [ ] Free users see "0/0" with upgrade prompts

### Story 4: Grant Detail Enhancement
**As a** user viewing a grant that was analyzed by AI  
**I want** to see the AI analysis results and autofill session data  
**So that** I can understand what the AI discovered and how it filled out the application

**Acceptance Criteria:**
- [ ] Grants with Deep Scan data show a "🔍 Deep Scan Analysis" section
- [ ] I can see confidence score, funder mission, eligibility criteria, key themes
- [ ] Grants with autofill sessions show "✨ AI Autofill Session" section
- [ ] I can see fields filled, pages navigated, and completion status
- [ ] I can view agent screenshots for audit trail
- [ ] I can expand to see full analysis details
- [ ] Grants without AI data still display normally

## Epic 3: User Experience Enhancements

### Story 5: Profile Completion Nudges
**As a** user with an incomplete profile  
**I want** to be reminded to complete my profile  
**So that** I can get better AI-generated answers

**Acceptance Criteria:**
- [ ] If my profile is <50% complete, I see a yellow warning banner
- [ ] The banner shows my completion percentage and explains the benefit
- [ ] I can click to go directly to the Profile Hub
- [ ] The banner disappears when my profile is complete

### Story 6: Pitch Deck Upload Reminder
**As a** user without a pitch deck  
**I want** to be reminded to upload my pitch deck  
**So that** I can get 10x better AI answers

**Acceptance Criteria:**
- [ ] If I haven't uploaded a pitch deck, I see a blue info banner
- [ ] The banner explains the benefit of uploading a pitch deck
- [ ] I can click to go directly to the document upload page
- [ ] The banner disappears after I upload a pitch deck

### Story 7: RAG Status Indicator
**As a** user  
**I want** to see if my profile and pitch deck are ready for AI  
**So that** I know when AI features will work optimally

**Acceptance Criteria:**
- [ ] I see a status indicator showing if my profile is vectorized
- [ ] I see a status indicator showing if my pitch deck is vectorized
- [ ] Green checkmark means ready for AI
- [ ] Yellow spinner means processing
- [ ] Red X means failed - with retry option

## Epic 4: Technical Requirements

### Story 8: Error Handling & Resilience
**As a** user  
**I want** the system to handle errors gracefully  
**So that** I have a smooth experience even when things go wrong

**Acceptance Criteria:**
- [ ] If vectorization fails, I see a clear error message with retry option
- [ ] If file upload fails, I see specific error messages (file too large, unsupported format)
- [ ] Network errors show "Please check your connection" messages
- [ ] All error states have recovery options
- [ ] Loading states are shown for all async operations

### Story 9: Performance & Reliability
**As a** user  
**I want** the dashboard to be fast and reliable  
**So that** I can work efficiently without interruptions

**Acceptance Criteria:**
- [ ] Dashboard loads in <2 seconds
- [ ] Profile saves complete in <3 seconds
- [ ] Vectorization completes in <30 seconds for profiles, <60 seconds for pitch decks
- [ ] All operations work across different browsers and devices
- [ ] Real-time updates work without page refresh

## Summary

These user stories focus on integrating the Dashboard with the new AI agent infrastructure, ensuring users can:

1. **Vectorize their profiles and pitch decks** for RAG-powered AI features
2. **Track their AI feature usage** with clear metrics and limits
3. **View AI analysis results** in their grant details
4. **Get helpful nudges** to complete their profile and upload documents
5. **Experience reliable performance** with proper error handling

The stories prioritize the critical integration points while maintaining a focus on user experience and technical reliability.