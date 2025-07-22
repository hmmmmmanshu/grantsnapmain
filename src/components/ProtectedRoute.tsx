import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean; // If true, redirect to onboarding if not completed
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOnboarding = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();

  // Show loading while checking auth and onboarding status
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding is required and user hasn't completed it, redirect to onboarding
  if (requireOnboarding && needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 