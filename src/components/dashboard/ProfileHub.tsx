
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { User, Building, Target, Users, FileText, Save, Download, Trash2, Bot, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useProfile, Founder } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useDocuments } from '@/hooks/useDocuments';
import { safeFormatDate } from '@/lib/dateUtils';
import { 
  calculateProfileCompletion, 
  getUserDisplayInfo, 
  getCompletionStatusDisplay,
  getNextRecommendedField 
} from '@/lib/profileUtils';
import { useTabVisibility } from '@/hooks/useTabVisibility';
import { usePersistedState } from '@/hooks/usePersistedState';

interface ProfileHubProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProfileHub = ({ isOpen: externalIsOpen, onOpenChange }: ProfileHubProps = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, founders, loading, saveProfile, saveFounder, deleteFounder, refetch: refetchProfile } = useProfile();
  const { isVisible } = useTabVisibility();
  
  // Enterprise state management
  const { 
    state: persistedFormData, 
    updateState: updateFormData, 
    forceSave: forceSaveFormData,
    clearState: clearFormData 
  } = usePersistedState({
    startup_name: '',
    one_line_pitch: '',
    problem_statement: '',
    solution_description: '',
    target_market: '',
    team_description: '',
    company_description: '',
    unique_value_proposition: '',
    mission_vision: '',
    elevator_pitch: '',
    standard_abstract: '',
    detailed_summary: '',
    impact: '',
    industry: '',
    competitors: '',
    traction: '',
    team_size: '',
    funding_stage: '',
    revenue_range: '',
    funding_goal: '',
    previous_funding: '',
    use_of_funds: '',
    demo_video: '',
    linkedin: '',
    press_kit: '',
    
    // Social Media & Online Presence
    website_url: '',
    twitter_handle: '',
    facebook_url: '',
    instagram_handle: '',
    youtube_channel: '',
    tiktok_handle: '',
    github_url: '',
    medium_url: '',
    substack_url: '',
    personal_website: '',
    
    // Company Details & Legal (Enhanced for International Support)
    company_website: '',
    business_registration_number: '',
    year_founded: 0,
    number_of_employees: 0,
    headquarters_location: '',
    legal_structure: '',
    incorporation_country: '',
    incorporation_date: '',
    tax_id: '',
    business_license: '',
    
    // International Incorporation Details
    incorporation_type: '',
    incorporation_state: '',
    incorporation_city: '',
    business_type: '',
    registration_authority: '',
    registration_number: '',
    pan_number: '',
    gst_number: '',
    cin_number: '',
    llp_number: '',
    partnership_deed_number: '',
    sole_proprietorship_number: '',
    foreign_registration_number: '',
    foreign_registration_country: '',
    foreign_registration_date: '',
    foreign_tax_id: '',
    foreign_business_license: '',
    compliance_status: '',
    regulatory_approvals: '',
    industry_licenses: '',
    export_import_license: '',
    fssai_license: '',
    drug_license: '',
    telecom_license: '',
    financial_services_license: '',
    insurance_license: '',
    real_estate_license: '',
    education_license: '',
    healthcare_license: '',
    technology_license: '',
    manufacturing_license: '',
    retail_license: '',
    service_license: '',
    other_licenses: '',
    
    // Financial Information
    annual_revenue: '',
    monthly_revenue: '',
    burn_rate: '',
    runway_months: 0,
    total_funding_raised: '',
    last_valuation: '',
    revenue_model: '',
    pricing_strategy: '',
    financial_projections: '',
    key_metrics: '',
    
    // Founder Background & Experience
    founder_full_name: '',
    founder_title: '',
    founder_email: '',
    founder_phone: '',
    founder_linkedin: '',
    founder_twitter: '',
    founder_background: '',
    previous_startups: '',
    work_experience: '',
    education_background: '',
    certifications: '',
    awards_recognition: '',
    cv_url: '',
    founder_bio: '',
    personal_interests: '',
    languages_spoken: '',
    time_commitment: '',
    co_founders: '',
    
    // Product & Technology
    product_name: '',
    product_description: '',
    technology_stack: '',
    development_stage: '',
    mvp_status: '',
    beta_testers: 0,
    user_feedback: '',
    product_roadmap: '',
    intellectual_property: '',
    patents: '',
    trademarks: '',
    copyrights: '',
    trade_secrets: '',
    technical_challenges: '',
    scalability_plan: '',
    
    // Market & Competition
    market_size: '',
    target_customers: '',
    customer_personas: '',
    customer_validation: '',
    market_research: '',
    competitive_analysis: '',
    market_entry_strategy: '',
    go_to_market_plan: '',
    sales_strategy: '',
    marketing_strategy: '',
    customer_acquisition_cost: '',
    lifetime_value: '',
    market_trends: '',
    regulatory_environment: '',
    
    // Team & Advisors
    key_team_members: '',
    advisors: '',
    mentors: '',
    board_members: '',
    investors: '',
    strategic_partners: '',
    hiring_plan: '',
    team_culture: '',
    remote_work_policy: '',
    equity_distribution: '',
    
    // Documents & Resources
    pitch_deck_url: '',
    business_plan_url: '',
    financial_model_url: '',
    market_research_url: '',
    legal_documents_url: '',
    press_kit_url: '',
    case_studies_url: '',
    testimonials_url: '',
    product_demo_url: '',
    investor_deck_url: '',
    
    // Additional Context Fields
    accelerator_programs_applied: '',
    accelerator_programs_accepted: '',
    grant_history: '',
    awards_won: '',
    press_mentions: '',
    media_coverage: '',
    speaking_engagements: '',
    publications: '',
    blog_posts: '',
    podcast_appearances: '',
  }, {
    key: 'profileHub.formData',
    debounceMs: 300,
        version: 5
  });

  const { 
    state: persistedUIState, 
    updateState: updateUIState 
  } = usePersistedState({
    isOpen: false,
    activeTab: 'onboarding'
  }, {
    key: 'profileHub.uiState',
    debounceMs: 100,
    version: 1
  });

  // Use external control if provided, otherwise use persisted state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : persistedUIState.isOpen;
  const setIsOpen = onOpenChange || ((open: boolean) => updateUIState(prev => ({ ...prev, isOpen: open })));
  
  const {
    documents,
    loading: docsLoading,
    error: docsError,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    refetch: refetchDocuments,
  } = useDocuments();
  
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Separate state for Resources tab document upload
  const [resourcesUploading, setResourcesUploading] = useState(false);
  const [selectedResourceFile, setSelectedResourceFile] = useState<File | null>(null);
  const [resourcesUploadError, setResourcesUploadError] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [activeFounderTab, setActiveFounderTab] = useState('founder-1');
  const [founderData, setFounderData] = useState<Record<string, Partial<Founder>>>({});
  
  // AI Context Sync state
  const [syncingContext, setSyncingContext] = useState(false);
  const [contextSummary, setContextSummary] = useState<any>(null);

  // Load AI context summary when profile loads
  useEffect(() => {
    if (profile?.ai_context_summary) {
      try {
        const parsed = JSON.parse(profile.ai_context_summary);
        setContextSummary(parsed);
      } catch (error) {
        console.error('Failed to parse AI context summary:', error);
        setContextSummary(null);
      }
    } else {
      setContextSummary(null);
    }
  }, [profile?.ai_context_summary]);

  // Handler for syncing user context
  const handleSyncContext = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to sync context',
        variant: 'destructive'
      });
      return;
    }

    setSyncingContext(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-user-context`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to sync context');
      }

      const result = await response.json();
      
      // Update the context summary immediately
      if (result.data?.ai_summary) {
        setContextSummary(result.data.ai_summary);
      }

      // Refetch profile to get the updated context
      await refetchProfile();

      toast({
        title: 'Success!',
        description: 'Your AI context has been synchronized successfully',
        duration: 5000
      });
    } catch (error) {
      console.error('Context sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync context',
        variant: 'destructive'
      });
    } finally {
      setSyncingContext(false);
    }
  };

  // Sync profile data with persisted form data
  useEffect(() => {
    if (profile && isVisible) {
      // Always load profile data if it's newer than local data
      const localTimestamp = localStorage.getItem('profileHub.formData.timestamp');
      const profileTimestamp = profile.updated_at ? new Date(profile.updated_at).getTime() : 0;
      
      // Load profile data if:
      // 1. No local data exists, OR
      // 2. Profile data is newer than local data (profile was updated elsewhere)
      if (!localTimestamp || parseInt(localTimestamp) < profileTimestamp) {
        console.log('🔄 ProfileHub: Loading fresh profile data from server');
        updateFormData({
        startup_name: profile.startup_name || '',
        one_line_pitch: profile.one_line_pitch || '',
        problem_statement: profile.problem_statement || '',
        solution_description: profile.solution_description || '',
        target_market: profile.target_market || '',
        team_description: profile.team_description || '',
        company_description: profile.company_description || '',
        unique_value_proposition: profile.unique_value_proposition || '',
        mission_vision: profile.mission_vision || '',
        elevator_pitch: profile.elevator_pitch || '',
        standard_abstract: profile.standard_abstract || '',
        detailed_summary: profile.detailed_summary || '',
          impact: profile.impact || '',
          industry: profile.industry || '',
          competitors: profile.competitors || '',
          traction: profile.traction || '',
          team_size: profile.team_size || '',
          funding_stage: profile.funding_stage || '',
          revenue_range: profile.revenue_range || '',
          funding_goal: profile.funding_goal || '',
          previous_funding: profile.previous_funding || '',
          use_of_funds: profile.use_of_funds || '',
          demo_video: profile.demo_video || '',
          linkedin: profile.linkedin || '',
          press_kit: profile.press_kit || '',
          
          // Social Media & Online Presence
          website_url: profile.website_url || '',
          twitter_handle: profile.twitter_handle || '',
          facebook_url: profile.facebook_url || '',
          instagram_handle: profile.instagram_handle || '',
          youtube_channel: profile.youtube_channel || '',
          tiktok_handle: profile.tiktok_handle || '',
          github_url: profile.github_url || '',
          medium_url: profile.medium_url || '',
          substack_url: profile.substack_url || '',
          personal_website: profile.personal_website || '',
          
          // Company Details & Legal (Enhanced for International Support)
          company_website: profile.company_website || '',
          business_registration_number: profile.business_registration_number || '',
          year_founded: profile.year_founded || 0,
          number_of_employees: profile.number_of_employees || 0,
          headquarters_location: profile.headquarters_location || '',
          legal_structure: profile.legal_structure || '',
          incorporation_country: profile.incorporation_country || '',
          incorporation_date: profile.incorporation_date || '',
          tax_id: profile.tax_id || '',
          business_license: profile.business_license || '',
          
          // International Incorporation Details
          incorporation_type: profile.incorporation_type || '',
          incorporation_state: profile.incorporation_state || '',
          incorporation_city: profile.incorporation_city || '',
          business_type: profile.business_type || '',
          registration_authority: profile.registration_authority || '',
          registration_number: profile.registration_number || '',
          pan_number: profile.pan_number || '',
          gst_number: profile.gst_number || '',
          cin_number: profile.cin_number || '',
          llp_number: profile.llp_number || '',
          partnership_deed_number: profile.partnership_deed_number || '',
          sole_proprietorship_number: profile.sole_proprietorship_number || '',
          foreign_registration_number: profile.foreign_registration_number || '',
          foreign_registration_country: profile.foreign_registration_country || '',
          foreign_registration_date: profile.foreign_registration_date || '',
          foreign_tax_id: profile.foreign_tax_id || '',
          foreign_business_license: profile.foreign_business_license || '',
          compliance_status: profile.compliance_status || '',
          regulatory_approvals: profile.regulatory_approvals || '',
          industry_licenses: profile.industry_licenses || '',
          export_import_license: profile.export_import_license || '',
          fssai_license: profile.fssai_license || '',
          drug_license: profile.drug_license || '',
          telecom_license: profile.telecom_license || '',
          financial_services_license: profile.financial_services_license || '',
          insurance_license: profile.insurance_license || '',
          real_estate_license: profile.real_estate_license || '',
          education_license: profile.education_license || '',
          healthcare_license: profile.healthcare_license || '',
          technology_license: profile.technology_license || '',
          manufacturing_license: profile.manufacturing_license || '',
          retail_license: profile.retail_license || '',
          service_license: profile.service_license || '',
          other_licenses: profile.other_licenses || '',
          
          // Financial Information
          annual_revenue: profile.annual_revenue || '',
          monthly_revenue: profile.monthly_revenue || '',
          burn_rate: profile.burn_rate || '',
          runway_months: profile.runway_months || 0,
          total_funding_raised: profile.total_funding_raised || '',
          last_valuation: profile.last_valuation || '',
          revenue_model: profile.revenue_model || '',
          pricing_strategy: profile.pricing_strategy || '',
          financial_projections: profile.financial_projections || '',
          key_metrics: profile.key_metrics || '',
          
          // Founder Background & Experience
          founder_full_name: profile.founder_full_name || '',
          founder_title: profile.founder_title || '',
          founder_email: profile.founder_email || '',
          founder_phone: profile.founder_phone || '',
          founder_linkedin: profile.founder_linkedin || '',
          founder_twitter: profile.founder_twitter || '',
          founder_background: profile.founder_background || '',
          previous_startups: profile.previous_startups || '',
          work_experience: profile.work_experience || '',
          education_background: profile.education_background || '',
          certifications: profile.certifications || '',
          awards_recognition: profile.awards_recognition || '',
          cv_url: profile.cv_url || '',
          founder_bio: profile.founder_bio || '',
          personal_interests: profile.personal_interests || '',
          languages_spoken: profile.languages_spoken || '',
          time_commitment: profile.time_commitment || '',
          co_founders: profile.co_founders || '',
          
          // Product & Technology
          product_name: profile.product_name || '',
          product_description: profile.product_description || '',
          technology_stack: profile.technology_stack || '',
          development_stage: profile.development_stage || '',
          mvp_status: profile.mvp_status || '',
          beta_testers: profile.beta_testers || 0,
          user_feedback: profile.user_feedback || '',
          product_roadmap: profile.product_roadmap || '',
          intellectual_property: profile.intellectual_property || '',
          patents: profile.patents || '',
          trademarks: profile.trademarks || '',
          copyrights: profile.copyrights || '',
          trade_secrets: profile.trade_secrets || '',
          technical_challenges: profile.technical_challenges || '',
          scalability_plan: profile.scalability_plan || '',
          
          // Market & Competition
          market_size: profile.market_size || '',
          target_customers: profile.target_customers || '',
          customer_personas: profile.customer_personas || '',
          customer_validation: profile.customer_validation || '',
          market_research: profile.market_research || '',
          competitive_analysis: profile.competitive_analysis || '',
          market_entry_strategy: profile.market_entry_strategy || '',
          go_to_market_plan: profile.go_to_market_plan || '',
          sales_strategy: profile.sales_strategy || '',
          marketing_strategy: profile.marketing_strategy || '',
          customer_acquisition_cost: profile.customer_acquisition_cost || '',
          lifetime_value: profile.lifetime_value || '',
          market_trends: profile.market_trends || '',
          regulatory_environment: profile.regulatory_environment || '',
          
          // Team & Advisors
          key_team_members: profile.key_team_members || '',
          advisors: profile.advisors || '',
          mentors: profile.mentors || '',
          board_members: profile.board_members || '',
          investors: profile.investors || '',
          strategic_partners: profile.strategic_partners || '',
          hiring_plan: profile.hiring_plan || '',
          team_culture: profile.team_culture || '',
          remote_work_policy: profile.remote_work_policy || '',
          equity_distribution: profile.equity_distribution || '',
          
          // Documents & Resources
          pitch_deck_url: profile.pitch_deck_url || '',
          business_plan_url: profile.business_plan_url || '',
          financial_model_url: profile.financial_model_url || '',
          market_research_url: profile.market_research_url || '',
          legal_documents_url: profile.legal_documents_url || '',
          press_kit_url: profile.press_kit_url || '',
          case_studies_url: profile.case_studies_url || '',
          testimonials_url: profile.testimonials_url || '',
          product_demo_url: profile.product_demo_url || '',
          investor_deck_url: profile.investor_deck_url || '',
          
          // Additional Context Fields
          accelerator_programs_applied: profile.accelerator_programs_applied || '',
          accelerator_programs_accepted: profile.accelerator_programs_accepted || '',
          grant_history: profile.grant_history || '',
          awards_won: profile.awards_won || '',
          press_mentions: profile.press_mentions || '',
          media_coverage: profile.media_coverage || '',
          speaking_engagements: profile.speaking_engagements || '',
          publications: profile.publications || '',
          blog_posts: profile.blog_posts || '',
          podcast_appearances: profile.podcast_appearances || '',
        });
      } else {
        console.log('✅ ProfileHub: Using existing local data (newer than server)');
      }
    }
  }, [profile, isVisible, updateFormData]);

  // Handle tab visibility changes
  useEffect(() => {
    if (isVisible && isOpen) {
      console.log('🔄 ProfileHub: Tab became visible, restoring state');
      // Only force save if there are actual changes to save
      // This prevents excessive API calls
      const hasChanges = Object.values(persistedFormData).some(value => 
        value !== '' && value !== null && value !== undefined
      );
      
      if (hasChanges) {
        // Debounce the force save to prevent excessive calls
        const timeoutId = setTimeout(() => {
          forceSaveFormData();
        }, 1000); // 1 second delay
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isVisible, isOpen, forceSaveFormData, persistedFormData]);

  // Handle founder management
  const handleAddFounder = () => {
    const founderCount = Object.keys(founderData).length + 1;
    const newFounderKey = `founder-${founderCount}`;
    setFounderData(prev => ({
      ...prev,
      [newFounderKey]: {
        founder_order: founderCount,
        is_primary_founder: founderCount === 1
      }
    }));
    setActiveFounderTab(newFounderKey);
  };

  const handleSaveFounder = async (founderKey: string) => {
    const founder = founderData[founderKey];
    if (!founder) return;

    try {
      const { error } = await saveFounder(founder);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Founder information saved successfully!",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save founder information",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFounder = async (founderKey: string) => {
    const founder = founderData[founderKey];
    if (!founder?.id) {
      // Remove from local state if not saved yet
      setFounderData(prev => {
        const newData = { ...prev };
        delete newData[founderKey];
        return newData;
      });
      return;
    }

    try {
      const { error } = await deleteFounder(founder.id);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Founder removed successfully!",
        });
        setFounderData(prev => {
          const newData = { ...prev };
          delete newData[founderKey];
          return newData;
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete founder",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Force save current form data before sending to server
      forceSaveFormData();
      
      const { error } = await saveProfile(persistedFormData);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        // Clear local draft after successful save
        clearFormData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Docs Tab upload handler
  const handleDocUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    const { error, success } = await uploadDocument(selectedFile);
    if (error) {
      setUploadError(error);
      toast({
        title: "Upload Failed",
        description: error,
        variant: "destructive",
      });
    } else if (success) {
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} uploaded successfully!`,
      });
      refetchDocuments();
    }
    setUploading(false);
  };

  // Resources Tab document upload handler
  const handleResourcesDocUpload = async () => {
    if (!selectedResourceFile || !selectedDocumentType) return;
    
    setResourcesUploading(true);
    setResourcesUploadError(null);
    
    const { error, success } = await uploadDocument(selectedResourceFile, selectedDocumentType);
    if (error) {
      setResourcesUploadError(error);
      toast({
        title: "Upload Failed",
        description: error,
        variant: "destructive",
      });
    } else if (success) {
      setSelectedResourceFile(null);
      setSelectedDocumentType('');
      toast({
        title: "Upload Successful",
        description: `${selectedResourceFile.name} uploaded successfully!`,
      });
      refetchDocuments();
    }
    
    setResourcesUploading(false);
  };

  // Pitch Deck upload and analysis handler
  const handlePitchDeckUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // First, upload to pitch-decks storage bucket
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create a unique filename with user ID
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `pitch-deck-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to pitch-decks bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('pitch-decks')
        .getPublicUrl(filePath);

      // Save the pitch deck URL to user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ pitch_deck_url: publicUrl })
        .eq('id', user.id);

      if (profileError) {
        console.error('Failed to save pitch deck URL to profile:', profileError);
        // Don't throw here as the upload was successful
      }

      // Call the analyze-pitch-deck Edge Function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-pitch-deck', {
        body: {
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size
        }
      });

      if (analysisError) {
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your pitch deck has been uploaded and is being analyzed by our AI. This may take a minute.",
      });

      // Refetch profile to show updated data
      await refetch();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  // Calculate completion status
  const completion = calculateProfileCompletion(profile);
  const userDisplay = getUserDisplayInfo(user, profile);
  const statusDisplay = getCompletionStatusDisplay(completion);
  const nextField = getNextRecommendedField(completion.missingFields);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Profile & Autofill Hub
              </>
            )}
          </Button>
          {/* Subtle Progress Dot */}
          {!loading && completion.percentage < 90 && (
            <div className="absolute -top-1 -right-1">
              <div className={`w-3 h-3 rounded-full ${
                completion.percentage >= 70 ? 'bg-blue-500' :
                completion.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
              } shadow-sm`}></div>
            </div>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Profile & Autofill Hub</SheetTitle>
          <SheetDescription>
            Build your comprehensive profile to power intelligent autofill and AI analysis
          </SheetDescription>
        </SheetHeader>

        {/* User Info & Completion Status Section */}
        <div className="mt-6 mb-6">
          <Card className={`${statusDisplay.bgColor} ${statusDisplay.borderColor} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{userDisplay.name}</h3>
                    <p className="text-sm text-gray-600">{userDisplay.email}</p>
                    {userDisplay.tagline && (
                      <p className="text-sm text-gray-500 italic mt-1">"{userDisplay.tagline}"</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                    {statusDisplay.message}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-medium">{completion.percentage}%</span>
                </div>
                <Progress value={completion.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{completion.completedFields} of {completion.totalFields} fields completed</span>
                  {nextField && (
                    <span>Next: {nextField}</span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {completion.percentage < 90 && (
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Complete your profile to unlock full AI potential
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    A complete profile helps our AI provide better grant recommendations and autofill assistance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Tabs value={persistedUIState.activeTab} onValueChange={(tab) => updateUIState(prev => ({ ...prev, activeTab: tab }))} className="w-full">
                      <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="onboarding" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="founder" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">Founder</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="product" className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span className="hidden sm:inline">Product</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

            {/* Content Tab - AI Context Summary */}
            <TabsContent value="onboarding" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      AI Context Summary
                    </CardTitle>
                    <Button 
                      onClick={handleSyncContext}
                      disabled={syncingContext}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {syncingContext ? (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Update Context
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    AI-generated comprehensive view of your startup profile, combining all your data for RAG-powered grant matching
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contextSummary ? (
                    <>
                      {/* Executive Summary */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Bot className="w-5 h-5 text-blue-600" />
                          Executive Summary
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {contextSummary.executive_summary}
                        </p>
                      </div>

                      {/* Key Strengths */}
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Key Strengths
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {contextSummary.key_strengths?.map((strength: string, index: number) => (
                            <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <p className="text-sm text-gray-700">{strength}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Funding Readiness */}
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                        <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-yellow-600" />
                          Funding Readiness
                        </h3>
                        <p className="text-sm text-gray-700">{contextSummary.funding_readiness}</p>
                      </div>

                      {/* Recommended Actions */}
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Recommended Actions
                        </h3>
                        <div className="space-y-2">
                          {contextSummary.recommended_actions?.map((action: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700 flex-1">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Profile Completeness */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          Profile Completeness
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">{contextSummary.profile_completeness}</p>
                        <Progress value={completion.percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {completion.completedFields} of {completion.totalFields} sections completed
                        </p>
                      </div>

                      {/* AI Insights */}
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Bot className="w-5 h-5 text-purple-600" />
                          AI Insights
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{contextSummary.ai_insights}</p>
                      </div>

                      {/* Last Updated */}
                      <div className="text-center text-xs text-gray-500">
                        Last updated: {profile?.context_last_updated ? safeFormatDate(profile.context_last_updated) : 'Never'}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        AI Context Not Generated Yet
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Click "Update Context" to generate an AI-powered summary of your startup profile. This will aggregate all your information for better grant matching and personalized recommendations.
                      </p>
                      <Button 
                        onClick={handleSyncContext}
                        disabled={syncingContext}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        {syncingContext ? (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                            Generating Context...
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            Generate AI Context
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organization Tab */}
            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startup-name">Startup Name</Label>
                      <Input 
                        id="startup-name" 
                        placeholder="Enter your startup name"
                        value={persistedFormData.startup_name}
                        onChange={(e) => updateFormData(prev => ({ ...prev, startup_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="one-line-pitch">One Line Pitch</Label>
                      <Input 
                        id="one-line-pitch" 
                        placeholder="Brief description of your startup"
                        value={persistedFormData.one_line_pitch}
                        onChange={(e) => updateFormData(prev => ({ ...prev, one_line_pitch: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problem-statement">Problem Statement</Label>
                    <Textarea 
                      id="problem-statement" 
                      placeholder="Describe the problem your startup solves"
                      value={persistedFormData.problem_statement}
                      onChange={(e) => updateFormData(prev => ({ ...prev, problem_statement: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution-description">Solution Description</Label>
                    <Textarea 
                      id="solution-description" 
                      placeholder="Describe your solution and how it works"
                      value={persistedFormData.solution_description}
                      onChange={(e) => updateFormData(prev => ({ ...prev, solution_description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pitch Tab */}
            <TabsContent value="pitch" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pitch & Narrative</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-description">Company Description (Tagline)</Label>
                    <Input 
                      id="company-description" 
                      placeholder="One-sentence description (140 chars max)" 
                      maxLength={140}
                      value={persistedFormData.company_description}
                      onChange={(e) => updateFormData(prev => ({ ...prev, company_description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unique-value-proposition">Unique Value Proposition</Label>
                    <Textarea 
                      id="unique-value-proposition" 
                      placeholder="What makes you different" 
                      rows={3}
                      value={persistedFormData.unique_value_proposition}
                      onChange={(e) => updateFormData(prev => ({ ...prev, unique_value_proposition: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Project Summaries (Autofill Gold)</h4>
                    <div className="space-y-2">
                      <Label htmlFor="elevator-pitch">Elevator Pitch (50 Words)</Label>
                      <Textarea 
                        id="elevator-pitch" 
                        placeholder="Very short summary" 
                        rows={2}
                        value={persistedFormData.elevator_pitch}
                        onChange={(e) => updateFormData(prev => ({ ...prev, elevator_pitch: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standard-abstract">Standard Abstract (250 Words)</Label>
                      <Textarea 
                        id="standard-abstract" 
                        placeholder="Most common length" 
                        rows={4}
                        value={persistedFormData.standard_abstract}
                        onChange={(e) => updateFormData(prev => ({ ...prev, standard_abstract: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detailed-summary">Detailed Summary (500 Words)</Label>
                      <Textarea 
                        id="detailed-summary" 
                        placeholder="For in-depth sections" 
                        rows={6}
                        value={persistedFormData.detailed_summary}
                        onChange={(e) => updateFormData(prev => ({ ...prev, detailed_summary: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mission-vision">Mission & Vision</Label>
                    <Textarea 
                      id="mission-vision" 
                      placeholder="Long-term view" 
                      rows={3}
                      value={persistedFormData.mission_vision}
                      onChange={(e) => updateFormData(prev => ({ ...prev, mission_vision: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="impact">Potential Impact</Label>
                    <Textarea id="impact" placeholder="The 'so what?' of your project" rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pitch Deck Tab */}
            <TabsContent value="pitch-deck" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Pitch Deck Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Upload your pitch deck (PDF, PPTX) for AI-powered analysis and summary generation
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Pitch Deck Status */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Current Status</h4>
                    {profile?.pitch_deck_summary ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Pitch Deck Analyzed</span>
                        </div>
                        <p className="text-sm text-green-700 mt-2">
                          Your pitch deck has been analyzed and is ready to enhance your grant applications.
                        </p>
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h5 className="font-medium text-sm mb-2">AI Summary Preview:</h5>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {profile.pitch_deck_summary.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="font-medium">No Pitch Deck Analyzed</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Upload your pitch deck to get AI-powered analysis and enhance your grant applications.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Upload Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Upload New Pitch Deck</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="pitch-deck-file">Select File</Label>
                        <Input
                          id="pitch-deck-file"
                          type="file"
                          accept=".pdf,.pptx,.ppt"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, PowerPoint (PPTX, PPT). Max size: 50MB
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handlePitchDeckUpload} 
                        disabled={!selectedFile || uploading} 
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing Pitch Deck...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Upload & Analyze
                          </>
                        )}
                      </Button>
                      
                      {uploadError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-red-800 text-sm">{uploadError}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">How This Helps Your Grant Applications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 text-sm">Enhanced AI Responses</h5>
                        <p className="text-xs text-blue-700 mt-1">
                          Our AI will understand your business context and provide more accurate grant writing assistance.
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-medium text-green-800 text-sm">Consistent Messaging</h5>
                        <p className="text-xs text-green-700 mt-1">
                          Ensure all your grant applications align with your core pitch deck messaging.
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h5 className="font-medium text-purple-800 text-sm">Time Savings</h5>
                        <p className="text-xs text-purple-700 mt-1">
                          No need to re-explain your business in every grant application.
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <h5 className="font-medium text-orange-800 text-sm">Better Success Rate</h5>
                        <p className="text-xs text-orange-700 mt-1">
                          More accurate and compelling grant applications increase your chances of success.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market & Traction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry / Sector</Label>
                    <Input id="industry" placeholder="Your industry (multiple selections allowed)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-market">Target Market</Label>
                    <Textarea 
                      id="target-market" 
                      placeholder="Ideal customer profile" 
                      value={persistedFormData.target_market}
                      onChange={(e) => updateFormData(prev => ({ ...prev, target_market: e.target.value }))}
                      rows={3} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Competitor Landscape</Label>
                    <Textarea id="competitors" placeholder="Key competitors and differentiators" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traction">Key Traction & Milestones</Label>
                    <Textarea id="traction" placeholder="Users, revenue, partnerships, growth metrics" rows={4} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team & Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-size">Team Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2-5">2-5 people</SelectItem>
                          <SelectItem value="6-10">6-10 people</SelectItem>
                          <SelectItem value="11-50">11-50 people</SelectItem>
                          <SelectItem value="50+">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="funding-stage">Funding Stage</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="team-description">Team Description</Label>
                    <Textarea 
                      id="team-description" 
                      placeholder="Brief bios for key members and team information" 
                      value={persistedFormData.team_description}
                      onChange={(e) => updateFormData(prev => ({ ...prev, team_description: e.target.value }))}
                      rows={6} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-revenue">Current Revenue (MRR)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">$0</SelectItem>
                          <SelectItem value="1-10k">$1-10K</SelectItem>
                          <SelectItem value="10-50k">$10-50K</SelectItem>
                          <SelectItem value="50-100k">$50-100K</SelectItem>
                          <SelectItem value="100k+">$100K+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="funding-goal">Funding Goal</Label>
                      <Input id="funding-goal" placeholder="Target funding amount" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="previous-funding">Previous Funding Raised</Label>
                    <Textarea id="previous-funding" placeholder="Details of previous funding rounds" rows={3} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="use-of-funds">Use of Funds</Label>
                    <Textarea id="use-of-funds" placeholder="Detailed breakdown of how new funding will be used" rows={4} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="supporting-docs">Upload Document</Label>
                    <Input
                      id="supporting-docs"
                      type="file"
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                    />
                    <Button onClick={handleDocUpload} disabled={!selectedFile || uploading} className="mt-2">
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    {uploadError && <div className="text-red-600 text-xs mt-1">{uploadError}</div>}
                  </div>
                  {/* File List Section */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Your Uploaded Documents</h4>
                    {docsLoading ? (
                      <div>Loading documents...</div>
                    ) : docsError ? (
                      <div className="text-red-600">{docsError}</div>
                    ) : documents.length === 0 ? (
                      <div className="text-gray-500">No documents uploaded yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between border rounded px-3 py-2 bg-gray-50">
                            <div>
                              <div className="font-medium">{doc.document_name}</div>
                              <div className="text-xs text-gray-500">Uploaded: {safeFormatDate(
                                doc.uploaded_at,
                                (date) => date.toLocaleDateString(),
                                'Unknown date'
                              )}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Download"
                                onClick={async () => {
                                  const url = await getDocumentUrl(doc.storage_path);
                                  if (url) {
                                    window.open(url, '_blank');
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Failed to generate download link",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                onClick={async () => {
                                  const { error, success } = await deleteDocument(doc.id, doc.storage_path);
                                  if (error) {
                                    toast({
                                      title: "Delete Failed",
                                      description: error,
                                      variant: "destructive",
                                    });
                                  } else if (success) {
                                    toast({
                                      title: "Document Deleted",
                                      description: `${doc.document_name} deleted successfully!`,
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                title="Analyze with AI (coming soon)"
                                disabled
                              >
                                <Bot className="w-4 h-4 text-blue-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Important Links</h4>
                    <div className="space-y-2">
                      <Label htmlFor="demo-video">Product Demo Video URL</Label>
                      <Input id="demo-video" placeholder="YouTube, Loom, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Company Page URL</Label>
                      <Input id="linkedin" placeholder="https://linkedin.com/company/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="press-kit">Press/Media Kit URL</Label>
                      <Input id="press-kit" placeholder="Link to press resources" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Founder Tab */}
            <TabsContent value="founder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Founders & Leadership Team
                    </div>
                    <Button onClick={handleAddFounder} size="sm" variant="outline">
                      <User className="w-4 h-4 mr-2" />
                      Add Founder
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manage multiple founders and their information</p>
                </CardHeader>
                <CardContent>
                  {Object.keys(founderData).length === 0 && founders.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Founders Added Yet</h3>
                      <p className="text-gray-600 mb-4">Add your first founder to get started</p>
                      <Button onClick={handleAddFounder}>
                        <User className="w-4 h-4 mr-2" />
                        Add First Founder
                      </Button>
                    </div>
                  ) : (
                    <Tabs value={activeFounderTab} onValueChange={setActiveFounderTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        {Object.keys(founderData).map((key, index) => (
                          <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="hidden sm:inline">Founder {index + 1}</span>
                          </TabsTrigger>
                        ))}
                        {founders.map((founder, index) => (
                          <TabsTrigger key={founder.id} value={`saved-${founder.id}`} className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="hidden sm:inline">{founder.full_name || `Founder ${index + 1}`}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {/* Dynamic Founder Tabs */}
                      {Object.entries(founderData).map(([key, founder]) => (
                        <TabsContent key={key} value={key} className="space-y-6 mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="w-5 h-5" />
                                  Founder {founder.founder_order}
                                  {founder.is_primary_founder && (
                                    <Badge variant="default" className="ml-2">Primary</Badge>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleDeleteFounder(key)} 
                                  size="sm" 
                                  variant="destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              {/* Basic Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-full-name`}>Full Name</Label>
                                  <Input
                                    id={`${key}-full-name`}
                                    placeholder="Full name"
                                    value={founder.full_name || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], full_name: e.target.value }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-title`}>Title/Position</Label>
                                  <Input
                                    id={`${key}-title`}
                                    placeholder="CEO, CTO, etc."
                                    value={founder.title || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], title: e.target.value }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-email`}>Email</Label>
                                  <Input
                                    id={`${key}-email`}
                                    type="email"
                                    placeholder="email@example.com"
                                    value={founder.email || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], email: e.target.value }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-phone`}>Phone</Label>
                                  <Input
                                    id={`${key}-phone`}
                                    placeholder="+1 (555) 123-4567"
                                    value={founder.phone || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], phone: e.target.value }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-equity`}>Equity Percentage</Label>
                                  <Input
                                    id={`${key}-equity`}
                                    type="number"
                                    placeholder="25"
                                    value={founder.equity_percentage || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], equity_percentage: parseFloat(e.target.value) || 0 }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-primary`}>Primary Founder</Label>
                                  <Select 
                                    value={founder.is_primary_founder ? 'true' : 'false'} 
                                    onValueChange={(value) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], is_primary_founder: value === 'true' }
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Social Media */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Social Media & Online Presence</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-linkedin`}>LinkedIn Profile</Label>
                                    <Input
                                      id={`${key}-linkedin`}
                                      placeholder="https://linkedin.com/in/username"
                                      value={founder.linkedin_url || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], linkedin_url: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-twitter`}>Twitter Handle</Label>
                                    <Input
                                      id={`${key}-twitter`}
                                      placeholder="@username"
                                      value={founder.twitter_handle || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], twitter_handle: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-website`}>Personal Website</Label>
                                    <Input
                                      id={`${key}-website`}
                                      placeholder="https://personalwebsite.com"
                                      value={founder.personal_website || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], personal_website: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-github`}>GitHub Profile</Label>
                                    <Input
                                      id={`${key}-github`}
                                      placeholder="https://github.com/username"
                                      value={founder.github_url || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], github_url: e.target.value }
                                      }))}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Background & Experience */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Background & Experience</h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-background`}>Professional Background</Label>
                                    <Textarea
                                      id={`${key}-background`}
                                      placeholder="Describe your professional background and key achievements"
                                      rows={4}
                                      value={founder.background || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], background: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-experience`}>Work Experience</Label>
                                    <Textarea
                                      id={`${key}-experience`}
                                      placeholder="Previous companies, roles, and responsibilities"
                                      rows={3}
                                      value={founder.work_experience || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], work_experience: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-startups`}>Previous Startups</Label>
                                    <Textarea
                                      id={`${key}-startups`}
                                      placeholder="List any previous startups you've founded or co-founded"
                                      rows={3}
                                      value={founder.previous_startups || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], previous_startups: e.target.value }
                                      }))}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Education & Skills */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Education & Skills</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-education`}>Education Background</Label>
                                    <Textarea
                                      id={`${key}-education`}
                                      placeholder="Universities, degrees, certifications"
                                      rows={3}
                                      value={founder.education_background || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], education_background: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-certifications`}>Certifications</Label>
                                    <Textarea
                                      id={`${key}-certifications`}
                                      placeholder="Professional certifications and licenses"
                                      rows={3}
                                      value={founder.certifications || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], certifications: e.target.value }
                                      }))}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-languages`}>Languages Spoken</Label>
                                  <Input
                                    id={`${key}-languages`}
                                    placeholder="English, Spanish, French, etc."
                                    value={founder.languages_spoken || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], languages_spoken: e.target.value }
                                    }))}
                                  />
                                </div>
                              </div>

                              {/* Personal Information */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Personal Information</h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-bio`}>Personal Bio</Label>
                                    <Textarea
                                      id={`${key}-bio`}
                                      placeholder="Tell us about yourself, your passions, and what drives you"
                                      rows={4}
                                      value={founder.bio || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], bio: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-interests`}>Personal Interests</Label>
                                    <Textarea
                                      id={`${key}-interests`}
                                      placeholder="Hobbies, interests, activities outside of work"
                                      rows={3}
                                      value={founder.personal_interests || ''}
                                      onChange={(e) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], personal_interests: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${key}-commitment`}>Time Commitment</Label>
                                    <Select 
                                      value={founder.time_commitment || ''} 
                                      onValueChange={(value) => setFounderData(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], time_commitment: value }
                                      }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select time commitment" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="full-time">Full-time (40+ hours/week)</SelectItem>
                                        <SelectItem value="part-time">Part-time (20-40 hours/week)</SelectItem>
                                        <SelectItem value="weekend">Weekend warrior</SelectItem>
                                        <SelectItem value="evening">Evening hours</SelectItem>
                                        <SelectItem value="flexible">Flexible schedule</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              {/* Awards & Recognition */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Awards & Recognition</h4>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-awards`}>Awards & Recognition</Label>
                                  <Textarea
                                    id={`${key}-awards`}
                                    placeholder="Industry awards, recognition, honors, publications"
                                    rows={3}
                                    value={founder.awards_recognition || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], awards_recognition: e.target.value }
                                    }))}
                                  />
                                </div>
                              </div>

                              {/* CV Upload */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Resume/CV</h4>
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-cv`}>CV/Resume URL</Label>
                                  <Input
                                    id={`${key}-cv`}
                                    placeholder="https://example.com/resume.pdf"
                                    value={founder.cv_url || ''}
                                    onChange={(e) => setFounderData(prev => ({
                                      ...prev,
                                      [key]: { ...prev[key], cv_url: e.target.value }
                                    }))}
                                  />
                                </div>
                              </div>

                              {/* Save Button */}
                              <div className="flex justify-end pt-4 border-t">
                                <Button onClick={() => handleSaveFounder(key)}>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Founder
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                      
                      {/* Saved Founders */}
                      {founders.map((founder) => (
                        <TabsContent key={founder.id} value={`saved-${founder.id}`} className="space-y-6 mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="w-5 h-5" />
                                  {founder.full_name || `Founder ${founder.founder_order}`}
                                  {founder.is_primary_founder && (
                                    <Badge variant="default" className="ml-2">Primary</Badge>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleDeleteFounder(`saved-${founder.id}`)} 
                                  size="sm" 
                                  variant="destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Title:</span> {founder.title || 'Not specified'}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {founder.email || 'Not specified'}
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span> {founder.phone || 'Not specified'}
                                </div>
                                <div>
                                  <span className="font-medium">Equity:</span> {founder.equity_percentage || 0}%
                                </div>
                              </div>
                              {founder.background && (
                                <div>
                                  <span className="font-medium">Background:</span>
                                  <p className="text-sm text-gray-600 mt-1">{founder.background}</p>
                                </div>
                              )}
                              <div className="flex justify-end pt-4 border-t">
                                <Button 
                                  onClick={() => {
                                    setFounderData(prev => ({
                                      ...prev,
                                      [`edit-${founder.id}`]: founder
                                    }));
                                    setActiveFounderTab(`edit-${founder.id}`);
                                  }}
                                  variant="outline"
                                >
                                  Edit Founder
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


            {/* Company Tab */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company Information & Legal Structure
                  </CardTitle>
                  <p className="text-sm text-gray-600">Legal, financial, and international business details</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Company Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-website">Company Website</Label>
                        <Input
                          id="company-website"
                          placeholder="https://yourcompany.com"
                          value={persistedFormData.company_website}
                          onChange={(e) => updateFormData(prev => ({ ...prev, company_website: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year-founded">Year Founded</Label>
                        <Input
                          id="year-founded"
                          type="number"
                          placeholder="2024"
                          value={persistedFormData.year_founded || ''}
                          onChange={(e) => updateFormData(prev => ({ ...prev, year_founded: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number-of-employees">Number of Employees</Label>
                        <Input
                          id="number-of-employees"
                          type="number"
                          placeholder="5"
                          value={persistedFormData.number_of_employees || ''}
                          onChange={(e) => updateFormData(prev => ({ ...prev, number_of_employees: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headquarters-location">Headquarters Location</Label>
                        <Input
                          id="headquarters-location"
                          placeholder="San Francisco, CA"
                          value={persistedFormData.headquarters_location}
                          onChange={(e) => updateFormData(prev => ({ ...prev, headquarters_location: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal Structure & Incorporation */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Legal Structure & Incorporation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="legal-structure">Legal Structure</Label>
                        <Select value={persistedFormData.legal_structure} onValueChange={(value) => updateFormData(prev => ({ ...prev, legal_structure: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select legal structure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private-limited">Private Limited Company</SelectItem>
                            <SelectItem value="llp">Limited Liability Partnership (LLP)</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="public-limited">Public Limited Company</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                            <SelectItem value="c-corp">C-Corporation</SelectItem>
                            <SelectItem value="s-corp">S-Corporation</SelectItem>
                            <SelectItem value="b-corp">B-Corporation</SelectItem>
                            <SelectItem value="non-profit">Non-Profit Organization</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incorporation-type">Incorporation Type</Label>
                        <Select value={persistedFormData.incorporation_type} onValueChange={(value) => updateFormData(prev => ({ ...prev, incorporation_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incorporation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="domestic">Domestic</SelectItem>
                            <SelectItem value="foreign">Foreign</SelectItem>
                            <SelectItem value="subsidiary">Subsidiary</SelectItem>
                            <SelectItem value="branch-office">Branch Office</SelectItem>
                            <SelectItem value="liaison-office">Liaison Office</SelectItem>
                            <SelectItem value="project-office">Project Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incorporation-country">Incorporation Country</Label>
                        <Select value={persistedFormData.incorporation_country} onValueChange={(value) => updateFormData(prev => ({ ...prev, incorporation_country: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="singapore">Singapore</SelectItem>
                            <SelectItem value="uae">United Arab Emirates</SelectItem>
                            <SelectItem value="germany">Germany</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="japan">Japan</SelectItem>
                            <SelectItem value="china">China</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incorporation-date">Incorporation Date</Label>
                        <Input
                          id="incorporation-date"
                          type="date"
                          value={persistedFormData.incorporation_date}
                          onChange={(e) => updateFormData(prev => ({ ...prev, incorporation_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incorporation-state">State/Province</Label>
                        <Input
                          id="incorporation-state"
                          placeholder="California, Maharashtra, etc."
                          value={persistedFormData.incorporation_state}
                          onChange={(e) => updateFormData(prev => ({ ...prev, incorporation_state: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incorporation-city">City</Label>
                        <Input
                          id="incorporation-city"
                          placeholder="San Francisco, Mumbai, etc."
                          value={persistedFormData.incorporation_city}
                          onChange={(e) => updateFormData(prev => ({ ...prev, incorporation_city: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Registration Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Business Registration Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-type">Business Type</Label>
                        <Select value={persistedFormData.business_type} onValueChange={(value) => updateFormData(prev => ({ ...prev, business_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="trading">Trading</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="agriculture">Agriculture</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registration-authority">Registration Authority</Label>
                        <Input
                          id="registration-authority"
                          placeholder="MCA, SEC, Companies House, etc."
                          value={persistedFormData.registration_authority}
                          onChange={(e) => updateFormData(prev => ({ ...prev, registration_authority: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registration-number">Registration Number</Label>
                        <Input
                          id="registration-number"
                          placeholder="U12345MH2024PTC123456"
                          value={persistedFormData.registration_number}
                          onChange={(e) => updateFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-registration-number">Business Registration Number</Label>
                        <Input
                          id="business-registration-number"
                          placeholder="BRN123456789"
                          value={persistedFormData.business_registration_number}
                          onChange={(e) => updateFormData(prev => ({ ...prev, business_registration_number: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* India-Specific Registration */}
                  {persistedFormData.incorporation_country === 'india' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">India-Specific Registration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pan-number">PAN Number</Label>
                          <Input
                            id="pan-number"
                            placeholder="ABCDE1234F"
                            value={persistedFormData.pan_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gst-number">GST Number</Label>
                          <Input
                            id="gst-number"
                            placeholder="27ABCDE1234F1Z5"
                            value={persistedFormData.gst_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cin-number">CIN Number</Label>
                          <Input
                            id="cin-number"
                            placeholder="U12345MH2024PTC123456"
                            value={persistedFormData.cin_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, cin_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="llp-number">LLP Number</Label>
                          <Input
                            id="llp-number"
                            placeholder="LLP123456789"
                            value={persistedFormData.llp_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, llp_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partnership-deed-number">Partnership Deed Number</Label>
                          <Input
                            id="partnership-deed-number"
                            placeholder="PD123456789"
                            value={persistedFormData.partnership_deed_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, partnership_deed_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sole-proprietorship-number">Sole Proprietorship Number</Label>
                          <Input
                            id="sole-proprietorship-number"
                            placeholder="SP123456789"
                            value={persistedFormData.sole_proprietorship_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, sole_proprietorship_number: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Foreign Registration */}
                  {persistedFormData.incorporation_type === 'foreign' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Foreign Registration Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="foreign-registration-number">Foreign Registration Number</Label>
                          <Input
                            id="foreign-registration-number"
                            placeholder="Foreign registration number"
                            value={persistedFormData.foreign_registration_number}
                            onChange={(e) => updateFormData(prev => ({ ...prev, foreign_registration_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreign-registration-country">Foreign Registration Country</Label>
                          <Input
                            id="foreign-registration-country"
                            placeholder="Country of foreign registration"
                            value={persistedFormData.foreign_registration_country}
                            onChange={(e) => updateFormData(prev => ({ ...prev, foreign_registration_country: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreign-registration-date">Foreign Registration Date</Label>
                          <Input
                            id="foreign-registration-date"
                            type="date"
                            value={persistedFormData.foreign_registration_date}
                            onChange={(e) => updateFormData(prev => ({ ...prev, foreign_registration_date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreign-tax-id">Foreign Tax ID</Label>
                          <Input
                            id="foreign-tax-id"
                            placeholder="Foreign tax identification number"
                            value={persistedFormData.foreign_tax_id}
                            onChange={(e) => updateFormData(prev => ({ ...prev, foreign_tax_id: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreign-business-license">Foreign Business License</Label>
                          <Input
                            id="foreign-business-license"
                            placeholder="Foreign business license number"
                            value={persistedFormData.foreign_business_license}
                            onChange={(e) => updateFormData(prev => ({ ...prev, foreign_business_license: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tax Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Tax Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tax-id">Tax ID</Label>
                        <Input
                          id="tax-id"
                          placeholder="Tax identification number"
                          value={persistedFormData.tax_id}
                          onChange={(e) => updateFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-license">Business License</Label>
                        <Input
                          id="business-license"
                          placeholder="Business license number"
                          value={persistedFormData.business_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, business_license: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compliance & Regulatory */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Compliance & Regulatory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="compliance-status">Compliance Status</Label>
                        <Select value={persistedFormData.compliance_status} onValueChange={(value) => updateFormData(prev => ({ ...prev, compliance_status: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compliant">Compliant</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                            <SelectItem value="under-review">Under Review</SelectItem>
                            <SelectItem value="exempt">Exempt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regulatory-approvals">Regulatory Approvals</Label>
                        <Textarea
                          id="regulatory-approvals"
                          placeholder="List regulatory approvals received"
                          rows={3}
                          value={persistedFormData.regulatory_approvals}
                          onChange={(e) => updateFormData(prev => ({ ...prev, regulatory_approvals: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Industry-Specific Licenses */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Industry-Specific Licenses</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fssai-license">FSSAI License (Food)</Label>
                        <Input
                          id="fssai-license"
                          placeholder="FSSAI license number"
                          value={persistedFormData.fssai_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, fssai_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drug-license">Drug License</Label>
                        <Input
                          id="drug-license"
                          placeholder="Drug license number"
                          value={persistedFormData.drug_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, drug_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telecom-license">Telecom License</Label>
                        <Input
                          id="telecom-license"
                          placeholder="Telecom license number"
                          value={persistedFormData.telecom_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, telecom_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="financial-services-license">Financial Services License</Label>
                        <Input
                          id="financial-services-license"
                          placeholder="Financial services license"
                          value={persistedFormData.financial_services_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, financial_services_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insurance-license">Insurance License</Label>
                        <Input
                          id="insurance-license"
                          placeholder="Insurance license number"
                          value={persistedFormData.insurance_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, insurance_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="real-estate-license">Real Estate License</Label>
                        <Input
                          id="real-estate-license"
                          placeholder="Real estate license number"
                          value={persistedFormData.real_estate_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, real_estate_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education-license">Education License</Label>
                        <Input
                          id="education-license"
                          placeholder="Education license number"
                          value={persistedFormData.education_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, education_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="healthcare-license">Healthcare License</Label>
                        <Input
                          id="healthcare-license"
                          placeholder="Healthcare license number"
                          value={persistedFormData.healthcare_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, healthcare_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="technology-license">Technology License</Label>
                        <Input
                          id="technology-license"
                          placeholder="Technology license number"
                          value={persistedFormData.technology_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, technology_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manufacturing-license">Manufacturing License</Label>
                        <Input
                          id="manufacturing-license"
                          placeholder="Manufacturing license number"
                          value={persistedFormData.manufacturing_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, manufacturing_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retail-license">Retail License</Label>
                        <Input
                          id="retail-license"
                          placeholder="Retail license number"
                          value={persistedFormData.retail_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, retail_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-license">Service License</Label>
                        <Input
                          id="service-license"
                          placeholder="Service license number"
                          value={persistedFormData.service_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, service_license: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="export-import-license">Export/Import License</Label>
                        <Input
                          id="export-import-license"
                          placeholder="Export/import license number"
                          value={persistedFormData.export_import_license}
                          onChange={(e) => updateFormData(prev => ({ ...prev, export_import_license: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="other-licenses">Other Licenses</Label>
                      <Textarea
                        id="other-licenses"
                        placeholder="List any other licenses or certifications"
                        rows={3}
                        value={persistedFormData.other_licenses}
                        onChange={(e) => updateFormData(prev => ({ ...prev, other_licenses: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


            {/* Product Tab */}
            <TabsContent value="product" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Product & Technology
                  </CardTitle>
                  <p className="text-sm text-gray-600">Product details, technology stack, and development information</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Product Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Product Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          placeholder="Your product name"
                          value={persistedFormData.product_name}
                          onChange={(e) => updateFormData(prev => ({ ...prev, product_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="development-stage">Development Stage</Label>
                        <Select value={persistedFormData.development_stage} onValueChange={(value) => updateFormData(prev => ({ ...prev, development_stage: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select development stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea Stage</SelectItem>
                            <SelectItem value="mvp">MVP Development</SelectItem>
                            <SelectItem value="beta">Beta Testing</SelectItem>
                            <SelectItem value="launched">Launched</SelectItem>
                            <SelectItem value="scaling">Scaling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mvp-status">MVP Status</Label>
                        <Select value={persistedFormData.mvp_status} onValueChange={(value) => updateFormData(prev => ({ ...prev, mvp_status: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select MVP status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="in-development">In Development</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="launched">Launched</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beta-testers">Number of Beta Testers</Label>
                        <Input
                          id="beta-testers"
                          type="number"
                          placeholder="50"
                          value={persistedFormData.beta_testers || ''}
                          onChange={(e) => updateFormData(prev => ({ ...prev, beta_testers: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-description">Product Description</Label>
                      <Textarea
                        id="product-description"
                        placeholder="Describe your product, its features, and how it works"
                        rows={4}
                        value={persistedFormData.product_description}
                        onChange={(e) => updateFormData(prev => ({ ...prev, product_description: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Technology Stack */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Technology Stack</h4>
                    <div className="space-y-2">
                      <Label htmlFor="technology-stack">Technology Stack</Label>
                      <Textarea
                        id="technology-stack"
                        placeholder="Frontend: React, Backend: Node.js, Database: PostgreSQL, etc."
                        rows={3}
                        value={persistedFormData.technology_stack}
                        onChange={(e) => updateFormData(prev => ({ ...prev, technology_stack: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technical-challenges">Technical Challenges</Label>
                      <Textarea
                        id="technical-challenges"
                        placeholder="Describe any technical challenges you're facing or have overcome"
                        rows={3}
                        value={persistedFormData.technical_challenges}
                        onChange={(e) => updateFormData(prev => ({ ...prev, technical_challenges: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scalability-plan">Scalability Plan</Label>
                      <Textarea
                        id="scalability-plan"
                        placeholder="How do you plan to scale your product and technology?"
                        rows={3}
                        value={persistedFormData.scalability_plan}
                        onChange={(e) => updateFormData(prev => ({ ...prev, scalability_plan: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Intellectual Property */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Intellectual Property</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="intellectual-property">Intellectual Property Overview</Label>
                        <Textarea
                          id="intellectual-property"
                          placeholder="Describe your IP assets, proprietary technology, or unique algorithms"
                          rows={3}
                          value={persistedFormData.intellectual_property}
                          onChange={(e) => updateFormData(prev => ({ ...prev, intellectual_property: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="patents">Patents</Label>
                          <Textarea
                            id="patents"
                            placeholder="Patent numbers, applications, or pending patents"
                            rows={3}
                            value={persistedFormData.patents}
                            onChange={(e) => updateFormData(prev => ({ ...prev, patents: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trademarks">Trademarks</Label>
                          <Textarea
                            id="trademarks"
                            placeholder="Registered trademarks or pending applications"
                            rows={3}
                            value={persistedFormData.trademarks}
                            onChange={(e) => updateFormData(prev => ({ ...prev, trademarks: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="copyrights">Copyrights</Label>
                          <Textarea
                            id="copyrights"
                            placeholder="Copyrighted materials, software, or content"
                            rows={3}
                            value={persistedFormData.copyrights}
                            onChange={(e) => updateFormData(prev => ({ ...prev, copyrights: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trade-secrets">Trade Secrets</Label>
                          <Textarea
                            id="trade-secrets"
                            placeholder="Proprietary processes, algorithms, or confidential information"
                            rows={3}
                            value={persistedFormData.trade_secrets}
                            onChange={(e) => updateFormData(prev => ({ ...prev, trade_secrets: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Feedback & Roadmap */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">User Feedback & Roadmap</h4>
                    <div className="space-y-2">
                      <Label htmlFor="user-feedback">User Feedback</Label>
                      <Textarea
                        id="user-feedback"
                        placeholder="Key feedback from users, testimonials, or user research insights"
                        rows={3}
                        value={persistedFormData.user_feedback}
                        onChange={(e) => updateFormData(prev => ({ ...prev, user_feedback: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-roadmap">Product Roadmap</Label>
                      <Textarea
                        id="product-roadmap"
                        placeholder="Upcoming features, milestones, and development timeline"
                        rows={4}
                        value={persistedFormData.product_roadmap}
                        onChange={(e) => updateFormData(prev => ({ ...prev, product_roadmap: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Market & Competition
                  </CardTitle>
                  <p className="text-sm text-gray-600">Market analysis, competition, and go-to-market strategy</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Market Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Market Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="market-size">Market Size</Label>
                        <Input
                          id="market-size"
                          placeholder="$50B TAM, $5B SAM"
                          value={persistedFormData.market_size}
                          onChange={(e) => updateFormData(prev => ({ ...prev, market_size: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-acquisition-cost">Customer Acquisition Cost</Label>
                        <Input
                          id="customer-acquisition-cost"
                          placeholder="$25"
                          value={persistedFormData.customer_acquisition_cost}
                          onChange={(e) => updateFormData(prev => ({ ...prev, customer_acquisition_cost: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lifetime-value">Customer Lifetime Value</Label>
                        <Input
                          id="lifetime-value"
                          placeholder="$500"
                          value={persistedFormData.lifetime_value}
                          onChange={(e) => updateFormData(prev => ({ ...prev, lifetime_value: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regulatory-environment">Regulatory Environment</Label>
                        <Input
                          id="regulatory-environment"
                          placeholder="FDA, SEC, GDPR, etc."
                          value={persistedFormData.regulatory_environment}
                          onChange={(e) => updateFormData(prev => ({ ...prev, regulatory_environment: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Target Customers */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Target Customers</h4>
                    <div className="space-y-2">
                      <Label htmlFor="target-customers">Target Customers</Label>
                      <Textarea
                        id="target-customers"
                        placeholder="Describe your ideal customer profile and target market segments"
                        rows={3}
                        value={persistedFormData.target_customers}
                        onChange={(e) => updateFormData(prev => ({ ...prev, target_customers: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-personas">Customer Personas</Label>
                      <Textarea
                        id="customer-personas"
                        placeholder="Detailed customer personas, demographics, and psychographics"
                        rows={3}
                        value={persistedFormData.customer_personas}
                        onChange={(e) => updateFormData(prev => ({ ...prev, customer_personas: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-validation">Customer Validation</Label>
                      <Textarea
                        id="customer-validation"
                        placeholder="How have you validated customer demand and product-market fit?"
                        rows={3}
                        value={persistedFormData.customer_validation}
                        onChange={(e) => updateFormData(prev => ({ ...prev, customer_validation: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Competition */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Competition</h4>
                    <div className="space-y-2">
                      <Label htmlFor="competitive-analysis">Competitive Analysis</Label>
                      <Textarea
                        id="competitive-analysis"
                        placeholder="Key competitors, their strengths/weaknesses, and your competitive advantages"
                        rows={4}
                        value={persistedFormData.competitive_analysis}
                        onChange={(e) => updateFormData(prev => ({ ...prev, competitive_analysis: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="market-trends">Market Trends</Label>
                      <Textarea
                        id="market-trends"
                        placeholder="Current market trends, opportunities, and threats"
                        rows={3}
                        value={persistedFormData.market_trends}
                        onChange={(e) => updateFormData(prev => ({ ...prev, market_trends: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Go-to-Market Strategy */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Go-to-Market Strategy</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="market-entry-strategy">Market Entry Strategy</Label>
                        <Textarea
                          id="market-entry-strategy"
                          placeholder="How do you plan to enter and capture market share?"
                          rows={3}
                          value={persistedFormData.market_entry_strategy}
                          onChange={(e) => updateFormData(prev => ({ ...prev, market_entry_strategy: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="go-to-market-plan">Go-to-Market Plan</Label>
                        <Textarea
                          id="go-to-market-plan"
                          placeholder="Detailed go-to-market strategy, channels, and tactics"
                          rows={3}
                          value={persistedFormData.go_to_market_plan}
                          onChange={(e) => updateFormData(prev => ({ ...prev, go_to_market_plan: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sales-strategy">Sales Strategy</Label>
                          <Textarea
                            id="sales-strategy"
                            placeholder="Sales approach, channels, and processes"
                            rows={3}
                            value={persistedFormData.sales_strategy}
                            onChange={(e) => updateFormData(prev => ({ ...prev, sales_strategy: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="marketing-strategy">Marketing Strategy</Label>
                          <Textarea
                            id="marketing-strategy"
                            placeholder="Marketing channels, campaigns, and brand strategy"
                            rows={3}
                            value={persistedFormData.marketing_strategy}
                            onChange={(e) => updateFormData(prev => ({ ...prev, marketing_strategy: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Research */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Market Research</h4>
                    <div className="space-y-2">
                      <Label htmlFor="market-research">Market Research</Label>
                      <Textarea
                        id="market-research"
                        placeholder="Market research conducted, data sources, and key findings"
                        rows={3}
                        value={persistedFormData.market_research}
                        onChange={(e) => updateFormData(prev => ({ ...prev, market_research: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team & Advisors
                  </CardTitle>
                  <p className="text-sm text-gray-600">Team composition, advisors, and organizational structure</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Team Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Team Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-size">Team Size</Label>
                        <Select value={persistedFormData.team_size} onValueChange={(value) => updateFormData(prev => ({ ...prev, team_size: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 person</SelectItem>
                            <SelectItem value="2-5">2-5 people</SelectItem>
                            <SelectItem value="6-10">6-10 people</SelectItem>
                            <SelectItem value="11-25">11-25 people</SelectItem>
                            <SelectItem value="26-50">26-50 people</SelectItem>
                            <SelectItem value="50+">50+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="remote-work-policy">Remote Work Policy</Label>
                        <Select value={persistedFormData.remote_work_policy} onValueChange={(value) => updateFormData(prev => ({ ...prev, remote_work_policy: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select remote work policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fully-remote">Fully Remote</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="office-based">Office-based</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="key-team-members">Key Team Members</Label>
                      <Textarea
                        id="key-team-members"
                        placeholder="List key team members, their roles, backgrounds, and contributions"
                        rows={4}
                        value={persistedFormData.key_team_members}
                        onChange={(e) => updateFormData(prev => ({ ...prev, key_team_members: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="co-founders">Co-founders</Label>
                      <Textarea
                        id="co-founders"
                        placeholder="Co-founder information, backgrounds, and equity distribution"
                        rows={3}
                        value={persistedFormData.co_founders}
                        onChange={(e) => updateFormData(prev => ({ ...prev, co_founders: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Advisors & Mentors */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Advisors & Mentors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="advisors">Advisors</Label>
                        <Textarea
                          id="advisors"
                          placeholder="List advisors, their expertise, and how they help"
                          rows={3}
                          value={persistedFormData.advisors}
                          onChange={(e) => updateFormData(prev => ({ ...prev, advisors: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mentors">Mentors</Label>
                        <Textarea
                          id="mentors"
                          placeholder="Mentors, their backgrounds, and guidance provided"
                          rows={3}
                          value={persistedFormData.mentors}
                          onChange={(e) => updateFormData(prev => ({ ...prev, mentors: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="board-members">Board Members</Label>
                      <Textarea
                        id="board-members"
                        placeholder="Board members, their roles, and governance structure"
                        rows={3}
                        value={persistedFormData.board_members}
                        onChange={(e) => updateFormData(prev => ({ ...prev, board_members: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Investors & Partners */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Investors & Partners</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="investors">Investors</Label>
                        <Textarea
                          id="investors"
                          placeholder="Current investors, funding rounds, and investor value-add"
                          rows={3}
                          value={persistedFormData.investors}
                          onChange={(e) => updateFormData(prev => ({ ...prev, investors: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="strategic-partners">Strategic Partners</Label>
                        <Textarea
                          id="strategic-partners"
                          placeholder="Key partnerships, collaborations, and strategic relationships"
                          rows={3}
                          value={persistedFormData.strategic_partners}
                          onChange={(e) => updateFormData(prev => ({ ...prev, strategic_partners: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team Culture & Growth */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Team Culture & Growth</h4>
                    <div className="space-y-2">
                      <Label htmlFor="team-culture">Team Culture</Label>
                      <Textarea
                        id="team-culture"
                        placeholder="Describe your team culture, values, and working environment"
                        rows={3}
                        value={persistedFormData.team_culture}
                        onChange={(e) => updateFormData(prev => ({ ...prev, team_culture: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hiring-plan">Hiring Plan</Label>
                      <Textarea
                        id="hiring-plan"
                        placeholder="Planned hires, roles needed, and timeline for team expansion"
                        rows={3}
                        value={persistedFormData.hiring_plan}
                        onChange={(e) => updateFormData(prev => ({ ...prev, hiring_plan: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equity-distribution">Equity Distribution</Label>
                      <Textarea
                        id="equity-distribution"
                        placeholder="Equity distribution among founders, employees, and advisors"
                        rows={3}
                        value={persistedFormData.equity_distribution}
                        onChange={(e) => updateFormData(prev => ({ ...prev, equity_distribution: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab (Updated Documents Tab) */}
            <TabsContent value="docs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents & Resources
                  </CardTitle>
                  <p className="text-sm text-gray-600">Upload documents and manage resource links</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document URLs */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Document Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pitch-deck-url">Pitch Deck URL</Label>
                        <Input
                          id="pitch-deck-url"
                          placeholder="https://yourcompany.com/pitch-deck.pdf"
                          value={persistedFormData.pitch_deck_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, pitch_deck_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-plan-url">Business Plan URL</Label>
                        <Input
                          id="business-plan-url"
                          placeholder="https://yourcompany.com/business-plan.pdf"
                          value={persistedFormData.business_plan_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, business_plan_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="financial-model-url">Financial Model URL</Label>
                        <Input
                          id="financial-model-url"
                          placeholder="https://yourcompany.com/financial-model.xlsx"
                          value={persistedFormData.financial_model_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, financial_model_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="market-research-url">Market Research URL</Label>
                        <Input
                          id="market-research-url"
                          placeholder="https://yourcompany.com/market-research.pdf"
                          value={persistedFormData.market_research_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, market_research_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="legal-documents-url">Legal Documents URL</Label>
                        <Input
                          id="legal-documents-url"
                          placeholder="https://yourcompany.com/legal-docs.pdf"
                          value={persistedFormData.legal_documents_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, legal_documents_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="press-kit-url">Press Kit URL</Label>
                        <Input
                          id="press-kit-url"
                          placeholder="https://yourcompany.com/press-kit.zip"
                          value={persistedFormData.press_kit_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, press_kit_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="case-studies-url">Case Studies URL</Label>
                        <Input
                          id="case-studies-url"
                          placeholder="https://yourcompany.com/case-studies.pdf"
                          value={persistedFormData.case_studies_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, case_studies_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="testimonials-url">Testimonials URL</Label>
                        <Input
                          id="testimonials-url"
                          placeholder="https://yourcompany.com/testimonials.pdf"
                          value={persistedFormData.testimonials_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, testimonials_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-demo-url">Product Demo URL</Label>
                        <Input
                          id="product-demo-url"
                          placeholder="https://youtube.com/watch?v=yourdemo"
                          value={persistedFormData.product_demo_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, product_demo_url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="investor-deck-url">Investor Deck URL</Label>
                        <Input
                          id="investor-deck-url"
                          placeholder="https://yourcompany.com/investor-deck.pdf"
                          value={persistedFormData.investor_deck_url}
                          onChange={(e) => updateFormData(prev => ({ ...prev, investor_deck_url: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Upload Document</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="document-file">Select File</Label>
                        <Input
                          id="document-file"
                          type="file"
                          accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                          onChange={e => setSelectedResourceFile(e.target.files?.[0] || null)}
                          disabled={resourcesUploading}
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files. Max size: 50MB
                        </p>
                      </div>
                      
                      {selectedResourceFile && (
                        <div className="space-y-2">
                          <Label htmlFor="document-type">Document Type</Label>
                          <Select onValueChange={setSelectedDocumentType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pitch-deck">Pitch Deck</SelectItem>
                              <SelectItem value="business-plan">Business Plan</SelectItem>
                              <SelectItem value="financial-model">Financial Model</SelectItem>
                              <SelectItem value="market-research">Market Research</SelectItem>
                              <SelectItem value="legal-documents">Legal Documents</SelectItem>
                              <SelectItem value="press-kit">Press Kit</SelectItem>
                              <SelectItem value="case-studies">Case Studies</SelectItem>
                              <SelectItem value="testimonials">Testimonials</SelectItem>
                              <SelectItem value="product-demo">Product Demo</SelectItem>
                              <SelectItem value="investor-deck">Investor Deck</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <Button 
                        onClick={handleResourcesDocUpload} 
                        disabled={!selectedResourceFile || !selectedDocumentType || resourcesUploading} 
                        className="w-full"
                      >
                        {resourcesUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          'Upload Document'
                        )}
                      </Button>
                      
                      {resourcesUploadError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-red-800 text-sm">{resourcesUploadError}</div>
                        </div>
                      )}
                    </div>
                  </div>
                    
                    {/* File List Section */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Your Documents</h4>
                      {docsLoading ? (
                        <div className="text-center py-4">Loading documents...</div>
                      ) : docsError ? (
                        <div className="text-red-600 text-center py-4">{docsError}</div>
                      ) : documents.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">No documents uploaded yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(
                            documents.reduce((acc, doc) => {
                              const type = doc.document_type || 'other';
                              if (!acc[type]) acc[type] = [];
                              acc[type].push(doc);
                              return acc;
                            }, {} as Record<string, typeof documents>)
                          ).map(([type, docs]) => (
                            <div key={type} className="space-y-2">
                              <h5 className="font-medium text-sm text-gray-700 capitalize">
                                {type.replace('-', ' ')} ({docs.length})
                              </h5>
                              <div className="space-y-2">
                                {docs.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between border rounded px-3 py-2 bg-gray-50">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{doc.document_name}</div>
                                      <div className="text-xs text-gray-500">
                                        Uploaded: {safeFormatDate(
                                          doc.uploaded_at,
                                          (date) => date.toLocaleDateString(),
                                          'Unknown date'
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        title="Download"
                                        onClick={async () => {
                                          const url = await getDocumentUrl(doc.storage_path);
                                          if (url) {
                                            window.open(url, '_blank');
                                          } else {
                                            toast({
                                              title: "Download Failed",
                                              description: "Could not generate download URL",
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        title="Delete"
                                        onClick={async () => {
                                          const { error, success } = await deleteDocument(doc.id, doc.storage_path);
                                          if (error) {
                                            toast({
                                              title: "Delete Failed",
                                              description: error,
                                              variant: "destructive",
                                            });
                                          } else if (success) {
                                            toast({
                                              title: "Document Deleted",
                                              description: "Document has been successfully deleted",
                                            });
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileHub;
