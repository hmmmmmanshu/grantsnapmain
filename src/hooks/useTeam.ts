import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { 
  TeamMember, 
  CreateTeamMemberData, 
  UpdateTeamMemberData,
  TeamMemberFilters 
} from '../types/team';

export const useTeam = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all team members for the current user
  const fetchTeamMembers = async (filters?: TeamMemberFilters) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('team_members')
        .select(`
          *,
          skills:team_member_skills(
            *,
            skill:skills(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.role) {
        query = query.ilike('role', `%${filters.role}%`);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,role.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTeamMembers(data || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  // Create a new team member
  const createTeamMember = async (memberData: CreateTeamMemberData): Promise<TeamMember | null> => {
    if (!user) return null;

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('team_members')
        .insert({
          ...memberData,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Refresh the team members list
      await fetchTeamMembers();
      return data;
    } catch (err) {
      console.error('Error creating team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to create team member');
      return null;
    }
  };

  // Update a team member
  const updateTeamMember = async (id: string, updates: UpdateTeamMemberData): Promise<TeamMember | null> => {
    if (!user) return null;

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update the local state
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, ...data } : member
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to update team member');
      return null;
    }
  };

  // Delete a team member
  const deleteTeamMember = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Update the local state
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete team member');
      return false;
    }
  };

  // Toggle team member active status
  const toggleTeamMemberStatus = async (id: string): Promise<boolean> => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return false;

    const success = await updateTeamMember(id, { is_active: !member.is_active });
    return success !== null;
  };

  // Get team member by ID
  const getTeamMember = (id: string): TeamMember | undefined => {
    return teamMembers.find(member => member.id === id);
  };

  // Get active team members
  const getActiveTeamMembers = (): TeamMember[] => {
    return teamMembers.filter(member => member.is_active);
  };

  // Get team members by role
  const getTeamMembersByRole = (role: string): TeamMember[] => {
    return teamMembers.filter(member => 
      member.role.toLowerCase().includes(role.toLowerCase())
    );
  };

  // Search team members
  const searchTeamMembers = (searchTerm: string): TeamMember[] => {
    if (!searchTerm.trim()) return teamMembers;

    const term = searchTerm.toLowerCase();
    return teamMembers.filter(member =>
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term) ||
      member.bio?.toLowerCase().includes(term)
    );
  };

  // Get team statistics
  const getTeamStats = () => {
    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter(m => m.is_active).length;
    const roles = [...new Set(teamMembers.map(m => m.role))];
    const totalSkills = teamMembers.reduce((acc, member) => 
      acc + (member.skills?.length || 0), 0
    );

    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      uniqueRoles: roles.length,
      totalSkills,
      averageSkillsPerMember: totalMembers > 0 ? (totalSkills / totalMembers).toFixed(1) : '0'
    };
  };

  // Load team members on mount
  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

  return {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    toggleTeamMemberStatus,
    getTeamMember,
    getActiveTeamMembers,
    getTeamMembersByRole,
    searchTeamMembers,
    getTeamStats,
  };
}; 