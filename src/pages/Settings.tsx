import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, CreditCard, User, Shield, Bell } from 'lucide-react';
import BillingSection from '@/components/dashboard/BillingSection';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and billing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile & Account
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security & Privacy
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Billing & Subscription
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <BillingSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
