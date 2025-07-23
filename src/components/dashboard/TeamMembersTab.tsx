import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTeam } from '@/hooks/useTeam';
import { useSkills } from '@/hooks/useSkills';
import { CreateTeamMemberData, TeamMember } from '@/types/team';
import { Plus, Edit, Trash2, ExternalLink, Mail, Github, Linkedin, User, Search, Filter } from 'lucide-react';

export default function TeamMembersTab() {
  const { teamMembers, loading, createTeamMember, updateTeamMember, deleteTeamMember, toggleTeamMemberStatus, searchTeamMembers } = useTeam();
  const { skills, getSkillsByCategory } = useSkills();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    name: '',
    email: '',
    role: '',
    bio: '',
    avatar_url: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  const filteredMembers = searchTeamMembers(searchTerm).filter(member => 
    !filterRole || member.role.toLowerCase().includes(filterRole.toLowerCase())
  );

  const roles = [...new Set(teamMembers.map(m => m.role))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      await updateTeamMember(editingMember.id, formData);
    } else {
      await createTeamMember(formData);
    }
    
    setShowAddDialog(false);
    setEditingMember(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      bio: '',
      avatar_url: '',
      linkedin_url: '',
      github_url: '',
      portfolio_url: '',
    });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      bio: member.bio || '',
      avatar_url: member.avatar_url || '',
      linkedin_url: member.linkedin_url || '',
      github_url: member.github_url || '',
      portfolio_url: member.portfolio_url || '',
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (member: TeamMember) => {
    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      await deleteTeamMember(member.id);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading team members...</div>
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
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingMember(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? 'Update team member information' : 'Add a new team member to your team'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief description of the team member's background and expertise..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {member.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {member.bio}
                </p>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              
              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Skills</Label>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill.id} variant="outline" className="text-xs">
                        {skill.skill?.name} ({skill.proficiency_level}/5)
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Social Links */}
              <div className="flex items-center space-x-2">
                {member.linkedin_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {member.github_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={member.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {member.portfolio_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTeamMemberStatus(member.id)}
                  >
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(member)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <User className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {searchTerm || filterRole ? 'No team members found matching your criteria' : 'No team members yet'}
            </p>
            {!searchTerm && !filterRole && (
              <Button onClick={() => setShowAddDialog(true)} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add your first team member
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 