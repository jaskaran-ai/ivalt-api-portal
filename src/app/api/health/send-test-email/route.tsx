import { render } from '@react-email/components';
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { to, template = 'test', userName, userPhone, useCase } = await req.json();

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    let subject: string;
    let html: string;

    switch (template) {
      case 'admin-notification': {
        const AdminNotification = (await import('@/emails/admin-notification')).default;
        html = await render(
          <AdminNotification
            userName={userName || 'Test User'}
            userPhone={userPhone || '+919876543210'}
            useCase={useCase || 'Testing email templates from debug dashboard'}
            requestedAt={new Date().toLocaleString()}
          />,
        );
        subject = 'New Access Request - iVALT Portal (TEST)';
        break;
      }
      case 'user-approved': {
        const UserApproved = (await import('@/emails/user-approved')).default;
        html = await render(<UserApproved userName={userName || 'Test User'} />);
        subject = 'Access Approved - iVALT Portal (TEST)';
        break;
      }
      case 'user-rejected': {
        const UserRejected = (await import('@/emails/user-rejected')).default;
        html = await render(<UserRejected userName={userName || 'Test User'} />);
        subject = 'Access Update - iVALT Portal (TEST)';
        break;
      }
      default: {
        html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
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
        </div>`;
        subject = 'iVALT Portal — Test Email';
      }
    }

    const info = await getTransporter().sendMail({
      from: SMTP_USER,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId, template, subject });
  } catch (err) {
    console.error('Test email error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
