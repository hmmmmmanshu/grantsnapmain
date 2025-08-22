import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OpportunityPipeline from '@/components/dashboard/OpportunityPipeline';
import ViewToggle from '@/components/dashboard/ViewToggle';
import ControlBar from '@/components/dashboard/ControlBar';
import OpportunityTable from '@/components/dashboard/OpportunityTable';
import DetailPanel from '@/components/dashboard/DetailPanel';
import { Opportunity } from '@/types/dashboard';
import ProfileHub from '@/components/dashboard/ProfileHub';
import VirtualCFO from '@/components/dashboard/VirtualCFO';
import { useAuth } from '@/hooks/useAuth';
import { useTrackedGrants, TrackedGrant } from '@/hooks/useTrackedGrants';
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

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    grants, 
    loading: grantsLoading, 
    error, 
    updateStatus,
    deleteGrant
  } = useTrackedGrants();
  
  const [selectedView, setSelectedView] = useState<'all' | 'grants' | 'investors'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'saved'>('deadline');
  const [selectedGrant, setSelectedGrant] = useState<TrackedGrant | null>(null);
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

  // Transform tracked grants to match Opportunity interface for existing components
  const transformedOpportunities: Opportunity[] = grants.map(grant => ({
    id: grant.id,
    status: (grant.status as 'To Review' | 'In Progress' | 'Applied') || 'To Review',
    page_title: grant.grant_name || 'Untitled Grant',
    funder_name: 'Grant Opportunity',
    page_url: grant.grant_url || '',
    application_deadline: grant.application_deadline || '',
    date_saved: grant.created_at || new Date().toISOString(),
    user_notes: grant.notes || '',
    extracted_emails: [],
    type: 'grant' as const,
    funding_amount: grant.funding_amount || undefined,
  }));

  // Filter opportunities based on selected view and filters
  const filteredOpportunities = transformedOpportunities.filter(opp => {
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

  // Handle status updates for tracked grants
  const handleStatusUpdate = async (id: string, status: Opportunity['status']) => {
    await updateStatus(id, status);
  };

  // Handle grant deletion
  const handleGrantDelete = async (id: string) => {
    await deleteGrant(id);
  };

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
              <ProfileHub />
              <VirtualCFO />
            </div>
          </div>

          {/* Funding Opportunities Section */}
          <div className="space-y-6">
            <OpportunityPipeline opportunities={transformedOpportunities} />
            
            {/* Success Message when grants are loaded */}
            {!grantsLoading && !error && grants.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">
                      Grants loaded successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      Found {grants.length} grant opportunity{grants.length === 1 ? '' : 'ies'} from your Chrome Extension
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Extension Ready Message */}
            {extensionStatus === 'connected' && grants.length === 0 && !grantsLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Extension connected and ready
                    </h3>
                    <p className="text-sm text-blue-700">
                      Your Chrome Extension is active. Browse grant websites and click the extension to start saving opportunities here.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Real-time Extension Status */}
            {extensionStatus === 'connected' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-700">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Extension is actively monitoring and will update this dashboard in real-time
                </div>
              </div>
            )}
            
            {/* Extension Instructions */}
            {extensionStatus === 'connected' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    How to capture grants:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                      <p>Browse grant websites</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                      <p>Click the extension icon</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">3</span>
                      </div>
                      <p>Save to your dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Extension Features */}
            {extensionStatus === 'connected' && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-purple-800 mb-2">
                    Extension Features Available:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-purple-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Auto-capture grant details
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Save funding amounts
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Extract eligibility criteria
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Real-time dashboard sync
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Extension Status Summary */}
            {extensionStatus === 'connected' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">
                        Extension Status: Connected
                      </h3>
                      <p className="text-xs text-green-700">
                        Real-time sync enabled • Grants will appear automatically
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">
                      {grants.length} grant{grants.length === 1 ? '' : 's'} saved
                    </div>
                    {lastAuthBroadcast && (
                      <div className="text-xs text-green-500">
                        Last sync: {lastAuthBroadcast.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;