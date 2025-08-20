
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Zap, HelpCircle, DollarSign, Chrome } from "lucide-react";

export function FloatingNavigation() {
  const links = [
    {
      title: "Home",
      icon: <Home className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "#",
      label: "Home"
    },
    {
      title: "Features",
      icon: <Zap className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "#features",
      label: "Features"
    },
    {
      title: "How it Works",
      icon: <HelpCircle className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "#how-it-works",
      label: "Guide"
    },
    {
      title: "Pricing",
      icon: <DollarSign className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "#pricing",
      label: "Pricing"
    },
    {
      title: "Add to Chrome",
      icon: <Chrome className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "#",
      label: "Install"
    },
  ];

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative p-2 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-200/50 shadow-lg">
        <FloatingDock items={links} />
      </div>
    </div>
  );
}
