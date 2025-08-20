
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Chrome, Star, Gift, Zap, Crown } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Base",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out Grants Snap",
      features: [
        "3 Form auto-fills per week",
        "Basic AI optimization",
        "Chrome extension access",
        "Email support",
        "Save on consultant fees"
      ],
      buttonText: "Join Waitlist - Free Plan",
      popular: false,
      icon: Gift,
      highlight: "Free Forever",
      borderColor: "border-green-200",
      bgColor: "bg-green-50"
    },
    {
      name: "Proof",
      price: "$39",
      period: "monthly",
      description: "Great for regular grant applications",
      features: [
        "15 Form auto-fills per week",
        "Advanced AI optimization",
        "Chrome extension access",
        "Priority email support",
        "Progress tracking",
        "Replace part-time intern costs"
      ],
      buttonText: "Join Waitlist - 50% Off",
      popular: true,
      icon: Zap,
      highlight: "Most Popular",
      borderColor: "border-black",
      bgColor: "bg-gray-50",
      earlyBirdPrice: "$19.50",
      earlyBirdSavings: "50% off first year"
    },
    {
      name: "Growth",
      price: "$59",
      period: "monthly",
      description: "Unlimited access for scaling startups",
      features: [
        "Unlimited form fills per month",
        "Advanced AI copilot",
        "Priority support & phone calls",
        "Custom templates",
        "Analytics dashboard",
        "Export capabilities",
        "Replace full consultant team"
      ],
      buttonText: "Join Waitlist - 50% Off",
      popular: false,
      icon: Crown,
      highlight: "Best Value",
      borderColor: "border-gray-300",
      bgColor: "bg-gray-50",
      earlyBirdPrice: "$29.50",
      earlyBirdSavings: "50% off first year"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-4">
            Early Bird Special - Limited Time
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 lg:mb-6">
            Save <span className="text-red-500">$30K+/year</span> vs Hiring
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Why pay consultants $2,000-5,000/month when AI can do it better, faster, and cheaper?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={index}
                className={`relative bg-white border-2 ${plan.borderColor} rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center ${plan.bgColor} border ${plan.borderColor}`}>
                    <IconComponent className="h-4 w-4 mr-1" />
                    {plan.highlight}
                  </div>
                </div>
                
                <div className="text-center mb-6 lg:mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-black mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    {plan.earlyBirdPrice ? (
                      <div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl sm:text-3xl font-bold text-red-500">{plan.earlyBirdPrice}</span>
                          <span className="text-lg text-gray-400 line-through">{plan.price}</span>
                          <span className="text-gray-500 ml-2">{plan.period}</span>
                        </div>
                        <p className="text-sm text-red-600 font-medium mt-1">{plan.earlyBirdSavings}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl sm:text-5xl font-bold text-black">{plan.price}</span>
                        <span className="text-gray-500 ml-2">{plan.period}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Cost comparison */}
                  {plan.name === 'Proof' && (
                    <div className="text-sm text-green-600 font-medium">
                      vs $500-600/month intern
                    </div>
                  )}
                  {plan.name === 'Growth' && (
                    <div className="text-sm text-green-600 font-medium">
                      vs $2,000-3,000/month consultant
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
                      : 'bg-gray-800 hover:bg-black text-white'
                  }`}
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
            Secure waitlist signup • 30-day money-back guarantee • Instant early access
          </p>
          <p className="text-gray-700 font-semibold text-lg">
            Lock in 50% off your first year - Limited to first 1,000 members
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
