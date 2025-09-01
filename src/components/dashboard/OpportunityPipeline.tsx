
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Opportunity } from '@/types/dashboard';

interface OpportunityPipelineProps {
  opportunities: Opportunity[];
}

const OpportunityPipeline = ({ opportunities }: OpportunityPipelineProps) => {
  // Calculate totals
  const totalFundingFound = opportunities.reduce((sum, opp) => {
    return sum + (opp.funding_amount || 0);
  }, 0);

  const totalFundingApplied = opportunities
    .filter(opp => opp.status === 'Applied')
    .reduce((sum, opp) => {
      return sum + (opp.funding_amount || 0);
    }, 0);

  const applicationRate = totalFundingFound > 0 
    ? (totalFundingApplied / totalFundingFound) * 100 
    : 0;

  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Your Funding Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Found</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalFundingFound)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Applied</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalFundingApplied)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Application Rate</p>
            <div className="flex items-center gap-2">
              <Progress value={applicationRate} className="h-2 flex-1" />
              <span className="text-sm font-medium text-foreground min-w-[45px]">{applicationRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityPipeline;
