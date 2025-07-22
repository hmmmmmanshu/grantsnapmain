
import { cn } from "@/lib/utils";

const AnimatedBeamMultipleOutputDemo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background", className)}>
      <div className="flex flex-col items-center gap-8">
        {/* Central hub */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
          <span className="text-xl">🚀</span>
        </div>
        
        {/* Connected services */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: "💰", label: "Grants" },
            { icon: "👥", label: "Investors" },
            { icon: "🎯", label: "Mentors" },
            { icon: "📊", label: "Analytics" },
            { icon: "📧", label: "Outreach" },
            { icon: "📋", label: "Applications" },
          ].map((service, idx) => (
            <div
              key={idx}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm"
            >
              <span>{service.icon}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Animated connections */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-32 w-32 animate-pulse rounded-full border-2 border-dashed border-gray-300"></div>
      </div>
    </div>
  );
};

export default AnimatedBeamMultipleOutputDemo;
