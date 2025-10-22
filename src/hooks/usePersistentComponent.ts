import { useState, useEffect, useRef } from 'react';

/**
 * Enterprise-grade component persistence manager
 * Prevents component remounting and state loss when switching tabs
 */
export interface PersistentComponentState<T> {
  data: T;
  timestamp: number;
  componentId: string;
}

export function usePersistentComponent<T>(
  componentId: string,
  initialState: T,
  options: {
    persistOnUnmount?: boolean;
    restoreOnMount?: boolean;
    maxAge?: number; // in milliseconds
  } = {}
) {
  const {
    persistOnUnmount = true,
    restoreOnMount = true,
    maxAge = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [state, setState] = useState<T>(() => {
    if (!restoreOnMount) return initialState;
    
    try {
      const saved = sessionStorage.getItem(`persistent-component-${componentId}`);
      if (saved) {
        const parsed: PersistentComponentState<T> = JSON.parse(saved);
        
        // Check if data is still fresh
        if (Date.now() - parsed.timestamp < maxAge) {
          console.log(`🔄 Restored persistent state for ${componentId}`);
          return parsed.data;
        } else {
          console.log(`⏰ Expired persistent state for ${componentId}`);
          sessionStorage.removeItem(`persistent-component-${componentId}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to restore persistent state for ${componentId}:`, error);
    }
    
    return initialState;
  });

  const isMountedRef = useRef(true);

  // Persist state on unmount
  useEffect(() => {
    return () => {
      if (persistOnUnmount && isMountedRef.current) {
        try {
          const persistentState: PersistentComponentState<T> = {
            data: state,
            timestamp: Date.now(),
            componentId
          };
          
          sessionStorage.setItem(`persistent-component-${componentId}`, JSON.stringify(persistentState));
          console.log(`💾 Persisted component state for ${componentId}`);
        } catch (error) {
          console.error(`Failed to persist state for ${componentId}:`, error);
        }
      }
    };
  }, [state, componentId, persistOnUnmount]);

  // Mark as unmounted when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [state, setState] as const;
}
