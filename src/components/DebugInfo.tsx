import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTrackedGrants } from '@/hooks/useTrackedGrants';

const DebugInfo: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasProfile, loading: onboardingLoading, needsOnboarding } = useOnboarding();
  const { grants, loading: grantsLoading } = useTrackedGrants();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>User ID: {user?.id || 'None'}</div>
        <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
        <div>Has Profile: {hasProfile ? 'Yes' : 'No'}</div>
        <div>Onboarding Loading: {onboardingLoading ? 'Yes' : 'No'}</div>
        <div>Needs Onboarding: {needsOnboarding ? 'Yes' : 'No'}</div>
        <div>Tracked Grants: {grants.length}</div>
        <div>Grants Loading: {grantsLoading ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default DebugInfo; 