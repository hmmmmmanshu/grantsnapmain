// Chrome Extension Supabase Configuration
export const SUPABASE_CONFIG = {
  // Your actual Supabase project URL
  url: 'https://uurdubbsamdawncqkaoy.supabase.co',
  
  // Your actual anon key  
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cmR1YmJzYW1kYXduY3FrYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDA2OTcsImV4cCI6MjA2ODYxNjY5N30.beDN_mt87tjlWC8j2t-JWeQRShfbdvxe3_nEBp51pXg',
  
  // Cookie name that matches your web app's authentication cookie
  // Updated to match Supabase's default cookie naming convention
  cookieName: 'sb-uurdubbsamdawncqkaoy-auth-token',
  
  // Domain should match your web application (with leading dot for Chrome Extension access)
  cookieDomain: '.grantsnap.pro',
  
  // Alternative domains for development
  cookieDomainDev: 'localhost',
} as const;

// Validation function to check if configuration is complete
export function validateSupabaseConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('your-actual-project-ref')) {
    errors.push('Supabase URL not configured');
  }
  
  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('your-actual-anon-key')) {
    errors.push('Supabase anon key not configured');
  }
  
  // Validate URL format
  try {
    new URL(SUPABASE_CONFIG.url);
  } catch {
    errors.push('Invalid Supabase URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Log configuration status
export function logConfigurationStatus(): void {
  const validation = validateSupabaseConfig();
  
  if (validation.isValid) {
    console.log('✅ Supabase configuration is valid');
    console.log('📡 Project URL:', SUPABASE_CONFIG.url);
    console.log('🔑 Anon key configured');
    console.log('🍪 Cookie domain:', SUPABASE_CONFIG.cookieDomain);
  } else {
    console.error('❌ Supabase configuration errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
}

// Edge Functions endpoints
export const EDGE_FUNCTIONS = {
  getUserData: 'get-user-data',
  saveGrant: 'save-grant', // Already exists
  generateAnswer: 'generate-answer',
  getUsageStats: 'get-usage-stats',
  updateGrant: 'update-grant', // Already exists
  triggerDeepScan: 'trigger-deep-scan', // Already exists
  refineAiAnswer: 'refine-ai-answer', // Already exists
} as const;

export type EdgeFunctionName = keyof typeof EDGE_FUNCTIONS;
