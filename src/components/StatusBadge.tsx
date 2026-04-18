import { cn } from "../utils/cn";
import type { ServiceStatus } from "../data/mockData";

const config: Record<ServiceStatus, { label: string; dot: string; text: string; bg: string; ring: string; pulse: boolean }> = {
  running:   { label: "Running",   dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20", pulse: false },
  deploying: { label: "Deploying", dot: "bg-blue-400",    text: "text-blue-400",    bg: "bg-blue-500/10",    ring: "ring-blue-500/20",    pulse: true  },
  failed:    { label: "Failed",    dot: "bg-red-400",     text: "text-red-400",     bg: "bg-red-500/10",     ring: "ring-red-500/20",     pulse: false },
  stopped:   { label: "Stopped",   dot: "bg-slate-500",   text: "text-slate-400",   bg: "bg-slate-800",      ring: "ring-slate-700",      pulse: false },
};

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1",
        c.bg, c.text, c.ring,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", c.dot, c.pulse && "animate-pulse")} />
      {c.label}
    </span>
  );
}
