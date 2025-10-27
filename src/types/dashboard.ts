
export interface Opportunity {
  id: string;
  status: 'To Review' | 'In Progress' | 'Applied';
  page_title: string;
  funder_name: string;
  page_url: string;
  application_deadline: string;
  date_saved: string;
  user_notes: string;
  extracted_emails: string[];
  type: 'grant' | 'investor';
  funding_amount?: number;
  
  // Enhanced Analysis Fields (optional for backward compatibility)
  page_context?: {
    full_content?: string;
    structured_data?: {
      jsonLd?: any[];
      microdata?: any[];
      forms?: any[];
    };
    content_blocks?: string[];
    meta_information?: {
      title?: string;
      description?: string;
      domain?: string;
      headings?: string[];
      lists?: string[];
      tables?: string[];
    };
    content_priority?: {
      high?: string[];
      medium?: string[];
      low?: string[];
    };
  };
  
  analysis_results?: {
    architect_analysis?: {
      name_candidates?: string[];
      deadline_candidates?: string[];
      structural_confidence?: number;
    };
    librarian_analysis?: {
      keywords?: string[];
      funding_type?: string;
      keyword_confidence?: number;
    };
    statistician_analysis?: {
      final_results?: any;
      confidence_scores?: any;
    };
    overall_confidence?: number;
    data_quality_score?: number;
  };
  
  crux_summary?: {
    generated_summary?: string;
    key_points?: string[];
    opportunity_details?: string;
    application_info?: string;
    eligibility_criteria?: string;
    benefits?: string[];
    requirements?: string[];
  };
  
  enhanced_analysis?: boolean;
  analysis_version?: string;
  data_quality_score?: number;
  
  // Gemini Computer Use Deep Scan Results
  computer_use_scan?: {
    confidence_score: number;
    funder_mission: string;
    funder_values?: string;
    eligibility_criteria: string[];
    evaluation_criteria: string[];
    key_themes: string[];
    past_winners?: string[];
    application_tips?: string[];
    success_factors?: string[];
    scanned_at: string;
  };
  
  // AI Autofill Session Data
  autofill_session?: {
    session_id: string;
    fields_filled: number;
    pages_navigated: number;
    status: 'in_progress' | 'completed' | 'failed' | 'partial';
    started_at: string;
    completed_at?: string;
    error_message?: string;
    fields_data?: {
      field_label: string;
      field_value: string;
      confidence: number;
      rag_chunks_used: string[];
    }[];
  };
  
  // Agent Screenshots from Computer Use
  agent_screenshots?: string[];
  
  // Deep Scan Usage Tracking
  deep_scan_used?: boolean;
  deep_scan_timestamp?: string;
}
