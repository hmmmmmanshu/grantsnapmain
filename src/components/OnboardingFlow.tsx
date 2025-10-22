import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('onboarding.currentStep');
    return saved ? parseInt(saved, 10) || 1 : 1;
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
    setValue,
    getValues
  } = useForm<OnboardingData>({
    defaultValues: {
      startup_name: '',
      one_line_pitch: '',
      problem_statement: '',
      solution_description: '',
      target_market: '',
      team_description: '',
    },
    mode: 'onChange'
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Watch all form fields for changes
  const watchedFields = watch();

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Reset form with saved data
        reset(parsedData);
        console.log('✅ Loaded saved onboarding data from localStorage');
      } catch (error) {
        console.error('❌ Failed to parse saved onboarding data:', error);
        localStorage.removeItem('onboardingFormData');
      }
    }
  }, [reset]);

  // Auto-save form data to localStorage whenever form changes
  useEffect(() => {
    const subscription = watch((value) => {
      // Only save if we have some data (not just empty strings)
      const hasData = Object.values(value).some(field => field && field.trim() !== '');
      if (hasData) {
        localStorage.setItem('onboardingFormData', JSON.stringify(value));
        console.log('💾 Auto-saved onboarding data to localStorage');
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      localStorage.setItem('onboarding.currentStep', String(next));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      localStorage.setItem('onboarding.currentStep', String(prev));
    }
  };

  const handleSkip = () => {
    // Clear saved data when skipping
    localStorage.removeItem('onboardingFormData');
    localStorage.removeItem('onboarding.currentStep');
    console.log('🗑️ Cleared onboarding data from localStorage (skip)');
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const formData = getValues();
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Clear saved data from localStorage on successful completion
      localStorage.removeItem('onboardingFormData');
      localStorage.removeItem('onboarding.currentStep');
      console.log('🗑️ Cleared onboarding data from localStorage (completion)');

      toast.success('Profile setup complete! Welcome to GrantSnap.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if current step can proceed
  const canProceed = () => {
    const values = getValues();
    switch (currentStep) {
      case 1:
        return values.startup_name?.trim() && values.one_line_pitch?.trim();
      case 2:
        return values.problem_statement?.trim() && values.solution_description?.trim();
      case 3:
        return values.target_market?.trim();
      default:
        return true;
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
                {...register('startup_name', { required: 'Startup name is required' })}
                className="h-12"
              />
              {errors.startup_name && (
                <p className="text-sm text-red-500">{errors.startup_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="one_line_pitch">One-Line Pitch *</Label>
              <Input
                id="one_line_pitch"
                placeholder="e.g., AI-powered tool that helps small businesses automate customer service"
                {...register('one_line_pitch', { required: 'One-line pitch is required' })}
                className="h-12"
              />
              {errors.one_line_pitch && (
                <p className="text-sm text-red-500">{errors.one_line_pitch.message}</p>
              )}
            </div>
          </div>
        </div>
      ),
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
                {...register('problem_statement', { required: 'Problem statement is required' })}
                className="min-h-[100px]"
              />
              {errors.problem_statement && (
                <p className="text-sm text-red-500">{errors.problem_statement.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution_description">Solution Description *</Label>
              <Textarea
                id="solution_description"
                placeholder="Describe how your solution addresses the problem..."
                {...register('solution_description', { required: 'Solution description is required' })}
                className="min-h-[100px]"
              />
              {errors.solution_description && (
                <p className="text-sm text-red-500">{errors.solution_description.message}</p>
              )}
            </div>
          </div>
        </div>
      ),
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
                {...register('target_market', { required: 'Target market is required' })}
                className="min-h-[100px]"
              />
              {errors.target_market && (
                <p className="text-sm text-red-500">{errors.target_market.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_description">Team Description</Label>
              <Textarea
                id="team_description"
                placeholder="Tell us about your team, experience, and key members..."
                {...register('team_description')}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      ),
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
                <div><strong>Startup:</strong> {watchedFields.startup_name}</div>
                <div><strong>Pitch:</strong> {watchedFields.one_line_pitch}</div>
                <div><strong>Problem:</strong> {watchedFields.problem_statement?.substring(0, 100)}...</div>
                <div><strong>Solution:</strong> {watchedFields.solution_description?.substring(0, 100)}...</div>
                <div><strong>Market:</strong> {watchedFields.target_market?.substring(0, 100)}...</div>
                {watchedFields.team_description && (
                  <div><strong>Team:</strong> {watchedFields.team_description.substring(0, 100)}...</div>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              You can always update this information later in your profile settings.
            </p>
          </div>
        </div>
      ),
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
                    disabled={!canProceed() || loading}
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