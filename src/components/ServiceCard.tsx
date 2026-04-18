import { useState } from "react";
import { Server, RotateCcw, Play, Square, ChevronDown, ChevronUp, Clock, GitCommit, User, Copy, Check } from "lucide-react";
import { cn } from "../utils/cn";
import StatusBadge from "./StatusBadge";
import MetricGauge from "./MetricGauge";
import { type Service } from "../data/mockData";

interface ServiceCardProps {
  service: Service;
  onRollback: (serviceId: string, deploymentId: string, version: string) => void;
  onRestart: (serviceId: string) => void;
  onStop: (serviceId: string) => void;
}

const ENV_COLORS: Record<string, string> = {
  production: "bg-red-500/10 text-red-400 ring-red-500/20",
  staging: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  development: "bg-slate-700 text-slate-400 ring-slate-600",
};

export default function ServiceCard({ service, onRollback, onRestart, onStop }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${service.image}:${service.tag}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const successDeployments = service.deployments.filter((d) => d.status === "success");
  const rollbackTarget = successDeployments.find((d) => d.version !== service.tag);

  return (
    <div className={cn(
      "rounded-xl border bg-[#161b22] transition-all duration-200",
      service.status === "failed" ? "border-red-500/30" : "border-white/[0.07]"
    )}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border",
            service.status === "failed" ? "bg-red-500/10 border-red-500/30" : "bg-slate-800 border-white/[0.07]"
          )}>
            <Server className={cn("h-4 w-4", service.status === "failed" ? "text-red-400" : "text-slate-400")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-100 font-mono text-sm">{service.name}</h3>
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 uppercase", ENV_COLORS[service.environment])}>
                {service.environment}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-slate-500 font-mono">{service.image}:{service.tag}</span>
              <button onClick={handleCopy} className="text-slate-600 hover:text-slate-400 transition-colors">
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <StatusBadge status={service.status} size="sm" />
        </div>

        {/* Metrics */}
        <div className="mt-4 space-y-2">
          <MetricGauge label="CPU" value={service.cpu} />
          <MetricGauge label="Memory" value={service.memory} />
        </div>

        {/* Info row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: "Uptime", value: service.status === "running" ? service.uptime : "—" },
            { icon: Server, label: `Port / Replicas`, value: `${service.port} · ×${service.replicas}` },
            { icon: GitCommit, label: "Commit", value: service.commit === "N/A" ? "N/A" : service.commit },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg bg-slate-800/50 p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Icon className="h-3 w-3 text-slate-600" />
                <p className="text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-[11px] font-mono text-slate-300 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Last deploy */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <User className="h-3 w-3" />
          <span>Last deploy by <span className="text-slate-400 font-medium">{service.deployedBy}</span></span>
          <span className="ml-auto">{new Date(service.lastDeploy).toLocaleDateString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2">
          {service.status === "failed" && rollbackTarget && (
            <button
              onClick={() => onRollback(service.id, rollbackTarget.id, rollbackTarget.version)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold py-2 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Rollback to {rollbackTarget.version}
            </button>
          )}
          {service.status === "stopped" && (
            <button
              onClick={() => onRestart(service.id)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold py-2 transition-all"
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </button>
          )}
          {service.status === "running" && (
            <button
              onClick={() => onStop(service.id)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs font-medium py-2 px-3 transition-all"
            >
              <Square className="h-3 w-3" />
              Stop
            </button>
          )}
          {(service.status === "running" || service.status === "failed") && (
            <button
              onClick={() => onRestart(service.id)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs font-medium py-2 px-3 transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Restart
            </button>
          )}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs font-medium py-2 px-3 transition-all ml-auto"
          >
            History
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Deployment History */}
      {expanded && (
        <div className="border-t border-white/[0.07] px-4 py-3 space-y-2">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Deployment History</p>
          {service.deployments.map((dep, i) => (
            <div key={dep.id} className={cn(
              "flex items-center gap-3 rounded-lg p-2.5 border",
              i === 0 ? "bg-slate-800/60 border-white/[0.08]" : "bg-transparent border-transparent hover:bg-slate-800/30"
            )}>
              <div className={cn("h-2 w-2 rounded-full flex-shrink-0",
                dep.status === "success" ? "bg-emerald-400" : dep.status === "failed" ? "bg-red-400" : "bg-amber-400"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 font-mono">{dep.version}</span>
                  <span className={cn("text-[10px] font-medium rounded px-1 py-0.5",
                    dep.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                    dep.status === "failed" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
                  )}>{dep.status}</span>
                  {i === 0 && <span className="text-[10px] text-cyan-400 font-medium">● current</span>}
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {dep.commit} · {dep.deployedBy} · {dep.duration}
                </p>
              </div>
              {dep.status === "success" && i !== 0 && (
                <button
                  onClick={() => onRollback(service.id, dep.id, dep.version)}
                  className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded px-2 py-1 transition-all font-medium"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  Rollback
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
