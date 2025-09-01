import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProBadge } from '@/components/ui/ProBadge'
import { CreditCard, Calendar, DollarSign, Crown, TrendingUp, Users, Zap, Gift, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { usePricing } from '@/hooks/usePricing'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getPlanInfo } from '@/lib/planUtils'

interface SubscriptionData {
  id: string
  user_id: string
  tier: string
  status: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}



interface PlanFeatures {
  [key: string]: {
    name: string
    price: string
    features: string[]
    color: string
    icon: React.ReactNode
    buttonText: string
  }
}

// Use pricing page data that matches the main site
const PLAN_FEATURES: PlanFeatures = {
  basic: {
    name: 'Base',
    price: 'Free',
    features: [
      'Unlimited Grant Capture & Tracking',
      'Central Dashboard Access',
      '10 Concierge AI Autofills / month',
      'Standard Page Analysis',
      'Deadline Notifications',
      'Standard Email Support'
    ],
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    icon: <Gift className="w-4 h-4" />,
    buttonText: 'Start for Free'
  },
  pro: {
    name: 'Proof',
    price: '$39/month',
    features: [
      'Everything in Base, plus:',
      '150 Concierge AI Autofills / month',
      'Unlimited AI Answer Refinement Engine',
      'One-Click Pitch Deck Analysis',
      'Priority Email Support'
    ],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    icon: <Zap className="w-4 h-4" />,
    buttonText: 'Get Proof'
  },
  enterprise: {
    name: 'Growth',
    price: '$59/month',
    features: [
      'Everything in Proof, plus:',
      '400 Concierge AI Autofills / month',
      '25 Deep Scans / month (with HyperBrowser)',
      'Analytics Dashboard',
      'Data Export Capabilities',
      'Priority Email & Phone Support'
    ],
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
    icon: <Crown className="w-4 h-4" />,
    buttonText: 'Scale with Growth'
  }
}

export function BillingSection() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { plans, createSubscription } = usePricing()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    }
  }, [user])

    const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Try to fetch real subscription data first
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single()

      if (!error && data) {
        setSubscription(data)
      } else {
        // If no subscription found, user is on basic plan
        const basicSubscription = {
          id: 'basic-default',
          user_id: user?.id || '',
          tier: 'basic',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now for free plan
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setSubscription(basicSubscription)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      // Default to basic plan on error
      const basicSubscription = {
        id: 'basic-error',
        user_id: user?.id || '',
        tier: 'basic',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setSubscription(basicSubscription)
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

  const getDaysUntilRenewal = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const handleUpgrade = () => {
    navigate('/pricing')
  }

  const handleManageBilling = () => {
    // TODO: Implement billing management
    toast.info('Billing management coming soon!')
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>Loading your subscription details...</CardDescription>
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

  if (!subscription) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Plan</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're currently on the free plan. Upgrade to unlock Pro features.
            </p>
            <Button onClick={handleUpgrade} className="bg-amber-600 hover:bg-amber-700">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const plan = PLAN_FEATURES[subscription.tier] || PLAN_FEATURES.basic
  const daysUntilRenewal = getDaysUntilRenewal(subscription.current_period_end)

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <ProBadge tier={subscription.tier} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plan Overview */}
          <div className={`p-4 rounded-lg ${plan.color}`}>
            <div className="flex items-center gap-3 mb-3">
              {plan.icon}
              <div>
                <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                <p className="text-sm opacity-80">{plan.price}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-3 h-3 text-current opacity-60 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Billing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <Badge 
                  variant={subscription.status === 'active' ? 'default' : 'secondary'}
                >
                  {subscription.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Started:</span>
                <span className="font-medium">{formatDate(subscription.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Period:</span>
                <span className="font-medium">{formatDate(subscription.current_period_start)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.tier === 'basic' ? 'Free Forever' : 'Renews:'}
                </span>
                <span className="font-medium">
                  {subscription.tier === 'basic' ? 'No Expiration' : formatDate(subscription.current_period_end)}
                </span>
              </div>
              
              {subscription.tier !== 'basic' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Days Left:</span>
                  <Badge variant="outline" className={daysUntilRenewal <= 7 ? 'border-red-300 text-red-600' : ''}>
                    {daysUntilRenewal} days
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="font-medium">{formatDate(subscription.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleManageBilling} 
              variant="outline" 
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
            
            {subscription.tier === 'basic' ? (
              <Button 
                onClick={handleUpgrade} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button 
                onClick={handleUpgrade} 
                variant="outline" 
                className="flex-1"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Change Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Available Plans
          </CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLAN_FEATURES).map(([key, planData]) => (
              <div 
                key={key}
                className={`p-4 rounded-lg border-2 transition-all ${
                  subscription.tier === key 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {planData.icon}
                  <h3 className="font-semibold">{planData.name}</h3>
                  {subscription.tier === key && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                </div>
                
                <p className="text-2xl font-bold mb-3">{planData.price}</p>
                
                <ul className="space-y-2 mb-4">
                  {planData.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {subscription.tier !== key && (
                  <Button 
                    onClick={handleUpgrade} 
                    variant="outline" 
                    className="w-full"
                    size="sm"
                  >
                    {planData.buttonText}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BillingSection;
