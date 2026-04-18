import { useState } from "react";
import { GitBranch, GitCommit, Play, Clock, CheckCircle2, XCircle, Loader2, ArrowRight, User } from "lucide-react";
import { cn } from "../utils/cn";

type StageStatus = "success" | "failed" | "running" | "pending";

interface PipelineStage {
  name: string;
  status: StageStatus;
  duration?: string;
}

interface Pipeline {
  id: string;
  service: string;
  branch: string;
  commit: string;
  commitMessage: string;
  triggeredBy: string;
  triggeredAt: string;
  status: "success" | "failed" | "running" | "pending";
  stages: PipelineStage[];
}

const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: "pip-001", service: "api-gateway", branch: "main", commit: "a3f9c12",
    commitMessage: "feat: add rate limiting middleware to /api/v2",
    triggeredBy: "alex.chen", triggeredAt: "2025-06-12T11:58:00Z",
    status: "success",
    stages: [
      { name: "Checkout", status: "success", duration: "3s" },
      { name: "Lint & Type Check", status: "success", duration: "28s" },
      { name: "Unit Tests", status: "success", duration: "1m 12s" },
      { name: "Build Image", status: "success", duration: "2m 04s" },
      { name: "Push to Registry", status: "success", duration: "22s" },
      { name: "Deploy (Prod)", status: "success", duration: "43s" },
    ],
  },
  {
    id: "pip-002", service: "media-processor", branch: "feature/v3-upgrade", commit: "4d2f885",
    commitMessage: "refactor: upgrade ffmpeg bindings to v3.1",
    triggeredBy: "alex.chen", triggeredAt: "2025-06-12T09:30:00Z",
    status: "failed",
    stages: [
      { name: "Checkout", status: "success", duration: "2s" },
      { name: "Lint & Type Check", status: "success", duration: "31s" },
      { name: "Unit Tests", status: "failed", duration: "0m 38s" },
      { name: "Build Image", status: "pending" },
      { name: "Push to Registry", status: "pending" },
      { name: "Deploy (Prod)", status: "pending" },
    ],
  },
  {
    id: "pip-003", service: "notification-worker", branch: "main", commit: "e9a1c73",
    commitMessage: "fix: retry logic for failed SMTP deliveries",
    triggeredBy: "sam.rivera", triggeredAt: "2025-06-12T11:55:00Z",
    status: "running",
    stages: [
      { name: "Checkout", status: "success", duration: "3s" },
      { name: "Lint & Type Check", status: "success", duration: "24s" },
      { name: "Unit Tests", status: "success", duration: "58s" },
      { name: "Build Image", status: "running" },
      { name: "Push to Registry", status: "pending" },
      { name: "Deploy (Prod)", status: "pending" },
    ],
  },
  {
    id: "pip-004", service: "auth-service", branch: "main", commit: "b8e2d55",
    commitMessage: "chore: rotate JWT secret & update expiry policy",
    triggeredBy: "maya.patel", triggeredAt: "2025-06-08T08:10:00Z",
    status: "success",
    stages: [
      { name: "Checkout", status: "success", duration: "2s" },
      { name: "Lint & Type Check", status: "success", duration: "19s" },
      { name: "Unit Tests", status: "success", duration: "47s" },
      { name: "Build Image", status: "success", duration: "1m 32s" },
      { name: "Push to Registry", status: "success", duration: "18s" },
      { name: "Deploy (Prod)", status: "success", duration: "31s" },
    ],
  },
  {
    id: "pip-005", service: "analytics-engine", branch: "staging", commit: "c6e3f44",
    commitMessage: "perf: batch insert for event aggregation pipeline",
    triggeredBy: "maya.patel", triggeredAt: "2025-06-09T17:55:00Z",
    status: "success",
    stages: [
      { name: "Checkout", status: "success", duration: "4s" },
      { name: "Lint & Type Check", status: "success", duration: "22s" },
      { name: "Unit Tests", status: "success", duration: "1m 05s" },
      { name: "Build Image", status: "success", duration: "1m 48s" },
      { name: "Push to Registry", status: "success", duration: "25s" },
      { name: "Deploy (Staging)", status: "success", duration: "37s" },
    ],
  },
];

const STATUS_ICON: Record<StageStatus, React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  failed:  <XCircle className="h-3.5 w-3.5 text-red-400" />,
  running: <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />,
  pending: <div className="h-3.5 w-3.5 rounded-full border border-slate-600" />,
};

const PIPELINE_STATUS_STYLES = {
  success: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  failed:  "bg-red-500/10 text-red-400 ring-red-500/20",
  running: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  pending: "bg-slate-800 text-slate-400 ring-slate-700",
};

function PipelineRow({ pipeline, onRetry }: { pipeline: Pipeline; onRetry: (id: string) => void }) {
  const [expanded, setExpanded] = useState(pipeline.status === "running");

  return (
    <div className={cn(
      "rounded-xl border bg-[#161b22] overflow-hidden transition-all",
      pipeline.status === "failed" ? "border-red-500/30" : pipeline.status === "running" ? "border-blue-500/20" : "border-white/[0.07]"
    )}>
      <button className="w-full text-left px-5 py-4" onClick={() => setExpanded((p) => !p)}>
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-white/[0.07]">
            <GitBranch className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200 font-mono text-sm">{pipeline.service}</span>
              <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">{pipeline.branch}</span>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 capitalize", PIPELINE_STATUS_STYLES[pipeline.status])}>
                {pipeline.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">{pipeline.commitMessage}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><GitCommit className="h-3 w-3" />{pipeline.commit}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{pipeline.triggeredBy}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(pipeline.triggeredAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pipeline.status === "failed" && (
              <button
                onClick={(e) => { e.stopPropagation(); onRetry(pipeline.id); }}
                className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg px-3 py-1.5 font-medium transition-all"
              >
                <Play className="h-3 w-3" /> Retry
              </button>
            )}
          </div>
        </div>

        {/* Stage progress bar */}
        <div className="mt-3 flex items-center gap-1">
          {pipeline.stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "h-1.5 w-full rounded-full",
                stage.status === "success" ? "bg-emerald-500" :
                stage.status === "failed" ? "bg-red-500" :
                stage.status === "running" ? "bg-blue-500 animate-pulse" :
                "bg-slate-700"
              )} />
              {i < pipeline.stages.length - 1 && (
                <ArrowRight className="h-2.5 w-2.5 text-slate-700 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.07] px-5 py-4">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-3">Pipeline Stages</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {pipeline.stages.map((stage, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg p-2.5 border",
                  stage.status === "success" ? "bg-emerald-950/20 border-emerald-500/20" :
                  stage.status === "failed" ? "bg-red-950/20 border-red-500/20" :
                  stage.status === "running" ? "bg-blue-950/20 border-blue-500/20" :
                  "bg-slate-800/30 border-white/[0.05]"
                )}
              >
                {STATUS_ICON[stage.status]}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium truncate",
                    stage.status === "pending" ? "text-slate-500" : "text-slate-200"
                  )}>{stage.name}</p>
                  {stage.duration && <p className="text-[10px] text-slate-600 font-mono">{stage.duration}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PipelinesPanel() {
  const [pipelines, setPipelines] = useState(INITIAL_PIPELINES);
  const [filter, setFilter] = useState<"all" | "success" | "failed" | "running">("all");

  const handleRetry = (id: string) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "running" as const,
              stages: p.stages.map((s, i) =>
                i === 0 ? { ...s, status: "running" as StageStatus } : { ...s, status: "pending" as StageStatus }
              ),
            }
          : p
      )
    );

    let stageIdx = 0;
    const advance = (pipelineId: string) => {
      setTimeout(() => {
        setPipelines((prev) => {
          const pipeline = prev.find((p) => p.id === pipelineId);
          if (!pipeline) return prev;
          const nextIdx = stageIdx + 1;
          stageIdx = nextIdx;
          if (nextIdx >= pipeline.stages.length) {
            return prev.map((p) =>
              p.id === pipelineId
                ? { ...p, status: "success" as const, stages: p.stages.map((s) => ({ ...s, status: "success" as StageStatus })) }
                : p
            );
          }
          advance(pipelineId);
          return prev.map((p) =>
            p.id === pipelineId
              ? {
                  ...p,
                  stages: p.stages.map((s, i) =>
                    i < nextIdx ? { ...s, status: "success" as StageStatus } :
                    i === nextIdx ? { ...s, status: "running" as StageStatus } :
                    { ...s, status: "pending" as StageStatus }
                  ),
                }
              : p
          );
        });
      }, 1500);
    };
    advance(id);
  };

  const filtered = pipelines.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">CI/CD Pipelines</h1>
          <p className="text-sm text-slate-500 mt-0.5">GitHub Actions · Docker Registry · Nginx rollout</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#161b22] border border-white/[0.07] p-1 w-fit mb-6">
        {(["all", "running", "success", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-all capitalize",
              filter === f ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {f}
            <span className="ml-1.5 opacity-60">{pipelines.filter((p) => f === "all" || p.status === f).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <PipelineRow key={p.id} pipeline={p} onRetry={handleRetry} />
        ))}
      </div>
    </div>
  );
}
