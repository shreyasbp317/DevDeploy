import { useState, useEffect, useRef } from "react";
import { ScrollText, Pause, Play, Trash2, Download, Filter } from "lucide-react";
import { INITIAL_LOGS, SERVICES, type LogEntry, type LogLevel } from "../data/mockData";
import { cn } from "../utils/cn";

const LEVEL_STYLES: Record<LogLevel, { bg: string; text: string; badge: string; border: string }> = {
  info:    { bg: "hover:bg-slate-800/30", text: "text-slate-300",  badge: "bg-slate-700 text-slate-400",          border: "border-l-slate-600" },
  warn:    { bg: "hover:bg-amber-950/20", text: "text-amber-200",  badge: "bg-amber-500/15 text-amber-400",        border: "border-l-amber-500/60" },
  error:   { bg: "hover:bg-red-950/20",   text: "text-red-200",    badge: "bg-red-500/15 text-red-400",            border: "border-l-red-500/60" },
  success: { bg: "hover:bg-emerald-950/20", text: "text-emerald-200", badge: "bg-emerald-500/15 text-emerald-400", border: "border-l-emerald-500/60" },
};

const LIVE_MESSAGES: Omit<LogEntry, "id" | "timestamp">[] = [
  { serviceId: "svc-001", serviceName: "api-gateway",          level: "info",    message: "GET /api/v2/health 200 OK — 3ms" },
  { serviceId: "svc-002", serviceName: "auth-service",         level: "info",    message: "Token validated for user:9f2a — TTL 3600s" },
  { serviceId: "svc-005", serviceName: "analytics-engine",     level: "warn",    message: "Slow query detected: 1.2s on events table (idx missing?)" },
  { serviceId: "svc-003", serviceName: "notification-worker",  level: "success", message: "Email dispatched to batch #4471 — 350 recipients" },
  { serviceId: "svc-006", serviceName: "postgres-db",          level: "info",    message: "autovacuum: VACUUM public.sessions (pg_catalog)" },
  { serviceId: "svc-001", serviceName: "api-gateway",          level: "info",    message: "POST /api/v2/deploy 202 Accepted — 12ms" },
  { serviceId: "svc-004", serviceName: "media-processor",      level: "error",   message: "SIGKILL received — container restart policy: on-failure" },
  { serviceId: "svc-002", serviceName: "auth-service",         level: "warn",    message: "Rate limit triggered: 120 req/min from IP 10.0.0.42" },
  { serviceId: "svc-005", serviceName: "analytics-engine",     level: "info",    message: "Aggregation pipeline completed — 14,220 records processed" },
  { serviceId: "svc-003", serviceName: "notification-worker",  level: "info",    message: "Heartbeat OK — queue depth: 42 messages" },
  { serviceId: "svc-001", serviceName: "api-gateway",          level: "success", message: "Nginx upstream health check passed — upstream: analytics:5004" },
  { serviceId: "svc-006", serviceName: "postgres-db",          level: "info",    message: "Connection pool: 18/100 active connections" },
];

const LEVEL_FILTERS: (LogLevel | "all")[] = ["all", "info", "success", "warn", "error"];

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [paused, setPaused] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const msgIdx = useRef(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const msg = LIVE_MESSAGES[msgIdx.current % LIVE_MESSAGES.length];
      msgIdx.current++;
      const now = new Date();
      setLogs((prev) => [
        ...prev.slice(-200),
        {
          ...msg,
          id: `live-${Date.now()}`,
          timestamp: now.toISOString(),
        },
      ]);
    }, 1800);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 60);
  };

  const filtered = logs.filter((l) => {
    const matchLevel = levelFilter === "all" || l.level === levelFilter;
    const matchSvc = serviceFilter === "all" || l.serviceId === serviceFilter;
    return matchLevel && matchSvc;
  });

  const handleDownload = () => {
    const text = filtered.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.serviceName}] ${l.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "devdeploy-logs.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const levelCounts = logs.reduce((acc, l) => { acc[l.level] = (acc[l.level] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">Live Logs</h1>
          {!paused && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-full px-2 py-0.5 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />streaming
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/[0.07] rounded-lg px-3 py-1.5 transition-all"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 border border-white/[0.07] hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className={cn(
              "flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 font-medium border transition-all",
              paused
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
            )}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 flex-shrink-0">
        {/* Level filter */}
        <div className="flex items-center gap-1 rounded-lg bg-[#161b22] border border-white/[0.07] p-1">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2 mr-1" />
          {LEVEL_FILTERS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevelFilter(lv)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all capitalize",
                levelFilter === lv ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {lv}{lv !== "all" && levelCounts[lv] ? <span className="ml-1 opacity-60">{levelCounts[lv]}</span> : null}
            </button>
          ))}
        </div>

        {/* Service filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-lg bg-[#161b22] border border-white/[0.07] px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">All Services</option>
          {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Log Viewer */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#0d1117] font-mono text-xs"
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-600">No log entries</div>
        ) : (
          filtered.map((log, i) => {
            const s = LEVEL_STYLES[log.level];
            const ts = new Date(log.timestamp);
            const time = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-2 border-l-2 transition-colors",
                  s.bg, s.border,
                  i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                )}
              >
                <span className="text-slate-600 select-none flex-shrink-0 w-16">{time}</span>
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase flex-shrink-0", s.badge)}>
                  {log.level}
                </span>
                <span className="text-cyan-600 flex-shrink-0 min-w-[130px]">[{log.serviceName}]</span>
                <span className={cn("flex-1 leading-relaxed", s.text)}>{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {!autoScroll && (
        <button
          onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }}
          className="mt-2 self-center text-xs text-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-500/20 rounded-full px-3 py-1 hover:bg-cyan-500/20 transition-all flex-shrink-0"
        >
          ↓ Jump to latest
        </button>
      )}
    </div>
  );
}
