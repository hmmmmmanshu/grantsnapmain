
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  colorFrom = "#ff6b35",
  colorTo = "#f7931e",
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "[border:calc(var(--border-width,2px)*1)_solid_transparent]",
        "[mask-clip:padding-box,border-box] [mask-composite:intersect]",
        "[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-full after:animate-border-beam",
        "after:[animation-delay:var(--delay)] after:[animation-duration:var(--duration)]",
        "after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),var(--color-from))]",
        "after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
      style={
        {
          "--size": size,
          "--duration": `${duration}s`,
          "--delay": `${delay}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": "2px",
        } as React.CSSProperties
      }
    />
  );
};
