import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  Target,
  X,
  RefreshCw,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AIContextSummary {
  executive_summary: string;
  key_strengths: string[];
  funding_readiness: string;
  recommended_actions: string[];
  profile_completeness: string;
  ai_insights: string;
}

const VirtualCFO = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [contextSummary, setContextSummary] = useState<AIContextSummary | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [contextLastUpdated, setContextLastUpdated] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pitchDeckAnalyzed, setPitchDeckAnalyzed] = useState(false);

  // Load AI context on component mount
  useEffect(() => {
    if (isOpen && user) {
      loadAIContext();
    }
  }, [isOpen, user]);

  const loadAIContext = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('ai_context_summary, context_last_updated, pitch_deck_summary')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile?.ai_context_summary) {
        try {
          const parsed = typeof profile.ai_context_summary === 'string' 
            ? JSON.parse(profile.ai_context_summary)
            : profile.ai_context_summary;
          setContextSummary(parsed);
        } catch (e) {
          console.error('Error parsing AI context:', e);
        }
      }

      setContextLastUpdated(profile?.context_last_updated || null);
      setPitchDeckAnalyzed(!!profile?.pitch_deck_summary);
    } catch (error) {
      console.error('Error loading AI context:', error);
    }
  };

  const handleUpdateContext = async () => {
    if (!user) return;

    setIsLoadingContext(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-user-context', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Context Updated",
        description: "Your AI insights have been refreshed successfully!",
      });

      // Reload the context
      await loadAIContext();
    } catch (error: any) {
      console.error('Error updating context:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update AI context",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handlePitchDeckUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-pitch-deck-${Date.now()}.${fileExt}`;
      const filePath = `pitch-decks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Call analyze-pitch-deck Edge Function
      const { data, error: analyzeError } = await supabase.functions.invoke('analyze-pitch-deck', {
        body: {
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (analyzeError) throw analyzeError;

      toast({
        title: "Pitch Deck Analyzed! 🎉",
        description: "Your pitch deck has been analyzed and added to your AI context.",
      });

      setSelectedFile(null);
      setPitchDeckAnalyzed(true);
      
      // Trigger vectorization for RAG (async, don't block UI)
      supabase.functions
        .invoke('vectorize-pitch-deck', {
          body: { user_id: user.id },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Pitch deck vectorization failed:', error);
          } else {
            console.log('Pitch deck vectorized for RAG:', data);
            toast({
              title: "RAG Ready! 🚀",
              description: "Your pitch deck is now optimized for AI-powered grant autofill.",
            });
          }
        })
        .catch((err) => console.error('Vectorization error:', err));
      
      // Refresh AI context
      await handleUpdateContext();
    } catch (error: any) {
      console.error('Error uploading pitch deck:', error);
      setUploadError(error.message || 'Failed to upload pitch deck');
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to analyze pitch deck",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 text-purple-700 hover:text-purple-800"
            onClick={() => setIsOpen(true)}
          >
            <Bot className="w-4 h-4 mr-2" />
            Your Virtual CFO
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:max-w-3xl p-0 overflow-y-auto">
          <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-semibold">Virtual CFO - AI Insights</SheetTitle>
                  <SheetDescription>
                    AI-generated analysis of your startup profile
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Pitch Deck Upload Section */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="w-5 h-5" />
                  Pitch Deck Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pitchDeckAnalyzed ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Pitch Deck Analyzed ✅</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Your pitch deck has been analyzed and is included in your AI insights below.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">No Pitch Deck Analyzed</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Upload your pitch deck to enhance your AI insights with deeper business context.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="pitch-deck-file">Upload New Pitch Deck</Label>
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
                  
                  <Button 
                    onClick={handlePitchDeckUpload} 
                    disabled={!selectedFile || uploading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Analyze Pitch Deck
                      </>
                    )}
                  </Button>
                  
                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-red-800 text-sm">{uploadError}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Context Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI-Generated Insights
                  </CardTitle>
                  <Button
                    onClick={handleUpdateContext}
                    disabled={isLoadingContext}
                    size="sm"
                    variant="outline"
                  >
                    {isLoadingContext ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Context
                      </>
                    )}
                  </Button>
                </div>
                {contextLastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(contextLastUpdated).toLocaleString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {contextSummary ? (
                  <>
                    {/* Executive Summary */}
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5" />
                        Executive Summary
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{contextSummary.executive_summary}</p>
                    </div>

                    {/* Key Strengths */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Key Strengths
                      </h3>
                      <ul className="space-y-2">
                        {contextSummary.key_strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-600 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Funding Readiness */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        💰 Funding Readiness
                      </h3>
                      <p className="text-gray-700">{contextSummary.funding_readiness}</p>
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">
                        📋 Recommended Actions
                      </h3>
                      <ul className="space-y-2">
                        {contextSummary.recommended_actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-orange-500 font-bold">{index + 1}.</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Profile Completeness */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        📊 Profile Completeness
                      </h3>
                      <p className="text-gray-700">{contextSummary.profile_completeness}</p>
                    </div>

                    {/* AI Insights */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5" />
                        AI Insights
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{contextSummary.ai_insights}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Context Generated Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Complete your profile and click "Update Context" to generate AI-powered insights about your startup.
                    </p>
                    <Button 
                      onClick={handleUpdateContext} 
                      disabled={isLoadingContext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isLoadingContext ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Insights...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Generate AI Insights
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default VirtualCFO;
