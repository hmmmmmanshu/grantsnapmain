
import { Button } from "@/components/ui/button";
import { ArrowDown, Chrome, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TypewriterEffect from "./TypewriterEffect";
import { RetroGrid } from "@/components/ui/retro-grid";
import WaitlistSection from "./WaitlistSection";

const Hero = () => {
  const navigate = useNavigate();
  const typewriterWords = [
    "Grant Applications",
    "Investor Outreach", 
    "Mentor Connections",
    "Costly Consultants"
  ];

  const scrollToWaitlist = () => {
    const waitlistSection = document.querySelector('.waitlist-section');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20 pb-8 px-4">
      {/* RetroGrid Background - reduced opacity for mobile */}
      <RetroGrid 
        opacity={0.2} 
        lightLineColor="#f3f4f6" 
        cellSize={40}
        angle={45}
        className="absolute inset-0" 
      />

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
        {/* Social Proof Badge - optimized for mobile */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-gray-700 text-xs sm:text-sm font-medium shadow-sm">
            <Chrome className="h-3 w-3 sm:h-4 sm:w-4 text-black mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Chrome Extension for Entrepreneurs</span>
            <span className="sm:hidden">Chrome Extension</span>
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2">
          Grants Snap
        </h1>
        
        <div className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-3 sm:mb-4 font-light min-h-[2.5em] sm:min-h-[2em] flex flex-col sm:flex-row items-center justify-center px-2">
          <span className="mb-1 sm:mb-0">Skip Hiring </span>
          <TypewriterEffect 
            words={typewriterWords}
            className="text-red-500 sm:ml-2 font-semibold"
            speed={150}
          />
        </div>
        
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          The AI-powered browser extension that replaces expensive consultants and interns. 
          <span className="hidden sm:inline"> Automate grant applications, investor outreach, and mentor connections while saving 
          thousands on hiring costs.</span>
        </p>

        {/* Key Benefit - mobile optimized */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
            <span className="text-xl sm:text-2xl">💡</span>
            <p className="text-yellow-800 font-semibold text-sm sm:text-lg text-center">
              Skip $2,000-$3,000/month consultant fees
              <span className="block sm:inline"> and $500-$600/month intern costs</span>
            </p>
          </div>
        </div>

        {/* Login Button */}
        <div className="mb-8 sm:mb-12">
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-black hover:bg-gray-800 text-white font-semibold text-lg px-8 py-3 rounded-xl transition-all duration-200"
          >
            Log In
          </Button>
        </div>

        {/* Alternative CTA - mobile optimized */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
          <Button 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:text-black px-6 py-3 text-base font-medium rounded-xl transition-all duration-200"
          >
            Watch Demo
          </Button>
        </div>

        {/* Stats - mobile grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-lg sm:max-w-2xl mx-auto text-center">
          <div className="p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-black">40+ Hours</div>
            <div className="text-xs sm:text-sm text-gray-600">Saved Per Application</div>
          </div>
          <div className="p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-black">$30K+</div>
            <div className="text-xs sm:text-sm text-gray-600">Annual Savings</div>
          </div>
          <div className="p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-black">AI-Powered</div>
            <div className="text-xs sm:text-sm text-gray-600">Smart Automation</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block">
        <ArrowDown className="h-5 w-5 text-gray-400 animate-bounce" />
      </div>
    </div>
  );
};

export default Hero;
