import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, resendVerificationEmail } = useAuth();

  const getErrorMessage = (error: any) => {
    if (!error) return 'An unexpected error occurred';
    
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the verification link to activate your account.';
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.';
      case 'Signup is disabled':
        return 'Sign up is currently disabled. Please contact support.';
      case 'Sign in not allowed for this user':
        return 'This account has been disabled. Please contact support.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error, data } = isSignup 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast.error(getErrorMessage(error));
        
        // Show email verification dialog for unconfirmed users
        if (error.message === 'Email not confirmed') {
          setVerificationEmail(email);
          setShowEmailVerification(true);
        }
              } else {
          if (isSignup && data?.user && !data.user.email_confirmed_at) {
            // User signed up but needs to verify email
            setVerificationEmail(email);
            setShowEmailVerification(true);
            toast.success('Account created! Please check your email to verify your account.');
      } else {
            // User is fully authenticated
        toast.success(isSignup ? 'Account created successfully!' : 'Signed in successfully!');
            // Redirect new users to onboarding, existing users to dashboard
            if (isSignup) {
              navigate('/onboarding');
            } else {
        navigate('/dashboard');
            }
          }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(getErrorMessage(error));
      }
      // Google OAuth will redirect automatically, so no need to navigate
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success('Password reset email sent! Please check your inbox.');
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setVerificationLoading(true);
    try {
      const { error } = await resendVerificationEmail(verificationEmail);
      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success('Verification email sent! Please check your inbox.');
        setShowEmailVerification(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? 'Sign up to get started with your account' 
                : 'Sign in to access your dashboard'
              }
            </CardDescription>
            
            {/* Login/Signup Toggle */}
            <div className="flex items-center justify-center space-x-3">
              <Label htmlFor="auth-mode" className={!isSignup ? "text-primary font-medium" : "text-muted-foreground"}>
                Login
              </Label>
              <Switch
                id="auth-mode"
                checked={isSignup}
                onCheckedChange={setIsSignup}
              />
              <Label htmlFor="auth-mode" className={isSignup ? "text-primary font-medium" : "text-muted-foreground"}>
                Sign Up
              </Label>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-border/50 hover:bg-accent/50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  disabled={loading}
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 font-medium">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            {!isSignup && (
              <div className="text-center">
                <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                  <DialogTrigger asChild>
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  Forgot your password?
                </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          disabled={forgotPasswordLoading}
                        />
                      </div>
                      <Button 
                        onClick={handleForgotPassword} 
                        disabled={forgotPasswordLoading}
                        className="w-full"
                      >
                        {forgotPasswordLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Verification Dialog */}
        <Dialog open={showEmailVerification} onOpenChange={setShowEmailVerification}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-email">Email</Label>
                <Input
                  id="verification-email"
                  type="email"
                  placeholder="Enter your email"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  disabled={verificationLoading}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleResendVerification} 
                  disabled={verificationLoading}
                  className="flex-1"
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Email'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailVerification(false)}
                  disabled={verificationLoading}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Login;