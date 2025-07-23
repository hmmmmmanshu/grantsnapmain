import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useTeam } from '@/hooks/useTeam';
import { useSkills } from '@/hooks/useSkills';
import { useNotifications } from '@/hooks/useNotifications';
import { AITeamRecommendation } from '@/types/team';
import { Lightbulb, Sparkles, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Brain } from 'lucide-react';

export default function AIRecommendationsTab() {
  const { 
    recommendations, 
    loading, 
    generating,
    updateRecommendationStatus, 
    deleteRecommendation,
    generateTeamOptimizationRecommendations,
    getRecommendationStats 
  } = useAIRecommendations();
  
  const { teamMembers } = useTeam();
  const { skills } = useSkills();
  const { preferences } = useNotifications();
  
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const stats = getRecommendationStats();

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesType = !filterType || rec.recommendation_type === filterType;
    const matchesPriority = !filterPriority || rec.priority === filterPriority;
    const matchesStatus = !filterStatus || rec.status === filterStatus;
    return matchesType && matchesPriority && matchesStatus;
  });

  const handleGenerateRecommendations = async () => {
    if (teamMembers.length === 0) {
      alert('Please add team members first to generate recommendations.');
      return;
    }

    const teamData = {
      teamMembers,
      skills: [], // This would be populated with skill matrix data
      opportunities: [], // This would be populated with opportunities data
      preferences: preferences || {
        email_notifications: true,
        push_notifications: true,
        grant_deadline_reminders: true,
        team_updates: true,
        ai_recommendations: true,
        weekly_summary: true,
        reminder_frequency: 'daily',
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
      }
    };

    await generateTeamOptimizationRecommendations(teamData);
    setShowGenerateDialog(false);
  };

  const handleStatusUpdate = async (recommendation: AITeamRecommendation, status: 'pending' | 'implemented' | 'dismissed') => {
    await updateRecommendationStatus(recommendation.id, status);
  };

  const handleDelete = async (recommendation: AITeamRecommendation) => {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      await deleteRecommendation(recommendation.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'text-green-600 bg-green-100 border-green-200';
      case 'dismissed': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'pending': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill_gap': return <Brain className="h-4 w-4" />;
      case 'role_assignment': return <TrendingUp className="h-4 w-4" />;
      case 'team_structure': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading AI recommendations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="skill_gap">Skill Gap</SelectItem>
              <SelectItem value="role_assignment">Role Assignment</SelectItem>
              <SelectItem value="team_structure">Team Structure</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button disabled={generating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? 'Generating...' : 'Generate AI Recommendations'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate AI Recommendations</DialogTitle>
              <DialogDescription>
                AI will analyze your team structure, skills, and opportunities to provide personalized recommendations.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">What AI will analyze:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Team member skills and expertise</li>
                    <li>• Skill gaps and areas for improvement</li>
                    <li>• Role optimization opportunities</li>
                    <li>• Team structure recommendations</li>
                  </ul>
                </div>
              </div>
              
              {teamMembers.length === 0 && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-700">
                    Add team members first to get meaningful recommendations.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateRecommendations}
                disabled={generating || teamMembers.length === 0}
              >
                {generating ? 'Generating...' : 'Generate Recommendations'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implemented</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.implemented}</div>
            <p className="text-xs text-muted-foreground">
              {stats.implementationRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.byPriority.high}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="implemented">Implemented ({stats.implemented})</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed ({stats.dismissed})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <RecommendationsList 
            recommendations={filteredRecommendations}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <RecommendationsList 
            recommendations={recommendations.filter(r => r.status === 'pending')}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>

        <TabsContent value="implemented" className="space-y-4">
          <RecommendationsList 
            recommendations={recommendations.filter(r => r.status === 'implemented')}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>

        <TabsContent value="dismissed" className="space-y-4">
          <RecommendationsList 
            recommendations={recommendations.filter(r => r.status === 'dismissed')}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>
      </Tabs>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {recommendations.length === 0 
                ? 'No AI recommendations yet. Generate your first set of recommendations!' 
                : 'No recommendations match your current filters'
              }
            </p>
            {recommendations.length === 0 && (
              <Button onClick={() => setShowGenerateDialog(true)} className="mt-2">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RecommendationsListProps {
  recommendations: AITeamRecommendation[];
  onStatusUpdate: (recommendation: AITeamRecommendation, status: 'pending' | 'implemented' | 'dismissed') => void;
  onDelete: (recommendation: AITeamRecommendation) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
}

function RecommendationsList({ 
  recommendations, 
  onStatusUpdate, 
  onDelete, 
  getPriorityColor, 
  getStatusColor, 
  getTypeIcon 
}: RecommendationsListProps) {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getTypeIcon(recommendation.recommendation_type)}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {recommendation.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(recommendation.priority)}>
                  {recommendation.priority} priority
                </Badge>
                <Badge className={getStatusColor(recommendation.status)}>
                  {recommendation.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Generated on {new Date(recommendation.ai_generated_at).toLocaleDateString()}
              </div>
              
              <div className="flex items-center space-x-2">
                {recommendation.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusUpdate(recommendation, 'implemented')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Implemented
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusUpdate(recommendation, 'dismissed')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Dismiss
                    </Button>
                  </>
                )}
                
                {recommendation.status === 'implemented' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(recommendation, 'pending')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Mark Pending
                  </Button>
                )}
                
                {recommendation.status === 'dismissed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(recommendation, 'pending')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Reopen
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(recommendation)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 