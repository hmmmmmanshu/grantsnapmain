
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Opportunity } from '@/types/dashboard';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
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

const OpportunityTable = ({ opportunities, onOpportunityClick }: OpportunityTableProps) => {
  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
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
    const date = new Date(dateString);
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
            {opportunities.map((opportunity) => {
              const deadline = formatDeadline(opportunity.application_deadline);
              
              return (
                <tr
                  key={opportunity.id}
                  className="hover:bg-gray-50 cursor-pointer group"
                  onClick={() => onOpportunityClick(opportunity)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={opportunity.status} />
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
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No opportunities found</p>
        </div>
      )}
    </div>
  );
};

export default OpportunityTable;
