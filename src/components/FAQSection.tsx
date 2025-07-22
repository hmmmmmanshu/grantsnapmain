
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How does Grants Snap save me time?",
      answer: "Grants Snap uses AI to automatically fill out grant applications and investor forms by analyzing your startup data. Instead of spending 10+ hours per week on paperwork, you can complete applications in minutes with our intelligent auto-fill technology."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption and never store your sensitive information on our servers. All data processing happens locally in your browser, and we comply with GDPR and SOC 2 security standards."
    },
    {
      question: "What browsers are supported?",
      answer: "Currently, Grants Snap is available as a Chrome extension. Support for Firefox, Safari, and Edge is coming soon. You'll need Chrome version 88 or higher for optimal performance."
    },
    {
      question: "Can I get a refund?",
      answer: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with Grants Snap for any reason, contact our support team within 30 days of purchase for a full refund."
    },
    {
      question: "How accurate is the AI form filling?",
      answer: "Our AI achieves 95%+ accuracy in form filling by learning from your previous applications and startup data. You can always review and edit before submitting, ensuring 100% accuracy for your specific needs."
    },
    {
      question: "Do you support international applications?",
      answer: "Yes! Grants Snap works with grant applications and investor forms globally. Our AI is trained on international funding sources and can adapt to different form formats and requirements."
    },
    {
      question: "What happens after I use up my form fills?",
      answer: "For the Proof plan (15 fills), you can upgrade to Growth for unlimited access. Your progress and templates are saved, so you won't lose any work when upgrading."
    },
    {
      question: "How do I install the extension?",
      answer: "After purchase, you'll receive an email with installation instructions. Simply click 'Add to Chrome' and follow the setup wizard. The entire process takes less than 2 minutes."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 lg:mb-6">
            Frequently Asked <span className="text-gray-600">Questions</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Everything you need to know about Grants Snap
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 border border-gray-200 rounded-xl px-6 hover:bg-gray-100 transition-colors"
            >
              <AccordionTrigger className="text-left text-black hover:text-gray-700 py-6 text-base sm:text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6 text-sm sm:text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-2">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                H
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                A
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">Got a question?</h3>
          <p className="text-gray-600 mb-6">Talk to our team Himanshu and Akshay</p>
          <a 
            href="mailto:support@grantssnap.com" 
            className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Book a call
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
