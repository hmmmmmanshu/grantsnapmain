import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { needsOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have a hash fragment with access token
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Get the current session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            setError('Authentication failed. Please try again.');
            console.error('OAuth callback error:', error);
          } else if (data.session) {
            // Successfully authenticated
            console.log('OAuth authentication successful');
            
            // Clean up the URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Wait a moment for the session to be fully established
            setTimeout(() => {
              // Check if user has profile
              checkUserProfileAndRedirect();
            }, 1000);
          }
        } else {
          // No hash fragment, check if user is already authenticated
          if (user) {
            checkUserProfileAndRedirect();
          } else {
            // No authentication, redirect to login
            navigate('/login', { replace: true });
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('OAuth callback error:', err);
      } finally {
        setLoading(false);
      }
    };

    const checkUserProfileAndRedirect = async () => {
      try {
        if (!user) return;
        
        // Check if user has profile
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        const hasProfile = !error && data;
        
        // Always redirect to dashboard - users can complete onboarding later if needed
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Error checking profile:', err);
        // Default to dashboard if there's an error
        navigate('/dashboard', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback; 