import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Enterprise-grade state persistence manager
 * Handles complex state persistence with debouncing and conflict resolution
 */
export interface PersistedState<T> {
  data: T;
  timestamp: number;
  version: number;
}

export interface StatePersistenceOptions {
  key: string;
  debounceMs?: number;
  version?: number;
  onConflict?: (local: T, remote: T) => T;
}

export function usePersistedState<T>(
  initialState: T,
  options: StatePersistenceOptions
) {
  const {
    key,
    debounceMs = 500,
    version = 1,
    onConflict
  } = options;

  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: PersistedState<T> = JSON.parse(saved);
        // Check version compatibility
        if (parsed.version === version) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn(`Failed to load persisted state for ${key}:`, error);
    }
    return initialState;
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);

  // Debounced save function
  const saveState = useCallback((newState: T) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        const persistedState: PersistedState<T> = {
          data: newState,
          timestamp: Date.now(),
          version
        };
        
        localStorage.setItem(key, JSON.stringify(persistedState));
        localStorage.setItem(`${key}.timestamp`, String(Date.now()));
        lastSaveRef.current = Date.now();
        console.log(`💾 Persisted state for ${key}`);
      } catch (error) {
        console.error(`Failed to persist state for ${key}:`, error);
      }
    }, debounceMs);
  }, [key, debounceMs, version]);

  // Update state and persist
  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      const updatedState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prevState)
        : newState;
      
      saveState(updatedState);
      return updatedState;
    });
  }, [saveState]);

  // Force immediate save
  const forceSave = useCallback((newState?: T) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    const stateToSave = newState ?? state;
    try {
      const persistedState: PersistedState<T> = {
        data: stateToSave,
        timestamp: Date.now(),
        version
      };
      
      localStorage.setItem(key, JSON.stringify(persistedState));
      localStorage.setItem(`${key}.timestamp`, String(Date.now()));
      lastSaveRef.current = Date.now();
      console.log(`💾 Force saved state for ${key}`);
    } catch (error) {
      console.error(`Failed to force save state for ${key}:`, error);
    }
  }, [key, state, version]);

  // Load from storage (useful for conflict resolution)
  const loadFromStorage = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: PersistedState<T> = JSON.parse(saved);
        if (parsed.version === version) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn(`Failed to load from storage for ${key}:`, error);
    }
    return null;
  }, [key, version]);

  // Clear persisted state
  const clearState = useCallback(() => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}.timestamp`);
    console.log(`🗑️ Cleared persisted state for ${key}`);
  }, [key]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    state,
    updateState,
    forceSave,
    loadFromStorage,
    clearState,
    lastSaved: lastSaveRef.current
  };
}
