
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Your Funding Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Found</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(totalFundingFound)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Applied</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(totalFundingApplied)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Application Progress</span>
            <span>{applicationRate.toFixed(1)}%</span>
          </div>
          <Progress 
            value={applicationRate} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>{formatCurrency(totalFundingFound)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityPipeline;
