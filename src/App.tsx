
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingFlow from "./components/OnboardingFlow";
import OAuthCallback from "./components/OAuthCallback";
import { useAuth } from './hooks/useAuth';

// Environment variable validation
const validateEnvironment = () => {
  const requiredVars = {
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please create a .env file in your project root with:');
    missingVars.forEach(key => {
      console.error(`${key}=your_value_here`);
    });
    
    // Show a user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fef2f2;
        color: #dc2626;
        padding: 2rem;
        font-family: system-ui, sans-serif;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      ">
        <div>
          <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">🚨 Configuration Error</h1>
          <p style="margin-bottom: 1rem;">Missing required environment variables:</p>
          <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
            ${missingVars.map(key => `<li style="background: #fee2e2; padding: 0.5rem; margin: 0.25rem 0; border-radius: 0.25rem;"><code>${key}</code></li>`).join('')}
          </ul>
          <p style="font-size: 0.875rem; color: #991b1b;">
            Please create a .env file in your project root with these variables.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
    return false;
  }

  console.log('✅ All required environment variables are present');
  return true;
};

// Create the query client outside of the component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AuthRedirector: Redirects authenticated users from /login to /dashboard (but not from /)
function AuthRedirector() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect from /login to /dashboard, not from home page
    if (!loading && user && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location, navigate]);

  return null;
}

const App: React.FC = () => {
  // Validate environment variables on app start
  useEffect(() => {
    validateEnvironment();
  }, []);

  console.log('App component rendering', { 
    React: !!React, 
    QueryClient: !!QueryClient,
    QueryClientProvider: !!QueryClientProvider,
    env: {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthRedirector />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
