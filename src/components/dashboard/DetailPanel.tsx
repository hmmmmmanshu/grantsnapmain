
import React from 'react';
import { X, ExternalLink, Sparkles, Mail, Calendar, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/types/dashboard';
import { format } from 'date-fns';

interface DetailPanelProps {
  opportunity: Opportunity;
  onClose: () => void;
}

const DetailPanel = ({ opportunity, onClose }: DetailPanelProps) => {
  const [isFullTextExpanded, setIsFullTextExpanded] = React.useState(false);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-2/5 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {opportunity.page_title}
              </h2>
              <a
                href={opportunity.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View Original Source
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Primary Action */}
          <Button className="w-full mb-6 bg-[#3ECF8E] hover:bg-[#35b87a] text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze with AI
          </Button>

          {/* Details Sections */}
          <div className="space-y-6">
            {/* Deadline */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Deadline</h3>
              </div>
              <p className="text-sm text-gray-600 pl-6">
                {format(new Date(opportunity.application_deadline), 'MMMM d, yyyy')}
              </p>
            </div>

            {/* Your Notes */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Your Notes</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {opportunity.user_notes}
                </p>
              </div>
            </div>

            {/* Contacts Found */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Contacts Found</h3>
              </div>
              <div className="space-y-2 pl-6">
                {opportunity.extracted_emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <a
                      href={`mailto:${email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Page Text (Pro Feature) */}
            <div>
              <button
                onClick={() => setIsFullTextExpanded(!isFullTextExpanded)}
                className="flex items-center gap-2 mb-2 w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
              >
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isFullTextExpanded ? 'rotate-180' : ''}`} />
                <h3 className="text-sm font-medium text-gray-900">Full Page Text</h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-auto">
                  Pro Feature
                </span>
              </button>
              
              {isFullTextExpanded && (
                <div className="bg-gray-50 rounded-lg p-4 pl-6">
                  <p className="text-sm text-gray-600 italic">
                    Full page content would be displayed here for Pro users. This includes the complete scraped text from the webpage for easy reference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
