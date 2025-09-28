
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
}
