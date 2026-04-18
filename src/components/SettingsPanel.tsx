import { useState } from "react";
import { Settings, Save, RotateCcw, Shield, Bell, Globe, Database, Server, Eye, EyeOff } from "lucide-react";
import { cn } from "../utils/cn";

interface Toggle {
  label: string;
  desc: string;
  key: string;
  value: boolean;
}

interface SettingSection {
  title: string;
  icon: React.ElementType;
  color: string;
  toggles: Toggle[];
}

const DEFAULT_SETTINGS = {
  autoRollback: true,
  healthChecks: true,
  slackAlerts: true,
  emailDigest: false,
  blueGreen: false,
  nginxLoadBalance: true,
  sslTermination: true,
  rateLimit: true,
  queryLogging: false,
  backupEnabled: true,
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [registryUrl, setRegistryUrl] = useState("registry.devdeploy.io");
  const [nginxConf, setNginxConf] = useState("upstream api_cluster {\n  least_conn;\n  server api-gateway-1:8080;\n  server api-gateway-2:8080;\n  server api-gateway-3:8080;\n}");

  const toggle = (key: string) =>
    setSettings((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SECTIONS: SettingSection[] = [
    {
      title: "Deployment", icon: Server, color: "text-cyan-400",
      toggles: [
        { label: "Auto Rollback on Failure", desc: "Automatically roll back to last stable version on deploy failure", key: "autoRollback", value: settings.autoRollback },
        { label: "Blue-Green Deployments", desc: "Route traffic gradually when deploying new versions", key: "blueGreen", value: settings.blueGreen },
        { label: "Health Check Gates", desc: "Require passing health checks before marking deploy as successful", key: "healthChecks", value: settings.healthChecks },
      ],
    },
    {
      title: "Alerts & Notifications", icon: Bell, color: "text-amber-400",
      toggles: [
        { label: "Slack Alerts", desc: "Send deploy and incident alerts to #devops-alerts Slack channel", key: "slackAlerts", value: settings.slackAlerts },
        { label: "Daily Email Digest", desc: "Receive a daily summary of all deployments and incidents", key: "emailDigest", value: settings.emailDigest },
      ],
    },
    {
      title: "Nginx / Network", icon: Globe, color: "text-violet-400",
      toggles: [
        { label: "Load Balancing", desc: "Enable Nginx upstream load balancing across replicas", key: "nginxLoadBalance", value: settings.nginxLoadBalance },
        { label: "SSL Termination", desc: "Terminate TLS at Nginx and proxy plain HTTP internally", key: "sslTermination", value: settings.sslTermination },
        { label: "Rate Limiting", desc: "Enforce API rate limits via Nginx limit_req_zone", key: "rateLimit", value: settings.rateLimit },
      ],
    },
    {
      title: "Database", icon: Database, color: "text-emerald-400",
      toggles: [
        { label: "Query Logging", desc: "Log all PostgreSQL queries slower than 500ms", key: "queryLogging", value: settings.queryLogging },
        { label: "Automated Backups", desc: "Run daily pg_dump backups to S3 bucket", key: "backupEnabled", value: settings.backupEnabled },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Infrastructure & deployment configuration</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/[0.07] rounded-lg px-3 py-2 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 text-xs rounded-lg px-4 py-2 font-semibold border transition-all",
              saved
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
            )}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Registry Config */}
        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Registry & Auth</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Docker Registry URL</label>
              <input
                value={registryUrl}
                onChange={(e) => setRegistryUrl(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-white/[0.07] px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">API Token</label>
              <div className="flex gap-2">
                <input
                  type={showToken ? "text" : "password"}
                  defaultValue="sk_prod_a9f2b1c3d4e5f6a7b8c9d0e1f2a3b4c5"
                  readOnly
                  className="flex-1 rounded-lg bg-slate-800 border border-white/[0.07] px-3 py-2 text-sm text-slate-400 font-mono focus:outline-none"
                />
                <button
                  onClick={() => setShowToken((p) => !p)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-white/[0.07] rounded-lg px-3 py-2 transition-all"
                >
                  {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Sections */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl border border-white/[0.07] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-4">
              <section.icon className={cn("h-4 w-4", section.color)} />
              <h2 className="text-sm font-semibold text-white">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.toggles.map((t) => (
                <div key={t.key} className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(t.key)}
                    className={cn(
                      "relative flex-shrink-0 h-5 w-9 rounded-full border transition-all duration-200",
                      t.value ? "bg-cyan-500 border-cyan-400" : "bg-slate-700 border-slate-600"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
                        t.value ? "left-4.5" : "left-0.5"
                      )}
                      style={{ left: t.value ? "calc(100% - 18px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Nginx Config */}
        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Nginx Upstream Config</h2>
          </div>
          <textarea
            value={nginxConf}
            onChange={(e) => setNginxConf(e.target.value)}
            rows={6}
            className="w-full rounded-lg bg-slate-800/80 border border-white/[0.07] px-4 py-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
