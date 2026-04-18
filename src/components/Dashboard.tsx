import { useState, useEffect } from "react";
import { Activity, Server, AlertTriangle, CheckCircle2, TrendingUp, Cpu, MemoryStick, RefreshCw, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SERVICES, generateTelemetry, type TelemetryPoint } from "../data/mockData";
import StatusBadge from "./StatusBadge";
import { cn } from "../utils/cn";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const STAT_CARDS = (services: typeof SERVICES) => {
  const running = services.filter((s) => s.status === "running").length;
  const failed = services.filter((s) => s.status === "failed").length;
  const deploying = services.filter((s) => s.status === "deploying").length;
  const avgCpu = Math.round(services.reduce((a, s) => a + s.cpu, 0) / services.length);
  return [
    { label: "Total Services", value: services.length.toString(), sub: `${running} healthy`, icon: Server, color: "text-cyan-400", bg: "bg-cyan-500/10", ring: "ring-cyan-500/20" },
    { label: "Running", value: running.toString(), sub: `${deploying} deploying`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20" },
    { label: "Incidents", value: failed.toString(), sub: "require attention", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", ring: "ring-red-500/20" },
    { label: "Avg CPU", value: `${avgCpu}%`, sub: "across all pods", icon: Cpu, color: "text-violet-400", bg: "bg-violet-500/10", ring: "ring-violet-500/20" },
  ];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#161b22]/90 p-3 text-xs shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 font-semibold text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {p.value.toFixed(1)}{p.unit ?? ""}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(() => generateTelemetry(38, 55, 20));
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, "0");
        const mm = now.getMinutes().toString().padStart(2, "0");
        const ss = now.getSeconds().toString().padStart(2, "0");
        next.push({
          time: `${hh}:${mm}:${ss}`,
          cpu: Math.max(2, Math.min(99, last.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(5, Math.min(99, last.memory + (Math.random() - 0.5) * 6)),
          requests: Math.floor(120 + Math.random() * 340),
        });
        return next;
      });
      setLastRefresh(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = STAT_CARDS(SERVICES);
  const currentCpu = telemetry[telemetry.length - 1]?.cpu ?? 0;
  const currentMem = telemetry[telemetry.length - 1]?.memory ?? 0;
  const currentRps = telemetry[telemetry.length - 1]?.requests ?? 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">System Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString()} · All times UTC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-full px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live telemetry
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-xl border border-white/[0.07] bg-[#161b22] p-4 ring-1", s.ring.replace("ring-", "ring-inset ring-"))}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                <p className={cn("text-3xl font-bold mt-1 tabular-nums", s.color)}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg ring-1", s.bg, s.ring)}>
                <s.icon className={cn("h-4.5 w-4.5", s.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Live CPU", value: currentCpu.toFixed(1) + "%", icon: Cpu, color: "text-cyan-400" },
          { label: "Live Memory", value: currentMem.toFixed(1) + "%", icon: MemoryStick, color: "text-violet-400" },
          { label: "Requests/min", value: currentRps.toString(), icon: TrendingUp, color: "text-amber-400" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/[0.07] bg-[#161b22] p-4 flex items-center gap-4">
            <m.icon className={cn("h-5 w-5 flex-shrink-0", m.color)} />
            <div>
              <p className="text-xs text-slate-500">{m.label}</p>
              <p className={cn("text-xl font-bold tabular-nums", m.color)}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Chart */}
      <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Cluster Telemetry</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-cyan-500/60" />CPU</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500/60" />Memory</span>
            <RefreshCw className="h-3 w-3 animate-spin text-slate-600" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={telemetry} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cpu" name="CPU" stroke="#22d3ee" strokeWidth={1.5} fill="url(#gradCpu)" dot={false} unit="%" />
            <Area type="monotone" dataKey="memory" name="Memory" stroke="#a78bfa" strokeWidth={1.5} fill="url(#gradMem)" dot={false} unit="%" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Services */}
      <div className="rounded-xl border border-white/[0.07] bg-[#161b22] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Services</h2>
          <button onClick={() => onNavigate("services")} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            View all <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {SERVICES.slice(0, 5).map((svc) => (
            <div key={svc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-white/[0.07] flex-shrink-0">
                <Server className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 font-mono">{svc.name}</p>
                <p className="text-xs text-slate-500 truncate">{svc.image}:{svc.tag} · port {svc.port}</p>
              </div>
              <StatusBadge status={svc.status} size="sm" />
              <div className="text-right hidden sm:block">
                <p className="text-xs font-mono text-slate-400">{svc.cpu}% CPU</p>
                <p className="text-xs text-slate-600">{svc.memory}% MEM</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
