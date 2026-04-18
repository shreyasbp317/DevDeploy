export type ServiceStatus = "running" | "deploying" | "failed" | "stopped";
export type LogLevel = "info" | "warn" | "error" | "success";

export interface Deployment {
  id: string;
  version: string;
  timestamp: string;
  deployedBy: string;
  status: "success" | "failed" | "rolled-back";
  commit: string;
  duration: string;
}

export interface Service {
  id: string;
  name: string;
  image: string;
  tag: string;
  status: ServiceStatus;
  port: number;
  replicas: number;
  cpu: number;
  memory: number;
  uptime: string;
  lastDeploy: string;
  deployedBy: string;
  commit: string;
  environment: "production" | "staging" | "development";
  deployments: Deployment[];
}

export interface LogEntry {
  id: string;
  serviceId: string;
  serviceName: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

export interface TelemetryPoint {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
}

export const SERVICES: Service[] = [
  {
    id: "svc-001",
    name: "api-gateway",
    image: "devdeploy/api-gateway",
    tag: "v2.4.1",
    status: "running",
    port: 8080,
    replicas: 3,
    cpu: 34,
    memory: 61,
    uptime: "12d 4h 32m",
    lastDeploy: "2025-06-10T14:22:00Z",
    deployedBy: "alex.chen",
    commit: "a3f9c12",
    environment: "production",
    deployments: [
      { id: "d1", version: "v2.4.1", timestamp: "2025-06-10T14:22:00Z", deployedBy: "alex.chen", status: "success", commit: "a3f9c12", duration: "1m 43s" },
      { id: "d2", version: "v2.4.0", timestamp: "2025-06-07T09:15:00Z", deployedBy: "maya.patel", status: "success", commit: "f7b2e91", duration: "2m 05s" },
      { id: "d3", version: "v2.3.9", timestamp: "2025-06-03T18:44:00Z", deployedBy: "alex.chen", status: "failed", commit: "c1d8a44", duration: "0m 52s" },
      { id: "d4", version: "v2.3.8", timestamp: "2025-05-28T11:30:00Z", deployedBy: "sam.rivera", status: "success", commit: "9e5f307", duration: "1m 58s" },
    ],
  },
  {
    id: "svc-002",
    name: "auth-service",
    image: "devdeploy/auth-service",
    tag: "v1.9.3",
    status: "running",
    port: 5001,
    replicas: 2,
    cpu: 18,
    memory: 44,
    uptime: "5d 11h 07m",
    lastDeploy: "2025-06-08T08:10:00Z",
    deployedBy: "maya.patel",
    commit: "b8e2d55",
    environment: "production",
    deployments: [
      { id: "d5", version: "v1.9.3", timestamp: "2025-06-08T08:10:00Z", deployedBy: "maya.patel", status: "success", commit: "b8e2d55", duration: "1m 12s" },
      { id: "d6", version: "v1.9.2", timestamp: "2025-06-01T13:05:00Z", deployedBy: "alex.chen", status: "success", commit: "7c3a910", duration: "1m 28s" },
      { id: "d7", version: "v1.9.1", timestamp: "2025-05-25T10:20:00Z", deployedBy: "sam.rivera", status: "rolled-back", commit: "d4f6b83", duration: "0m 41s" },
    ],
  },
  {
    id: "svc-003",
    name: "notification-worker",
    image: "devdeploy/notif-worker",
    tag: "v0.8.7",
    status: "deploying",
    port: 5002,
    replicas: 1,
    cpu: 72,
    memory: 55,
    uptime: "0d 0h 02m",
    lastDeploy: "2025-06-12T11:58:00Z",
    deployedBy: "sam.rivera",
    commit: "e9a1c73",
    environment: "production",
    deployments: [
      { id: "d8", version: "v0.8.7", timestamp: "2025-06-12T11:58:00Z", deployedBy: "sam.rivera", status: "success", commit: "e9a1c73", duration: "2m 19s" },
      { id: "d9", version: "v0.8.6", timestamp: "2025-06-05T16:40:00Z", deployedBy: "maya.patel", status: "success", commit: "3b7d291", duration: "1m 55s" },
    ],
  },
  {
    id: "svc-004",
    name: "media-processor",
    image: "devdeploy/media-proc",
    tag: "v3.1.0",
    status: "failed",
    port: 5003,
    replicas: 2,
    cpu: 0,
    memory: 12,
    uptime: "0d 0h 00m",
    lastDeploy: "2025-06-12T09:30:00Z",
    deployedBy: "alex.chen",
    commit: "4d2f885",
    environment: "production",
    deployments: [
      { id: "d10", version: "v3.1.0", timestamp: "2025-06-12T09:30:00Z", deployedBy: "alex.chen", status: "failed", commit: "4d2f885", duration: "0m 38s" },
      { id: "d11", version: "v3.0.9", timestamp: "2025-06-09T14:22:00Z", deployedBy: "sam.rivera", status: "success", commit: "8a5c019", duration: "1m 47s" },
      { id: "d12", version: "v3.0.8", timestamp: "2025-06-02T09:00:00Z", deployedBy: "maya.patel", status: "success", commit: "f1e8b36", duration: "2m 03s" },
    ],
  },
  {
    id: "svc-005",
    name: "analytics-engine",
    image: "devdeploy/analytics",
    tag: "v1.2.5",
    status: "running",
    port: 5004,
    replicas: 2,
    cpu: 51,
    memory: 78,
    uptime: "3d 7h 19m",
    lastDeploy: "2025-06-09T17:55:00Z",
    deployedBy: "maya.patel",
    commit: "c6e3f44",
    environment: "staging",
    deployments: [
      { id: "d13", version: "v1.2.5", timestamp: "2025-06-09T17:55:00Z", deployedBy: "maya.patel", status: "success", commit: "c6e3f44", duration: "1m 34s" },
      { id: "d14", version: "v1.2.4", timestamp: "2025-06-04T12:10:00Z", deployedBy: "alex.chen", status: "success", commit: "2f9b107", duration: "1m 51s" },
    ],
  },
  {
    id: "svc-006",
    name: "postgres-db",
    image: "postgres",
    tag: "15-alpine",
    status: "running",
    port: 5432,
    replicas: 1,
    cpu: 9,
    memory: 32,
    uptime: "22d 1h 04m",
    lastDeploy: "2025-05-21T06:00:00Z",
    deployedBy: "sam.rivera",
    commit: "N/A",
    environment: "production",
    deployments: [
      { id: "d15", version: "15-alpine", timestamp: "2025-05-21T06:00:00Z", deployedBy: "sam.rivera", status: "success", commit: "N/A", duration: "0m 28s" },
    ],
  },
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: "l1", serviceId: "svc-001", serviceName: "api-gateway", level: "success", message: "Health check passed — all 3 replicas responding", timestamp: "2025-06-12T11:59:42Z" },
  { id: "l2", serviceId: "svc-004", serviceName: "media-processor", level: "error", message: "Container exited with code 1: OOMKilled — memory limit exceeded", timestamp: "2025-06-12T09:31:05Z" },
  { id: "l3", serviceId: "svc-003", serviceName: "notification-worker", level: "info", message: "Pulling image devdeploy/notif-worker:v0.8.7 from registry...", timestamp: "2025-06-12T11:58:03Z" },
  { id: "l4", serviceId: "svc-005", serviceName: "analytics-engine", level: "warn", message: "Memory usage at 78% — approaching container limit (512Mi)", timestamp: "2025-06-12T11:57:30Z" },
  { id: "l5", serviceId: "svc-002", serviceName: "auth-service", level: "info", message: "JWT token rotation completed successfully", timestamp: "2025-06-12T11:55:00Z" },
  { id: "l6", serviceId: "svc-006", serviceName: "postgres-db", level: "info", message: "Checkpoint complete: wrote 214 buffers (1.3%)", timestamp: "2025-06-12T11:52:18Z" },
  { id: "l7", serviceId: "svc-001", serviceName: "api-gateway", level: "info", message: "Nginx upstream reconnected — upstream: auth-service:5001", timestamp: "2025-06-12T11:50:44Z" },
  { id: "l8", serviceId: "svc-003", serviceName: "notification-worker", level: "warn", message: "RabbitMQ queue depth at 1,240 — consumer lag detected", timestamp: "2025-06-12T11:48:12Z" },
];

export function generateTelemetry(baselineCpu: number, baselineMem: number, points = 20): TelemetryPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now - (points - 1 - i) * 30_000);
    const hh = t.getHours().toString().padStart(2, "0");
    const mm = t.getMinutes().toString().padStart(2, "0");
    const ss = t.getSeconds().toString().padStart(2, "0");
    return {
      time: `${hh}:${mm}:${ss}`,
      cpu: Math.max(2, Math.min(99, baselineCpu + (Math.random() - 0.5) * 20)),
      memory: Math.max(5, Math.min(99, baselineMem + (Math.random() - 0.5) * 12)),
      requests: Math.floor(120 + Math.random() * 340),
    };
  });
}
