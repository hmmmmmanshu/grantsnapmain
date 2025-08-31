import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactUs: React.FC = () => {
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
            Contact Us
          </h1>
          <p className="text-slate-600 text-base sm:text-lg text-center sm:text-left">
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  Email Support
                </h3>
                <p className="text-slate-600 mb-2 sm:mb-3 text-sm sm:text-base">
                  The best way to reach our team is by sending an email to:
                </p>
                <a 
                  href="mailto:RealStartup911@gmail.com"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-base sm:text-lg"
                >
                  <Mail className="h-4 w-4" />
                  RealStartup911@gmail.com
                </a>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-slate-200">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Response Time
                </h3>
                <p className="text-slate-600 text-sm sm:text-base">
                  We aim to respond to all inquiries within <strong>24-48 hours</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Address */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                    Company Location
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    Himachal Pradesh, India
                  </p>
                </div>
                
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                    Office Hours
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                    Saturday: 10:00 AM - 2:00 PM IST<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="mt-4 sm:mt-6 shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl text-slate-900">
              Need Immediate Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">
              For urgent matters or technical support, please include the following in your email:
            </p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-slate-600 ml-2 sm:ml-4 text-sm sm:text-base">
              <li>Your account email address</li>
              <li>A clear description of the issue</li>
              <li>Any error messages you're seeing</li>
              <li>Steps to reproduce the problem</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactUs;
