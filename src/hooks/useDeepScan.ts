import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { 
  DeepScanRequest, 
  DeepScanResponse, 
  DeepScanError, 
  DeepScanStatus,
  DeepScanResult 
} from '@/types/deepScan';
import { toast } from 'sonner';

export function useDeepScan() {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Map<string, DeepScanResult>>(new Map());
  const { user } = useAuth();

  /**
   * Trigger a deep scan for a specific grant
   */
  const triggerDeepScan = async (grantId: string, urlToScan: string): Promise<DeepScanResult> => {
    if (!user) {
      const error: DeepScanError = {
        error: 'Unauthorized',
        message: 'User not authenticated'
      };
      toast.error('Authentication required for deep scan');
      return { status: 'error', error: error.message };
    }

    // Update local state to show scanning
    const initialResult: DeepScanResult = { status: 'scanning' };
    setScanResults(prev => new Map(prev).set(grantId, initialResult));
    setScanning(true);

    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the Edge Function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/trigger-deep-scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_id: grantId,
          url_to_scan: urlToScan
        } as DeepScanRequest)
      });

      if (!response.ok) {
        const errorData: DeepScanError = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: DeepScanResponse = await response.json();
      
      // Success result
      const successResult: DeepScanResult = {
        status: 'completed',
        profile: data.funder_profile,
        lastScanned: data.updated_at
      };

      // Update local state
      setScanResults(prev => new Map(prev).set(grantId, successResult));
      
      toast.success('Deep scan completed successfully!');
      return successResult;

    } catch (error) {
      console.error('Deep scan error:', error);
      
      // Error result
      const errorResult: DeepScanResult = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      // Update local state
      setScanResults(prev => new Map(prev).set(grantId, errorResult));
      
      toast.error(`Deep scan failed: ${errorResult.error}`);
      return errorResult;

    } finally {
      setScanning(false);
    }
  };

  /**
   * Get the scan result for a specific grant
   */
  const getScanResult = (grantId: string): DeepScanResult => {
    return scanResults.get(grantId) || { status: 'idle' };
  };

  /**
   * Check if a grant has a funder profile
   */
  const hasFunderProfile = (grantId: string): boolean => {
    const result = scanResults.get(grantId);
    return result?.status === 'completed' && !!result.profile;
  };

  /**
   * Clear scan results for a specific grant
   */
  const clearScanResult = (grantId: string) => {
    setScanResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(grantId);
      return newMap;
    });
  };

  /**
   * Clear all scan results
   */
  const clearAllScanResults = () => {
    setScanResults(new Map());
  };

  /**
   * Get the current scanning status
   */
  const isScanning = (grantId?: string): boolean => {
    if (grantId) {
      return scanResults.get(grantId)?.status === 'scanning';
    }
    return scanning;
  };

  /**
   * Get the funder profile for a grant
   */
  const getFunderProfile = (grantId: string) => {
    const result = scanResults.get(grantId);
    if (result?.status === 'completed' && result.profile) {
      return result.profile;
    }
    return null;
  };

  return {
    // State
    scanning,
    scanResults,
    
    // Actions
    triggerDeepScan,
    clearScanResult,
    clearAllScanResults,
    
    // Getters
    getScanResult,
    hasFunderProfile,
    isScanning,
    getFunderProfile,
    
    // Utility
    getScanStatus: (grantId: string): DeepScanStatus => {
      return scanResults.get(grantId)?.status || 'idle';
    }
  };
}
