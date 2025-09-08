import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_CONFIG } from '@/config/supabase';
import { debugCookieSetup, getAuthStatus, clearAuthCookies } from '@/utils/cookieDebug';
import { testAuthentication, testChromeExtensionAccess } from '@/utils/authTest';

const AuthTest: React.FC = () => {
  const { user, session, loading } = useAuth();
  const [cookieStatus, setCookieStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [authTestResults, setAuthTestResults] = useState<any>(null);

  useEffect(() => {
    // Check cookie status on component mount
    updateCookieStatus();
  }, [session]);

  const updateCookieStatus = () => {
    const status = getAuthStatus();
    setCookieStatus(status);
  };

  const runCookieTests = () => {
    const results: string[] = [];
    
    // Test 1: Domain configuration
    results.push(`Domain Test: Current domain is ${window.location.hostname}`);
    results.push(`Expected cookie domain: ${SUPABASE_CONFIG.cookieDomain}`);
    
    // Test 2: Cookie existence
    const authStatus = getAuthStatus();
    results.push(`Cookie Exists: ${authStatus.hasCookie ? 'YES' : 'NO'}`);
    
    if (authStatus.hasCookie) {
      results.push(`Cookie Name: ${authStatus.cookieName}`);
      results.push(`Cookie Value Length: ${authStatus.cookieValue?.length || 0} characters`);
    }
    
    // Test 3: Session status
    results.push(`Supabase Session: ${session ? 'ACTIVE' : 'NONE'}`);
    results.push(`User Authenticated: ${user ? 'YES' : 'NO'}`);
    
    // Test 4: Chrome Extension compatibility
    results.push('--- Chrome Extension Compatibility ---');
    results.push(`Cookie HttpOnly: Should be FALSE for extension access`);
    results.push(`Cookie SameSite: Should be Lax or None`);
    results.push(`Cookie Secure: Should be TRUE for HTTPS`);
    results.push(`Cookie Domain: Should start with . for subdomain access`);
    
    setTestResults(results);
    
    // Also run the full debug setup
    debugCookieSetup();
  };

  const clearCookies = () => {
    clearAuthCookies();
    updateCookieStatus();
    setTestResults(['All authentication cookies cleared']);
  };

  const runAdvancedAuthTest = async () => {
    const results = await testAuthentication();
    setAuthTestResults(results);
    
    // Also run Chrome Extension access test
    testChromeExtensionAccess();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Chrome Extension Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Authentication Status</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                  <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
                  <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
                  <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Cookie Status</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Cookie Name:</strong> {SUPABASE_CONFIG.cookieName}</p>
                  <p><strong>Expected Domain:</strong> {SUPABASE_CONFIG.cookieDomain}</p>
                  <p><strong>Cookie Exists:</strong> {cookieStatus?.hasCookie ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Current Domain:</strong> {window.location.hostname}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <Button onClick={runCookieTests} variant="default">
                🔍 Run Cookie Tests
              </Button>
              <Button onClick={runAdvancedAuthTest} variant="default">
                🧪 Advanced Auth Test
              </Button>
              <Button onClick={updateCookieStatus} variant="outline">
                🔄 Refresh Status
              </Button>
              <Button onClick={clearCookies} variant="destructive">
                🧹 Clear Cookies
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {testResults.join('\n')}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {authTestResults && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Authentication Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${authTestResults.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-semibold">Overall Status</div>
                    <div>{authTestResults.isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${authTestResults.hasSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-semibold">Session</div>
                    <div>{authTestResults.hasSession ? '✅ ACTIVE' : '❌ NONE'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${authTestResults.hasUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-semibold">User</div>
                    <div>{authTestResults.hasUser ? '✅ FOUND' : '❌ NONE'}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${authTestResults.hasCookies ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="font-semibold">Cookies</div>
                    <div>{authTestResults.hasCookies ? '✅ FOUND' : '❌ NONE'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Client Type: {authTestResults.clientType}</h4>
                  <div className="text-sm space-y-2">
                    <div><strong>Supabase URL:</strong> {authTestResults.details.supabaseUrl || 'Not available'}</div>
                    <div><strong>User ID:</strong> {authTestResults.details.user?.id || 'N/A'}</div>
                    <div><strong>User Email:</strong> {authTestResults.details.user?.email || 'N/A'}</div>
                    <div><strong>Auth Cookies Found:</strong> {authTestResults.details.cookies.length}</div>
                    {authTestResults.details.error && (
                      <div className="text-red-600"><strong>Error:</strong> {authTestResults.details.error.message}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Configuration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Supabase Configuration</h4>
                <p><strong>URL:</strong> {SUPABASE_CONFIG.url}</p>
                <p><strong>Anon Key:</strong> {SUPABASE_CONFIG.anonKey.substring(0, 20)}...</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Cookie Configuration</h4>
                <p><strong>Name:</strong> {SUPABASE_CONFIG.cookieName}</p>
                <p><strong>Domain:</strong> {SUPABASE_CONFIG.cookieDomain}</p>
                <p><strong>Dev Domain:</strong> {SUPABASE_CONFIG.cookieDomainDev}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions for Extension Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Test Authentication Flow</h4>
              <p className="text-sm text-gray-600">
                Log in to the dashboard, then run the cookie tests above. Verify that:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                <li>Authentication session is active</li>
                <li>Cookie exists with correct name: {SUPABASE_CONFIG.cookieName}</li>
                <li>Cookie domain is set to: {SUPABASE_CONFIG.cookieDomain}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Chrome Extension Testing</h4>
              <p className="text-sm text-gray-600">
                From your Chrome Extension, use this code to test cookie access:
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                {`chrome.cookies.get({
  url: 'https://grantsnap.pro',
  name: '${SUPABASE_CONFIG.cookieName}'
}, (cookie) => {
  console.log('Cookie from extension:', cookie);
});`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Troubleshooting</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                <li>Ensure you're logged in to grantsnap.pro first</li>
                <li>Check that cookie domain includes the leading dot (.grantsnap.pro)</li>
                <li>Verify cookie is not HttpOnly (extension can't read HttpOnly cookies)</li>
                <li>Make sure extension has proper permissions in manifest.json</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTest;
