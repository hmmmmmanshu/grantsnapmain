// Authentication test utilities for debugging
import { supabase } from '@/lib/supabase';

/**
 * Test authentication status and provide detailed debugging information
 */
export async function testAuthentication(): Promise<{
  isAuthenticated: boolean;
  hasSession: boolean;
  hasUser: boolean;
  hasCookies: boolean;
  clientType: 'real' | 'mock';
  details: any;
}> {
  console.log('🧪 Running Authentication Test...');
  
  // Check if we have a real Supabase client
  const clientType = supabase?.auth?.getSession ? 'real' : 'mock';
  console.log('🔍 Client type:', clientType);
  
  // Test session
  let sessionResult;
  try {
    sessionResult = await supabase.auth.getSession();
  } catch (error) {
    console.error('❌ Error getting session:', error);
    sessionResult = { data: { session: null }, error };
  }
  
  const hasSession = !!sessionResult.data?.session;
  const hasUser = !!sessionResult.data?.session?.user;
  
  // Test cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  const authCookies = cookies.filter(cookie => 
    cookie.includes('sb-') || cookie.includes('supabase') || cookie.includes('auth')
  );
  const hasCookies = authCookies.length > 0;
  
  // Test user info
  let userResult;
  try {
    userResult = await supabase.auth.getUser();
  } catch (error) {
    console.error('❌ Error getting user:', error);
    userResult = { data: { user: null }, error };
  }
  
  const isAuthenticated = hasSession && hasUser && hasCookies;
  
  const result = {
    isAuthenticated,
    hasSession,
    hasUser,
    hasCookies,
    clientType,
    details: {
      session: sessionResult.data?.session,
      user: userResult.data?.user,
      cookies: authCookies,
      allCookies: cookies,
      supabaseUrl: supabase?.supabaseUrl,
      error: sessionResult.error || userResult.error
    }
  };
  
  console.log('🧪 Authentication Test Results:', result);
  
  return result;
}

/**
 * Test Chrome Extension cookie access simulation
 */
export function testChromeExtensionAccess(): void {
  console.log('🧪 Testing Chrome Extension Cookie Access...');
  
  // Simulate what the Chrome Extension would see
  const cookies = document.cookie.split(';').map(c => c.trim());
  const supabaseCookies = cookies.filter(cookie => 
    cookie.includes('sb-uurdubbsamdawncqkaoy-auth-token')
  );
  
  console.log('🍪 All cookies:', cookies);
  console.log('🔐 Supabase auth cookies:', supabaseCookies);
  
  if (supabaseCookies.length > 0) {
    console.log('✅ Chrome Extension would be able to authenticate');
    supabaseCookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      console.log(`  ${name}: ${value.substring(0, 50)}...`);
    });
  } else {
    console.log('❌ Chrome Extension would NOT be able to authenticate');
    console.log('🔧 Expected cookie: sb-uurdubbsamdawncqkaoy-auth-token');
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).authTest = {
    testAuthentication,
    testChromeExtensionAccess
  };
  
  console.log('🛠️ Auth test tools available at window.authTest');
  console.log('Usage:');
  console.log('  window.authTest.testAuthentication() - Test full auth status');
  console.log('  window.authTest.testChromeExtensionAccess() - Test extension access');
}
