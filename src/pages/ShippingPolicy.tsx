import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShippingPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 text-center sm:text-left">
            Shipping Policy
          </h1>
          <p className="text-slate-600 text-base sm:text-lg text-center sm:text-left">
            Understanding how our digital services are delivered
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg mb-4 sm:mb-6">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center text-slate-900 flex items-center justify-center gap-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Digital Service Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6 pb-6">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                  No Physical Shipping Required
                </h2>
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
                  As a provider of digital services (Software-as-a-Service), GrantSnap does not ship any physical products. All of our services are accessible immediately after subscription via our website and Chrome Extension.
                </p>
              </div>

              <div className="text-left space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  What This Means for You:
                </h3>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-slate-700 ml-2 sm:ml-4 text-sm sm:text-base">
                  <li><strong>Instant Access:</strong> Your subscription becomes active immediately after payment confirmation</li>
                  <li><strong>No Waiting:</strong> No shipping delays or delivery tracking needed</li>
                  <li><strong>Global Availability:</strong> Access our services from anywhere in the world</li>
                  <li><strong>Environmentally Friendly:</strong> No carbon footprint from shipping or packaging</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Access Information */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl text-slate-900">
              How to Access Your Services
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                  <Zap className="h-4 w-4 text-green-600" />
                  Web Platform
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Access your dashboard, grant opportunities, and AI tools directly through grantsnap.pro
                </p>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                  <Package className="h-4 w-4 text-blue-600" />
                  Chrome Extension
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Install our browser extension for seamless grant scanning and analysis
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 text-xs sm:text-sm">
                <strong>Need Help?</strong> If you have any questions about accessing your services, please contact us at{' '}
                <a 
                  href="mailto:RealStartup911@gmail.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  RealStartup911@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingPolicy;
