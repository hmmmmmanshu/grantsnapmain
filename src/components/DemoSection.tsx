
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Chrome, Shield, CheckCircle } from "lucide-react";

const DemoSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 lg:mb-6">
            See Grants Snap in <span className="text-gray-600">Action</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how our AI transforms a 40-hour grant application into a 30-second automated process.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Demo GIF Placeholder */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50"></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="bg-black/80 backdrop-blur-sm border border-black/20 rounded-full p-6 group-hover:scale-110 transition-transform">
                  <Play className="h-12 w-12 text-white ml-1" />
                </div>
              </div>
              
              {/* Demo GIF will be placed here */}
              <img 
                src="/placeholder.svg" 
                alt="Grants Snap Demo"
                className="w-full h-full object-cover opacity-20"
              />
              
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm font-medium">Demo: Auto-filling a $50K grant in 30 seconds</p>
              </div>
            </div>
          </div>
          
          {/* Risk Reversal Demo Guarantee */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Risk-Free Demo Guarantee</h3>
            </div>
            <p className="text-green-700 text-center text-sm">
              Try Grants Snap for 30 days. If you don't save at least $1,000 in consultant fees, we'll refund every penny.
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-green-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>No contracts</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>100% refund</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Chrome className="mr-2 h-5 w-5" />
              Get Early Access - Save $30K This Year
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
