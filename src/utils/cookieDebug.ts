// Cookie debugging utilities for Chrome Extension authentication
import { SUPABASE_CONFIG } from '../config/supabase';

/**
 * Debug function to check cookie accessibility from the web application
 * Call this from browser console on grantsnap.pro to verify cookie setup
 */
export function debugCookieSetup(): void {
  console.log('🍪 Cookie Debug Information');
  console.log('='.repeat(50));
  
  // Check if we're on the correct domain
  console.log('📍 Current domain:', window.location.hostname);
  console.log('📍 Current protocol:', window.location.protocol);
  
  // Get all cookies
  const allCookies = document.cookie.split(';').map(c => c.trim());
  console.log('🍪 All cookies:', allCookies);
  
  // Look for Supabase auth cookies
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.includes('sb-') || cookie.includes('supabase') || cookie.includes('auth')
  );
  console.log('🔐 Supabase-related cookies:', supabaseCookies);
  
  // Check for the specific cookie the extension expects
  const expectedCookie = SUPABASE_CONFIG.cookieName;
  const cookieExists = document.cookie.includes(expectedCookie);
  console.log(`🎯 Expected cookie (${expectedCookie}):`, cookieExists ? '✅ Found' : '❌ Not found');
  
  // Check domain configuration
  console.log('🌐 Extension expects cookie domain:', SUPABASE_CONFIG.cookieDomain);
  
  // Test cookie setting (for debugging)
  console.log('\n🧪 Test Cookie Setting:');
  const testCookieName = 'test-extension-cookie';
  const testValue = 'test-value-' + Date.now();
  
  // Set test cookie with correct domain
  document.cookie = `${testCookieName}=${testValue}; domain=${SUPABASE_CONFIG.cookieDomain}; path=/; secure; samesite=lax`;
  
  // Check if test cookie was set
  const testCookieSet = document.cookie.includes(testCookieName);
  console.log(`Test cookie set: ${testCookieSet ? '✅ Success' : '❌ Failed'}`);
  
  if (testCookieSet) {
    console.log('✅ Cookie domain configuration appears to be working');
  } else {
    console.log('❌ Cookie domain configuration may need adjustment');
  }
  
  // Cleanup test cookie
  document.cookie = `${testCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${SUPABASE_CONFIG.cookieDomain}; path=/;`;
}

/**
 * Function to manually set a properly formatted auth cookie for testing
 * Call this with a valid JWT token to test extension authentication
 */
export function setTestAuthCookie(jwtToken: string): void {
  const cookieName = SUPABASE_CONFIG.cookieName;
  const domain = SUPABASE_CONFIG.cookieDomain;
  
  // Create cookie value in the format Supabase expects
  const cookieValue = JSON.stringify({
    access_token: jwtToken,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'refresh_token_placeholder'
  });
  
  // Set the cookie with proper configuration
  document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; domain=${domain}; path=/; secure; samesite=lax; max-age=${30 * 24 * 60 * 60}`;
  
  console.log('🍪 Test auth cookie set:', cookieName);
  console.log('🌐 Domain:', domain);
  console.log('🔐 Token preview:', jwtToken.substring(0, 20) + '...');
}

/**
 * Function to clear all authentication cookies
 */
export function clearAuthCookies(): void {
  const cookiesToClear = [
    SUPABASE_CONFIG.cookieName,
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'access_token',
    'auth-token'
  ];
  
  cookiesToClear.forEach(cookieName => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear for .grantsnap.pro domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.grantsnap.pro; path=/;`;
    // Clear for grantsnap.pro domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=grantsnap.pro; path=/;`;
  });
  
  console.log('🧹 Auth cookies cleared');
}

/**
 * Function to get current authentication status for extension debugging
 */
export function getAuthStatus(): {
  hasCookie: boolean;
  cookieName: string;
  domain: string;
  cookieValue?: string;
} {
  const cookieName = SUPABASE_CONFIG.cookieName;
  const domain = SUPABASE_CONFIG.cookieDomain;
  
  // Check if cookie exists
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${cookieName}=`)
  );
  
  return {
    hasCookie: !!authCookie,
    cookieName,
    domain,
    cookieValue: authCookie ? authCookie.split('=')[1] : undefined
  };
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).cookieDebug = {
    debugCookieSetup,
    setTestAuthCookie,
    clearAuthCookies,
    getAuthStatus
  };
  
  console.log('🛠️ Cookie debug tools available at window.cookieDebug');
  console.log('Usage:');
  console.log('  window.cookieDebug.debugCookieSetup() - Check cookie configuration');
  console.log('  window.cookieDebug.setTestAuthCookie(token) - Set test auth cookie');
  console.log('  window.cookieDebug.clearAuthCookies() - Clear all auth cookies');
  console.log('  window.cookieDebug.getAuthStatus() - Get current auth status');
}
