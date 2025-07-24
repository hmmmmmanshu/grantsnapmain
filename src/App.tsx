
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingFlow from "./components/OnboardingFlow";
import OAuthCallback from "./components/OAuthCallback";
import { useAuth } from './hooks/useAuth';

// Create the query client outside of the component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AuthRedirector: Redirects authenticated users from / or /login to /dashboard
function AuthRedirector() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && (location.pathname === '/' || location.pathname === '/login')) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location, navigate]);

  return null;
}

const App: React.FC = () => {
  console.log('App component rendering', { 
    React: !!React, 
    QueryClient: !!QueryClient,
    QueryClientProvider: !!QueryClientProvider 
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
              <ProtectedRoute requireOnboarding={true}>
                <Dashboard />
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
