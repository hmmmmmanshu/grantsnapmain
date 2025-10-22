import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Enterprise-grade authentication cache
 * Prevents unnecessary re-authentication when switching tabs
 */
interface AuthCache {
  user: User | null;
  session: Session | null;
  timestamp: number;
  isValid: boolean;
}

class AuthCacheManager {
  private static instance: AuthCacheManager;
  private cache: AuthCache | null = null;
  private listeners: Set<(auth: AuthCache) => void> = new Set();
  private isInitialized = false;

  static getInstance(): AuthCacheManager {
    if (!AuthCacheManager.instance) {
      AuthCacheManager.instance = new AuthCacheManager();
    }
    return AuthCacheManager.instance;
  }

  private constructor() {
    // Listen to auth changes globally
    supabase.auth.onAuthStateChange((_event, session) => {
      this.updateCache(session?.user ?? null, session);
    });
  }

  private updateCache(user: User | null, session: Session | null) {
    this.cache = {
      user,
      session,
      timestamp: Date.now(),
      isValid: true
    };

    // Notify all listeners
    this.listeners.forEach(listener => listener(this.cache!));
  }

  getCachedAuth(): AuthCache | null {
    // Check if cache is still valid (5 minutes)
    if (this.cache && Date.now() - this.cache.timestamp < 5 * 60 * 1000) {
      return this.cache;
    }
    return null;
  }

  subscribe(listener: (auth: AuthCache) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  async initialize(): Promise<AuthCache> {
    if (this.isInitialized) {
      return this.cache!;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      this.updateCache(session?.user ?? null, session);
      this.isInitialized = true;
      
      return this.cache!;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.updateCache(null, null);
      this.isInitialized = true;
      return this.cache!;
    }
  }
}

export function useSmartAuth() {
  const [auth, setAuth] = useState<AuthCache | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheManager = useRef(AuthCacheManager.getInstance());

  useEffect(() => {
    const manager = cacheManager.current;

    // Check if we have cached auth first
    const cachedAuth = manager.getCachedAuth();
    if (cachedAuth) {
      setAuth(cachedAuth);
      setLoading(false);
      console.log('🚀 Using cached auth - no loading state');
    } else {
      // Initialize auth
      manager.initialize().then(authData => {
        setAuth(authData);
        setLoading(false);
      });
    }

    // Subscribe to auth changes
    const unsubscribe = manager.subscribe(authData => {
      setAuth(authData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user: auth?.user ?? null,
    session: auth?.session ?? null,
    loading,
    isValid: auth?.isValid ?? false
  };
}
