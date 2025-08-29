import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/ProBadge';
import { Zap, Brain, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface UsageStats {
  user_id: string;
  month_start_date: string;
  ai_generations_used: number;
  deep_scans_used: number;
  updated_at: string;
}

interface UsageData {
  current_month: string;
  usage_stats: UsageStats;
  subscription: {
    tier: string;
    current_period_end: string;
  };
  quotas: {
    ai_generations: number;
    deep_scans: number;
  };
  progress: {
    ai_generations: number;
    deep_scans: number;
  };
}

export function UsageTracker() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUsageData();
    }
  }, [user]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // For now, create mock usage data since the table might not exist yet
      const mockUsageData = {
        current_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        usage_stats: {
          user_id: user?.id || '',
          month_start_date: new Date().toISOString().split('T')[0],
          ai_generations_used: 0,
          deep_scans_used: 0,
          updated_at: new Date().toISOString()
        },
        subscription: {
          tier: 'basic',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        quotas: {
          ai_generations: 10,
          deep_scans: 5
        },
        progress: {
          ai_generations: 0,
          deep_scans: 0
        }
      };
      
      setUsageData(mockUsageData);
      
      // TODO: Uncomment when get-usage Edge Function is ready
      /*
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-usage`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsageData(data.data);
      */
    } catch (error) {
      console.error('Error fetching usage data:', error);
      // Don't show error toast for now since we're using mock data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>Loading your usage statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>Unable to load usage data</CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={fetchUsageData}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>
              {`${new Date(usageData.usage_stats.month_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${new Date(usageData.subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            </CardDescription>
          </div>
          <ProBadge tier={usageData.subscription.tier} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* AI Generations Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-medium">AI Generations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {usageData.usage_stats.ai_generations_used} / {usageData.quotas.ai_generations}
              </span>
              <Badge variant="outline" className="text-xs">
                {usageData.progress.ai_generations}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={usageData.progress.ai_generations} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Used: {usageData.usage_stats.ai_generations_used}</span>
              <span>Limit: {usageData.quotas.ai_generations}</span>
            </div>
          </div>
        </div>

        {/* Deep Scans Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Deep Scans</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {usageData.usage_stats.deep_scans_used} / {usageData.quotas.deep_scans}
              </span>
              <Badge variant="outline" className="text-xs">
                {usageData.progress.deep_scans}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={usageData.progress.deep_scans} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Used: {usageData.usage_stats.deep_scans_used}</span>
              <span>Limit: {usageData.quotas.deep_scans}</span>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchUsageData}
          className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 
                     hover:bg-blue-50 dark:hover:bg-blue-950/20 py-2 px-3 rounded-md transition-colors"
        >
          Refresh Usage Data
        </button>
      </CardContent>
    </Card>
  );
}

export default UsageTracker;
