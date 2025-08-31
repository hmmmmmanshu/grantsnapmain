import { useState, useEffect } from 'react';
import { useLocation } from './useLocation';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular: boolean;
  highlight: string;
  borderColor: string;
  bgColor: string;
  icon: string;
  currency: string;
  symbol: string;
  razorpayPlanId?: string;
}

interface PricingData {
  plans: PricingPlan[];
  loading: boolean;
  error: string | null;
}

// Base pricing in USD
const BASE_PRICING = {
  basic: {
    name: "Basic",
    price: 0,
    period: "forever",
    description: "Perfect for trying out Grants Snap",
    features: [
      "3 Form auto-fills per week",
      "Basic AI optimization",
      "Chrome extension access",
      "Email support",
      "Save on consultant fees"
    ],
    buttonText: "Get Started Free",
    popular: false,
    highlight: "Free Forever",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    icon: "Gift"
  },
  pro: {
    name: "Pro",
    price: 29,
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
    buttonText: "Upgrade to Pro",
    popular: true,
    highlight: "Most Popular",
    borderColor: "border-black",
    bgColor: "bg-gray-50",
    icon: "Zap",
    razorpayPlanId: "plan_pro_monthly"
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
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
    buttonText: "Upgrade to Enterprise",
    popular: false,
    highlight: "Best Value",
    borderColor: "border-gray-300",
    bgColor: "bg-gray-50",
    icon: "Crown",
    razorpayPlanId: "plan_enterprise_monthly"
  }
};

// Currency conversion rates (in a real app, you'd fetch these from an API)
const CURRENCY_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52
};

export const usePricing = () => {
  const { country, currency, symbol, loading: locationLoading } = useLocation();
  const { user } = useAuth();
  const [pricingData, setPricingData] = useState<PricingData>({
    plans: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (locationLoading) return;

    const generatePricing = () => {
      try {
        const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
        
        const plans: PricingPlan[] = Object.entries(BASE_PRICING).map(([key, plan]) => {
          const convertedPrice = Math.round(plan.price * rate);
          
          return {
            id: key,
            name: plan.name,
            price: convertedPrice,
            originalPrice: plan.price,
            period: plan.period,
            description: plan.description,
            features: plan.features,
            buttonText: plan.buttonText,
            popular: plan.popular,
            highlight: plan.highlight,
            borderColor: plan.borderColor,
            bgColor: plan.bgColor,
            icon: plan.icon,
            currency,
            symbol,
            razorpayPlanId: plan.razorpayPlanId
          };
        });

        setPricingData({
          plans,
          loading: false,
          error: null
        });
      } catch (error) {
        setPricingData({
          plans: [],
          loading: false,
          error: 'Failed to generate pricing'
        });
      }
    };

    generatePricing();
  }, [currency, symbol, locationLoading]);

  const createSubscription = async (planId: string) => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  return {
    ...pricingData,
    country,
    currency,
    symbol,
    createSubscription
  };
};
