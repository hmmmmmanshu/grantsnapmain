import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OpportunityPipeline from '@/components/dashboard/OpportunityPipeline';
import ViewToggle from '@/components/dashboard/ViewToggle';
import ControlBar from '@/components/dashboard/ControlBar';
import OpportunityTable from '@/components/dashboard/OpportunityTable';
import DetailPanel from '@/components/dashboard/DetailPanel';
import { Opportunity } from '@/types/dashboard';
import ProfileHub from '@/components/dashboard/ProfileHub';
import { useAuth } from '@/hooks/useAuth';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Navigate } from 'react-router-dom';

// Mock data for demonstration
const mockOpportunities: Opportunity[] = [
  {
    id: "uuid-1",
    status: "In Progress",
    page_title: "AI for Social Good Grant",
    funder_name: "The Future Foundation",
    page_url: "https://futurefoundation.org/ai-grant",
    application_deadline: "2025-12-01",
    date_saved: "2025-07-10T10:00:00Z",
    user_notes: "This seems like a perfect fit for Project Starlight. Need to check the budget restrictions.",
    extracted_emails: ["grants@futurefoundation.org"],
    type: "grant",
    funding_amount: 500000
  },
  {
    id: "uuid-2",
    status: "To Review",
    page_title: "Seed Funding for Climate Tech",
    funder_name: "GreenTech Ventures",
    page_url: "https://greentechvc.com/funding",
    application_deadline: "2025-07-20",
    date_saved: "2025-07-09T14:30:00Z",
    user_notes: "Early stage funding opportunity. Need to prepare pitch deck.",
    extracted_emails: ["hello@greentechvc.com", "applications@greentechvc.com"],
    type: "investor",
    funding_amount: 2000000
  },
  {
    id: "uuid-3",
    status: "Applied",
    page_title: "Innovation Grant Program",
    funder_name: "Tech Innovation Council",
    page_url: "https://techcouncil.org/grants",
    application_deadline: "2025-08-15",
    date_saved: "2025-07-08T09:15:00Z",
    user_notes: "Application submitted. Follow up scheduled for next week.",
    extracted_emails: ["grants@techcouncil.org"],
    type: "grant",
    funding_amount: 250000
  }
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { opportunities, loading: opportunitiesLoading, error } = useOpportunities();
  
  const [selectedView, setSelectedView] = useState<'all' | 'grants' | 'investors'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'saved'>('deadline');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Filter opportunities based on selected view and filters
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesView = selectedView === 'all' || 
      (selectedView === 'grants' && opp.type === 'grant') ||
      (selectedView === 'investors' && opp.type === 'investor');
    
    const matchesSearch = opp.page_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.funder_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || opp.status === statusFilter;
    
    return matchesView && matchesSearch && matchesStatus;
  });

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
    } else {
      return new Date(b.date_saved).getTime() - new Date(a.date_saved).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile & Autofill Hub - Primary Feature */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Funding Dashboard</h1>
              <p className="text-gray-600">Manage your funding opportunities and profile</p>
            </div>
            <ProfileHub />
          </div>

          <OpportunityPipeline opportunities={opportunities} />
          
          <ViewToggle 
            selectedView={selectedView} 
            onViewChange={setSelectedView} 
          />
          
          <ControlBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          {opportunitiesLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading opportunities...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading opportunities: {error}</p>
            </div>
          ) : (
            <OpportunityTable
              opportunities={sortedOpportunities}
              onOpportunityClick={setSelectedOpportunity}
            />
          )}


        </div>
      </main>

      {selectedOpportunity && (
        <DetailPanel
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
