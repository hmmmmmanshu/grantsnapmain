import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { 
  AITeamRecommendation,
  TeamOptimizationRequest,
  TeamOptimizationResponse,
  SkillGapAnalysis
} from '../types/team';

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AITeamRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch AI recommendations for the current user
  const fetchRecommendations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_team_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRecommendations(data || []);
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Create a new AI recommendation
  const createRecommendation = async (recommendationData: Partial<AITeamRecommendation>): Promise<AITeamRecommendation | null> => {
    if (!user) return null;

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('ai_team_recommendations')
        .insert({
          ...recommendationData,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Update local state
      setRecommendations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating AI recommendation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create recommendation');
      return null;
    }
  };

  // Update recommendation status
  const updateRecommendationStatus = async (
    id: string, 
    status: 'pending' | 'implemented' | 'dismissed'
  ): Promise<AITeamRecommendation | null> => {
    if (!user) return null;

    try {
      setError(null);

      const updates: Partial<AITeamRecommendation> = { status };
      if (status === 'implemented') {
        updates.implemented_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('ai_team_recommendations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setRecommendations(prev => 
        prev.map(rec => rec.id === id ? data : rec)
      );

      return data;
    } catch (err) {
      console.error('Error updating recommendation status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update recommendation');
      return null;
    }
  };

  // Delete a recommendation
  const deleteRecommendation = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('ai_team_recommendations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting recommendation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete recommendation');
      return false;
    }
  };

  // Generate AI recommendations using ChatGPT
  const generateTeamOptimizationRecommendations = async (
    teamData: TeamOptimizationRequest
  ): Promise<TeamOptimizationResponse | null> => {
    if (!user) return null;

    try {
      setGenerating(true);
      setError(null);

      // Prepare the data for AI analysis
      const analysisData = {
        teamMembers: teamData.teamMembers.map(member => ({
          name: member.name,
          role: member.role,
          skills: member.skills?.map(skill => ({
            name: skill.skill?.name,
            proficiency: skill.proficiency_level,
            yearsExperience: skill.years_experience,
            isPrimary: skill.is_primary_skill
          })) || []
        })),
        opportunities: teamData.opportunities,
        skillGaps: teamData.skills.filter(entry => entry.teamMembers.length === 0 || 
          entry.teamMembers.reduce((sum, member) => sum + member.proficiency, 0) / entry.teamMembers.length < 3
        ).map(entry => ({
          skill: entry.skill.name,
          category: entry.skill.category,
          currentStrength: entry.teamMembers.length > 0 ? 
            entry.teamMembers.reduce((sum, member) => sum + member.proficiency, 0) / entry.teamMembers.length : 0
        })),
        preferences: teamData.preferences
      };

      // Call ChatGPT API (you'll need to implement this)
      const aiResponse = await callChatGPTForTeamOptimization(analysisData);
      
      if (!aiResponse) {
        throw new Error('Failed to get AI response');
      }

      // Create recommendations in the database
      const createdRecommendations: AITeamRecommendation[] = [];
      
      for (const recommendation of aiResponse.recommendations) {
        const created = await createRecommendation({
          recommendation_type: recommendation.type,
          title: recommendation.title,
          description: recommendation.description,
          priority: recommendation.priority,
        });
        
        if (created) {
          createdRecommendations.push(created);
        }
      }

      return {
        recommendations: createdRecommendations,
        skillGaps: aiResponse.skillGaps,
        teamStructure: aiResponse.teamStructure,
      };
    } catch (err) {
      console.error('Error generating AI recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  // Mock ChatGPT API call (replace with actual implementation)
  const callChatGPTForTeamOptimization = async (data: any): Promise<any> => {
    // This is a mock implementation - replace with actual ChatGPT API call
    // You'll need to set up your OpenAI API key and implement the actual API call
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response
    return {
      recommendations: [
        {
          type: 'skill_gap',
          title: 'Strengthen Technical Skills',
          description: 'Your team shows gaps in advanced technical skills. Consider upskilling team members in React and Node.js.',
          priority: 'high'
        },
        {
          type: 'role_assignment',
          title: 'Optimize Role Distribution',
          description: 'Consider redistributing responsibilities to better align with team member strengths.',
          priority: 'medium'
        },
        {
          type: 'team_structure',
          title: 'Enhance Team Collaboration',
          description: 'Implement regular team meetings and cross-functional projects to improve collaboration.',
          priority: 'medium'
        }
      ],
      skillGaps: [
        {
          skill: { name: 'React', category: 'Technical' },
          currentStrength: 2.5,
          recommendedStrength: 4,
          gap: 1.5,
          priority: 'high',
          recommendations: ['Consider hiring a senior React developer', 'Provide React training for existing team members']
        }
      ],
      teamStructure: {
        strengths: ['Good mix of technical and business skills', 'Strong communication within team'],
        weaknesses: ['Limited advanced technical expertise', 'Need more project management experience'],
        suggestions: ['Hire a senior technical lead', 'Implement mentorship program', 'Add project management training']
      }
    };
  };

  // Get recommendations by type
  const getRecommendationsByType = (type: string): AITeamRecommendation[] => {
    return recommendations.filter(rec => rec.recommendation_type === type);
  };

  // Get recommendations by priority
  const getRecommendationsByPriority = (priority: string): AITeamRecommendation[] => {
    return recommendations.filter(rec => rec.priority === priority);
  };

  // Get pending recommendations
  const getPendingRecommendations = (): AITeamRecommendation[] => {
    return recommendations.filter(rec => rec.status === 'pending');
  };

  // Get recommendation statistics
  const getRecommendationStats = () => {
    const total = recommendations.length;
    const pending = recommendations.filter(rec => rec.status === 'pending').length;
    const implemented = recommendations.filter(rec => rec.status === 'implemented').length;
    const dismissed = recommendations.filter(rec => rec.status === 'dismissed').length;
    
    const byType = {
      skill_gap: recommendations.filter(rec => rec.recommendation_type === 'skill_gap').length,
      role_assignment: recommendations.filter(rec => rec.recommendation_type === 'role_assignment').length,
      team_structure: recommendations.filter(rec => rec.recommendation_type === 'team_structure').length,
    };

    const byPriority = {
      high: recommendations.filter(rec => rec.priority === 'high').length,
      medium: recommendations.filter(rec => rec.priority === 'medium').length,
      low: recommendations.filter(rec => rec.priority === 'low').length,
    };

    return {
      total,
      pending,
      implemented,
      dismissed,
      byType,
      byPriority,
      implementationRate: total > 0 ? ((implemented / total) * 100).toFixed(1) : '0',
    };
  };

  // Load recommendations on mount
  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  return {
    recommendations,
    loading,
    generating,
    error,
    fetchRecommendations,
    createRecommendation,
    updateRecommendationStatus,
    deleteRecommendation,
    generateTeamOptimizationRecommendations,
    getRecommendationsByType,
    getRecommendationsByPriority,
    getPendingRecommendations,
    getRecommendationStats,
  };
}; 