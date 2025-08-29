import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ProBadge } from '@/components/ui/ProBadge'
import { Brain, Search, Calendar, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface UsageStats {
  user_id: string
  month_start_date: string
  ai_generations_used: number
  deep_scans_used: number
  updated_at: string
}

interface SubscriptionInfo {
  tier: string
  status: string
  current_period_start: string
  current_period_end: string
}

interface UsageData {
  current_month: string
  usage_stats: UsageStats
  subscription: SubscriptionInfo
  quotas: {
    ai_generations: number
    deep_scans: number
  }
  progress: {
    ai_generations: number
    deep_scans: number
  }
}

export function UsageTracker() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUsageData()
    }
  }, [user])

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-usage`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const data = await response.json()
      setUsageData(data.data)
    } catch (error) {
      console.error('Error fetching usage data:', error)
      toast.error('Failed to load usage statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

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
    )
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
    )
  }

  const { usage_stats, subscription, quotas, progress } = usageData

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
              {formatDate(usage_stats.month_start_date)} - {formatDate(subscription.current_period_end)}
            </CardDescription>
          </div>
          <ProBadge tier={subscription.tier} />
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
                {usage_stats.ai_generations_used} / {quotas.ai_generations}
              </span>
              <Badge variant="outline" className="text-xs">
                {progress.ai_generations}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={progress.ai_generations} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Used: {usage_stats.ai_generations_used}</span>
              <span>Limit: {quotas.ai_generations}</span>
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
                {usage_stats.deep_scans_used} / {quotas.deep_scans}
              </span>
              <Badge variant="outline" className="text-xs">
                {progress.deep_scans}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={progress.deep_scans} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Used: {usage_stats.deep_scans_used}</span>
              <span>Limit: {quotas.deep_scans}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Plan:</span>
            <span className="font-medium capitalize">{subscription.tier}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <Badge 
              variant={subscription.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {subscription.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-400">Renews:</span>
            <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
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
  )
}

export default UsageTracker;
