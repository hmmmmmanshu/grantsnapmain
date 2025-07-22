
import { Calendar, FileText, Bell, Share2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import AnimatedBeamMultipleOutputDemo from "@/registry/example/animated-beam-multiple-outputs";
import AnimatedListDemo from "@/registry/example/animated-list-demo";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";

const files = [
  {
    name: "grant-app.pdf",
    body: "SBIR Phase I application with detailed project proposal and budget breakdown for innovative technology development.",
  },
  {
    name: "investor-pitch.pptx",
    body: "Comprehensive pitch deck showcasing market opportunity, business model, and financial projections for Series A funding.",
  },
  {
    name: "mentor-connect.xlsx",
    body: "Database of potential mentors with expertise in startup scaling, industry connections, and strategic guidance.",
  },
  {
    name: "funding-tracker.csv",
    body: "Progress tracking for multiple funding applications with deadlines, requirements, and submission status.",
  },
  {
    name: "outreach-list.txt",
    body: "Curated list of investors and grant opportunities with contact information and application requirements.",
  },
];

const features = [
  {
    Icon: FileText,
    name: "Application Automation",
    description: "We automatically fill grant applications and investor forms as you browse.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Bell,
    name: "Smart Notifications",
    description: "Get notified about new funding opportunities and application deadlines.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2,
    name: "Network Connections",
    description: "Access 100+ funding sources, investors, and mentor connections.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: Calendar,
    name: "Deadline Tracking",
    description: "Never miss funding deadlines with our integrated calendar system.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <CalendarComponent
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90"
      />
    ),
  },
];

const SolutionSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-4">
            ✨ The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 lg:mb-6">
            Meet Your <span className="text-green-600">AI Funding Assistant</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Grants Snap automates everything you hate about funding applications, 
            so you can focus on what you love - building your business.
          </p>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>

        <div className="text-center mt-12 lg:mt-16">
          <div className="inline-block bg-white border-2 border-green-200 rounded-2xl px-6 lg:px-8 py-4 lg:py-6">
            <p className="text-gray-700 text-base sm:text-lg font-semibold">
              💡 Ready to stop wasting time on paperwork?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
