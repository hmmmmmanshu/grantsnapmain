import React, { useState, useEffect } from 'react';
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
import { Target, Globe, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  isExtensionAvailable, 
  promptExtensionInstallation,
  broadcastUserAuthenticated,
  broadcastProfileUpdate
} from '@/lib/extensionService';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

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
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(null);
  const [extensionStatus, setExtensionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastAuthBroadcast, setLastAuthBroadcast] = useState<Date | null>(null);

  // Check extension availability and broadcast authentication on component mount
  useEffect(() => {
    const initializeExtension = async () => {
      try {
        // Check if extension is available
        const available = await isExtensionAvailable();
        setExtensionAvailable(available);
        
        if (available && user) {
          // 🚀 PHASE 1 IMPLEMENTATION: Broadcast authentication to extension
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await broadcastUserAuthenticated(user, session);
              setExtensionStatus('connected');
              setLastAuthBroadcast(new Date());
              console.log('✅ Dashboard: Authentication broadcasted to extension');
            }
          } catch (broadcastError) {
            console.log('⚠️ Dashboard: Extension broadcast failed:', broadcastError.message);
            setExtensionStatus('error');
          }
        } else if (!available) {
          setExtensionStatus('disconnected');
        }
      } catch (error) {
        console.log('Dashboard: Extension check failed:', error);
        setExtensionStatus('error');
        setExtensionAvailable(false);
      }
    };
    
    if (user) {
      initializeExtension();
    }
  }, [user]);

  // Monitor extension status periodically
  useEffect(() => {
    if (!user || !extensionAvailable) return;

    const checkExtensionStatus = async () => {
      try {
        const available = await isExtensionAvailable();
        if (available) {
          setExtensionStatus('connected');
        } else {
          setExtensionStatus('disconnected');
        }
      } catch (error) {
        setExtensionStatus('error');
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkExtensionStatus, 30000);
    return () => clearInterval(interval);
  }, [user, extensionAvailable]);

  // Manual extension status refresh
  const refreshExtensionStatus = async () => {
    setExtensionStatus('checking');
    try {
      const available = await isExtensionAvailable();
      setExtensionAvailable(available);
      
      if (available && user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await broadcastUserAuthenticated(user, session);
          setExtensionStatus('connected');
          setLastAuthBroadcast(new Date());
        }
      } else {
        setExtensionStatus('disconnected');
      }
    } catch (error) {
      setExtensionStatus('error');
    }
  };

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
          {/* Main Dashboard Header */}
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

          {/* Funding Opportunities Section */}
          <div className="space-y-6">
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

          {/* Extension Integration & Virtual CFO Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Extension Status Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Chrome Extension</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status Indicator */}
                  {extensionStatus === 'checking' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Checking...
                    </div>
                  )}
                  {extensionStatus === 'connected' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </div>
                  )}
                  {extensionStatus === 'disconnected' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Disconnected
                    </div>
                  )}
                  {extensionStatus === 'error' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Error
                    </div>
                  )}
                  
                  {/* Refresh Button */}
                  <Button
                    onClick={refreshExtensionStatus}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {extensionStatus === 'connected' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Your extension is active and ready to capture grant opportunities from any website.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Seamlessly integrated with your dashboard
                  </div>
                  {lastAuthBroadcast && (
                    <div className="text-xs text-gray-500">
                      Last synced: {lastAuthBroadcast.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ) : extensionStatus === 'disconnected' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Install the Grants Snap Chrome extension to capture opportunities directly from grant websites.
                  </p>
                  <Button
                    onClick={() => promptExtensionInstallation()}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Extension
                  </Button>
                </div>
              ) : extensionStatus === 'error' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    There was an issue connecting to your extension. Try refreshing or reinstalling.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={refreshExtensionStatus}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                    <Button
                      onClick={() => promptExtensionInstallation()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Reinstall
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Checking extension status...
                  </p>
                </div>
              )}
            </div>

            {/* Virtual CFO Placeholder Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Coming Soon
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Virtual CFO</h3>
                <p className="text-sm text-gray-600">
                  Advanced financial tracking, runway analysis, and automated reporting are coming soon to help you manage your finances like a pro.
                </p>
              </div>
            </div>
          </div>

          {/* Extension Test Component - Remove this in production */}
          <div className="mt-8">
            {/* ExtensionTest component was removed */}
          </div>
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
