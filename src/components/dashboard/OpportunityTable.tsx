
import React from 'react';
import { MoreHorizontal, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Opportunity } from '@/types/dashboard';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import { sendCommandToExtension, handleExtensionError, promptExtensionInstallation } from '@/lib/extensionService';
import { safeParseDate } from '@/lib/dateUtils';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
  onStatusUpdate?: (id: string, status: Opportunity['status']) => void;
  onDelete?: (id: string) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Review':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Applied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

const OpportunityTable = ({ 
  opportunities, 
  onOpportunityClick, 
  onStatusUpdate, 
  onDelete 
}: OpportunityTableProps) => {
  // Add error boundary for date parsing
  const safeOpportunities = opportunities.map(opp => {
    try {
      // Validate that required fields exist
      if (!opp.id || !opp.page_title) {
        console.warn('Invalid opportunity data:', opp);
        return null;
      }
      return opp;
    } catch (error) {
      console.error('Error processing opportunity:', opp, error);
      return null;
    }
  }).filter(Boolean) as Opportunity[];

  const formatDeadline = (deadline: string) => {
    const deadlineDate = safeParseDate(deadline);
    
    if (!deadlineDate) {
      return {
        formatted: 'No deadline',
        isUpcoming: false
      };
    }
    
    const now = new Date();
    const sevenDaysFromNow = subDays(now, -7);
    
    const isUpcoming = isAfter(sevenDaysFromNow, deadlineDate);
    const formatted = format(deadlineDate, 'MMM d, yyyy');
    
    return {
      formatted,
      isUpcoming
    };
  };

  const formatSavedDate = (dateString: string) => {
    const date = safeParseDate(dateString);
    
    if (!date) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opportunity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeOpportunities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm">No opportunities to display</p>
                    <p className="text-xs text-gray-400 mt-1">Try refreshing or check your data</p>
                  </div>
                </td>
              </tr>
            ) : (
              safeOpportunities.map((opportunity) => {
                const deadline = formatDeadline(opportunity.application_deadline);
                
                return (
                  <tr
                    key={opportunity.id}
                    className="hover:bg-gray-50 cursor-pointer group"
                    onClick={() => onOpportunityClick(opportunity)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto"
                          >
                            <StatusBadge status={opportunity.status} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusUpdate?.(opportunity.id, 'To Review');
                            }}
                          >
                            To Review
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusUpdate?.(opportunity.id, 'In Progress');
                            }}
                          >
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusUpdate?.(opportunity.id, 'Applied');
                            }}
                          >
                            Applied
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.page_title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {opportunity.funder_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${deadline.isUpcoming ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {deadline.formatted}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSavedDate(opportunity.date_saved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={async (e) => {
                              e.stopPropagation();
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
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            View with Extension
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this opportunity?')) {
                                onDelete?.(opportunity.id);
                              }
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunityTable;
