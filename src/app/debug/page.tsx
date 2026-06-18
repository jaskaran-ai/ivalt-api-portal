"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Activity, AlertCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface HealthCheck {
  status: string;
  error?: string;
  warning?: string;
  statusCode?: number;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  checks: Record<string, HealthCheck>;
}

const checkIcons: Record<string, React.ReactNode> = {
  ok: <CheckCircle2 className="size-4 text-emerald-600" />,
  configured: <CheckCircle2 className="size-4 text-emerald-600" />,
  reachable: <CheckCircle2 className="size-4 text-emerald-600" />,
  error: <XCircle className="size-4 text-red-600" />,
  missing_required: <AlertCircle className="size-4 text-red-600" />,
  not_configured: <AlertCircle className="size-4 text-amber-600" />,
  unreachable: <XCircle className="size-4 text-red-600" />,
};

const checkLabels: Record<string, string> = {
  env: "Environment Variables",
  database: "PostgreSQL Database",
  ivaltApi: "iVALT API",
  smtp: "SMTP (Email)",
  aws: "AWS API Gateway",
};

export default function DebugPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealth(await res.json());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-7 text-primary" />
              <h1 className="text-2xl font-semibold tracking-[-0.02em]">Debug Dashboard</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Check integration health and configuration status
            </p>
          </div>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {loading && !health && (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {health && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm">
              <Activity className="size-4 text-primary" />
              <span className="font-medium">Overall Status:</span>
              <span className={health.status === "healthy" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                {health.status === "healthy" ? "Healthy" : "Degraded"}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(health.timestamp).toLocaleString()}
              </span>
            </div>

            {Object.entries(health.checks).map(([key, check]) => (
              <div key={key} className="rounded-xl border border-border/80 bg-card p-4">
                <div className="flex items-center gap-2">
                  {checkIcons[check.status] || <AlertCircle className="size-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">{checkLabels[key] || key}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{check.status}</span>
                </div>
                {check.error && (
                  <p className="mt-2 text-xs text-red-600 font-mono break-all">{check.error}</p>
                )}
                {check.warning && (
                  <p className="mt-2 text-xs text-amber-600 font-mono break-all">{check.warning}</p>
                )}
                {check.statusCode && (
                  <p className="mt-1 text-xs text-muted-foreground">Status: {check.statusCode}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
