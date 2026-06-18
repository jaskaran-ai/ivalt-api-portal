import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, { status: string; error?: string }> = {};

  // 1. Environment variables
  const requiredVars = [
    "DATABASE_URL",
    "SESSION_SECRET",
    "IVALT_API_BASE_URL",
    "IVALT_SECURITY_TOKEN",
  ];
  const optionalVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "ADMIN_EMAIL",
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_API_GATEWAY_USAGE_PLAN_ID",
  ];

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const v of requiredVars) {
    if (!process.env[v]) missingRequired.push(v);
  }
  for (const v of optionalVars) {
    if (!process.env[v]) missingOptional.push(v);
  }

  checks.env = {
    status: missingRequired.length === 0 ? "ok" : "missing_required",
    ...(missingRequired.length > 0 && { error: `Missing: ${missingRequired.join(", ")}` }),
    ...(missingOptional.length > 0 && { warning: `Missing optional: ${missingOptional.join(", ")}` }),
  };

  // 2. Database
  try {
    const { db } = await import("@/db");
    const result = await db.execute("SELECT 1 AS ok");
    checks.database = { status: "ok" };
  } catch (err) {
    checks.database = { status: "error", error: String(err) };
  }

  // 3. iVALT API base URL reachable
  try {
    const baseUrl = process.env.IVALT_API_BASE_URL || "https://api.ivalt.com";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${baseUrl}/biometric-auth-request`, {
      method: "OPTIONS",
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeout);
    checks.ivaltApi = {
      status: res ? "reachable" : "unreachable",
      ...(res && { statusCode: res.status }),
    };
  } catch (err) {
    checks.ivaltApi = { status: "error", error: String(err) };
  }

  // 4. SMTP config (validate creds exist, don't send test email)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.verify();
      checks.smtp = { status: "ok" };
    } catch (err) {
      checks.smtp = { status: "error", error: String(err) };
    }
  } else {
    checks.smtp = { status: "not_configured" };
  }

  // 5. AWS config (check creds exist)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    checks.aws = { status: "configured" };
  } else {
    checks.aws = { status: "not_configured" };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok" || c.status === "configured" || c.status === "reachable");

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  });
}
