import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/ProBadge';
import { Button } from '@/components/ui/button';
import { Zap, Brain, Search, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getPlanQuotas, calculateUsagePercentage, isNearLimit, hasExceededLimit, getPlanDisplayName } from '@/lib/planUtils';

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
  const [userTier, setUserTier] = useState<string>('basic');
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (user && userTier) {
      fetchUsageData();
    }
  }, [user, userTier]);

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (!error && data) {
        setUserTier(data.tier);
      } else {
        setUserTier('basic'); // Default to basic if no subscription found
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      setUserTier('basic');
    }
  };

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // Get dynamic quotas based on user's actual tier
      const currentTier = userTier || 'basic';
      const planQuotas = getPlanQuotas(currentTier);
      
      // For now, create mock usage data with dynamic quotas
      const mockUsageData = {
        current_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        usage_stats: {
          user_id: user?.id || '',
          month_start_date: new Date().toISOString().split('T')[0],
          ai_generations_used: 3, // Some realistic usage
          deep_scans_used: 1,
          updated_at: new Date().toISOString()
        },
        subscription: {
          tier: currentTier,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        quotas: planQuotas,
        progress: {
          ai_generations: calculateUsagePercentage(3, planQuotas.ai_generations),
          deep_scans: calculateUsagePercentage(1, planQuotas.deep_scans)
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <CardTitle className="text-lg">Usage This Month</CardTitle>
              <ProBadge tier={usageData.subscription.tier} />
            </div>
            {!isCollapsed && (
              <CardDescription className="mt-1">
                {`${new Date(usageData.usage_stats.month_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${new Date(usageData.subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </CardDescription>
            )}
          </div>
          
          {/* Collapsed View - Show compact progress bars */}
          {isCollapsed && (
            <div className="flex items-center gap-4 mr-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <div className="w-20">
                  <Progress value={usageData.progress.ai_generations} className="h-1.5" />
                </div>
                <span className="text-xs text-gray-500 w-12">{usageData.usage_stats.ai_generations_used}/{usageData.quotas.ai_generations}</span>
              </div>
              {usageData.quotas.deep_scans > 0 && (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <div className="w-20">
                    <Progress value={usageData.progress.deep_scans} className="h-1.5" />
                  </div>
                  <span className="text-xs text-gray-500 w-12">{usageData.usage_stats.deep_scans_used}/{usageData.quotas.deep_scans}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-2"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-0 space-y-6">
        {/* AI Generations Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-medium">AI Generations</span>
              {hasExceededLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations) && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {usageData.usage_stats.ai_generations_used} / {usageData.quotas.ai_generations}
              </span>
              <Badge 
                variant={
                  hasExceededLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations) 
                    ? "destructive" 
                    : isNearLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations)
                    ? "secondary" 
                    : "outline"
                } 
                className="text-xs"
              >
                {usageData.progress.ai_generations}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={usageData.progress.ai_generations} 
              className={`h-2 ${
                hasExceededLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations)
                  ? 'progress-danger'
                  : isNearLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations)
                  ? 'progress-warning'
                  : ''
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Used: {usageData.usage_stats.ai_generations_used}</span>
              <span>Limit: {usageData.quotas.ai_generations}</span>
            </div>
            {hasExceededLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations) && (
              <p className="text-xs text-red-600">⚠️ You've reached your monthly limit. Upgrade for more!</p>
            )}
            {isNearLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations) && 
             !hasExceededLimit(usageData.usage_stats.ai_generations_used, usageData.quotas.ai_generations) && (
              <p className="text-xs text-amber-600">🔔 You're close to your monthly limit</p>
            )}
          </div>
        </div>

        {/* Deep Scans Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Deep Scans</span>
              {usageData.quotas.deep_scans === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Pro Feature
                </Badge>
              )}
              {usageData.quotas.deep_scans > 0 && hasExceededLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans) && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {usageData.usage_stats.deep_scans_used} / {usageData.quotas.deep_scans || 'N/A'}
              </span>
              {usageData.quotas.deep_scans > 0 && (
                <Badge 
                  variant={
                    hasExceededLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans) 
                      ? "destructive" 
                      : isNearLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans)
                      ? "secondary" 
                      : "outline"
                  } 
                  className="text-xs"
                >
                  {usageData.progress.deep_scans}%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {usageData.quotas.deep_scans > 0 ? (
              <>
                <Progress 
                  value={usageData.progress.deep_scans} 
                  className={`h-2 ${
                    hasExceededLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans)
                      ? 'progress-danger'
                      : isNearLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans)
                      ? 'progress-warning'
                      : ''
                  }`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used: {usageData.usage_stats.deep_scans_used}</span>
                  <span>Limit: {usageData.quotas.deep_scans}</span>
                </div>
                {hasExceededLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans) && (
                  <p className="text-xs text-red-600">⚠️ You've reached your monthly limit. Upgrade for more!</p>
                )}
                {isNearLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans) && 
                 !hasExceededLimit(usageData.usage_stats.deep_scans_used, usageData.quotas.deep_scans) && (
                  <p className="text-xs text-amber-600">🔔 You're close to your monthly limit</p>
                )}
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deep Scans available in {userTier === 'basic' ? 'Proof' : 'Growth'} plan
                </p>
                <button 
                  onClick={() => window.open('/pricing', '_blank')}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Upgrade Now →
                </button>
              </div>
            )}
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
      )}
    </Card>
  );
}

export default UsageTracker;
