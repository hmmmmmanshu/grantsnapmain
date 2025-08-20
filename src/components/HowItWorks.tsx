
import { MousePointer, Bot, Zap, Target } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MousePointer,
      number: "01",
      title: "Install & Browse",
      description: "Add Grants Snap to Chrome and browse funding opportunities as usual. Our extension runs silently in the background.",
      color: "bg-gray-100"
    },
    {
      icon: Bot,
      number: "02", 
      title: "AI Analysis",
      description: "Our AI copilot analyzes the grant or investor requirements and your startup profile for perfect alignment.",
      color: "bg-gray-100"
    },
    {
      icon: Zap,
      number: "03",
      title: "Auto-Fill & Optimize",
      description: "Click once to auto-fill applications with optimized content. Our AI ensures maximum approval chances.",
      color: "bg-gray-100"
    },
    {
      icon: Target,
      number: "04",
      title: "Track & Follow-up",
      description: "Monitor all applications in one dashboard. Automated follow-ups ensure nothing falls through the cracks.",
      color: "bg-gray-100"
    }
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 px-4">
            How <span className="text-gray-600">Grants Snap</span> Works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Four simple steps to revolutionize your funding process. 
            <span className="hidden sm:inline"> From manual chaos to automated success.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line for desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 z-0"></div>
              )}
              
              <div className="relative z-10 text-center p-4 sm:p-0">
                <div className={`inline-block p-4 sm:p-6 rounded-xl sm:rounded-2xl ${step.color} mb-4 sm:mb-6 shadow-lg border border-gray-200`}>
                  <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700" />
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-6xl font-bold text-gray-300">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-16 px-4">
          <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg font-semibold">
              🎯 From 10+ hours per week to 5 minutes per application
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
