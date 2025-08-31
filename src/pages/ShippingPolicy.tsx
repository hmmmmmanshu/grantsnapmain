import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShippingPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Shipping Policy
          </h1>
          <p className="text-slate-600 text-lg">
            Understanding how our digital services are delivered
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-slate-900 flex items-center justify-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Digital Service Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-3">
                  No Physical Shipping Required
                </h2>
                <p className="text-slate-700 text-lg leading-relaxed">
                  As a provider of digital services (Software-as-a-Service), GrantSnap does not ship any physical products. All of our services are accessible immediately after subscription via our website and Chrome Extension.
                </p>
              </div>

              <div className="text-left space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  What This Means for You:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
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
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              How to Access Your Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  Web Platform
                </h4>
                <p className="text-slate-600 text-sm">
                  Access your dashboard, grant opportunities, and AI tools directly through grantsnap.pro
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Chrome Extension
                </h4>
                <p className="text-slate-600 text-sm">
                  Install our browser extension for seamless grant scanning and analysis
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 text-sm">
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
