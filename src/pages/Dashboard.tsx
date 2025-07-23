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
import DebugInfo from '@/components/DebugInfo';

// Sample data button component for testing
const SampleDataButton = ({ onAddSampleData }: { onAddSampleData: () => void }) => (
  <button
    onClick={onAddSampleData}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  >
    Add Sample Data
  </button>
);

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    opportunities, 
    loading: opportunitiesLoading, 
    error, 
    addSampleData,
    updateStatus,
    deleteOpportunity
  } = useOpportunities();
  
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
            <div className="flex items-center gap-4">
              {opportunities.length === 0 && (
                <SampleDataButton onAddSampleData={addSampleData} />
              )}
              <ProfileHub />
            </div>
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
              onStatusUpdate={updateStatus}
              onDelete={deleteOpportunity}
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
      
      <DebugInfo />
    </div>
  );
};

export default Dashboard;
