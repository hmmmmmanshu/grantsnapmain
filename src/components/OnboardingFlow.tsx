import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  startup_name: string;
  one_line_pitch: string;
  problem_statement: string;
  solution_description: string;
  target_market: string;
  team_description: string;
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    startup_name: '',
    one_line_pitch: '',
    problem_statement: '',
    solution_description: '',
    target_market: '',
    team_description: '',
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      toast.success('Profile setup complete! Welcome to GrantSnap.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Welcome to GrantSnap!",
      description: "Let's get to know your startup better to personalize your experience.",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Account Created Successfully!</h3>
            <p className="text-muted-foreground">
              Your account has been created and verified. Now let's set up your startup profile 
              to help us find the best funding opportunities for you.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startup_name">Startup Name *</Label>
              <Input
                id="startup_name"
                placeholder="Enter your startup name"
                value={data.startup_name}
                onChange={(e) => updateData('startup_name', e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="one_line_pitch">One-Line Pitch *</Label>
              <Input
                id="one_line_pitch"
                placeholder="e.g., AI-powered tool that helps small businesses automate customer service"
                value={data.one_line_pitch}
                onChange={(e) => updateData('one_line_pitch', e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        </div>
      ),
      canProceed: () => data.startup_name.trim() && data.one_line_pitch.trim(),
    },
    {
      title: "Problem & Solution",
      description: "Tell us about the problem you're solving and your solution.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="problem_statement">Problem Statement *</Label>
              <Textarea
                id="problem_statement"
                placeholder="Describe the problem your startup is solving..."
                value={data.problem_statement}
                onChange={(e) => updateData('problem_statement', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution_description">Solution Description *</Label>
              <Textarea
                id="solution_description"
                placeholder="Describe how your solution addresses the problem..."
                value={data.solution_description}
                onChange={(e) => updateData('solution_description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      ),
      canProceed: () => data.problem_statement.trim() && data.solution_description.trim(),
    },
    {
      title: "Market & Team",
      description: "Help us understand your target market and team.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target_market">Target Market *</Label>
              <Textarea
                id="target_market"
                placeholder="Describe your target market, customers, and market size..."
                value={data.target_market}
                onChange={(e) => updateData('target_market', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_description">Team Description</Label>
              <Textarea
                id="team_description"
                placeholder="Tell us about your team, experience, and key members..."
                value={data.team_description}
                onChange={(e) => updateData('team_description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      ),
      canProceed: () => data.target_market.trim(),
    },
    {
      title: "You're All Set!",
      description: "Review your information and complete your profile setup.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Profile Summary</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Startup:</strong> {data.startup_name}</div>
                <div><strong>Pitch:</strong> {data.one_line_pitch}</div>
                <div><strong>Problem:</strong> {data.problem_statement.substring(0, 100)}...</div>
                <div><strong>Solution:</strong> {data.solution_description.substring(0, 100)}...</div>
                <div><strong>Market:</strong> {data.target_market.substring(0, 100)}...</div>
                {data.team_description && (
                  <div><strong>Team:</strong> {data.team_description.substring(0, 100)}...</div>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              You can always update this information later in your profile settings.
            </p>
          </div>
        </div>
      ),
      canProceed: () => true,
    },
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {currentStepData.title}
              </CardTitle>
              <CardDescription>
                {currentStepData.description}
              </CardDescription>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    disabled={!currentStepData.canProceed() || loading}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow; 