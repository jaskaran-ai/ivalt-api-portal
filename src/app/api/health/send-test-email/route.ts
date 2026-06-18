import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }

    const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
    const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (!SMTP_USER || !SMTP_PASS) {
      return NextResponse.json({ error: "SMTP not configured on server" }, { status: 400 });
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const info = await transporter.sendMail({
      from: SMTP_USER,
      to,
      subject: "iVALT Portal — Test Email",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="background:#611f69;height:4px;border-radius:2px;margin-bottom:24px" />
        <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Test Email</h1>
        <p style="color:#666;margin:0 0 16px;line-height:1.5">
          This is a test email from the iVALT Developer Portal debug dashboard.
          If you received this, your SMTP configuration is working correctly.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
        <p style="font-size:12px;color:#999;margin:0">
          Sent at ${new Date().toISOString()} · iVALT Portal Debug
        </p>
      </div>`,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Test email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
