import { LayoutDashboard, Server, ScrollText, Settings, GitBranch, Bell, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "services", label: "Services", icon: Server },
  { id: "logs", label: "Live Logs", icon: ScrollText },
  { id: "pipelines", label: "Pipelines", icon: GitBranch },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, alertCount }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 flex-col bg-[#0d1117] border-r border-white/[0.07] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.07]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-900/40">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">DevDeploy</p>
          <p className="text-[10px] text-slate-500 font-medium">v2.4.1 · production</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="flex-1 text-left">{label}</span>
              {id === "logs" && alertCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {alertCount}
                </span>
              )}
              {active && <ChevronRight className="h-3 w-3 text-cyan-500/60" />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/[0.07] pt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">alex.chen</p>
            <p className="text-[10px] text-slate-500">Admin</p>
          </div>
          <Bell className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}
