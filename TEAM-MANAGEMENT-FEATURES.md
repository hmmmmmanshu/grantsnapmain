# Team Management Features - GrantSnap

This document outlines the comprehensive team management system built for GrantSnap, including team members, skill matrix, AI recommendations, and notification preferences.

## 🚀 Features Overview

### 1. Team Members & Profiles
- **Add/Edit/Delete Team Members**: Full CRUD operations for team member management
- **Rich Profiles**: Include bio, social links (LinkedIn, GitHub, Portfolio), and avatar
- **Role Management**: Assign and manage team member roles
- **Active/Inactive Status**: Toggle team member availability
- **Search & Filter**: Find team members by name, email, role, or status

### 2. Skill Matrix
- **Comprehensive Skill Categories**: Technical, Business, Creative, and Soft Skills
- **Proficiency Tracking**: 1-5 scale for skill proficiency levels
- **Experience Tracking**: Years of experience for each skill
- **Primary Skills**: Mark key skills for each team member
- **Skill Gap Analysis**: Identify areas needing improvement
- **Visual Matrix**: Clear visualization of team capabilities

### 3. ChatGPT Team Optimization
- **AI-Powered Recommendations**: Generate team optimization suggestions
- **Skill Gap Analysis**: AI identifies missing or weak skills
- **Role Assignment Optimization**: Suggest better role distributions
- **Team Structure Recommendations**: Improve team collaboration
- **Priority-Based Suggestions**: High, medium, low priority recommendations
- **Status Tracking**: Mark recommendations as pending, implemented, or dismissed

### 4. Notification Preferences
- **Multiple Notification Types**: Email, push, grant deadlines, team updates, AI recommendations, weekly summaries
- **Reminder Frequency**: Immediate, daily, or weekly notifications
- **Quiet Hours**: Set times when notifications are paused
- **Granular Control**: Enable/disable specific notification types
- **Real-time Status**: Show current notification state

## 🏗️ Architecture

### Database Schema
The system uses the following Supabase tables:

```sql
-- Core team management
team_members
skills
team_member_skills

-- AI recommendations
ai_team_recommendations

-- Notification preferences
notification_preferences

-- Project management (future)
team_projects
team_project_assignments
```

### TypeScript Types
Comprehensive type definitions in `src/types/team.ts`:
- `TeamMember` - Team member data structure
- `Skill` - Skill definitions and categories
- `TeamMemberSkill` - Skill assignments with proficiency levels
- `AITeamRecommendation` - AI-generated recommendations
- `NotificationPreferences` - User notification settings

### React Hooks
Custom hooks for state management:

- **`useTeam()`** - Team member CRUD operations
- **`useSkills()`** - Skill matrix and gap analysis
- **`useAIRecommendations()`** - AI recommendation management
- **`useNotifications()`** - Notification preferences

## 🎯 Key Components

### 1. TeamManagement.tsx
Main container component with tabbed interface:
- Team Members tab
- Skill Matrix tab
- AI Recommendations tab
- Settings tab

### 2. TeamMembersTab.tsx
Team member management interface:
- Grid view of team members
- Add/edit forms with validation
- Search and filter functionality
- Social media links and avatars

### 3. SkillMatrixTab.tsx
Skill visualization and management:
- Matrix view of skills vs team members
- Gap analysis with recommendations
- Add skills to team members
- Proficiency level tracking

### 4. AIRecommendationsTab.tsx
AI-powered insights:
- Generate team optimization recommendations
- View and manage recommendation status
- Filter by type, priority, and status
- Implementation tracking

### 5. NotificationSettingsTab.tsx
Notification preference management:
- Toggle notification types
- Set reminder frequencies
- Configure quiet hours
- Real-time status display

## 🔧 Setup Instructions

### 1. Database Setup
Run the SQL schema in `team-management-schema.sql`:

```bash
# Apply the schema to your Supabase project
psql -h your-supabase-host -U postgres -d postgres -f team-management-schema.sql
```

### 2. Environment Variables
Ensure your `.env` file includes:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Component Integration
The team management system is integrated into the main dashboard:

```tsx
// In Dashboard.tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsTrigger value="opportunities">Funding Opportunities</TabsTrigger>
  <TabsTrigger value="team">Team Management</TabsTrigger>
</Tabs>
```

## 🎨 UI/UX Features

### Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Card-Based Interface**: Clean, organized information display
- **Interactive Elements**: Hover states, loading indicators, toast notifications
- **Consistent Styling**: Uses shadcn/ui components for consistency

### User Experience
- **Intuitive Navigation**: Tabbed interface for easy switching
- **Real-time Updates**: Immediate feedback on actions
- **Search & Filter**: Quick access to specific information
- **Bulk Operations**: Efficient management of multiple items

## 🤖 AI Integration

### ChatGPT Integration
The AI recommendation system includes:

1. **Mock Implementation**: Currently uses mock data for demonstration
2. **Real API Integration**: Ready for OpenAI API integration
3. **Structured Analysis**: Analyzes team composition, skills, and opportunities
4. **Actionable Recommendations**: Provides specific, implementable suggestions

### Future Enhancements
- Real ChatGPT API integration
- Advanced team composition analysis
- Predictive skill gap identification
- Automated recommendation scheduling

## 📊 Analytics & Insights

### Team Statistics
- Total team members and active members
- Skill coverage and average proficiency
- Implementation rate of AI recommendations
- Notification engagement metrics

### Skill Gap Analysis
- Visual representation of team capabilities
- Priority-based gap identification
- Specific recommendations for improvement
- Progress tracking over time

## 🔒 Security & Permissions

### Row Level Security (RLS)
All tables implement RLS policies:
- Users can only access their own data
- Team members are scoped to user ownership
- Skills are globally accessible but user-specific assignments are protected

### Data Validation
- Form validation for all inputs
- Type safety with TypeScript
- Database constraints for data integrity

## 🚀 Getting Started

### 1. Add Team Members
1. Navigate to Team Management tab
2. Click "Add Team Member"
3. Fill in required information (name, email, role)
4. Add optional details (bio, social links)

### 2. Assign Skills
1. Go to Skill Matrix tab
2. Click "Add Skill" on any team member
3. Select skill and set proficiency level
4. Add years of experience

### 3. Generate AI Recommendations
1. Ensure team members and skills are added
2. Go to AI Recommendations tab
3. Click "Generate AI Recommendations"
4. Review and implement suggestions

### 4. Configure Notifications
1. Go to Settings tab
2. Toggle notification types as needed
3. Set reminder frequency
4. Configure quiet hours

## 🔮 Future Roadmap

### Phase 2 Features
- **Project Management**: Assign team members to specific opportunities
- **Time Tracking**: Track hours spent on grant applications
- **Performance Analytics**: Measure team effectiveness
- **Advanced AI**: More sophisticated recommendation algorithms

### Phase 3 Features
- **Team Collaboration**: Real-time collaboration tools
- **Integration APIs**: Connect with external tools
- **Advanced Reporting**: Comprehensive analytics dashboard
- **Mobile App**: Native mobile application

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials
   - Check RLS policies are applied
   - Ensure tables exist in database

2. **Component Import Errors**
   - Verify all dependencies are installed
   - Check import paths are correct
   - Ensure TypeScript types are generated

3. **AI Recommendations Not Working**
   - Verify team members are added
   - Check skills are assigned
   - Ensure mock implementation is working

### Support
For issues or questions:
1. Check the console for error messages
2. Verify database schema is applied correctly
3. Test with sample data first
4. Review TypeScript type definitions

## 📝 Contributing

When contributing to the team management features:

1. **Follow TypeScript conventions**
2. **Add proper error handling**
3. **Include loading states**
4. **Test with real data**
5. **Update documentation**

## 🎉 Conclusion

The team management system provides a comprehensive solution for managing startup teams in the context of grant applications. With its modern UI, robust backend, and AI-powered insights, it helps teams optimize their composition and improve their chances of securing funding.

The system is designed to be extensible and can easily accommodate future enhancements as the platform grows. 