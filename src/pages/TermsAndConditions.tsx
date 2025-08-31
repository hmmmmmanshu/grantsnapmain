import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
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
            Terms and Conditions
          </h1>
          <p className="text-slate-600 text-lg">
            Last Updated: August 31, 2025
          </p>
        </div>

        {/* Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-slate-900">
              Terms and Conditions for GrantSnap
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-slate-700">
              <p className="text-lg leading-relaxed">
                Welcome to GrantSnap! These Terms and Conditions ("Terms") govern your use of the grantsnap.pro website (the "Site"), our Chrome Extension, and the services we provide (collectively, the "Service"). By using our Service, you agree to these Terms.
              </p>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Accounts</h2>
                <p className="leading-relaxed">
                  When you create an account with us, you must provide information that is accurate and complete. You are responsible for safeguarding your password and for any activities or actions under your password.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Subscriptions</h2>
                <p className="leading-relaxed mb-3">
                  Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Payments:</strong> All payments are processed by our third-party payment processor, Razorpay.</li>
                  <li><strong>Cancellation:</strong> You may cancel your Subscription at any time. The cancellation will take effect at the end of the current Billing Cycle.</li>
                  <li><strong>Fee Changes:</strong> We reserve the right to change our subscription fees at any time. We will provide you with reasonable prior notice of any change in Subscription fees.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Content</h2>
                <p className="leading-relaxed mb-3">
                  Our Service allows you to post, link, store, share, and otherwise make available certain information, text, or other material ("Content"), including your startup profile, pitch deck information, and generated answers. You are responsible for the Content that you post on or through the Service.
                </p>
                <p className="leading-relaxed">
                  You retain any and all of your rights to any Content you submit. By submitting Content, you grant us the right and license to use, modify, and reproduce that Content on and through the Service solely for the purpose of providing the Service to you.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">4. AI-Generated Content</h2>
                <p className="leading-relaxed">
                  The Service uses artificial intelligence to generate suggested text for grant applications. This content is provided for assistance and as a starting point. You are solely responsible for reviewing, editing, and ensuring the accuracy and appropriateness of any AI-generated content before submitting it in any application. GrantSnap is not liable for any inaccuracies or outcomes based on the use of AI-generated content.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Prohibited Uses</h2>
                <p className="leading-relaxed">
                  You may not use the Service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  In no event shall GrantSnap, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Governing Law</h2>
                <p className="leading-relaxed">
                  These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms, please contact us at{' '}
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

export default TermsAndConditions;
