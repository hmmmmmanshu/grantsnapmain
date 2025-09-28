import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, FileText, Edit3, Save, Globe, BarChart3, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/types/dashboard';
import { format } from 'date-fns';
import { sendCommandToExtension, handleExtensionError, promptExtensionInstallation } from '@/lib/extensionService';
import { safeFormatDate } from '@/lib/dateUtils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface DetailPanelProps {
  opportunity: Opportunity;
  onClose: () => void;
}

const DetailPanel = ({ opportunity, onClose }: DetailPanelProps) => {
  const { user } = useAuth();
  const [userNotes, setUserNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Load user notes on component mount
  useEffect(() => {
    if (user && opportunity.id) {
      loadUserNotes();
    }
  }, [user, opportunity.id]);

  const loadUserNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('note_content')
        .eq('user_id', user.id)
        .eq('grant_id', opportunity.id)
        .single();

      if (data) {
        setUserNotes(data.note_content);
      }
    } catch (error) {
      console.log('No existing notes found');
    }
  };

  const saveUserNotes = async () => {
    if (!user || !opportunity.id) return;
    
    setNotesLoading(true);
    try {
      const { error } = await supabase
        .from('user_notes')
        .upsert({
          user_id: user.id,
          grant_id: opportunity.id,
          note_content: userNotes
        }, {
          onConflict: 'user_id,grant_id'
        });

      if (error) throw error;
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-xl z-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {opportunity.page_title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Saved: {safeFormatDate(
                      opportunity.date_saved,
                      (date) => format(date, 'MMM d, yyyy'),
                      'Unknown date'
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <a
                href={opportunity.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View Original Source <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-gray-300">•</span>
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
                className="text-sm text-green-600 hover:text-green-800"
              >
                View with Extension
              </button>
            </div>

            {/* Analyze with AI Button */}
            <div className="mt-4">
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <span className="text-sm">✨</span>
                Analyze with Enhancement
              </button>
            </div>

            {/* Deadline Warning */}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">
                Deadline: {safeFormatDate(
                  opportunity.application_deadline,
                  (date) => format(date, 'MMMM d, yyyy'),
                  'No deadline set'
                )}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* 1. GRANT ANALYTICS & SOURCE ANALYSIS (Combined Header Section) */}
            <div className="mb-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Grant Analytics & Source Analysis
                </h1>
                <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
                  <Calendar className="w-5 h-5" />
                  <span>Apply by: {safeFormatDate(
                    opportunity.application_deadline,
                    (date) => format(date, 'MMMM d, yyyy'),
                    'No deadline set'
                  )}</span>
                </div>
              </div>

              {/* Combined Analytics & Source Data */}
              {(opportunity.page_context?.application_details || opportunity.funding_amount) && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 space-y-6">
                  {/* Funding Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs font-medium text-blue-800 mb-1">FUNDING AMOUNT</div>
                      <div className="text-xl font-bold text-gray-900">
                        {opportunity.funding_amount ? 
                          `${opportunity.page_context?.application_details?.currency || 'USD'} ${opportunity.funding_amount.toLocaleString()}` : 
                          'Amount not specified'
                        }
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs font-medium text-blue-800 mb-1">FUNDING TYPE</div>
                      <div className="text-xl font-bold text-gray-900 capitalize">
                        {opportunity.type || 'Grant'}
                      </div>
                    </div>
                  </div>

                  {/* Source Information */}
                  {opportunity.page_context?.application_details && Object.keys(opportunity.page_context.application_details).length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Source Information
                      </h4>
                      <div className="space-y-3">
                        {opportunity.page_context.application_details.page_title && (
                          <div>
                            <div className="text-xs font-medium text-blue-800 mb-1">PAGE TITLE</div>
                            <div className="text-sm text-gray-900 font-medium">
                              {opportunity.page_context.application_details.page_title}
                            </div>
                          </div>
                        )}
                        
                        {opportunity.page_context.application_details.page_url && (
                          <div>
                            <div className="text-xs font-medium text-blue-800 mb-1">SOURCE URL</div>
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
                            <div className="text-xs font-medium text-blue-800 mb-1">ANALYZED ON</div>
                            <div className="text-sm text-gray-700">
                              {new Date(opportunity.page_context.application_details.analysis_timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex gap-3 pt-2">
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
                  )}
                </div>
              )}
            </div>

            {/* 2. GRANT MANAGEMENT (Simplified Second Section) */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Grant Management
                </h2>
                
                {/* Current Status */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                  <div className="flex items-center justify-between mb-3">
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
                  <div className="flex gap-2">
                    {['To Review', 'In Progress', 'Applied'].map((status) => (
                      <button
                        key={status}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          opportunity.status === status 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contacts Found */}
                {opportunity.extracted_emails && opportunity.extracted_emails.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contacts Found</h4>
                    <div className="space-y-2">
                      {opportunity.extracted_emails.map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
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
                )}
              </div>
            </div>

            {/* 3. EXTENSION DATA (Structured Crux Field Content) */}
            {(opportunity.page_context?.opportunity_summary || opportunity.page_context?.eligibility_info) && (
              <div className="mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Extension Data Analysis
                  </h2>
                  
                  {/* Opportunity Summary */}
                  {opportunity.page_context?.opportunity_summary && (
                    <div className="bg-white rounded-lg p-4 border border-green-100 mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Opportunity Summary</h4>
                      <div className="text-sm text-gray-800 leading-relaxed space-y-3">
                        {opportunity.page_context.opportunity_summary.split('\n\n').map((paragraph, index) => (
                          <div key={index}>
                            {paragraph.includes('**') ? (
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
                  )}

                  {/* Eligibility & Requirements */}
                  {opportunity.page_context?.eligibility_info && (
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Eligibility & Requirements</h4>
                      <div className="text-sm text-gray-800 leading-relaxed space-y-3">
                        {opportunity.page_context.eligibility_info.split('\n\n').map((section, index) => (
                          <div key={index}>
                            {section.includes('**') ? (
                              <div dangerouslySetInnerHTML={{
                                __html: section
                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
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
                  )}
                </div>
              </div>
            )}

            {/* 4. NOTES SECTION (User-editable notes) */}
            <div className="mb-8">
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Personal Notes
                  </h2>
                  <button
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isEditingNotes ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-yellow-100">
                  {isEditingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        placeholder="Add your notes about this grant opportunity..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveUserNotes}
                          disabled={notesLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {notesLoading ? 'Saving...' : 'Save Notes'}
                        </button>
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[80px] flex items-center">
                      {userNotes || 'No notes added yet. Click "Edit" to add your thoughts about this grant opportunity.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPanel;