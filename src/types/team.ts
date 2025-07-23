// Team Management Types

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  is_active: boolean;
  joined_date: string;
  created_at: string;
  updated_at: string;
  skills?: TeamMemberSkill[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Business' | 'Creative' | 'Soft Skills';
  description?: string;
  created_at: string;
}

export interface TeamMemberSkill {
  id: string;
  team_member_id: string;
  skill_id: string;
  proficiency_level: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  years_experience: number;
  is_primary_skill: boolean;
  created_at: string;
  updated_at: string;
  skill?: Skill; // Joined skill data
}

export interface AITeamRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'skill_gap' | 'role_assignment' | 'team_structure';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'implemented' | 'dismissed';
  ai_generated_at: string;
  implemented_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  grant_deadline_reminders: boolean;
  team_updates: boolean;
  ai_recommendations: boolean;
  weekly_summary: boolean;
  reminder_frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start: string; // HH:MM format
  quiet_hours_end: string; // HH:MM format
  created_at: string;
  updated_at: string;
}

export interface TeamProject {
  id: string;
  user_id: string;
  opportunity_id?: string;
  project_name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  assignments?: TeamProjectAssignment[];
}

export interface TeamProjectAssignment {
  id: string;
  team_project_id: string;
  team_member_id: string;
  role: string;
  responsibilities?: string;
  hours_allocated: number;
  is_lead: boolean;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  team_member?: TeamMember;
}

// Form types for creating/editing
export interface CreateTeamMemberData {
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {
  is_active?: boolean;
}

export interface CreateTeamMemberSkillData {
  skill_id: string;
  proficiency_level: 1 | 2 | 3 | 4 | 5;
  years_experience: number;
  is_primary_skill?: boolean;
}

export interface UpdateTeamMemberSkillData extends Partial<CreateTeamMemberSkillData> {}

export interface CreateTeamProjectData {
  opportunity_id?: string;
  project_name: string;
  description?: string;
  status?: 'planning' | 'active' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
}

export interface CreateProjectAssignmentData {
  team_member_id: string;
  role: string;
  responsibilities?: string;
  hours_allocated?: number;
  is_lead?: boolean;
}

// Skill Matrix types
export interface SkillMatrixEntry {
  skill: Skill;
  teamMembers: {
    member: TeamMember;
    proficiency: number;
    yearsExperience: number;
    isPrimary: boolean;
  }[];
}

export interface SkillGapAnalysis {
  skill: Skill;
  currentStrength: number; // Average proficiency
  recommendedStrength: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// AI Recommendation types
export interface TeamOptimizationRequest {
  teamMembers: TeamMember[];
  skills: SkillMatrixEntry[];
  opportunities: any[]; // Opportunity type from dashboard
  preferences: NotificationPreferences;
}

export interface TeamOptimizationResponse {
  recommendations: AITeamRecommendation[];
  skillGaps: SkillGapAnalysis[];
  teamStructure: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

// Notification types
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  grant_deadline_reminders: boolean;
  team_updates: boolean;
  ai_recommendations: boolean;
  weekly_summary: boolean;
  reminder_frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
}

// Dashboard stats types
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalSkills: number;
  averageProficiency: number;
  skillGaps: number;
  pendingRecommendations: number;
  activeProjects: number;
}

// Filter and search types
export interface TeamMemberFilters {
  role?: string;
  isActive?: boolean;
  skillCategory?: string;
  minProficiency?: number;
  search?: string;
}

export interface SkillFilters {
  category?: string;
  search?: string;
  hasMembers?: boolean;
} 