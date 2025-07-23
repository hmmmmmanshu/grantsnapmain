import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeam } from '@/hooks/useTeam';
import { useSkills } from '@/hooks/useSkills';
import { SkillMatrixEntry, SkillGapAnalysis, CreateTeamMemberSkillData } from '@/types/team';
import { Brain, Plus, Search, AlertTriangle, TrendingUp, Users, Target } from 'lucide-react';

export default function SkillMatrixTab() {
  const { teamMembers } = useTeam();
  const { 
    skills, 
    loading, 
    getSkillMatrix, 
    analyzeSkillGaps, 
    addTeamMemberSkill,
    getSkillsByCategory,
    getSkillCategories 
  } = useSkills();
  
  const [skillMatrix, setSkillMatrix] = useState<SkillMatrixEntry[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [skillFormData, setSkillFormData] = useState<CreateTeamMemberSkillData>({
    skill_id: '',
    proficiency_level: 3,
    years_experience: 0,
    is_primary_skill: false,
  });

  const categories = getSkillCategories();

  useEffect(() => {
    if (teamMembers.length > 0 && skills.length > 0) {
      loadSkillMatrix();
    }
  }, [teamMembers, skills]);

  const loadSkillMatrix = async () => {
    const matrix = await getSkillMatrix(teamMembers);
    setSkillMatrix(matrix);
    
    const gaps = analyzeSkillGaps(matrix);
    setSkillGaps(gaps);
  };

  const filteredSkills = skillMatrix.filter(entry => {
    const matchesCategory = !selectedCategory || entry.skill.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      entry.skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember && selectedSkill) {
      await addTeamMemberSkill(selectedMember.id, skillFormData);
      setShowAddSkillDialog(false);
      setSelectedMember(null);
      setSelectedSkill(null);
      setSkillFormData({
        skill_id: '',
        proficiency_level: 3,
        years_experience: 0,
        is_primary_skill: false,
      });
      loadSkillMatrix();
    }
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-yellow-500';
    if (level >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGapPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading skill matrix...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddSkillDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skill to Team Member</DialogTitle>
              <DialogDescription>
                Assign a skill to a team member with proficiency level
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member">Team Member</Label>
                <Select onValueChange={(value) => {
                  const member = teamMembers.find(m => m.id === value);
                  setSelectedMember(member);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skill">Skill</Label>
                <Select onValueChange={(value) => {
                  const skill = skills.find(s => s.id === value);
                  setSelectedSkill(skill);
                  setSkillFormData({ ...skillFormData, skill_id: value });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map(skill => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name} ({skill.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proficiency">Proficiency Level (1-5)</Label>
                <Select onValueChange={(value) => setSkillFormData({ 
                  ...skillFormData, 
                  proficiency_level: parseInt(value) as 1 | 2 | 3 | 4 | 5 
                })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proficiency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Novice</SelectItem>
                    <SelectItem value="3">3 - Intermediate</SelectItem>
                    <SelectItem value="4">4 - Advanced</SelectItem>
                    <SelectItem value="5">5 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={skillFormData.years_experience}
                  onChange={(e) => setSkillFormData({ 
                    ...skillFormData, 
                    years_experience: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddSkillDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedMember || !selectedSkill}>
                  Add Skill
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Skill Matrix and Gap Analysis */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Skill Matrix</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <div className="grid gap-4">
            {filteredSkills.map((entry) => (
              <Card key={entry.skill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {entry.skill.name}
                      </CardTitle>
                      <CardDescription>
                        {entry.skill.category} • {entry.skill.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{entry.teamMembers.length} members</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {entry.teamMembers.length > 0 ? (
                    <div className="space-y-3">
                      {entry.teamMembers.map((memberData) => (
                        <div key={memberData.member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {memberData.member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{memberData.member.name}</p>
                              <p className="text-sm text-muted-foreground">{memberData.member.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">{memberData.proficiency}/5</div>
                              <div className="text-xs text-muted-foreground">Proficiency</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">{memberData.yearsExperience}y</div>
                              <div className="text-xs text-muted-foreground">Experience</div>
                            </div>
                            <div className="w-20">
                              <Progress value={(memberData.proficiency / 5) * 100} className="h-2" />
                            </div>
                            {memberData.isPrimary && (
                              <Badge variant="secondary">Primary</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p>No team members have this skill</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowAddSkillDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Skill
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <div className="grid gap-4">
            {skillGaps.map((gap) => (
              <Card key={gap.skill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {gap.skill.name}
                      </CardTitle>
                      <CardDescription>
                        {gap.skill.category} • Gap: {gap.gap.toFixed(1)} points
                      </CardDescription>
                    </div>
                    <Badge className={getGapPriorityColor(gap.priority)}>
                      {gap.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Strength</span>
                      <span className="text-sm">{gap.currentStrength.toFixed(1)}/5</span>
                    </div>
                    <Progress value={(gap.currentStrength / 5) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended Strength</span>
                      <span className="text-sm">{gap.recommendedStrength}/5</span>
                    </div>
                    <Progress value={(gap.recommendedStrength / 5) * 100} className="h-2" />
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {gap.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {skillGaps.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">No significant skill gaps detected!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skillMatrix.length}</div>
                <p className="text-xs text-muted-foreground">Skills covered by team</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Skill Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{skillGaps.length}</div>
                <p className="text-xs text-muted-foreground">Areas needing attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Average Proficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {skillMatrix.length > 0 
                    ? (skillMatrix.reduce((sum, entry) => 
                        sum + entry.teamMembers.reduce((memberSum, member) => 
                          memberSum + member.proficiency, 0
                        ), 0
                      ) / skillMatrix.reduce((sum, entry) => 
                        sum + entry.teamMembers.length, 0
                      )).toFixed(1)
                    : '0'
                  }/5
                </div>
                <p className="text-xs text-muted-foreground">Across all skills</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 