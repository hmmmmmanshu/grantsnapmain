
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chrome, Mail, Users, Clock, Shield, CheckCircle } from "lucide-react";

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistCount] = useState(1247);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Waitlist signup:', email);
      setIsSubmitted(true);
      setEmail('');
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-sm sm:max-w-md mx-auto">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">You're In!</h3>
        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
          We'll notify you the moment Grants Snap launches with your exclusive early-bird access.
        </p>
        <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Position #{waitlistCount + 1} on the waitlist</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-sm max-w-sm sm:max-w-md mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Chrome className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Get Early Access</h3>
        <p className="text-gray-600 text-xs sm:text-sm">
          Be first to access Grants Snap when we launch. Lock in 50% off your first year.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 text-base"
        />
        <Button 
          type="submit" 
          className="w-full bg-black hover:bg-gray-800 text-white font-medium h-12 text-base"
        >
          Save $30K This Year - Join Waitlist
        </Button>
      </form>

      {/* Risk Reversal - mobile optimized */}
      <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2 text-blue-800 text-xs sm:text-sm">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium">Risk-Free Guarantee:</span>
            <p className="text-blue-700 text-xs mt-1">
              If you're not saving $1,000+ in your first month, we'll refund 100% of your payment.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{waitlistCount.toLocaleString()} joined</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Launch: July 15, 2025</span>
            <span className="sm:hidden">July 15, 2025</span>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs text-gray-600 font-medium">
          Early Access: 50% off first year + exclusive premium features
        </p>
      </div>
    </div>
  );
};

export default WaitlistSection;
