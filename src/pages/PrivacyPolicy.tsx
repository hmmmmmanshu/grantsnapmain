import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-slate-600 text-base sm:text-lg text-center sm:text-left">
            Last Updated: August 31, 2025
          </p>
        </div>

        {/* Content */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center text-slate-900">
              Privacy Policy for GrantSnap
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none px-4 sm:px-6 pb-6">
            <div className="space-y-4 sm:space-y-6 text-slate-700">
              <p className="text-base sm:text-lg leading-relaxed">
                GrantSnap ("us", "we", or "our") operates the grantsnap.pro website and the GrantSnap Chrome Extension (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
              </p>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">1. Information Collection and Use</h2>
                <p className="leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">
                  We collect several different types of information for various purposes to provide and improve our Service to you.
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                  <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information, such as your email address and name.</li>
                  <li><strong>Startup & Application Data:</strong> We collect and store the information you provide about your startup, including but not limited to your pitch deck, company profile, and the questions and AI-generated answers associated with your grant applications. This data is used solely to power the features of the Service for you.</li>
                  <li><strong>Usage Data:</strong> We may collect information on how the Service is accessed and used (e.g., features used, pages visited).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">2. Use of Data</h2>
                <p className="leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">
                  GrantSnap uses the collected data for various purposes:
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                  <li>To provide and maintain our Service.</li>
                  <li>To manage your account and subscriptions.</li>
                  <li>To provide the context required for our AI features to function.</li>
                  <li>To notify you about changes to our Service.</li>
                  <li>To provide customer support.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">3. Data Security</h2>
                <p className="leading-relaxed text-sm sm:text-base">
                  The security of your data is critical to us. We use industry-standard security measures, including data encryption and secure cloud infrastructure provided by Supabase, to protect your information. Your startup data is protected by Row Level Security, meaning only you can access it.
                </p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">4. Service Providers</h2>
                <p className="leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">
                  We employ third-party companies to facilitate our Service:
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                  <li><strong>Razorpay:</strong> To process payments.</li>
                  <li><strong>Supabase:</strong> For database, authentication, and backend infrastructure.</li>
                  <li><strong>OpenAI / Google Gemini:</strong> To provide artificial intelligence features.</li>
                </ul>
                <p className="leading-relaxed mt-2 sm:mt-3 text-sm sm:text-base">
                  These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">5. Your Data Rights</h2>
                <p className="leading-relaxed text-sm sm:text-base">
                  You have the right to access, update, or delete the information we have on you. You can do this at any time through your account settings on the dashboard.
                </p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">6. Changes to This Privacy Policy</h2>
                <p className="leading-relaxed text-sm sm:text-base">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">7. Contact Us</h2>
                <p className="leading-relaxed text-sm sm:text-base">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a 
                    href="mailto:RealStartup911@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    RealStartup911@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
