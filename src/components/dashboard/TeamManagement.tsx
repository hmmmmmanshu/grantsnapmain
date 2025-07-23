import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeam } from '@/hooks/useTeam';
import { useSkills } from '@/hooks/useSkills';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useNotifications } from '@/hooks/useNotifications';
import { Users, Brain, Lightbulb, Settings, Plus } from 'lucide-react';
import TeamMembersTab from './TeamMembersTab';
import SkillMatrixTab from './SkillMatrixTab';
import AIRecommendationsTab from './AIRecommendationsTab';
import NotificationSettingsTab from './NotificationSettingsTab';

export default function TeamManagement() {
  const { teamMembers, getTeamStats } = useTeam();
  const { getSkillStats } = useSkills();
  const { getRecommendationStats } = useAIRecommendations();
  const { getNotificationSummary } = useNotifications();

  const teamStats = getTeamStats();
  const skillStats = getSkillStats();
  const recommendationStats = getRecommendationStats();
  const notificationSummary = getNotificationSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members, skills, and AI-powered recommendations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {teamStats.activeMembers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillStats.totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              {skillStats.categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendationStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {recommendationStats.implementationRate}% implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationSummary?.enabledTypes.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {notificationSummary?.currentlyAllowed ? 'Active' : 'Quiet hours'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Skill Matrix
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <TeamMembersTab />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <SkillMatrixTab />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AIRecommendationsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <NotificationSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
} 