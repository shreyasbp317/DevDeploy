import { cn } from "../utils/cn";

interface MetricGaugeProps {
  label: string;
  value: number;
  unit?: string;
  colorThresholds?: { warn: number; danger: number };
}

export default function MetricGauge({ label, value, unit = "%", colorThresholds = { warn: 60, danger: 85 } }: MetricGaugeProps) {
  const color =
    value >= colorThresholds.danger
      ? { bar: "bg-red-500", text: "text-red-400", glow: "shadow-red-500/30" }
      : value >= colorThresholds.warn
      ? { bar: "bg-amber-400", text: "text-amber-300", glow: "shadow-amber-400/30" }
      : { bar: "bg-emerald-400", text: "text-emerald-400", glow: "shadow-emerald-400/30" };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{label}</span>
        <span className={cn("text-xs font-bold tabular-nums", color.text)}>
          {value.toFixed(0)}{unit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 shadow-sm", color.bar, color.glow)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
