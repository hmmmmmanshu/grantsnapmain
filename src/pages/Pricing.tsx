import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Chrome, Gift, Zap, Crown, Globe, CreditCard } from "lucide-react";
import { usePricing } from '@/hooks/usePricing';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Pricing = () => {
  const { plans, loading, error, country, currency, symbol, createSubscription } = usePricing();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const iconMap = {
    Gift,
    Zap,
    Crown
  };

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      navigate('/login');
      return;
    }

    if (plan.id === 'basic') {
      toast.info('Basic plan is free! You can start using it right away.');
      navigate('/dashboard');
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const subscriptionData = await createSubscription(plan.id);
      
      // Initialize Razorpay
      const options = {
        key: subscriptionData.razorpay_key_id,
        subscription_id: subscriptionData.subscription_id,
        name: 'GrantSnap',
        description: `${plan.name} Plan Subscription`,
        image: '/logo.png',
        handler: function (response: any) {
          toast.success('Payment successful! Welcome to Pro!');
          navigate('/dashboard');
        },
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email
        },
        notes: {
          plan: plan.name,
          user_id: user.id
        },
        theme: {
          color: '#000000'
        }
      };

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-lg font-semibold"
              >
                GrantSnap
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>{country} • {currency}</span>
              </div>
              {user ? (
                <Button onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 lg:mb-6">
              Choose Your Plan
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Save <span className="text-red-500 font-semibold">$30K+/year</span> vs hiring consultants
            </p>
            <p className="text-sm text-gray-500">
              Prices shown in {currency} • Secure payment via Razorpay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const IconComponent = iconMap[plan.icon as keyof typeof iconMap];
              const isCurrentPlan = plan.id === 'basic' && !user;
              
              return (
                <div 
                  key={plan.id}
                  className={`relative bg-white border-2 ${plan.borderColor} rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                    plan.popular ? 'ring-2 ring-black ring-opacity-20' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className={`text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center ${plan.bgColor} border ${plan.borderColor}`}>
                        <IconComponent className="h-4 w-4 mr-1" />
                        {plan.highlight}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-6 lg:mb-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-black mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <div>
                        <span className="text-4xl sm:text-5xl font-bold text-black">
                          {plan.price === 0 ? 'Free' : `${symbol}${plan.price}`}
                        </span>
                        <span className="text-gray-500 ml-2">{plan.period}</span>
                      </div>
                      {plan.originalPrice && plan.originalPrice !== plan.price && (
                        <div className="text-sm text-gray-400 line-through">
                          ${plan.originalPrice}/month
                        </div>
                      )}
                    </div>
                    
                    {/* Cost comparison */}
                    {plan.id === 'pro' && (
                      <div className="text-sm text-green-600 font-medium">
                        vs {symbol}500-600/month intern
                      </div>
                    )}
                    {plan.id === 'enterprise' && (
                      <div className="text-sm text-green-600 font-medium">
                        vs {symbol}2,000-3,000/month consultant
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-6 lg:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    size="lg" 
                    className={`w-full py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-black hover:bg-gray-800 text-white' 
                        : plan.id === 'basic'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-800 hover:bg-black text-white'
                    }`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan === plan.id}
                  >
                    {loadingPlan === plan.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    {loadingPlan === plan.id ? 'Processing...' : plan.buttonText}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12 lg:mt-16">
            <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
              <h3 className="text-2xl font-bold text-black mb-4">Why Choose GrantSnap?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-black mb-2">AI-Powered</h4>
                  <p className="text-sm text-gray-600">Advanced AI optimization for better grant applications</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Chrome className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-black mb-2">Chrome Extension</h4>
                  <p className="text-sm text-gray-600">Seamlessly capture opportunities from any website</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-black mb-2">Cost Effective</h4>
                  <p className="text-sm text-gray-600">Save thousands compared to hiring consultants</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm sm:text-base mt-8">
              Secure payment via Razorpay • 30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
