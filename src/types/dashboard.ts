
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
}
