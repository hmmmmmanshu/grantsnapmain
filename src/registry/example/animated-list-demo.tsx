
import { cn } from "@/lib/utils";

const AnimatedListDemo = ({ className }: { className?: string }) => {
  const notifications = [
    {
      name: "Grant Application",
      description: "SBIR Phase I submitted",
      time: "15m ago",
      icon: "💰",
    },
    {
      name: "Investor Outreach",
      description: "3 new investor contacts",
      time: "10m ago",
      icon: "📧",
    },
    {
      name: "Form Completion",
      description: "Application auto-filled",
      time: "5m ago",
      icon: "✅",
    },
    {
      name: "Progress Update",
      description: "75% completion rate",
      time: "2m ago",
      icon: "📊",
    },
  ];

  return (
    <div className={cn("relative flex h-[400px] w-full flex-col p-6 overflow-hidden", className)}>
      <div className="flex flex-col gap-3">
        {notifications.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
            style={{
              animationDelay: `${idx * 0.5}s`,
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg">{item.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <div className="text-xs text-gray-400">{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedListDemo;
