import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { User, Users, Building, Target, FileText, Save, Trash2, Plus, Upload, Download, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ProfileHubProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface FounderData {
  id?: string;
  full_name: string;
  title: string;
  linkedin_url: string;
  professional_background: string;
  coolest_thing_built: string;
  biggest_accomplishment: string;
  time_commitment: string;
}

interface BusinessData {
  startup_name: string;
  one_line_pitch: string;
  problem_statement: string;
  golden_retriever_explanation: string;
  dream_customer: string;
  market_size: string;
  industry: string;
  unfair_advantage: string;
  top_competitors: string;
  traction_story: string;
  current_stage: string;
  funding_stage: string;
  funding_amount: string;
  funding_unlock: string;
  twelve_month_goal: string;
  why_now: string;
  biggest_risk: string;
  customer_acquisition: string;
}

const ProfileHub = ({ isOpen: externalIsOpen, onOpenChange }: ProfileHubProps = {}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('founders');
  const [saving, setSaving] = useState(false);

  // Founders state
  const [founders, setFounders] = useState<FounderData[]>([]);
  const [activeFounderIndex, setActiveFounderIndex] = useState(0);

  // Business state
  const [businessData, setBusinessData] = useState<BusinessData>({
    startup_name: '',
    one_line_pitch: '',
    problem_statement: '',
    golden_retriever_explanation: '',
    dream_customer: '',
    market_size: '',
    industry: '',
    unfair_advantage: '',
    top_competitors: '',
    traction_story: '',
    current_stage: '',
    funding_stage: '',
    funding_amount: '',
    funding_unlock: '',
    twelve_month_goal: '',
    why_now: '',
    biggest_risk: '',
    customer_acquisition: '',
  });

  // Documents state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    setIsOpen(externalIsOpen || false);
  }, [externalIsOpen]);

  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) onOpenChange(open);
  };

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load founders
      const { data: foundersData, error: foundersError } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!foundersError && foundersData) {
        const mappedFounders = foundersData.map((f: any) => ({
          id: f.id,
          full_name: f.full_name || '',
          title: f.title || '',
          linkedin_url: f.linkedin_url || '',
          professional_background: f.background || '',
          coolest_thing_built: f.coolest_thing_built || '',
          biggest_accomplishment: f.biggest_accomplishment || '',
          time_commitment: f.time_commitment || '',
        }));
        setFounders(mappedFounders.length > 0 ? mappedFounders : [createEmptyFounder()]);
      }

      // Load business profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setBusinessData({
          startup_name: profileData.startup_name || '',
          one_line_pitch: profileData.one_line_pitch || '',
          problem_statement: profileData.problem_statement || '',
          golden_retriever_explanation: profileData.golden_retriever_explanation || '',
          dream_customer: profileData.target_market || '',
          market_size: profileData.market_size || '',
          industry: profileData.industry || '',
          unfair_advantage: profileData.unfair_advantage || '',
          top_competitors: profileData.top_competitors || '',
          traction_story: profileData.traction_story || '',
          current_stage: profileData.current_stage || '',
          funding_stage: profileData.funding_stage || '',
          funding_amount: profileData.funding_amount || '',
          funding_unlock: profileData.funding_unlock || '',
          twelve_month_goal: profileData.twelve_month_goal || '',
          why_now: profileData.why_now || '',
          biggest_risk: profileData.biggest_risk || '',
          customer_acquisition: profileData.customer_acquisition || '',
        });
      }

      // Load documents
      const { data: docsData, error: docsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (!docsError && docsData) {
        setDocuments(docsData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const createEmptyFounder = (): FounderData => ({
    full_name: '',
    title: '',
    linkedin_url: '',
    professional_background: '',
    coolest_thing_built: '',
    biggest_accomplishment: '',
    time_commitment: '',
  });

  const handleAddFounder = () => {
    setFounders([...founders, createEmptyFounder()]);
    setActiveFounderIndex(founders.length);
  };

  const handleRemoveFounder = (index: number) => {
    if (founders.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one founder.",
        variant: "destructive",
      });
      return;
    }
    const newFounders = founders.filter((_, i) => i !== index);
    setFounders(newFounders);
    setActiveFounderIndex(Math.max(0, index - 1));
  };

  const handleFounderChange = (index: number, field: keyof FounderData, value: string) => {
    const newFounders = [...founders];
    newFounders[index] = { ...newFounders[index], [field]: value };
    setFounders(newFounders);
  };

  const handleBusinessChange = (field: keyof BusinessData, value: string) => {
    setBusinessData({ ...businessData, [field]: value });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Save business data to user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          startup_name: businessData.startup_name,
          one_line_pitch: businessData.one_line_pitch,
          problem_statement: businessData.problem_statement,
          golden_retriever_explanation: businessData.golden_retriever_explanation,
          target_market: businessData.dream_customer,
          market_size: businessData.market_size,
          industry: businessData.industry,
          unfair_advantage: businessData.unfair_advantage,
          top_competitors: businessData.top_competitors,
          traction_story: businessData.traction_story,
          current_stage: businessData.current_stage,
          funding_stage: businessData.funding_stage,
          funding_amount: businessData.funding_amount,
          funding_unlock: businessData.funding_unlock,
          twelve_month_goal: businessData.twelve_month_goal,
          why_now: businessData.why_now,
          biggest_risk: businessData.biggest_risk,
          customer_acquisition: businessData.customer_acquisition,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Save founders
      for (const founder of founders) {
        if (founder.id) {
          // Update existing founder
          await supabase
            .from('founders')
            .update({
              full_name: founder.full_name,
              title: founder.title,
              linkedin_url: founder.linkedin_url,
              background: founder.professional_background,
              coolest_thing_built: founder.coolest_thing_built,
              biggest_accomplishment: founder.biggest_accomplishment,
              time_commitment: founder.time_commitment,
              updated_at: new Date().toISOString(),
            })
            .eq('id', founder.id);
        } else if (founder.full_name) {
          // Insert new founder
          await supabase
            .from('founders')
            .insert({
              user_id: user.id,
              full_name: founder.full_name,
              title: founder.title,
              linkedin_url: founder.linkedin_url,
              background: founder.professional_background,
              coolest_thing_built: founder.coolest_thing_built,
              biggest_accomplishment: founder.biggest_accomplishment,
              time_commitment: founder.time_commitment,
            });
        }
      }

      toast({
        title: "Profile Saved!",
        description: "Your profile has been updated successfully.",
      });

      // Trigger vectorization for RAG (async, don't wait)
      supabase.functions
        .invoke('vectorize-profile', {
          body: { user_id: user.id },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Vectorization failed:', error);
          } else {
            console.log('Profile vectorized for RAG:', data);
            toast({
              title: "AI Ready!",
              description: "Your profile is now optimized for grant auto-fill.",
            });
          }
        })
        .catch((err) => console.error('Vectorization error:', err));

      loadProfileData();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !user || !selectedDocType) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${selectedDocType}-${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_name: selectedFile.name,
          document_type: selectedDocType,
          storage_path: filePath,
          file_size: selectedFile.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Document Uploaded!",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });

      // If pitch deck was uploaded, trigger analysis and vectorization
      if (selectedDocType === 'pitch-deck') {
        // Call analyze-pitch-deck Edge Function
        supabase.functions
          .invoke('analyze-pitch-deck', {
            body: {
              file_path: filePath,
              file_name: selectedFile.name,
              file_size: selectedFile.size,
            },
          })
          .then(({ data, error }) => {
            if (error) {
              console.error('Pitch deck analysis failed:', error);
              toast({
                title: "Analysis Failed",
                description: "Failed to analyze pitch deck, but file was uploaded.",
                variant: "destructive",
              });
            } else {
              console.log('Pitch deck analyzed:', data);
              toast({
                title: "Pitch Deck Analyzed! 🎉",
                description: "Your pitch deck has been analyzed and added to your AI context.",
              });

              // Trigger vectorization for RAG
              return supabase.functions.invoke('vectorize-pitch-deck', {
                body: { user_id: user.id },
              });
            }
          })
          .then((response) => {
            if (response?.error) {
              console.error('Pitch deck vectorization failed:', response.error);
            } else if (response?.data) {
              console.log('Pitch deck vectorized for RAG:', response.data);
              toast({
                title: "RAG Ready! 🚀",
                description: "Your pitch deck is now optimized for AI-powered grant autofill.",
              });
            }
          })
          .catch((err) => console.error('Pitch deck processing error:', err));
      }

      setSelectedFile(null);
      setSelectedDocType('');
      loadProfileData();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    if (!user) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('user-documents')
        .remove([storagePath]);

      // Delete from database
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Document Deleted",
        description: "Document has been removed successfully.",
      });

      loadProfileData();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={() => handleOpenChange(true)}>
          <User className="w-4 h-4 mr-2" />
          Profile Hub
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0 overflow-y-auto">
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">Profile Hub</SheetTitle>
              <SheetDescription>
                Complete your startup profile - 30 essential questions
              </SheetDescription>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </SheetHeader>

        <div className="px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="founders" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Founders & Team</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Business & Market</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: FOUNDERS & TEAM */}
            <TabsContent value="founders" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Founders & Team
                    </CardTitle>
                    <Button onClick={handleAddFounder} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Founder
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {founders.length > 0 && (
                    <div className="space-y-4">
                      {/* Founder tabs */}
                      <div className="flex items-center gap-2 border-b pb-2">
                        {founders.map((founder, index) => (
                          <Button
                            key={index}
                            variant={activeFounderIndex === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFounderIndex(index)}
                          >
                            <User className="w-3 h-3 mr-1" />
                            {founder.full_name || `Founder ${index + 1}`}
                          </Button>
                        ))}
                      </div>

                      {/* Active founder form */}
                      {founders[activeFounderIndex] && (
                        <div className="space-y-4 pt-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFounder(activeFounderIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove Founder
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="full_name">Full Name *</Label>
                              <Input
                                id="full_name"
                                placeholder="John Doe"
                                value={founders[activeFounderIndex].full_name}
                                onChange={(e) => handleFounderChange(activeFounderIndex, 'full_name', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="title">Title/Role *</Label>
                              <Input
                                id="title"
                                placeholder="CEO, CTO, etc."
                                value={founders[activeFounderIndex].title}
                                onChange={(e) => handleFounderChange(activeFounderIndex, 'title', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                              <Input
                                id="linkedin_url"
                                placeholder="https://linkedin.com/in/johndoe"
                                value={founders[activeFounderIndex].linkedin_url}
                                onChange={(e) => handleFounderChange(activeFounderIndex, 'linkedin_url', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="professional_background">Professional Background (2-3 sentences)</Label>
                              <Textarea
                                id="professional_background"
                                placeholder="Describe your professional journey and key experiences..."
                                rows={3}
                                value={founders[activeFounderIndex].professional_background}
                                onChange={(e) => handleFounderChange(activeFounderIndex, 'professional_background', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coolest_thing_built">
                                What's the coolest thing you've built before this? 🚀
                              </Label>
                              <Textarea
                                id="coolest_thing_built"
                                placeholder="Tell us about your proudest creation or project..."
                                rows={2}
                                value={founders[activeFounderIndex].coolest_thing_built}
                                onChange={(e) => handleFounderChange(activeFounderIndex, 'coolest_thing_built', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="biggest_accomplishment">
                                What's your biggest accomplishment? 🏆
                              </Label>
                              <Textarea
                                id="biggest_accomplishment"
                                placeholder="What achievement are you most proud of?"
                                rows={2}
                                value={founders[activeFounderIndex].biggest_accomplishment}
                                onChange={(e) => handleFounderChange(activeFounderIndex, 'biggest_accomplishment', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="time_commitment">Time Commitment</Label>
                              <Select
                                value={founders[activeFounderIndex].time_commitment}
                                onValueChange={(value) => handleFounderChange(activeFounderIndex, 'time_commitment', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select commitment level" />
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
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: BUSINESS & MARKET */}
            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business & Market (18 Questions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startup_name">1. Startup Name *</Label>
                      <Input
                        id="startup_name"
                        placeholder="Your startup name"
                        value={businessData.startup_name}
                        onChange={(e) => handleBusinessChange('startup_name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">7. Industry/Sector *</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., FinTech, HealthTech, EdTech"
                        value={businessData.industry}
                        onChange={(e) => handleBusinessChange('industry', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="one_line_pitch">2. One-Line Pitch *</Label>
                    <Input
                      id="one_line_pitch"
                      placeholder="Describe your startup in one compelling sentence"
                      value={businessData.one_line_pitch}
                      onChange={(e) => handleBusinessChange('one_line_pitch', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problem_statement">
                      3. What problem keeps your customers up at night? 🌙
                    </Label>
                    <Textarea
                      id="problem_statement"
                      placeholder="Describe the pain point you're solving..."
                      rows={3}
                      value={businessData.problem_statement}
                      onChange={(e) => handleBusinessChange('problem_statement', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="golden_retriever_explanation">
                      4. Explain your idea like you're talking to a golden retriever 🐕
                    </Label>
                    <Textarea
                      id="golden_retriever_explanation"
                      placeholder="Super simple, clear explanation anyone can understand..."
                      rows={3}
                      value={businessData.golden_retriever_explanation}
                      onChange={(e) => handleBusinessChange('golden_retriever_explanation', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Keep it simple and jargon-free!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dream_customer">5. Who is your dream customer?</Label>
                    <Textarea
                      id="dream_customer"
                      placeholder="Describe your ideal customer profile..."
                      rows={2}
                      value={businessData.dream_customer}
                      onChange={(e) => handleBusinessChange('dream_customer', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="market_size">6. Market Size (TAM estimation)</Label>
                    <Input
                      id="market_size"
                      placeholder="e.g., $50B global market"
                      value={businessData.market_size}
                      onChange={(e) => handleBusinessChange('market_size', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unfair_advantage">
                      8. Your Unfair Advantage ⚡
                    </Label>
                    <Textarea
                      id="unfair_advantage"
                      placeholder="What do you have that competitors don't and can't easily copy?"
                      rows={2}
                      value={businessData.unfair_advantage}
                      onChange={(e) => handleBusinessChange('unfair_advantage', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="top_competitors">9. Top 3 Competitors</Label>
                    <Textarea
                      id="top_competitors"
                      placeholder="List your main competitors and how you differ..."
                      rows={2}
                      value={businessData.top_competitors}
                      onChange={(e) => handleBusinessChange('top_competitors', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="traction_story">10. Your Traction Story 📈</Label>
                    <Textarea
                      id="traction_story"
                      placeholder="Numbers, users, revenue, partnerships, growth metrics..."
                      rows={3}
                      value={businessData.traction_story}
                      onChange={(e) => handleBusinessChange('traction_story', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_stage">11. Current Stage</Label>
                      <Select
                        value={businessData.current_stage}
                        onValueChange={(value) => handleBusinessChange('current_stage', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="mvp">MVP</SelectItem>
                          <SelectItem value="early-revenue">Early Revenue</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="scale">Scale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="funding_stage">12. Funding Stage</Label>
                      <Select
                        value={businessData.funding_stage}
                        onValueChange={(value) => handleBusinessChange('funding_stage', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funding_amount">13. How much are you raising? 💰</Label>
                    <Input
                      id="funding_amount"
                      placeholder="e.g., $500K, $2M"
                      value={businessData.funding_amount}
                      onChange={(e) => handleBusinessChange('funding_amount', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funding_unlock">14. What will the funding unlock? 🚀</Label>
                    <Textarea
                      id="funding_unlock"
                      placeholder="Specific milestones this funding will help you achieve..."
                      rows={2}
                      value={businessData.funding_unlock}
                      onChange={(e) => handleBusinessChange('funding_unlock', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twelve_month_goal">15. 12-Month Moonshot Goal 🌙</Label>
                    <Textarea
                      id="twelve_month_goal"
                      placeholder="Where will you be in one year?"
                      rows={2}
                      value={businessData.twelve_month_goal}
                      onChange={(e) => handleBusinessChange('twelve_month_goal', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="why_now">16. Your "Why Now?" Moment ⏰</Label>
                    <Textarea
                      id="why_now"
                      placeholder="Why is this the perfect time for your solution?"
                      rows={2}
                      value={businessData.why_now}
                      onChange={(e) => handleBusinessChange('why_now', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biggest_risk">17. Biggest Risk You're Facing ⚠️</Label>
                    <Textarea
                      id="biggest_risk"
                      placeholder="What's your biggest challenge or concern?"
                      rows={2}
                      value={businessData.biggest_risk}
                      onChange={(e) => handleBusinessChange('biggest_risk', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_acquisition">18. Customer Acquisition Strategy</Label>
                    <Textarea
                      id="customer_acquisition"
                      placeholder="How do you get and keep customers?"
                      rows={2}
                      value={businessData.customer_acquisition}
                      onChange={(e) => handleBusinessChange('customer_acquisition', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: DOCUMENTS */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Upload Document</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="document-file">Select File</Label>
                        <Input
                          id="document-file"
                          type="file"
                          accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500">
                          Supported: PDF, Word, Excel, PowerPoint, Images. Max 50MB
                        </p>
                      </div>

                      {selectedFile && (
                        <div className="space-y-2">
                          <Label htmlFor="document-type">Document Type</Label>
                          <Select onValueChange={setSelectedDocType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pitch-deck">Pitch Deck</SelectItem>
                              <SelectItem value="business-plan">Business Plan</SelectItem>
                              <SelectItem value="financial-model">Financial Model</SelectItem>
                              <SelectItem value="market-research">Market Research</SelectItem>
                              <SelectItem value="legal-documents">Legal Documents</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || !selectedDocType || uploading}
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Your Documents</h4>
                    {documents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No documents uploaded yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium">{doc.document_name}</div>
                                <div className="text-xs text-gray-500">
                                  {doc.document_type} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id, doc.storage_path)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileHub;
