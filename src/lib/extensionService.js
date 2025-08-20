/**
 * Extension Service - Centralized communication hub for Chrome extension
 * 
 * This utility provides a reliable way to send commands from the web dashboard
 * to the Grants Snap Chrome extension, with proper error handling for
 * cases where the extension isn't installed or is disabled.
 */

// Extension ID for Grants Snap Chrome extension
const EXTENSION_ID = 'hkkpgceneddimfjmjmenejbcfokphalk';

/**
 * Sends a command message to the Chrome extension
 * 
 * @param {Object} messageObject - The message object to send to the extension
 * @returns {Promise<Object>} Promise that resolves with the extension's response or rejects with an error
 */
export async function sendCommandToExtension(messageObject) {
  return new Promise((resolve, reject) => {
    // Check if Chrome runtime API is available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      reject(new Error('Chrome runtime API not available. This function only works in Chrome browsers.'));
      return;
    }

    // Validate message object
    if (!messageObject || typeof messageObject !== 'object') {
      reject(new Error('Invalid message object. Must be a non-null object.'));
      return;
    }

    // Add timestamp to message for tracking
    const messageWithTimestamp = {
      ...messageObject,
      timestamp: new Date().toISOString(),
      source: 'grantsnap-dashboard'
    };

    try {
      // Send message to extension
      chrome.runtime.sendMessage(EXTENSION_ID, messageWithTimestamp, (response) => {
        // Check for runtime errors (extension not installed, disabled, etc.)
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          
          // Handle specific error cases
          if (error.message.includes('Could not establish connection')) {
            reject(new Error('Extension not installed or disabled. Please install the Grants Snap extension.'));
          } else if (error.message.includes('Receiving end does not exist')) {
            reject(new Error('Extension is not responding. Please refresh the page and try again.'));
          } else {
            reject(new Error(`Extension communication error: ${error.message}`));
          }
          return;
        }

        // Check if we got a valid response
        if (response === undefined) {
          reject(new Error('Extension did not respond to message.'));
          return;
        }

        // Success - resolve with the response
        resolve(response);
      });
    } catch (error) {
      // Handle any synchronous errors
      reject(new Error(`Failed to send message to extension: ${error.message}`));
    }
  });
}

/**
 * Broadcasts authentication status to the extension
 * This is the core function for Phase 1 implementation
 * 
 * @param {Object} authData - Authentication data to broadcast
 * @param {Object} authData.user - User object from Supabase
 * @param {Object} authData.session - Session object with tokens
 * @param {string} authData.action - Action type (e.g., 'USER_AUTHENTICATED', 'USER_LOGOUT')
 * @returns {Promise<Object>} Promise that resolves with the broadcast result
 */
export async function broadcastAuthenticationToExtension(authData) {
  try {
    // Prepare the authentication message
    const authMessage = {
      action: authData.action || 'USER_AUTHENTICATED',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        created_at: authData.user?.created_at,
        updated_at: authData.user?.updated_at
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at
      },
      timestamp: new Date().toISOString(),
      source: 'grantsnap-dashboard'
    };

    // Send to extension via Chrome API
    const response = await sendCommandToExtension(authMessage);
    console.log('✅ Extension received auth update:', response);
    return response;

  } catch (error) {
    console.log('⚠️ Extension auth broadcast failed:', error.message);
    
    // Fallback: Use window.postMessage for broader compatibility
    try {
      window.postMessage({
        source: 'grantsnap-dashboard',
        action: authData.action || 'USER_AUTHENTICATED',
        data: authData,
        timestamp: new Date().toISOString()
      }, '*');
      console.log('✅ Auth broadcast sent via postMessage fallback');
    } catch (postMessageError) {
      console.error('❌ Both extension messaging and postMessage failed:', postMessageError);
    }
    
    throw error;
  }
}

/**
 * Broadcasts user authentication success to extension
 * Call this immediately after successful OAuth login
 * 
 * @param {Object} user - Supabase user object
 * @param {Object} session - Supabase session object
 * @returns {Promise<Object>} Promise that resolves with the broadcast result
 */
export async function broadcastUserAuthenticated(user, session) {
  return broadcastAuthenticationToExtension({
    action: 'USER_AUTHENTICATED',
    user: user,
    session: session
  });
}

/**
 * Broadcasts user logout to extension
 * Call this when user logs out
 * 
 * @param {Object} user - Supabase user object (can be null)
 * @returns {Promise<Object>} Promise that resolves with the broadcast result
 */
export async function broadcastUserLogout(user = null) {
  return broadcastAuthenticationToExtension({
    action: 'USER_LOGOUT',
    user: user,
    session: null
  });
}

/**
 * Broadcasts user profile update to extension
 * Call this when user profile data changes
 * 
 * @param {Object} user - Supabase user object
 * @param {Object} profile - User profile data
 * @returns {Promise<Object>} Promise that resolves with the broadcast result
 */
export async function broadcastProfileUpdate(user, profile) {
  return sendCommandToExtension({
    action: 'PROFILE_UPDATED',
    user: {
      id: user.id,
      email: user.email
    },
    profile: profile,
    timestamp: new Date().toISOString(),
    source: 'grantsnap-dashboard'
  });
}

/**
 * Checks if the Chrome extension is installed and available
 * 
 * @returns {Promise<boolean>} Promise that resolves to true if extension is available, false otherwise
 */
export async function isExtensionAvailable() {
  try {
    await sendCommandToExtension({ type: 'ping', data: 'availability-check' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the extension installation URL for Chrome Web Store
 * 
 * @returns {string} Chrome Web Store URL for the extension
 */
export function getExtensionInstallUrl() {
  return `https://chrome.google.com/webstore/detail/grants-snap/${EXTENSION_ID}`;
}

/**
 * Prompts user to install the extension if not available
 * 
 * @param {string} [customMessage] - Custom message to show to user
 */
export function promptExtensionInstallation(customMessage) {
  const message = customMessage || 'The Grants Snap extension is required for this feature. Please install it to continue.';
  
  if (confirm(message + '\n\nWould you like to install the extension now?')) {
    window.open(getExtensionInstallUrl(), '_blank');
  }
}

/**
 * Sends a grant capture command to the extension
 * 
 * @param {Object} grantData - Grant information to capture
 * @param {string} grantData.name - Name of the grant
 * @param {string} grantData.url - URL of the grant page
 * @param {string} [grantData.notes] - Optional notes about the grant
 * @returns {Promise<Object>} Promise that resolves with the capture result
 */
export async function captureGrant(grantData) {
  return sendCommandToExtension({
    type: 'capture-grant',
    data: grantData
  });
}

/**
 * Sends an AI analysis request to the extension
 * 
 * @param {Object} analysisData - Data for AI analysis
 * @param {string} analysisData.url - URL to analyze
 * @param {string} [analysisData.focus] - Specific focus area for analysis
 * @returns {Promise<Object>} Promise that resolves with the analysis result
 */
export async function requestAIAnalysis(analysisData) {
  return sendCommandToExtension({
    type: 'ai-analysis',
    data: analysisData
  });
}

/**
 * Sends a profile sync command to the extension
 * 
 * @param {Object} profileData - User profile data to sync
 * @returns {Promise<Object>} Promise that resolves with the sync result
 */
export async function syncProfile(profileData) {
  return sendCommandToExtension({
    type: 'sync-profile',
    data: profileData
  });
}

/**
 * Sends a notification preference update to the extension
 * 
 * @param {Object} notificationData - Notification preferences
 * @returns {Promise<Object>} Promise that resolves with the update result
 */
export async function updateNotificationPreferences(notificationData) {
  return sendCommandToExtension({
    type: 'update-notifications',
    data: notificationData
  });
}

/**
 * Utility function to handle extension communication errors gracefully
 * 
 * @param {Error} error - The error from extension communication
 * @param {Function} onExtensionMissing - Callback when extension is not available
 * @param {Function} onOtherError - Callback for other types of errors
 */
export function handleExtensionError(error, onExtensionMissing, onOtherError) {
  if (error.message.includes('Extension not installed') || 
      error.message.includes('Extension is not responding')) {
    if (onExtensionMissing) {
      onExtensionMissing(error);
    }
  } else {
    if (onOtherError) {
      onOtherError(error);
    }
  }
}
