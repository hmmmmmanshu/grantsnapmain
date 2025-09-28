
import React from 'react';
import { X, ExternalLink, Sparkles, Mail, Calendar, FileText, ChevronDown, Globe, Brain, BarChart3, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/types/dashboard';
import { format } from 'date-fns';
import { sendCommandToExtension, handleExtensionError, promptExtensionInstallation } from '@/lib/extensionService';
import { safeFormatDate } from '@/lib/dateUtils';

interface DetailPanelProps {
  opportunity: Opportunity;
  onClose: () => void;
}

const DetailPanel = ({ opportunity, onClose }: DetailPanelProps) => {
  const [isFullTextExpanded, setIsFullTextExpanded] = React.useState(false);
  const [isEnhancedSummaryExpanded, setIsEnhancedSummaryExpanded] = React.useState(false);
  const [isAnalysisConfidenceExpanded, setIsAnalysisConfidenceExpanded] = React.useState(false);
  const [isPageContextExpanded, setIsPageContextExpanded] = React.useState(false);

  // Debug logging to see what data DetailPanel is receiving
  React.useEffect(() => {
    console.log('🚀 NEW DETAILPANEL CODE LOADED!', opportunity.page_title);
    console.log('🔍 DetailPanel Debug - Opportunity:', opportunity.page_title);
    console.log('- page_context:', opportunity.page_context);
    console.log('- enhanced_analysis:', opportunity.enhanced_analysis);
    console.log('- opportunity_summary:', opportunity.page_context?.opportunity_summary?.substring(0, 100));
    console.log('- confidence_data:', opportunity.page_context?.confidence_data);
    console.log('- application_details:', opportunity.page_context?.application_details);
    console.log('- is_free_feature:', opportunity.page_context?.is_free_feature);
  }, [opportunity]);

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
              <div className="flex items-center gap-3">
                <a
                  href={opportunity.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Original Source
                  <ExternalLink className="w-3 h-3" />
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await sendCommandToExtension({
                        action: 'open_url',
                        url: opportunity.page_url,
                        title: opportunity.page_title,
                        type: 'grant_opportunity'
                      });
                    } catch (error) {
                      handleExtensionError(
                        error,
                        // Extension missing callback
                        () => {
                          promptExtensionInstallation(
                            'The Grants Snap extension is required to view grant pages with enhanced features. Install it to get AI-powered insights and better grant management tools.'
                          );
                        },
                        // Other error callback
                        (error) => {
                          console.error('Extension communication error:', error);
                          // Fallback to regular link if extension fails
                          window.open(opportunity.page_url, '_blank');
                        }
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 text-sm"
                >
                  <Globe className="w-3 h-3" />
                  View with Extension
                </Button>
              </div>
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
                {safeFormatDate(
                  opportunity.application_deadline,
                  (date) => format(date, 'MMMM d, yyyy'),
                  'No deadline set'
                )}
              </p>
            </div>

            {/* AI-Generated Opportunity Summary (KEY FIELD - opportunity_crux) */}
            {opportunity.page_context?.opportunity_summary && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-semibold text-gray-900">AI-Generated Opportunity Summary</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                    ⭐ KEY FIELD
                  </span>
                </div>
                <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 rounded-xl p-5 border border-purple-200">
                  <div className="text-sm text-gray-800 leading-relaxed space-y-3">
                    {/* Parse and format the opportunity_crux content */}
                    {opportunity.page_context.opportunity_summary.split('\n\n').map((paragraph, index) => (
                      <div key={index}>
                        {paragraph.includes('**') ? (
                          // Format text with bold markers
                          <div dangerouslySetInnerHTML={{
                            __html: paragraph
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                              .replace(/◉/g, '•')
                              .replace(/\n/g, '<br/>')
                          }} />
                        ) : (
                          <p className="text-gray-700">{paragraph}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Grant Analytics & Metadata */}
            {opportunity.page_context?.is_free_feature && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">Grant Analytics</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    CAPTURED DATA
                  </span>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 space-y-4">
                  {/* Funding Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="text-xs font-medium text-blue-800 mb-1">FUNDING AMOUNT</div>
                      <div className="text-lg font-bold text-gray-900">
                        {opportunity.funding_amount ? 
                          `${opportunity.page_context.application_details?.currency || 'USD'} ${opportunity.funding_amount.toLocaleString()}` : 
                          'Amount not specified'
                        }
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="text-xs font-medium text-blue-800 mb-1">FUNDING TYPE</div>
                      <div className="text-lg font-bold text-gray-900 capitalize">
                        {opportunity.type || 'Grant'}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Timestamp */}
                  {opportunity.page_context.application_details?.analysis_timestamp && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="text-xs font-medium text-blue-800 mb-1">ANALYZED BY EXTENSION</div>
                      <div className="text-sm text-gray-700">
                        📅 {new Date(opportunity.page_context.application_details.analysis_timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

      {/* AI Analysis Confidence Scores (Core Extension Feature) */}
      {opportunity.page_context?.confidence_data && Object.keys(opportunity.page_context.confidence_data).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-base font-semibold text-gray-900">AI Analysis Confidence</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    QUALITY SCORES
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                  {/* Overall Confidence Score */}
                  {opportunity.page_context.confidence_data.overall && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">Overall Analysis Confidence</div>
                        <div className={`text-xl font-bold px-3 py-1 rounded-full ${
                          opportunity.page_context.confidence_data.overall >= 80 ? 'bg-green-100 text-green-800' :
                          opportunity.page_context.confidence_data.overall >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {opportunity.page_context.confidence_data.overall}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            opportunity.page_context.confidence_data.overall >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            opportunity.page_context.confidence_data.overall >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${opportunity.page_context.confidence_data.overall}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Individual Field Confidence Scores */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Field-by-Field Analysis</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(opportunity.page_context.confidence_data)
                        .filter(([field]) => field !== 'overall')
                        .map(([field, score]) => (
                        <div key={field} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800 capitalize">
                                {field === 'crux' ? 'Opportunity Summary' : field.replace(/_/g, ' ')}
                              </span>
                              {field === 'crux' && <span className="text-xs text-purple-600">⭐ Key Field</span>}
                            </div>
                            <div className={`text-sm font-bold px-2 py-1 rounded-md ${
                              score >= 80 ? 'bg-green-100 text-green-800' :
                              score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {score}%
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {score >= 80 ? '✅ High confidence - reliable data' :
                             score >= 60 ? '⚠️ Medium confidence - review recommended' :
                             '⚠️ Low confidence - manual verification needed'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}


      {/* Comprehensive Application Data & Metadata */}
      {opportunity.page_context?.application_details && Object.keys(opportunity.page_context.application_details).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-semibold text-gray-900">Source Analysis & Metadata</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                    EXTENSION DATA
                  </span>
                </div>
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200 space-y-4">
                  {/* Source Information */}
                  <div className="bg-white rounded-lg p-4 border border-indigo-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Source Information</h4>
                    <div className="space-y-3">
                      {opportunity.page_context.application_details.page_title && (
                        <div>
                          <div className="text-xs font-medium text-indigo-800 mb-1">PAGE TITLE</div>
                          <div className="text-sm text-gray-900 font-medium">
                            {opportunity.page_context.application_details.page_title}
                          </div>
                        </div>
                      )}
                      
                      {opportunity.page_context.application_details.page_url && (
                        <div>
                          <div className="text-xs font-medium text-indigo-800 mb-1">SOURCE URL</div>
                          <div className="flex items-center gap-2">
                            <a 
                              href={opportunity.page_context.application_details.page_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline truncate flex-1"
                            >
                              {opportunity.page_context.application_details.page_url}
                            </a>
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      )}
                      
                      {opportunity.page_context.application_details.analysis_timestamp && (
                        <div>
                          <div className="text-xs font-medium text-indigo-800 mb-1">ANALYSIS TIMESTAMP</div>
                          <div className="text-sm text-gray-700">
                            🕒 {new Date(opportunity.page_context.application_details.analysis_timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extracted Keywords */}
                  {opportunity.page_context.application_details.extracted_keywords && 
                   opportunity.page_context.application_details.extracted_keywords.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">AI-Extracted Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.page_context.application_details.extracted_keywords.map((keyword, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grant URL Actions */}
                  <div className="bg-white rounded-lg p-4 border border-indigo-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                    <div className="flex gap-3">
                      <a
                        href={opportunity.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Grant Page
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            await sendCommandToExtension({
                              action: 'open_url',
                              url: opportunity.page_url,
                              title: opportunity.page_title,
                              type: 'grant_opportunity'
                            });
                          } catch (error) {
                            handleExtensionError(
                              error,
                              () => promptExtensionInstallation('Extension required for enhanced features'),
                              () => window.open(opportunity.page_url, '_blank')
                            );
                          }
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Open with Extension
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility & Requirements Analysis */}
            {opportunity.page_context?.eligibility_info && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-base font-semibold text-gray-900">Eligibility & Requirements</h3>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                    CAPTURED CRITERIA
                  </span>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                  <div className="bg-white rounded-lg p-4 border border-orange-100">
                    <div className="text-sm text-gray-800 leading-relaxed space-y-3">
                      {opportunity.page_context.eligibility_info.split('\n\n').map((section, index) => (
                        <div key={index}>
                          {section.includes('**') ? (
                            <div dangerouslySetInnerHTML={{
                              __html: section
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-orange-900">$1</strong>')
                                .replace(/◉/g, '•')
                                .replace(/\n/g, '<br/>')
                            }} />
                          ) : (
                            <p className="text-gray-700">{section}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extension Analysis Status (when data exists but no rich content) */}
      {opportunity.page_context?.is_free_feature && 
       !opportunity.page_context?.opportunity_summary &&
       (!opportunity.page_context?.confidence_data || Object.keys(opportunity.page_context.confidence_data).length === 0) &&
       (!opportunity.page_context?.application_details || Object.keys(opportunity.page_context.application_details).length === 0) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Extension Analysis Status</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              ANALYZED
            </span>
          </div>
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-800 space-y-2">
                <p className="font-medium text-blue-900">✅ Grant Successfully Analyzed</p>
                <p className="text-gray-700">
                  The GrantSnap extension has processed this page and found it to be a valid grant opportunity, 
                  but the page structure didn't contain detailed information for automatic extraction.
                </p>
                <p className="text-gray-600 text-xs">
                  This is normal for simple application forms or pages with minimal content. 
                  You can still track and manage this grant using the sections below.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grant Status & Management */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-900">Grant Management</h3>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-medium">
                  USER DATA
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                {/* Current Status */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">Current Status</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      opportunity.status === 'Applied' ? 'bg-green-100 text-green-800' :
                      opportunity.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      opportunity.status === 'To Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {opportunity.status}
                    </div>
                  </div>
                  
                  {/* Quick Status Actions */}
                  <div className="flex gap-2 mt-3">
                    {['To Review', 'In Progress', 'Applied'].map((status) => (
                      <button
                        key={status}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          opportunity.status === status 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => {
                          // This would call an update function - placeholder for now
                          console.log(`Update status to: ${status}`);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Notes */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900 mb-2">Your Notes</div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.user_notes || 'No notes added yet. Click to add your thoughts about this grant opportunity.'}
                  </div>
                </div>
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

            {/* Enhanced AI Summary (Enhanced Analysis v2.0) */}
            {opportunity.enhanced_analysis && opportunity.crux_summary && (
              <div>
                <button
                  onClick={() => setIsEnhancedSummaryExpanded(!isEnhancedSummaryExpanded)}
                  className="flex items-center gap-2 mb-2 w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isEnhancedSummaryExpanded ? 'rotate-180' : ''}`} />
                  <Brain className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-medium text-gray-900">AI-Generated Summary</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full ml-auto">
                    Enhanced v2.0
                  </span>
                </button>
                
                {isEnhancedSummaryExpanded && (
                  <div className="space-y-4 pl-6">
                    {/* Generated Summary */}
                    {opportunity.crux_summary.generated_summary && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Opportunity Summary</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opportunity.crux_summary.generated_summary}
                        </p>
                      </div>
                    )}

                    {/* Key Points */}
                    {opportunity.crux_summary.key_points && opportunity.crux_summary.key_points.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Points</h4>
                        <ul className="space-y-1">
                          {opportunity.crux_summary.key_points.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Benefits and Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunity.crux_summary.benefits && opportunity.crux_summary.benefits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits</h4>
                          <ul className="space-y-1">
                            {opportunity.crux_summary.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {opportunity.crux_summary.requirements && opportunity.crux_summary.requirements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
                          <ul className="space-y-1">
                            {opportunity.crux_summary.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Opportunity Details */}
                    {opportunity.crux_summary.opportunity_details && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Opportunity Details</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opportunity.crux_summary.opportunity_details}
                        </p>
                      </div>
                    )}

                    {/* Application Info */}
                    {opportunity.crux_summary.application_info && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Application Information</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opportunity.crux_summary.application_info}
                        </p>
                      </div>
                    )}

                    {/* Eligibility Criteria */}
                    {opportunity.crux_summary.eligibility_criteria && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Eligibility Criteria</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opportunity.crux_summary.eligibility_criteria}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Analysis Confidence (Enhanced Analysis v2.0) */}
            {opportunity.enhanced_analysis && opportunity.analysis_results && (
              <div>
                <button
                  onClick={() => setIsAnalysisConfidenceExpanded(!isAnalysisConfidenceExpanded)}
                  className="flex items-center gap-2 mb-2 w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isAnalysisConfidenceExpanded ? 'rotate-180' : ''}`} />
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-900">Analysis Confidence</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-auto">
                    Quality: {opportunity.data_quality_score || opportunity.analysis_results.data_quality_score || 0}%
                  </span>
                </button>
                
                {isAnalysisConfidenceExpanded && (
                  <div className="space-y-4 pl-6">
                    {/* Overall Confidence */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Overall Confidence</h4>
                        <span className="text-lg font-bold text-blue-600">
                          {opportunity.analysis_results.overall_confidence || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${opportunity.analysis_results.overall_confidence || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Individual Confidence Scores */}
                    {opportunity.analysis_results.statistician_analysis?.confidence_scores && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Field Confidence Scores</h4>
                        {Object.entries(opportunity.analysis_results.statistician_analysis.confidence_scores).map(([field, score]) => (
                          <div key={field} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 capitalize">{field.replace(/_/g, ' ')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{score}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    score >= 80 ? 'bg-green-500' : 
                                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Data Quality Score */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-900">Data Quality Assessment</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        This grant was analyzed using Enhanced Heuristic Engine v{opportunity.analysis_version || '2.0'} 
                        with a data quality score of {opportunity.data_quality_score || opportunity.analysis_results.data_quality_score || 0}%.
                        Higher scores indicate more reliable data extraction and analysis.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Page Context Analysis (Enhanced Analysis v2.0) */}
            {opportunity.enhanced_analysis && opportunity.page_context && (
              <div>
                <button
                  onClick={() => setIsPageContextExpanded(!isPageContextExpanded)}
                  className="flex items-center gap-2 mb-2 w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPageContextExpanded ? 'rotate-180' : ''}`} />
                  <FileText className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-medium text-gray-900">Page Analysis Details</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-auto">
                    Advanced
                  </span>
                </button>
                
                {isPageContextExpanded && (
                  <div className="space-y-4 pl-6">
                    {/* Meta Information */}
                    {opportunity.page_context.meta_information && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Page Structure</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Headings:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.meta_information.headings?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lists:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.meta_information.lists?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tables:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.meta_information.tables?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Domain:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.meta_information.domain || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Priority */}
                    {opportunity.page_context.content_priority && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Content Priority Analysis</h4>
                        <div className="space-y-2">
                          {opportunity.page_context.content_priority.high && opportunity.page_context.content_priority.high.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">High Priority</span>
                              <span className="ml-2 text-sm text-gray-600">{opportunity.page_context.content_priority.high.length} items</span>
                            </div>
                          )}
                          {opportunity.page_context.content_priority.medium && opportunity.page_context.content_priority.medium.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Medium Priority</span>
                              <span className="ml-2 text-sm text-gray-600">{opportunity.page_context.content_priority.medium.length} items</span>
                            </div>
                          )}
                          {opportunity.page_context.content_priority.low && opportunity.page_context.content_priority.low.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">Low Priority</span>
                              <span className="ml-2 text-sm text-gray-600">{opportunity.page_context.content_priority.low.length} items</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Structured Data */}
                    {opportunity.page_context.structured_data && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Structured Data Found</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">JSON-LD:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.structured_data.jsonLd?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Microdata:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.structured_data.microdata?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Forms:</span>
                            <span className="ml-2 font-medium">{opportunity.page_context.structured_data.forms?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Content Preview */}
                    {opportunity.page_context.full_content && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Full Page Content</h4>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {opportunity.page_context.full_content.substring(0, 500)}
                            {opportunity.page_context.full_content.length > 500 && '...'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
