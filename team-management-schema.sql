-- Team Management and Skill Matrix Schema
-- This schema supports team members, skills, AI optimization, and notification preferences

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    is_active BOOLEAN DEFAULT true,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Table (master list of available skills)
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Technical', 'Business', 'Creative'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Member Skills (junction table for skill matrix)
CREATE TABLE IF NOT EXISTS team_member_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5), -- 1-5 scale
    years_experience INTEGER DEFAULT 0,
    is_primary_skill BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_member_id, skill_id)
);

-- AI Team Optimization Recommendations
CREATE TABLE IF NOT EXISTS ai_team_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'skill_gap', 'role_assignment', 'team_structure'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'implemented', 'dismissed'
    ai_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    grant_deadline_reminders BOOLEAN DEFAULT true,
    team_updates BOOLEAN DEFAULT true,
    ai_recommendations BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    reminder_frequency VARCHAR(20) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Team Projects (for tracking team involvement in opportunities)
CREATE TABLE IF NOT EXISTS team_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'active', 'completed', 'on_hold'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Member Project Assignments
CREATE TABLE IF NOT EXISTS team_project_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    responsibilities TEXT,
    hours_allocated INTEGER DEFAULT 0,
    is_lead BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_project_id, team_member_id)
);

-- Insert default skills
INSERT INTO skills (name, category, description) VALUES
-- Technical Skills
('JavaScript', 'Technical', 'Programming language for web development'),
('React', 'Technical', 'Frontend framework for building user interfaces'),
('Node.js', 'Technical', 'JavaScript runtime for server-side development'),
('Python', 'Technical', 'Programming language for data science and web development'),
('SQL', 'Technical', 'Database query language'),
('AWS', 'Technical', 'Cloud computing platform'),
('Docker', 'Technical', 'Containerization platform'),
('Git', 'Technical', 'Version control system'),
('TypeScript', 'Technical', 'Typed JavaScript superset'),
('Next.js', 'Technical', 'React framework for production'),

-- Business Skills
('Project Management', 'Business', 'Planning and executing projects'),
('Business Development', 'Business', 'Growing business opportunities'),
('Sales', 'Business', 'Selling products or services'),
('Marketing', 'Business', 'Promoting products or services'),
('Financial Planning', 'Business', 'Managing financial resources'),
('Strategy', 'Business', 'Long-term planning and decision making'),
('Operations', 'Business', 'Managing day-to-day business operations'),
('Customer Success', 'Business', 'Ensuring customer satisfaction'),

-- Creative Skills
('UI/UX Design', 'Creative', 'User interface and experience design'),
('Graphic Design', 'Creative', 'Visual communication design'),
('Content Writing', 'Creative', 'Creating written content'),
('Video Production', 'Creative', 'Creating video content'),
('Branding', 'Creative', 'Building brand identity'),
('Social Media', 'Creative', 'Managing social media presence'),

-- Soft Skills
('Leadership', 'Soft Skills', 'Leading and motivating teams'),
('Communication', 'Soft Skills', 'Effective verbal and written communication'),
('Problem Solving', 'Soft Skills', 'Analyzing and solving complex problems'),
('Teamwork', 'Soft Skills', 'Collaborating effectively with others'),
('Time Management', 'Soft Skills', 'Managing time and priorities'),
('Negotiation', 'Soft Skills', 'Reaching agreements with stakeholders')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_skills_member_id ON team_member_skills(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_skills_skill_id ON team_member_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_team_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_user_id ON team_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_team_project_assignments_project_id ON team_project_assignments(team_project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_team_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_assignments ENABLE ROW LEVEL SECURITY;

-- Team members policies
CREATE POLICY "Users can view their own team members" ON team_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members" ON team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members" ON team_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members" ON team_members
    FOR DELETE USING (auth.uid() = user_id);

-- Team member skills policies
CREATE POLICY "Users can view their team member skills" ON team_member_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.id = team_member_skills.team_member_id 
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their team member skills" ON team_member_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.id = team_member_skills.team_member_id 
            AND team_members.user_id = auth.uid()
        )
    );

-- AI recommendations policies
CREATE POLICY "Users can view their own AI recommendations" ON ai_team_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI recommendations" ON ai_team_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Team projects policies
CREATE POLICY "Users can view their own team projects" ON team_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own team projects" ON team_projects
    FOR ALL USING (auth.uid() = user_id);

-- Team project assignments policies
CREATE POLICY "Users can view their team project assignments" ON team_project_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_projects 
            WHERE team_projects.id = team_project_assignments.team_project_id 
            AND team_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their team project assignments" ON team_project_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_projects 
            WHERE team_projects.id = team_project_assignments.team_project_id 
            AND team_projects.user_id = auth.uid()
        )
    );

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_member_skills_updated_at BEFORE UPDATE ON team_member_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_team_recommendations_updated_at BEFORE UPDATE ON ai_team_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_projects_updated_at BEFORE UPDATE ON team_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_project_assignments_updated_at BEFORE UPDATE ON team_project_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 