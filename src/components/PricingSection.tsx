
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Chrome, Star, Gift, Zap, Crown, Globe } from "lucide-react";
import { usePricing } from '@/hooks/usePricing';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const { plans, loading, country, currency, symbol } = usePricing();
  const navigate = useNavigate();

  const iconMap = {
    Gift,
    Zap,
    Crown
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 lg:mb-6">
            Save <span className="text-red-500 currency-symbol">{symbol}15K+/year</span> vs Hiring
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-4 currency-symbol">
            Why pay consultants {symbol}1,500-3,000/month when AI can do it better, faster, and cheaper?
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Globe className="h-4 w-4" />
            <span>Pricing for {country} • {currency}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = iconMap[plan.icon as keyof typeof iconMap];
            return (
              <div 
                key={index}
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
                  onClick={() => navigate('/pricing')}
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  {plan.buttonText}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 lg:mt-16">
          <p className="text-gray-500 text-sm sm:text-base mb-4">
            Secure payment via Razorpay • 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
