import { useState, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { SERVICES, type Service, type ServiceStatus } from "../data/mockData";
import ServiceCard from "./ServiceCard";
import { cn } from "../utils/cn";

const FILTERS: { label: string; value: ServiceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Deploying", value: "deploying" },
  { label: "Failed", value: "failed" },
  { label: "Stopped", value: "stopped" },
];

interface Toast {
  id: string;
  message: string;
  type: "success" | "warn" | "error";
}

export default function ServicesPanel() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ServiceStatus | "all">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  const handleRollback = useCallback((serviceId: string, _depId: string, version: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, status: "deploying" as ServiceStatus, tag: version }
          : s
      )
    );
    addToast(`Rolling back to ${version}...`, "warn");
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, status: "running" as ServiceStatus } : s
        )
      );
      addToast(`Rollback to ${version} completed ✓`, "success");
    }, 3000);
  }, []);

  const handleRestart = useCallback((serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status: "deploying" as ServiceStatus } : s))
    );
    addToast(`Restarting ${svc?.name}...`, "warn");
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, status: "running" as ServiceStatus, cpu: Math.floor(10 + Math.random() * 30), uptime: "0d 0h 0m" } : s))
      );
      addToast(`${svc?.name} restarted successfully ✓`, "success");
    }, 2500);
  }, [services]);

  const handleStop = useCallback((serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status: "stopped" as ServiceStatus, cpu: 0, uptime: "0d 0h 0m" } : s))
    );
    addToast(`${svc?.name} stopped`, "warn");
  }, [services]);

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.image.toLowerCase().includes(search.toLowerCase()) ||
      s.tag.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: services.length,
    running: services.filter((s) => s.status === "running").length,
    deploying: services.filter((s) => s.status === "deploying").length,
    failed: services.filter((s) => s.status === "failed").length,
    stopped: services.filter((s) => s.status === "stopped").length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-xl border backdrop-blur-sm transition-all duration-300",
              t.type === "success" && "bg-emerald-950/90 border-emerald-500/40 text-emerald-300",
              t.type === "warn" && "bg-amber-950/90 border-amber-500/40 text-amber-300",
              t.type === "error" && "bg-red-950/90 border-red-500/40 text-red-300"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Services</h1>
          <p className="text-sm text-slate-500 mt-0.5">{services.length} microservices · Docker / Nginx</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services, images, tags..."
            className="w-full rounded-lg bg-[#161b22] border border-white/[0.07] pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[#161b22] border border-white/[0.07] p-1">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2 mr-1" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                filter === f.value
                  ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {f.label}
              {statusCounts[f.value] > 0 && (
                <span className={cn(
                  "ml-1.5 text-[10px] font-semibold",
                  f.value === "failed" && statusCounts.failed > 0 ? "text-red-400" : "opacity-60"
                )}>
                  {statusCounts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600">
          <Search className="h-8 w-8 mb-3" />
          <p className="font-medium">No services match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onRollback={handleRollback}
              onRestart={handleRestart}
              onStop={handleStop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
