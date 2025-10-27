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

// Base pricing in USD (Updated with new AI features)
const BASE_PRICING = {
  basic: {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started with grant discovery and tracking",
    features: [
      "Unlimited Grant Discovery & Saving",
      "Heuristic Analysis (Unlimited)",
      "Central Dashboard Access",
      "Deadline Notifications",
      "Standard Email Support",
      "Deep Scans: 0 (upgrade required)",
      "AI Autofills: 0 (upgrade required)"
    ],
    buttonText: "Start for Free",
    popular: false,
    highlight: "Free Forever",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    icon: "Gift"
  },
  pro: {
    name: "Starter",
    price: 59,
    period: "monthly",
    description: "Unlock AI-powered deep scans and grant auto-filling for serious founders",
    features: [
      "Everything in Free, plus:",
      "50 Deep Scans / month (Gemini 2.5)",
      "30 AI Autofills / month (RAG-powered)",
      "RAG-Powered Personalization",
      "One-Click Pitch Deck Analysis",
      "Priority Email Support"
    ],
    buttonText: "Get Starter",
    popular: true,
    highlight: "Most Popular",
    borderColor: "border-black",
    bgColor: "bg-gray-50",
    icon: "Zap",
    razorpayPlanId: "plan_pro_monthly"
  },
  enterprise: {
    name: "Pro",
    price: 99,
    period: "monthly",
    description: "Maximum AI power for scaling startups applying to dozens of grants monthly",
    features: [
      "Everything in Starter, plus:",
      "150 Deep Scans / month (Gemini 2.5)",
      "100 AI Autofills / month (RAG-powered)",
      "Advanced Analytics Dashboard",
      "Custom Templates",
      "Data Export Capabilities",
      "Priority Email & Phone Support"
    ],
    buttonText: "Get Pro",
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

  const createGuestSubscription = async (planId: string, email: string) => {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-guest-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create guest subscription');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating guest subscription:', error);
      throw error;
    }
  };

  return {
    ...pricingData,
    country,
    currency,
    symbol,
    createSubscription,
    createGuestSubscription
  };
};
