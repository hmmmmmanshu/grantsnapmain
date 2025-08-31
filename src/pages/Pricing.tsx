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
      // For now, let's simulate the subscription process
      // TODO: Replace with actual Edge Function call when deployed
      console.log('Attempting to subscribe to plan:', plan.id);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success message
      toast.success(`Successfully subscribed to ${plan.name}! Redirecting to dashboard...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

      // TODO: Uncomment when Edge Functions are deployed
      /*
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
      */

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
               Save <span className="text-red-500 font-semibold currency-symbol">{symbol}15K+/year</span> vs hiring consultants
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
                                                 <span className="text-4xl sm:text-5xl font-bold text-black currency-symbol">
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
                       <div className="text-sm text-green-600 font-medium currency-symbol">
                         vs {symbol}800-1,200/month intern
                       </div>
                     )}
                     {plan.id === 'enterprise' && (
                       <div className="text-sm text-green-600 font-medium currency-symbol">
                         vs {symbol}1,500-3,000/month consultant
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
             <div className="bg-white rounded-2xl p-8 max-w-6xl mx-auto shadow-lg">
               <h3 className="text-3xl font-bold text-black mb-8">Powerful Features That Set You Apart</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Zap className="h-8 w-8 text-blue-600" />
                   </div>
                   <h4 className="text-xl font-semibold text-black mb-3">AI Concierge Autofill</h4>
                   <p className="text-gray-600 leading-relaxed">
                     Intelligent form filling that adapts to your startup's unique story and automatically populates grant applications with precision
                   </p>
                 </div>
                 <div className="text-center">
                   <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Chrome className="h-8 w-8 text-green-600" />
                   </div>
                   <h4 className="text-xl font-semibold text-black mb-3">One-Click Capture</h4>
                   <p className="text-gray-600 leading-relaxed">
                     Instantly save grant opportunities from any website with our Chrome extension. Never miss a funding opportunity again
                   </p>
                 </div>
                 <div className="text-center">
                   <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Crown className="h-8 w-8 text-purple-600" />
                   </div>
                   <h4 className="text-xl font-semibold text-black mb-3">Deep Scan Analysis</h4>
                   <p className="text-gray-600 leading-relaxed">
                     Advanced AI that analyzes funder websites to understand their mission, values, and past funding patterns
                   </p>
                 </div>
                 <div className="text-center">
                   <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Gift className="h-8 w-8 text-orange-600" />
                   </div>
                   <h4 className="text-xl font-semibold text-black mb-3">Smart Answer Refinement</h4>
                   <p className="text-gray-600 leading-relaxed">
                     AI-powered suggestions that help you craft compelling answers to grant questions, tailored to your startup's story
                   </p>
                 </div>
                 <div className="text-center">
                   <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Check className="h-8 w-8 text-indigo-600" />
                   </div>
                   <h4 className="text-xl font-semibold text-black mb-3">Progress Tracking</h4>
                   <p className="text-gray-600 leading-relaxed">
                     Visual dashboard showing your grant pipeline, deadlines, and application status. Stay organized and never miss a deadline
                   </p>
                 </div>
                 <div className="text-center">
                   <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <CreditCard className="h-8 w-8 text-pink-600" />
                   </div>
                   <h4 className="text-xl font-semibold text-black mb-3">Cost Savings</h4>
                   <p className="text-gray-600 leading-relaxed">
                     Save $15K+ annually compared to hiring consultants. Get professional-level grant writing at a fraction of the cost
                   </p>
                 </div>
               </div>
             </div>
             
             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto mt-8 shadow-lg">
               <h3 className="text-2xl font-bold text-black mb-4">Trusted by Founders Worldwide</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                 <div>
                   <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                   <div className="text-gray-600">Grants Captured</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-green-600 mb-2">$2M+</div>
                   <div className="text-gray-600">Funding Secured</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                   <div className="text-gray-600">Success Rate</div>
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
