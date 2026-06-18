"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Activity, AlertCircle, CheckCircle2, XCircle, RefreshCw, Mail, Loader2, Send, Bell, UserCheck, UserX } from "lucide-react";

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

const emailTemplates = [
  {
    id: "admin-notification",
    label: "Admin Notification",
    icon: Bell,
    desc: "Alert admin about new access request",
    fields: ["userName", "userPhone", "useCase"],
    subject: "New Access Request - iVALT Portal (TEST)",
  },
  {
    id: "user-approved",
    label: "User Approved",
    icon: UserCheck,
    desc: "Notify user their access was approved",
    fields: ["userName"],
    subject: "Access Approved - iVALT Portal (TEST)",
  },
  {
    id: "user-rejected",
    label: "User Rejected",
    icon: UserX,
    desc: "Notify user their access was rejected",
    fields: ["userName"],
    subject: "Access Update - iVALT Portal (TEST)",
  },
] as const;

type EmailTemplateId = (typeof emailTemplates)[number]["id"];

export default function DebugPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test email state
  const [emailTo, setEmailTo] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateId>("admin-notification");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [useCase, setUseCase] = useState("");
  const [sending, setSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ ok: boolean; message: string } | null>(null);

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

  const template = emailTemplates.find((t) => t.id === selectedTemplate)!;
  const hasField = (field: string) => (template.fields as readonly string[]).includes(field);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo.trim()) return;
    setSending(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/health/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          template: selectedTemplate,
          userName: userName || undefined,
          userPhone: userPhone || undefined,
          useCase: useCase || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailResult({ ok: true, message: `Sent! ID: ${data.messageId} · ${data.subject}` });
      } else {
        setEmailResult({ ok: false, message: data.error || "Failed to send" });
      }
    } catch (err) {
      setEmailResult({ ok: false, message: String(err) });
    } finally {
      setSending(false);
    }
  };

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
          <div className="flex flex-col gap-4 mb-8">
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

        {/* Test Email Section */}
        <div className="rounded-xl border border-border/80 bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="size-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-[-0.01em]">Send Test Email</h2>
          </div>

          {/* Template selector */}
          <div className="flex gap-2 mb-5">
            {emailTemplates.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTemplate === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border/60 bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSendTestEmail} className="flex flex-col gap-4">
            <div>
              <label htmlFor="emailTo" className="block text-sm font-medium mb-1.5">Recipient Email</label>
              <input
                id="emailTo"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/65"
              />
            </div>

            {template.fields.includes("userName") && (
              <div>
                <label htmlFor="userName" className="block text-sm font-medium mb-1.5">User Name</label>
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/65"
                />
              </div>
            )}

            {hasField("userPhone") && (
              <div>
                <label htmlFor="userPhone" className="block text-sm font-medium mb-1.5">User Phone</label>
                <input
                  id="userPhone"
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/65"
                />
              </div>
            )}

            {hasField("useCase") && (
              <div>
                <label htmlFor="useCase" className="block text-sm font-medium mb-1.5">Use Case</label>
                <textarea
                  id="useCase"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="Describe the use case..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/65 resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={sending || !emailTo.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {sending ? "Sending..." : `Send ${template.label}`}
            </button>
          </form>

          {emailResult && (
            <div className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
              emailResult.ok
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}>
              {emailResult.ok ? <CheckCircle2 className="size-4 shrink-0 mt-0.5" /> : <XCircle className="size-4 shrink-0 mt-0.5" />}
              <span className="font-mono text-xs break-all">{emailResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
