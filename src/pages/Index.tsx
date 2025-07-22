
import Hero from "@/components/Hero";
import MinimalNavigation from "@/components/MinimalNavigation";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DemoSection from "@/components/DemoSection";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import SocialProof from "@/components/SocialProof";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <MinimalNavigation />
      <Hero />
      <SocialProof />
      <div id="features" className="scroll-mt-16">
        <ProblemSection />
        <SolutionSection />
        <DemoSection />
      </div>
      <div id="how-it-works" className="scroll-mt-16">
        <HowItWorks />
      </div>
      <div id="pricing" className="scroll-mt-16">
        <PricingSection />
      </div>
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
