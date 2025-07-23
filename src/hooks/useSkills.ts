import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { 
  Skill, 
  TeamMemberSkill, 
  CreateTeamMemberSkillData,
  UpdateTeamMemberSkillData,
  SkillMatrixEntry,
  SkillGapAnalysis,
  SkillFilters 
} from '../types/team';

export const useSkills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [teamMemberSkills, setTeamMemberSkills] = useState<TeamMemberSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available skills
  const fetchSkills = async (filters?: SkillFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setSkills(data || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  // Fetch team member skills for a specific team member
  const fetchTeamMemberSkills = async (teamMemberId: string) => {
    if (!user) return;

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('team_member_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('team_member_id', teamMemberId);

      if (fetchError) {
        throw fetchError;
      }

      setTeamMemberSkills(data || []);
    } catch (err) {
      console.error('Error fetching team member skills:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team member skills');
    }
  };

  // Add a skill to a team member
  const addTeamMemberSkill = async (
    teamMemberId: string, 
    skillData: CreateTeamMemberSkillData
  ): Promise<TeamMemberSkill | null> => {
    if (!user) return null;

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('team_member_skills')
        .insert({
          ...skillData,
          team_member_id: teamMemberId,
        })
        .select(`
          *,
          skill:skills(*)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      // Update local state
      setTeamMemberSkills(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding team member skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to add skill');
      return null;
    }
  };

  // Update a team member skill
  const updateTeamMemberSkill = async (
    skillId: string, 
    updates: UpdateTeamMemberSkillData
  ): Promise<TeamMemberSkill | null> => {
    if (!user) return null;

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('team_member_skills')
        .update(updates)
        .eq('id', skillId)
        .select(`
          *,
          skill:skills(*)
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setTeamMemberSkills(prev => 
        prev.map(skill => 
          skill.id === skillId ? data : skill
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating team member skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to update skill');
      return null;
    }
  };

  // Remove a skill from a team member
  const removeTeamMemberSkill = async (skillId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('team_member_skills')
        .delete()
        .eq('id', skillId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setTeamMemberSkills(prev => prev.filter(skill => skill.id !== skillId));
      return true;
    } catch (err) {
      console.error('Error removing team member skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
      return false;
    }
  };

  // Get skills by category
  const getSkillsByCategory = (category: string): Skill[] => {
    return skills.filter(skill => skill.category === category);
  };

  // Get skill categories
  const getSkillCategories = (): string[] => {
    return [...new Set(skills.map(skill => skill.category))];
  };

  // Search skills
  const searchSkills = (searchTerm: string): Skill[] => {
    if (!searchTerm.trim()) return skills;

    const term = searchTerm.toLowerCase();
    return skills.filter(skill =>
      skill.name.toLowerCase().includes(term) ||
      skill.description?.toLowerCase().includes(term) ||
      skill.category.toLowerCase().includes(term)
    );
  };

  // Get skill matrix for all team members
  const getSkillMatrix = async (teamMembers: any[]): Promise<SkillMatrixEntry[]> => {
    if (!user || teamMembers.length === 0) return [];

    try {
      const skillMatrix: SkillMatrixEntry[] = [];

      for (const skill of skills) {
        const teamMembersWithSkill = [];

        for (const member of teamMembers) {
          const memberSkill = member.skills?.find((s: any) => s.skill_id === skill.id);
          if (memberSkill) {
            teamMembersWithSkill.push({
              member,
              proficiency: memberSkill.proficiency_level,
              yearsExperience: memberSkill.years_experience,
              isPrimary: memberSkill.is_primary_skill,
            });
          }
        }

        if (teamMembersWithSkill.length > 0) {
          skillMatrix.push({
            skill,
            teamMembers: teamMembersWithSkill,
          });
        }
      }

      return skillMatrix;
    } catch (err) {
      console.error('Error generating skill matrix:', err);
      return [];
    }
  };

  // Analyze skill gaps
  const analyzeSkillGaps = (skillMatrix: SkillMatrixEntry[]): SkillGapAnalysis[] => {
    const skillGaps: SkillGapAnalysis[] = [];

    skillMatrix.forEach(entry => {
      const totalProficiency = entry.teamMembers.reduce((sum, member) => 
        sum + member.proficiency, 0
      );
      const currentStrength = entry.teamMembers.length > 0 
        ? totalProficiency / entry.teamMembers.length 
        : 0;

      // Define recommended strength based on skill category
      let recommendedStrength = 3; // Default
      switch (entry.skill.category) {
        case 'Technical':
          recommendedStrength = 4;
          break;
        case 'Business':
          recommendedStrength = 3.5;
          break;
        case 'Creative':
          recommendedStrength = 3;
          break;
        case 'Soft Skills':
          recommendedStrength = 4;
          break;
      }

      const gap = Math.max(0, recommendedStrength - currentStrength);
      
      if (gap > 0) {
        const priority = gap >= 2 ? 'high' : gap >= 1 ? 'medium' : 'low';
        
        const recommendations = [];
        if (gap >= 2) {
          recommendations.push('Consider hiring or training for this skill');
        }
        if (entry.teamMembers.length === 0) {
          recommendations.push('No team members have this skill');
        }
        if (currentStrength < 2) {
          recommendations.push('Team needs basic training in this area');
        }

        skillGaps.push({
          skill: entry.skill,
          currentStrength,
          recommendedStrength,
          gap,
          priority,
          recommendations,
        });
      }
    });

    return skillGaps.sort((a, b) => b.gap - a.gap);
  };

  // Get skill statistics
  const getSkillStats = () => {
    const categories = getSkillCategories();
    const totalSkills = skills.length;
    const skillsByCategory = categories.map(category => ({
      category,
      count: getSkillsByCategory(category).length,
    }));

    return {
      totalSkills,
      categories: skillsByCategory,
      mostCommonCategory: skillsByCategory.reduce((prev, current) => 
        prev.count > current.count ? prev : current
      ),
    };
  };

  // Load skills on mount
  useEffect(() => {
    fetchSkills();
  }, []);

  return {
    skills,
    teamMemberSkills,
    loading,
    error,
    fetchSkills,
    fetchTeamMemberSkills,
    addTeamMemberSkill,
    updateTeamMemberSkill,
    removeTeamMemberSkill,
    getSkillsByCategory,
    getSkillCategories,
    searchSkills,
    getSkillMatrix,
    analyzeSkillGaps,
    getSkillStats,
  };
}; 