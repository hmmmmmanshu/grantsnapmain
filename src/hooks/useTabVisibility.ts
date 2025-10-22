import { useState, useEffect, useRef } from 'react';

/**
 * Enterprise-grade tab visibility management
 * Handles browser tab switching without losing state
 */
export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const lastVisibilityChange = useRef(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const visible = !document.hidden;
      
      // Debounce visibility changes to prevent excessive triggers
      if (now - lastVisibilityChange.current < 500) {
        return; // Ignore changes within 500ms
      }
      
      lastVisibilityChange.current = now;
      setIsVisible(visible);
      
      if (visible) {
        setLastActiveTime(now);
        // Restore any suspended operations when tab becomes visible
        console.log('🔄 Tab became visible - restoring state');
      } else {
        console.log('⏸️ Tab became hidden - preserving state');
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastVisibilityChange.current > 500) {
        setIsVisible(true);
        setLastActiveTime(now);
        lastVisibilityChange.current = now;
      }
    };

    const handleBlur = () => {
      // Don't immediately set to hidden on blur - wait for visibility change
      // This prevents false positives when clicking on other elements
    };

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return {
    isVisible,
    lastActiveTime,
    isHidden: !isVisible
  };
}
