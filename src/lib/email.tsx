import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { DEMO_MODE } from "./demo";
import AdminNotification from "@/emails/admin-notification";
import UserApproved from "@/emails/user-approved";
import UserRejected from "@/emails/user-rejected";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("[EMAIL] Missing SMTP_USER or SMTP_PASS in env");
    throw new Error("SMTP credentials not configured. Set SMTP_USER and SMTP_PASS in .env");
  }
  console.log("[EMAIL] Creating transporter:", {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
  });
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendRawEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (DEMO_MODE) {
    console.log(`[EMAIL DEMO] To: ${to} | Subject: ${subject}`);
    return;
  }
  console.log(`[EMAIL] Sending to: ${to} | Subject: ${subject}`);
  try {
    const info = await getTransporter().sendMail({ from: SMTP_USER, to, subject, html });
    console.log(`[EMAIL] Sent successfully:`, info.messageId);
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err);
  }
}

function getAdminEmails(): string[] {
  if (!ADMIN_EMAIL) return [];
  return ADMIN_EMAIL.split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export async function sendAdminNotification({
  userName,
  userPhone,
  useCase,
}: {
  userName: string;
  userPhone: string;
  useCase: string;
}) {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    console.warn("[EMAIL] ADMIN_EMAIL not set, skipping admin notification");
    return;
  }
  const html = await render(
    <AdminNotification
      userName={userName}
      userPhone={userPhone}
      useCase={useCase}
      requestedAt={new Date().toLocaleString()}
    />,
  );
  await Promise.all(
    adminEmails.map((email) =>
      sendRawEmail({
        to: email,
        subject: "New Access Request - iVALT Portal",
        html,
      }),
    ),
  );
}

export async function sendUserApprovedEmail({ to, userName }: { to: string; userName: string }) {
  const html = await render(<UserApproved userName={userName} />);
  await sendRawEmail({
    to,
    subject: "Access Approved - iVALT Portal",
    html,
  });
}

export async function sendUserRejectedEmail({ to, userName }: { to: string; userName: string }) {
  const html = await render(<UserRejected userName={userName} />);
  await sendRawEmail({
    to,
    subject: "Access Update - iVALT Portal",
    html,
  });
}
