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
import UsageTracker from '@/components/dashboard/UsageTracker';
import ProfileCompletionNotification from '@/components/dashboard/ProfileCompletionNotification';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSmartAuth } from '@/hooks/useSmartAuth';
import { useTrackedGrants, TrackedGrant } from '@/hooks/useTrackedGrants';
import { usePersistentComponent } from '@/hooks/usePersistentComponent';
import { Navigate } from 'react-router-dom';
import { getDefaultDate, safeGetTimestamp } from '@/lib/dateUtils';
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
  const { user, loading: authLoading } = useSmartAuth();
  
  // Persistent dashboard state - survives tab switches
  const [dashboardState, setDashboardState] = usePersistentComponent('dashboard', {
    profileHubOpen: false,
    selectedView: 'all' as 'all' | 'grants' | 'investors',
    searchTerm: '',
    statusFilter: '',
    sortBy: 'saved' as 'deadline' | 'saved', // Default: latest grants at top
    selectedOpportunity: null as Opportunity | null,
    extensionAvailable: null as boolean | null,
    extensionStatus: 'checking' as 'checking' | 'connected' | 'disconnected' | 'error',
    lastAuthBroadcast: null as Date | null
  });

  const { 
    grants, 
    loading: grantsLoading, 
    error, 
    updateStatus,
    deleteGrant
  } = useTrackedGrants();

  // Check extension availability and broadcast authentication on component mount
  useEffect(() => {
    const initializeExtension = async () => {
      try {
        // Check if extension is available
        const available = await isExtensionAvailable();
        setDashboardState(prev => ({ ...prev, extensionAvailable: available }));
        
        if (available && user) {
          // 🚀 PHASE 1 IMPLEMENTATION: Broadcast authentication to extension
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await broadcastUserAuthenticated(user, session);
              setDashboardState(prev => ({ 
                ...prev, 
                extensionStatus: 'connected',
                lastAuthBroadcast: new Date()
              }));
              console.log('✅ Dashboard: Authentication broadcasted to extension');
            }
          } catch (broadcastError) {
            console.log('⚠️ Dashboard: Extension broadcast failed:', broadcastError.message);
            setDashboardState(prev => ({ ...prev, extensionStatus: 'error' }));
          }
        } else if (!available) {
          setDashboardState(prev => ({ ...prev, extensionStatus: 'disconnected' }));
        }
      } catch (error) {
        console.log('Dashboard: Extension check failed:', error);
        setDashboardState(prev => ({ 
          ...prev, 
          extensionStatus: 'error',
          extensionAvailable: false
        }));
      }
    };
    
    if (user) {
      initializeExtension();
    }
  }, [user]);

  // Monitor extension status periodically
  useEffect(() => {
    if (!user || !dashboardState.extensionAvailable) return;

    const checkExtensionStatus = async () => {
      try {
        const available = await isExtensionAvailable();
        if (available) {
          setDashboardState(prev => ({ ...prev, extensionStatus: 'connected' }));
        } else {
          setDashboardState(prev => ({ ...prev, extensionStatus: 'disconnected' }));
        }
      } catch (error) {
        setDashboardState(prev => ({ ...prev, extensionStatus: 'error' }));
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkExtensionStatus, 30000);
    return () => clearInterval(interval);
  }, [user, dashboardState.extensionAvailable]);

  // Manual extension status refresh
  const refreshExtensionStatus = async () => {
    setDashboardState(prev => ({ ...prev, extensionStatus: 'checking' }));
    try {
      const available = await isExtensionAvailable();
      setDashboardState(prev => ({ ...prev, extensionAvailable: available }));
      
      if (available && user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await broadcastUserAuthenticated(user, session);
          setDashboardState(prev => ({ 
            ...prev, 
            extensionStatus: 'connected',
            lastAuthBroadcast: new Date()
          }));
        }
      } else {
        setDashboardState(prev => ({ ...prev, extensionStatus: 'disconnected' }));
      }
    } catch (error) {
      setDashboardState(prev => ({ ...prev, extensionStatus: 'error' }));
    }
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Helper function to parse Deep Scan data from raw Gemini API response
  const parseDeepScanData = (rawData: any): Opportunity['computer_use_scan'] | null => {
    if (!rawData || typeof rawData !== 'object') return null;

    try {
      // Extract JSON from Gemini response structure
      let parsedData: any = null;

      // Helper to convert string to array (handles multiline strings with bullet points)
      const stringToArray = (value: any): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value !== 'string') return [];
        
        // Split by newlines and filter out empty lines
        return value
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.match(/^[-*•]\s*$/)) // Remove empty bullet points
          .map(line => line.replace(/^[-*•]\s*/, '')) // Remove bullet point markers
          .filter(line => line.length > 0);
      };

      // Check if it's already in the expected format (parsed structure)
      if (rawData.confidence_score !== undefined && rawData.funder_mission !== undefined) {
        // Already parsed, normalize arrays
        return {
          confidence_score: rawData.confidence_score,
          funder_mission: rawData.funder_mission,
          funder_values: rawData.funder_values,
          eligibility_criteria: stringToArray(rawData.eligibility_criteria),
          evaluation_criteria: stringToArray(rawData.evaluation_criteria),
          key_themes: Array.isArray(rawData.key_themes) 
            ? rawData.key_themes.map((theme: string) => 
                typeof theme === 'string' ? theme.replace(/^\*\*.*?\*\*:\s*/, '').trim() : theme
              )
            : stringToArray(rawData.key_themes),
          past_winners: stringToArray(rawData.past_winners),
          application_tips: stringToArray(rawData.application_tips),
          success_factors: stringToArray(rawData.success_factors),
          scanned_at: rawData.scanned_at || new Date().toISOString(),
        };
      }

      // Try to extract from Gemini API response structure
      if (rawData.candidates && Array.isArray(rawData.candidates) && rawData.candidates.length > 0) {
        const candidate = rawData.candidates[0];
        if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
          const textPart = candidate.content.parts.find((p: any) => p.text);
          if (textPart?.text) {
            // Extract JSON from markdown code block if present
            const jsonMatch = textPart.text.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : textPart.text;
            parsedData = JSON.parse(jsonText);
          }
        }
      }

      if (!parsedData) return null;

      // Map to expected structure (using stringToArray helper defined above)
      return {
        confidence_score: parsedData.confidence_score || 0,
        funder_mission: parsedData.funder_mission || 'Not available',
        funder_values: parsedData.funder_values,
        eligibility_criteria: stringToArray(parsedData.eligibility_criteria),
        evaluation_criteria: stringToArray(parsedData.evaluation_criteria),
        key_themes: Array.isArray(parsedData.key_themes) 
          ? parsedData.key_themes.map((theme: string) => 
              typeof theme === 'string' ? theme.replace(/^\*\*.*?\*\*:\s*/, '').trim() : theme
            )
          : stringToArray(parsedData.key_themes),
        past_winners: Array.isArray(parsedData.past_winners) 
          ? parsedData.past_winners 
          : stringToArray(parsedData.past_winners),
        application_tips: Array.isArray(parsedData.application_tips)
          ? parsedData.application_tips
          : stringToArray(parsedData.application_tips),
        success_factors: Array.isArray(parsedData.success_factors)
          ? parsedData.success_factors
          : stringToArray(parsedData.success_factors),
        scanned_at: parsedData.scanned_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error parsing Deep Scan data:', error, rawData);
      return null;
    }
  };

  // Transform tracked grants to match Opportunity interface for existing components
  console.log('🔍 Dashboard Debug - Raw grants from useTrackedGrants:', grants.length);
  if (grants.length > 0) {
    console.log('🔍 First raw grant:', grants[0]);
  }

  const transformedOpportunities: Opportunity[] = grants.map(grant => {
    try {
      // Ensure we have valid dates for required fields
      const safeDeadline = grant.application_deadline || getDefaultDate();
      const safeCreatedAt = grant.created_at || getDefaultDate();
      
      // Extract page title from application_data if available
      const pageTitle = grant.application_data?.page_title || grant.grant_name || 'Untitled Grant';
      
      // Parse Deep Scan data if available
      const parsedDeepScan = grant.computer_use_scan ? parseDeepScanData(grant.computer_use_scan) : null;

      // Create base opportunity with rich extension data
      const opportunity: Opportunity = {
        id: grant.id,
        status: (grant.status as 'To Review' | 'In Progress' | 'Applied') || 'To Review',
        page_title: pageTitle,
        funder_name: 'Grant Opportunity',
        page_url: grant.grant_url || '',
        application_deadline: safeDeadline,
        date_saved: safeCreatedAt,
        user_notes: grant.notes || '',
        extracted_emails: [],
        type: (grant.funding_type as 'grant' | 'investor') || 'grant',
        funding_amount: grant.funding_amount || undefined,
        
        // Enhanced Analysis v2.0 fields (Premium features)
        page_context: grant.page_context,
        analysis_results: grant.analysis_results,
        crux_summary: grant.crux_summary,
        enhanced_analysis: grant.enhanced_analysis || false,
        analysis_version: grant.analysis_version || '1.0',
        data_quality_score: grant.data_quality_score || 0,
        
        // Deep Scan & Autofill data (from Gemini Computer Use)
        computer_use_scan: parsedDeepScan || undefined,
        autofill_session: grant.autofill_session || undefined,
        agent_screenshots: grant.agent_screenshots || undefined,
        deep_scan_used: !!grant.computer_use_scan,
        deep_scan_timestamp: parsedDeepScan?.scanned_at || (grant.computer_use_scan ? grant.updated_at || undefined : undefined),
      };
      
      // Add captured extension data as free features in page_context if no enhanced analysis
      if (!grant.enhanced_analysis) {
        // Create a synthetic page_context for free features using captured extension data
        // Always show available data, even if opportunity_crux is empty
        opportunity.page_context = {
          // Store the opportunity crux in a free-access format (only if it has content)
          opportunity_summary: grant.opportunity_crux && grant.opportunity_crux.trim() !== '' ? grant.opportunity_crux : null,
          // Store confidence scores (always show if available)
          confidence_data: grant.confidence_scores,
          // Store application data (always show if available)
          application_details: grant.application_data,
          // Store eligibility criteria (only if it has content)
          eligibility_info: grant.eligibility_criteria && grant.eligibility_criteria.trim() !== '' ? grant.eligibility_criteria : null,
          // Mark as free feature (not enhanced analysis)
          is_free_feature: true
        };
        
        // Debug logging to see what data we have
        console.log('🔍 Debug Grant Data for:', grant.grant_name);
        console.log('- opportunity_crux:', grant.opportunity_crux?.substring(0, 100) + '...');
        console.log('- confidence_scores:', grant.confidence_scores);
        console.log('- application_data:', grant.application_data);
        console.log('- eligibility_criteria:', grant.eligibility_criteria?.substring(0, 100) + '...');
        console.log('- Mapped page_context:', opportunity.page_context);
      }
      
      return opportunity;
    } catch (error) {
      console.error('Error transforming grant:', grant, error);
      // Return a safe fallback opportunity
      return {
        id: grant.id,
        status: 'To Review' as const,
        page_title: grant.grant_name || 'Untitled Grant',
        funder_name: 'Grant Opportunity',
        page_url: grant.grant_url || '',
        application_deadline: getDefaultDate(),
        date_saved: getDefaultDate(),
        user_notes: grant.notes || '',
        extracted_emails: [],
        type: 'grant' as const,
        funding_amount: grant.funding_amount || undefined,
      };
    }
  });

  // Filter opportunities based on selected view and filters
  const filteredOpportunities = transformedOpportunities.filter(opp => {
    const matchesView = dashboardState.selectedView === 'all' || 
      (dashboardState.selectedView === 'grants' && opp.type === 'grant') ||
      (dashboardState.selectedView === 'investors' && opp.type === 'investor');
    
    const matchesSearch = opp.page_title.toLowerCase().includes(dashboardState.searchTerm.toLowerCase()) ||
      opp.funder_name.toLowerCase().includes(dashboardState.searchTerm.toLowerCase());
    
    const matchesStatus = !dashboardState.statusFilter || opp.status === dashboardState.statusFilter;
    
    return matchesView && matchesSearch && matchesStatus;
  });

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    try {
    if (dashboardState.sortBy === 'deadline') {
        const timestampA = safeGetTimestamp(a.application_deadline);
        const timestampB = safeGetTimestamp(b.application_deadline);
        // Handle invalid dates by treating them as far future dates
        if (timestampA === null) return 1;
        if (timestampB === null) return -1;
        return timestampA - timestampB;
    } else {
        const timestampA = safeGetTimestamp(a.date_saved);
        const timestampB = safeGetTimestamp(b.date_saved);
        // Handle invalid dates by treating them as old dates
        if (timestampA === null) return 1;
        if (timestampB === null) return -1;
        return timestampB - timestampA;
      }
    } catch (error) {
      console.error('Error sorting opportunities:', error);
      return 0; // Keep original order if sorting fails
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
          {/* Profile Completion Notification */}
          <ProfileCompletionNotification 
            onOpenProfile={() => setDashboardState(prev => ({ ...prev, profileHubOpen: true }))} 
          />

          {/* Main Dashboard Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Funding Dashboard</h1>
              <p className="text-gray-600">Manage your funding opportunities and profile</p>
            </div>
            <div className="flex items-center gap-4">
              <ErrorBoundary>
                <ProfileHub 
                  isOpen={dashboardState.profileHubOpen} 
                  onOpenChange={(open) => setDashboardState(prev => ({ ...prev, profileHubOpen: open }))} 
                />
              </ErrorBoundary>
              <VirtualCFO />
            </div>
          </div>



          {/* Usage Tracking Section */}
          <div className="mb-8">
            <UsageTracker />
          </div>

          {/* Funding Opportunities Section */}
          <div className="space-y-6">
            <OpportunityPipeline opportunities={transformedOpportunities} />
              
              <ViewToggle 
                selectedView={dashboardState.selectedView} 
                onViewChange={(view) => setDashboardState(prev => ({ ...prev, selectedView: view }))} 
              />
              
              <ControlBar
                searchTerm={dashboardState.searchTerm}
                onSearchChange={(term) => setDashboardState(prev => ({ ...prev, searchTerm: term }))}
                statusFilter={dashboardState.statusFilter}
                onStatusFilterChange={(filter) => setDashboardState(prev => ({ ...prev, statusFilter: filter }))}
                sortBy={dashboardState.sortBy}
                onSortChange={(sort) => setDashboardState(prev => ({ ...prev, sortBy: sort }))}
              />
              
            {grantsLoading ? (
                <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your grants...</h3>
                  <p className="text-gray-500">
                    Fetching your saved grant opportunities from the extension.
                  </p>
                </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading grants</h3>
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : grants.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No grants yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start capturing grant opportunities using the Chrome Extension. 
                    Browse grant websites and click the extension to save them here.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => promptExtensionInstallation()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install Extension
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Chrome Web Store
                    </Button>
                  </div>
                </div>
                </div>
              ) : (
                <OpportunityTable
                  opportunities={sortedOpportunities}
                  onOpportunityClick={(opportunity) => setDashboardState(prev => ({ ...prev, selectedOpportunity: opportunity }))}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleGrantDelete}
              />
            )}
          </div>

          {/* Extension Integration & Virtual CFO Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Enhanced Extension Status Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Chrome Extension</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status Indicator */}
                  {dashboardState.extensionStatus === 'checking' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Checking...
                    </div>
                  )}
                  {dashboardState.extensionStatus === 'connected' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </div>
                  )}
                  {dashboardState.extensionStatus === 'disconnected' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Disconnected
                    </div>
                  )}
                  {dashboardState.extensionStatus === 'error' && (
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
              
              {dashboardState.extensionStatus === 'connected' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Your extension is active and ready to capture grant opportunities from any website.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Seamlessly integrated with your dashboard
                  </div>
                  {dashboardState.lastAuthBroadcast && (
                    <div className="text-xs text-gray-500">
                      Last synced: {dashboardState.lastAuthBroadcast?.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ) : dashboardState.extensionStatus === 'disconnected' ? (
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
              ) : dashboardState.extensionStatus === 'error' ? (
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
        </div>
      </main>

      {dashboardState.selectedOpportunity && (
        <DetailPanel
          opportunity={dashboardState.selectedOpportunity}
          onClose={() => setDashboardState(prev => ({ ...prev, selectedOpportunity: null }))}
        />
      )}
      
      <DebugInfo />
    </div>
  );
};

export default Dashboard;