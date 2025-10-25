/**
 * LocalStorage Cleanup Utility
 * Fixes corrupted AI context data stored in localStorage
 */

export function cleanupCorruptedAIContext() {
  try {
    // Get the profileHub persisted state
    const persistedState = localStorage.getItem('profileHub.formData');
    
    if (persistedState) {
      const data = JSON.parse(persistedState);
      
      // Check if ai_context_summary exists and is a string (JSON)
      if (data.ai_context_summary && typeof data.ai_context_summary === 'string') {
        try {
          const aiContext = JSON.parse(data.ai_context_summary);
          
          // Normalize the AI context to ensure arrays are arrays
          const normalized = {
            executive_summary: aiContext.executive_summary || '',
            key_strengths: Array.isArray(aiContext.key_strengths) ? aiContext.key_strengths : [],
            funding_readiness: aiContext.funding_readiness || '',
            recommended_actions: Array.isArray(aiContext.recommended_actions) ? aiContext.recommended_actions : [],
            profile_completeness: aiContext.profile_completeness || '',
            ai_insights: aiContext.ai_insights || ''
          };
          
          // Update the data with normalized version
          data.ai_context_summary = JSON.stringify(normalized);
          localStorage.setItem('profileHub.formData', JSON.stringify(data));
          
          console.log('✅ Cleaned up corrupted AI context data in localStorage');
          return true;
        } catch (parseError) {
          console.log('⚠️ Failed to parse AI context, removing it');
          delete data.ai_context_summary;
          localStorage.setItem('profileHub.formData', JSON.stringify(data));
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to cleanup localStorage:', error);
    return false;
  }
}

/**
 * Clear all ProfileHub localStorage data
 * Use this as a nuclear option to reset everything
 */
export function clearProfileHubStorage() {
  try {
    const keys = Object.keys(localStorage);
    const profileHubKeys = keys.filter(key => key.startsWith('profileHub'));
    
    profileHubKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`✅ Cleared ${profileHubKeys.length} ProfileHub localStorage items`);
    return true;
  } catch (error) {
    console.error('Failed to clear ProfileHub storage:', error);
    return false;
  }
}

/**
 * Run cleanup on app initialization
 */
export function initializeLocalStorageCleanup() {
  // Check if we've already run cleanup
  const cleanupVersion = localStorage.getItem('cleanup.version');
  const currentVersion = '1.0.0'; // Increment this when you need to run cleanup again
  
  if (cleanupVersion !== currentVersion) {
    console.log('🧹 Running localStorage cleanup...');
    cleanupCorruptedAIContext();
    localStorage.setItem('cleanup.version', currentVersion);
    console.log('✅ localStorage cleanup complete');
  }
}


