
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { User, Building, Target, Users, FileText, Save, Download, Trash2, Bot } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/useDocuments';

const ProfileHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, loading, saveProfile } = useProfile();
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
  const [formData, setFormData] = useState({
    startup_name: '',
    one_line_pitch: '',
    problem_statement: '',
    solution_description: '',
    target_market: '',
    team_description: '',
  });
  const [saving, setSaving] = useState(false);

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        startup_name: profile.startup_name || '',
        one_line_pitch: profile.one_line_pitch || '',
        problem_statement: profile.problem_statement || '',
        solution_description: profile.solution_description || '',
        target_market: profile.target_market || '',
        team_description: profile.team_description || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await saveProfile(formData);
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
    setSelectedFile(null);
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
        description: "Your pitch deck is now being analyzed by our AI. This may take a minute.",
      });

      // Refresh profile to show the new summary
      // You'll need to implement a refetch function for the profile
      window.location.reload(); // Temporary solution

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Profile & Autofill Hub</SheetTitle>
          <SheetDescription>
            Build your comprehensive profile to power intelligent autofill and AI analysis
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="onboarding" className="w-full">
                      <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="onboarding" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="pitch" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Pitch</span>
            </TabsTrigger>
            <TabsTrigger value="pitch-deck" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Pitch Deck</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
          </TabsList>

            {/* Onboarding Tab */}
            <TabsContent value="onboarding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Complete Your Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to Grants Snap!
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Complete your onboarding to unlock personalized grant recommendations, AI-powered insights, and advanced features.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/onboarding'}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Start Onboarding
                    </Button>
                  </div>
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
                        value={formData.startup_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, startup_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="one-line-pitch">One Line Pitch</Label>
                      <Input 
                        id="one-line-pitch" 
                        placeholder="Brief description of your startup"
                        value={formData.one_line_pitch}
                        onChange={(e) => setFormData(prev => ({ ...prev, one_line_pitch: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problem-statement">Problem Statement</Label>
                    <Textarea 
                      id="problem-statement" 
                      placeholder="Describe the problem your startup solves"
                      value={formData.problem_statement}
                      onChange={(e) => setFormData(prev => ({ ...prev, problem_statement: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution-description">Solution Description</Label>
                    <Textarea 
                      id="solution-description" 
                      placeholder="Describe your solution and how it works"
                      value={formData.solution_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, solution_description: e.target.value }))}
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
                    <Label htmlFor="tagline">Company Description (Tagline)</Label>
                    <Input id="tagline" placeholder="One-sentence description (140 chars max)" maxLength={140} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem You Solve</Label>
                    <Textarea id="problem" placeholder="Detailed description of the pain point" rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution">How You Solve It</Label>
                    <Textarea id="solution" placeholder="Detailed description of your product/service" rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uvp">Unique Value Proposition</Label>
                    <Textarea id="uvp" placeholder="What makes you different" rows={3} />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Project Summaries (Autofill Gold)</h4>
                    <div className="space-y-2">
                      <Label htmlFor="elevator-pitch">Elevator Pitch (50 Words)</Label>
                      <Textarea id="elevator-pitch" placeholder="Very short summary" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standard-abstract">Standard Abstract (250 Words)</Label>
                      <Textarea id="standard-abstract" placeholder="Most common length" rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detailed-summary">Detailed Summary (500 Words)</Label>
                      <Textarea id="detailed-summary" placeholder="For in-depth sections" rows={6} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mission-vision">Mission & Vision</Label>
                    <Textarea id="mission-vision" placeholder="Long-term view" rows={3} />
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
                      value={formData.target_market}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_market: e.target.value }))}
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
                      value={formData.team_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, team_description: e.target.value }))}
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
                              <div className="text-xs text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</div>
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
