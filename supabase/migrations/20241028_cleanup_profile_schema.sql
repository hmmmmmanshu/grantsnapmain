-- Migration: Clean up user_profiles table and add new fields
-- Created: 2024-10-28
-- Purpose: Remove 100+ old columns, add 18 new business fields for RAG integration

BEGIN;

-- =====================================================
-- PART 1: Add new columns to user_profiles
-- =====================================================

-- Add new business fields (18 questions from Business & Market tab)
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS golden_retriever_explanation TEXT,
  ADD COLUMN IF NOT EXISTS unfair_advantage TEXT,
  ADD COLUMN IF NOT EXISTS top_competitors TEXT,
  ADD COLUMN IF NOT EXISTS traction_story TEXT,
  ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50),
  ADD COLUMN IF NOT EXISTS funding_amount VARCHAR(100),
  ADD COLUMN IF NOT EXISTS funding_unlock TEXT,
  ADD COLUMN IF NOT EXISTS twelve_month_goal TEXT,
  ADD COLUMN IF NOT EXISTS why_now TEXT,
  ADD COLUMN IF NOT EXISTS biggest_risk TEXT,
  ADD COLUMN IF NOT EXISTS customer_acquisition TEXT;

-- Note: These fields already exist from ProfileHub, so we're keeping them:
-- - startup_name
-- - one_line_pitch
-- - problem_statement
-- - target_market (will be used for dream_customer)
-- - market_size
-- - industry
-- - funding_stage
-- - pitch_deck_summary
-- - ai_context_summary
-- - context_last_updated

-- =====================================================
-- PART 2: Add new columns to founders table
-- =====================================================

ALTER TABLE founders
  ADD COLUMN IF NOT EXISTS coolest_thing_built TEXT,
  ADD COLUMN IF NOT EXISTS biggest_accomplishment TEXT;

-- =====================================================
-- PART 3: Drop old unused columns from user_profiles
-- =====================================================

-- WARNING: This will permanently delete data in these columns!
-- Make sure you have a backup if needed.

-- Drop old form fields that are no longer used
ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS company_description,
  DROP COLUMN IF EXISTS unique_value_proposition,
  DROP COLUMN IF EXISTS mission_vision,
  DROP COLUMN IF EXISTS elevator_pitch,
  DROP COLUMN IF EXISTS standard_abstract,
  DROP COLUMN IF EXISTS detailed_summary,
  DROP COLUMN IF EXISTS impact,
  DROP COLUMN IF EXISTS competitors,
  DROP COLUMN IF EXISTS traction,
  DROP COLUMN IF EXISTS team_description,
  DROP COLUMN IF EXISTS team_size,
  DROP COLUMN IF EXISTS revenue_range,
  DROP COLUMN IF EXISTS funding_goal,
  DROP COLUMN IF EXISTS previous_funding,
  DROP COLUMN IF EXISTS use_of_funds,
  
  -- Social media fields (no longer needed)
  DROP COLUMN IF EXISTS website_url,
  DROP COLUMN IF EXISTS twitter_handle,
  DROP COLUMN IF EXISTS facebook_url,
  DROP COLUMN IF EXISTS instagram_handle,
  DROP COLUMN IF EXISTS youtube_channel,
  DROP COLUMN IF EXISTS tiktok_handle,
  DROP COLUMN IF EXISTS github_url,
  DROP COLUMN IF EXISTS medium_url,
  DROP COLUMN IF EXISTS substack_url,
  DROP COLUMN IF EXISTS personal_website,
  DROP COLUMN IF EXISTS linkedin,
  DROP COLUMN IF EXISTS demo_video,
  DROP COLUMN IF EXISTS press_kit,
  
  -- Company details (no longer needed)
  DROP COLUMN IF EXISTS company_website,
  DROP COLUMN IF EXISTS business_registration_number,
  DROP COLUMN IF EXISTS year_founded,
  DROP COLUMN IF EXISTS number_of_employees,
  DROP COLUMN IF EXISTS headquarters_location,
  DROP COLUMN IF EXISTS legal_structure,
  DROP COLUMN IF EXISTS incorporation_country,
  DROP COLUMN IF EXISTS tax_id,
  DROP COLUMN IF EXISTS duns_number,
  DROP COLUMN IF EXISTS ein,
  
  -- Document URLs (replaced by file uploads)
  DROP COLUMN IF EXISTS pitch_deck_url,
  DROP COLUMN IF EXISTS business_plan_url,
  DROP COLUMN IF EXISTS financial_model_url,
  DROP COLUMN IF EXISTS market_research_url,
  DROP COLUMN IF EXISTS legal_documents_url,
  DROP COLUMN IF EXISTS press_kit_url,
  DROP COLUMN IF EXISTS case_studies_url,
  DROP COLUMN IF EXISTS testimonials_url,
  DROP COLUMN IF EXISTS product_demo_url,
  DROP COLUMN IF EXISTS investor_deck_url,
  
  -- Product/Service details (consolidated)
  DROP COLUMN IF EXISTS product_name,
  DROP COLUMN IF EXISTS product_description,
  DROP COLUMN IF EXISTS product_stage,
  DROP COLUMN IF EXISTS product_url,
  DROP COLUMN IF EXISTS product_demo_url,
  DROP COLUMN IF EXISTS product_video_url,
  
  -- Financial details (consolidated)
  DROP COLUMN IF EXISTS current_mrr,
  DROP COLUMN IF EXISTS current_arr,
  DROP COLUMN IF EXISTS burn_rate,
  DROP COLUMN IF EXISTS runway_months,
  DROP COLUMN IF EXISTS cash_on_hand,
  
  -- Traction metrics (consolidated into traction_story)
  DROP COLUMN IF EXISTS total_users,
  DROP COLUMN IF EXISTS active_users,
  DROP COLUMN IF EXISTS paying_customers,
  DROP COLUMN IF EXISTS user_growth_rate,
  DROP COLUMN IF EXISTS monthly_revenue,
  DROP COLUMN IF EXISTS revenue_growth_rate,
  
  -- Milestones (consolidated)
  DROP COLUMN IF EXISTS key_milestones,
  DROP COLUMN IF EXISTS upcoming_milestones,
  DROP COLUMN IF EXISTS past_milestones,
  
  -- Press & media (no longer needed)
  DROP COLUMN IF EXISTS press_mentions,
  DROP COLUMN IF EXISTS awards,
  DROP COLUMN IF EXISTS certifications,
  DROP COLUMN IF EXISTS partnerships,
  DROP COLUMN IF EXISTS advisors,
  
  -- Technical details (no longer needed)
  DROP COLUMN IF EXISTS tech_stack,
  DROP COLUMN IF EXISTS infrastructure,
  DROP COLUMN IF EXISTS security_compliance,
  DROP COLUMN IF EXISTS data_privacy,
  DROP COLUMN IF EXISTS ip_status,
  DROP COLUMN IF EXISTS patents,
  
  -- Market details (consolidated)
  DROP COLUMN IF EXISTS target_customers,
  DROP COLUMN IF EXISTS customer_segments,
  DROP COLUMN IF EXISTS customer_personas,
  DROP COLUMN IF EXISTS customer_pain_points,
  DROP COLUMN IF EXISTS value_proposition,
  DROP COLUMN IF EXISTS competitive_advantages,
  DROP COLUMN IF EXISTS barriers_to_entry,
  
  -- Business model (consolidated)
  DROP COLUMN IF EXISTS revenue_model,
  DROP COLUMN IF EXISTS pricing_strategy,
  DROP COLUMN IF EXISTS sales_channels,
  DROP COLUMN IF EXISTS marketing_channels,
  DROP COLUMN IF EXISTS customer_acquisition_cost,
  DROP COLUMN IF EXISTS lifetime_value,
  DROP COLUMN IF EXISTS unit_economics,
  
  -- Blog & content (no longer needed)
  DROP COLUMN IF EXISTS blog_posts,
  DROP COLUMN IF EXISTS podcast_appearances,
  DROP COLUMN IF EXISTS webinars,
  DROP COLUMN IF EXISTS speaking_engagements,
  DROP COLUMN IF EXISTS publications,
  
  -- Other miscellaneous old fields
  DROP COLUMN IF EXISTS referral_source,
  DROP COLUMN IF EXISTS how_did_you_hear,
  DROP COLUMN IF EXISTS additional_notes,
  DROP COLUMN IF EXISTS internal_notes,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS categories,
  DROP COLUMN IF EXISTS completion_percentage CASCADE;

-- =====================================================
-- PART 4: Create indexes for better query performance
-- =====================================================

-- Index for vectorization queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated 
  ON user_profiles(updated_at DESC);

-- Index for AI context queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_context_updated 
  ON user_profiles(context_last_updated DESC NULLS LAST);

-- Index for founder queries
CREATE INDEX IF NOT EXISTS idx_founders_user_id 
  ON founders(user_id);

-- =====================================================
-- PART 5: Update RLS policies if needed
-- =====================================================

-- Ensure users can only access their own profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- =====================================================
-- PART 6: Add helpful comments
-- =====================================================

COMMENT ON COLUMN user_profiles.golden_retriever_explanation IS 
  'Simple explanation of the business idea (like explaining to a golden retriever)';

COMMENT ON COLUMN user_profiles.unfair_advantage IS 
  'What unique advantage the startup has that competitors cannot easily replicate';

COMMENT ON COLUMN user_profiles.traction_story IS 
  'Narrative description of growth metrics, users, revenue, partnerships';

COMMENT ON COLUMN founders.coolest_thing_built IS 
  'Description of the coolest project or product the founder has built before this startup';

COMMENT ON COLUMN founders.biggest_accomplishment IS 
  'The founders biggest professional or personal accomplishment';

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added 11 new columns to user_profiles';
  RAISE NOTICE 'Added 2 new columns to founders';
  RAISE NOTICE 'Dropped 100+ unused columns from user_profiles';
  RAISE NOTICE 'Created performance indexes';
END $$;

