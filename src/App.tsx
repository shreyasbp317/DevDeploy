import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ServicesPanel from "./components/ServicesPanel";
import LogsPanel from "./components/LogsPanel";
import PipelinesPanel from "./components/PipelinesPanel";
import SettingsPanel from "./components/SettingsPanel";

const ALERT_COUNT = 2; // failed services

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderPanel = () => {
    switch (activeTab) {
      case "dashboard":  return <Dashboard onNavigate={setActiveTab} />;
      case "services":   return <ServicesPanel />;
      case "logs":       return <LogsPanel />;
      case "pipelines":  return <PipelinesPanel />;
      case "settings":   return <SettingsPanel />;
      default:           return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={ALERT_COUNT}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderPanel()}
      </main>
    </div>
  );
}
