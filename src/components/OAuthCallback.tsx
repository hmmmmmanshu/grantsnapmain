import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { broadcastUserAuthenticated } from '@/lib/extensionService';
import { Button } from '@/components/ui/button';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have a hash fragment with access token (implicit flow)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Extract tokens from hash fragment
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              setError('Authentication failed. Please try again.');
              console.log('OAuth callback error:', error);
            } else if (data.session) {
              // Successfully authenticated
              console.log('OAuth authentication successful');
              
              // Clean up the URL immediately
              window.history.replaceState(null, '', window.location.pathname);
              
              // 🚀 PHASE 1 IMPLEMENTATION: Broadcast to extension
              try {
                await broadcastUserAuthenticated(data.user, data.session);
                console.log('✅ Authentication broadcasted to extension successfully');
              } catch (broadcastError) {
                console.log('⚠️ Extension broadcast failed (non-critical):', broadcastError.message);
              }
              
              // Redirect to dashboard immediately
              navigate('/dashboard', { replace: true });
            }
          } else {
            setError('Invalid OAuth response. Please try again.');
          }
        } else {
          // Check if user is already authenticated
          if (user) {
            // 🚀 PHASE 1 IMPLEMENTATION: Broadcast existing session to extension
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                await broadcastUserAuthenticated(user, session);
                console.log('✅ Existing session broadcasted to extension');
              }
            } catch (broadcastError) {
              console.log('⚠️ Extension broadcast failed (non-critical):', broadcastError.message);
            }
            
            // Redirect to dashboard immediately
            navigate('/dashboard', { replace: true });
          } else {
            // No authentication, redirect to login
            navigate('/login', { replace: true });
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.log('OAuth callback error:', err);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h2>
          <p className="text-gray-600">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Back to Login
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback; 