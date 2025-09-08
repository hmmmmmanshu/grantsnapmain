import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Cookie debugging for Chrome Extension compatibility
const debugCookies = () => {
  if (import.meta.env.DEV) {
    console.log('🍪 Cookie Debug - Current cookies:', document.cookie)
    console.log('🌐 Current domain:', window.location.hostname)
    
    // Check for Supabase auth cookies
    const cookies = document.cookie.split(';')
    const authCookies = cookies.filter(cookie => 
      cookie.includes('sb-') || cookie.includes('auth') || cookie.includes('supabase')
    )
    console.log('🔐 Auth-related cookies:', authCookies)
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to get the correct redirect URL based on environment
  const getRedirectUrl = (path: string) => {
    if (import.meta.env.DEV) {
      return `http://localhost:5173${path}`
    }
    // Production domain
    return `https://grantsnap.pro${path}`
  }

  useEffect(() => {
    // Handle OAuth callback with hash fragment
    const handleAuthCallback = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Error getting session after OAuth:', error)
          } else if (data.session) {
            setSession(data.session)
            setUser(data.session.user)
            setLoading(false)
            // Clean up the URL hash
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error)
        }
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Debug cookies for Chrome Extension compatibility
      debugCookies()
      
      if (session) {
        console.log('✅ Session established, cookies should be accessible to Chrome Extension')
        console.log('👤 User ID:', session.user?.id)
        console.log('📧 User Email:', session.user?.email)
        console.log('🔑 Access Token exists:', !!session.access_token)
      } else {
        console.log('⚠️ No session found, Chrome Extension may not be able to authenticate')
        console.log('🔍 Checking if Supabase client is properly configured...')
        console.log('🌐 Supabase URL available:', !!supabase?.supabaseUrl)
        console.log('🔑 Supabase client type:', supabase?.auth ? 'Real client' : 'Mock client')
      }
    })

    // Handle OAuth callback
    handleAuthCallback()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { error, data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      return { error: error as AuthError, data: null }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl('/dashboard')
        }
      })
      
      if (error) {
        return { error, data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      return { error: error as AuthError, data: null }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        return { error, data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      return { error: error as AuthError, data: null }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password')
      })
      
      if (error) {
        return { error, data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      return { error: error as AuthError, data: null }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        return { error, data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      return { error: error as AuthError, data: null }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: getRedirectUrl('/dashboard')
        }
      })
      
      if (error) {
        return { error, data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      return { error: error as AuthError, data: null }
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
  }
} 