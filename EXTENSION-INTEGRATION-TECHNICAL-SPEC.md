# GrantSnap Extension Integration - Technical Specification

## 🎯 **Project Overview**
This document outlines the technical requirements for integrating the GrantSnap Chrome extension with the GrantSnap dashboard web application. The integration enables seamless two-way communication between the extension and dashboard for authentication, data capture, and user experience enhancement.

## 🏗️ **Architecture Overview**

### **System Components**
1. **GrantSnap Dashboard** (React + Supabase)
2. **GrantSnap Chrome Extension** (Manifest V3)
3. **Supabase Backend** (Auth, Database, Edge Functions)
4. **Communication Bridge** (Chrome Extension APIs + HTTP)

### **Integration Pattern**
```
Dashboard ↔ Chrome Extension ↔ Supabase Backend
    ↓              ↓              ↓
  React UI    Background Script  Edge Functions
  Auth State   Content Script    Database
  User Profile Popup UI         Storage
```

## 🔐 **Phase 1: Authentication Integration**

### **1.1 Authentication Broadcasting (Dashboard → Extension)**

#### **Implementation Details**
The dashboard automatically broadcasts authentication events to the extension using Chrome's `chrome.runtime.sendMessage` API.

#### **Message Format**
```typescript
interface AuthMessage {
  action: 'USER_AUTHENTICATED' | 'USER_LOGOUT' | 'PROFILE_UPDATED';
  user: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
  timestamp: string;
  source: 'grantsnap-dashboard';
}
```

#### **When Messages Are Sent**
1. **OAuth Login Success**: After Google OAuth callback completes
2. **Email/Password Login**: After successful authentication
3. **Dashboard Load**: When user visits dashboard with existing session
4. **Profile Updates**: When user profile data changes

#### **Dashboard Code Location**
- **OAuth Callback**: `src/components/OAuthCallback.tsx`
- **Login Component**: `src/pages/Login.tsx`
- **Dashboard**: `src/pages/Dashboard.tsx`
- **Extension Service**: `src/lib/extensionService.js`

### **1.2 Extension Message Handling**

#### **Required Background Script Implementation**
```javascript
// background.js
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log('Received message from dashboard:', request);
    
    switch (request.action) {
      case 'USER_AUTHENTICATED':
        handleUserAuthenticated(request);
        sendResponse({ success: true, action: 'auth_received' });
        break;
        
      case 'USER_LOGOUT':
        handleUserLogout(request);
        sendResponse({ success: true, action: 'logout_received' });
        break;
        
      case 'PROFILE_UPDATED':
        handleProfileUpdate(request);
        sendResponse({ success: true, action: 'profile_received' });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
  }
);

function handleUserAuthenticated(authMessage) {
  // Store user data and tokens
  localStorage.setItem('user_id', authMessage.user.id);
  localStorage.setItem('user_email', authMessage.user.email);
  localStorage.setItem('access_token', authMessage.session.access_token);
  localStorage.setItem('refresh_token', authMessage.session.refresh_token);
  localStorage.setItem('token_expires_at', authMessage.session.expires_at);
  
  // Update extension UI
  updateExtensionStatus('connected', authMessage.user);
  
  // Notify content scripts
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'AUTH_STATUS_CHANGED',
        authenticated: true,
        user: authMessage.user
      }).catch(() => {}); // Ignore errors for inactive tabs
    });
  });
}

function handleUserLogout(authMessage) {
  // Clear stored data
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expires_at');
  
  // Update extension UI
  updateExtensionStatus('disconnected');
  
  // Notify content scripts
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'AUTH_STATUS_CHANGED',
        authenticated: false,
        user: null
      }).catch(() => {});
    });
  });
}
```

### **1.3 Auth Status Endpoint (Extension → Dashboard)**

#### **Endpoint Details**
```
GET /functions/v1/auth-status
Authorization: Bearer <JWT_TOKEN>
```

#### **Purpose**
- Verify authentication status
- Get current user profile
- Refresh tokens if needed
- Fallback mechanism for authentication

#### **Response Format**
```typescript
interface AuthStatusResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    email_confirmed_at: string;
    created_at: string;
    updated_at: string;
  };
  profile: {
    id: string;
    organization_name: string;
    mission_statement: string;
    pitch_deck_summary: string;
    created_at: string;
    updated_at: string;
  } | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  } | null;
  last_updated: string;
  source: 'grantsnap-auth-status-endpoint';
}
```

#### **Extension Implementation**
```javascript
// Extension utility function
async function checkAuthStatus() {
  try {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      updateExtensionStatus('disconnected');
      return;
    }
    
    const response = await fetch('https://uurdubbsamdawncqkaoy.supabase.co/functions/v1/auth-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const authStatus = await response.json();
      
      if (authStatus.authenticated) {
        // Update stored tokens
        localStorage.setItem('access_token', authStatus.session.access_token);
        localStorage.setItem('refresh_token', authStatus.session.refresh_token);
        localStorage.setItem('token_expires_at', authStatus.session.expires_at);
        
        // Update extension UI
        updateExtensionStatus('connected', authStatus.user);
        
        // Store profile data for AI context
        if (authStatus.profile) {
          localStorage.setItem('user_profile', JSON.stringify(authStatus.profile));
        }
      } else {
        updateExtensionStatus('disconnected');
      }
    } else {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      updateExtensionStatus('disconnected');
    }
  } catch (error) {
    console.error('Auth status check failed:', error);
    updateExtensionStatus('error');
  }
}
```

## 📡 **Phase 2: Data Communication**

### **2.1 Dashboard → Extension Commands**

#### **Available Commands**
```typescript
// Open URL in new tab
{
  action: 'open_url',
  url: string
}

// Test extension connectivity
{
  action: 'test_message',
  data: string
}

// Get extension status
{
  action: 'get_status'
}

// Capture grant data
{
  action: 'capture_grant',
  data: {
    name: string;
    url: string;
    notes?: string;
  }
}
```

#### **Extension Response Format**
```typescript
interface ExtensionResponse {
  success: boolean;
  action: string;
  data?: any;
  error?: string;
}
```

### **2.2 Extension → Dashboard Data**

#### **Grant Capture Endpoint**
```
POST /functions/v1/save-grant
Authorization: Bearer <JWT_TOKEN>
```

#### **Data Format**
```typescript
interface GrantData {
  url: string;
  title: string;
  description: string;
  deadline?: string;
  amount?: string;
  eligibility?: string;
  user_id: string; // From JWT token
}
```

## 🎨 **Phase 3: UI Integration**

### **3.1 Extension Status Indicators**

#### **Status Types**
- **Connected**: Green indicator, user authenticated
- **Disconnected**: Red indicator, extension not installed
- **Error**: Yellow indicator, communication issues
- **Checking**: Gray indicator, verifying status

#### **UI Updates**
```javascript
function updateExtensionStatus(status, user = null) {
  // Update extension popup
  if (chrome.action && chrome.action.setBadgeText) {
    switch (status) {
      case 'connected':
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
        break;
      case 'disconnected':
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
        break;
      case 'error':
        chrome.action.setBadgeText({ text: '?' });
        chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
        break;
      default:
        chrome.action.setBadgeText({ text: '' });
    }
  }
  
  // Update popup content
  chrome.runtime.sendMessage({
    action: 'UPDATE_UI_STATUS',
    status: status,
    user: user
  });
}
```

### **3.2 Content Script Integration**

#### **Message Handling**
```javascript
// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'AUTH_STATUS_CHANGED':
      handleAuthStatusChange(request);
      break;
      
    case 'CAPTURE_GRANT':
      captureCurrentPageGrant();
      break;
  }
});

function handleAuthStatusChange(request) {
  if (request.authenticated) {
    // Show authenticated UI elements
    showGrantCaptureButton();
    showUserInfo(request.user);
  } else {
    // Hide authenticated UI elements
    hideGrantCaptureButton();
    hideUserInfo();
  }
}
```

## 🔧 **Technical Requirements**

### **3.1 Extension Manifest**
```json
{
  "manifest_version": 3,
  "name": "GrantSnap",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "storage",
    "tabs"
  ],
  "host_permissions": [
    "https://grantsnap.pro/*",
    "https://*.supabase.co/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*/*"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "GrantSnap"
  }
}
```

### **3.2 Required Files**
```
extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── styles.css
└── assets/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### **3.3 Environment Variables**
```bash
# Supabase Configuration
SUPABASE_URL=https://uurdubbsamdawncqkaoy.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Dashboard URLs
DASHBOARD_URL=https://grantsnap.pro
AUTH_STATUS_ENDPOINT=/functions/v1/auth-status
SAVE_GRANT_ENDPOINT=/functions/v1/save-grant
```

## 🧪 **Testing & Debugging**

### **3.1 Development Testing**
```javascript
// Test authentication broadcasting
chrome.runtime.sendMessage('hkkpgceneddimfjmjmenejbcfokphalk', {
  action: 'test_message',
  data: 'Hello from dashboard'
}, (response) => {
  console.log('Extension response:', response);
});

// Test auth status endpoint
fetch('https://uurdubbsamdawncqkaoy.supabase.co/functions/v1/auth-status', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
}).then(response => response.json()).then(console.log);
```

### **3.2 Debug Console**
```javascript
// Enable debug logging
localStorage.setItem('grantsnap_debug', 'true');

// Check stored data
console.log('Stored user:', localStorage.getItem('user_id'));
console.log('Stored token:', localStorage.getItem('access_token'));
console.log('Stored profile:', localStorage.getItem('user_profile'));
```

## 🚀 **Deployment Checklist**

### **3.1 Extension Deployment**
- [ ] Build extension with correct manifest
- [ ] Test in Chrome developer mode
- [ ] Submit to Chrome Web Store
- [ ] Update extension ID in dashboard code

### **3.2 Dashboard Deployment**
- [ ] Deploy `auth-status` Edge Function
- [ ] Set environment variables
- [ ] Test authentication broadcasting
- [ ] Verify extension communication

### **3.3 Integration Testing**
- [ ] Test OAuth login flow
- [ ] Test email/password login flow
- [ ] Test extension status updates
- [ ] Test grant capture functionality
- [ ] Test profile synchronization

## 📚 **API Reference**

### **3.1 Dashboard Functions**
- `broadcastUserAuthenticated(user, session)`: Send auth success
- `broadcastUserLogout(user)`: Send logout notification
- `broadcastProfileUpdate(user, profile)`: Send profile changes
- `sendCommandToExtension(message)`: Send commands to extension

### **3.2 Extension Functions**
- `checkAuthStatus()`: Verify authentication
- `updateExtensionStatus(status, user)`: Update UI
- `handleUserAuthenticated(authMessage)`: Process auth
- `handleUserLogout(authMessage)`: Process logout

## 🔒 **Security Considerations**

### **3.1 Token Management**
- Store tokens securely in extension storage
- Implement token refresh logic
- Clear tokens on logout
- Validate tokens before API calls

### **3.2 CORS & Permissions**
- Restrict host permissions to necessary domains
- Validate message sources
- Implement proper error handling
- Rate limit API calls

## 📞 **Support & Contact**

### **3.1 Dashboard Team**
- **Repository**: `grantsnapmain-main`
- **Framework**: React + TypeScript + Supabase
- **Deployment**: Vercel (grantsnap.pro)

### **3.2 Extension Team**
- **Extension ID**: `hkkpgceneddimfjmjmenejbcfokphalk`
- **Communication**: Chrome Extension APIs + HTTP
- **Integration**: Real-time + Polling fallback

### **3.3 Key Files for Extension Team**
1. **`src/lib/extensionService.js`** - Communication functions
2. **`supabase/functions/auth-status/index.ts`** - Auth endpoint
3. **`supabase/functions/save-grant/index.ts`** - Data endpoint
4. **`EXTENSION-INTEGRATION-TECHNICAL-SPEC.md`** - This document

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Phase 1 Implementation Complete
