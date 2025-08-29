/**
 * TypeScript interfaces for the HyperBrowser Deep Scan functionality
 */

export interface DeepScanRequest {
  grant_id: string;
  url_to_scan: string;
}

export interface FunderProfile {
  funder_mission: string;
  funder_values: string;
  past_project_examples: string;
  scanned_at: string;
  source_url: string;
}

export interface DeepScanResponse {
  success: boolean;
  message: string;
  grant_id: string;
  funder_profile: FunderProfile;
  scanned_url: string;
  updated_at: string;
}

export interface DeepScanError {
  error: string;
  message: string;
  details?: string;
}

export interface TrackedGrantWithProfile {
  id: string;
  user_id: string;
  grant_name: string | null;
  grant_url: string | null;
  application_deadline: string | null;
  status: string | null;
  notes: string | null;
  funding_amount: number | null;
  eligibility_criteria: string | null;
  created_at: string | null;
  updated_at: string | null;
  application_data?: {
    funder_profile?: FunderProfile;
    [key: string]: any;
  };
}

/**
 * Deep scan status for UI feedback
 */
export type DeepScanStatus = 
  | 'idle'
  | 'scanning'
  | 'completed'
  | 'error'
  | 'no_profile';

/**
 * Deep scan result for display
 */
export interface DeepScanResult {
  status: DeepScanStatus;
  profile?: FunderProfile;
  error?: string;
  lastScanned?: string;
}
