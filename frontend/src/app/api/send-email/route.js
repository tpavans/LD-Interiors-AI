import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SHARED_SECRET = process.env.EMAIL_BRIDGE_SECRET || 'ld_email_bridge_secret_2026';
const SMTP_USER = process.env.SMTP_USER || 'ldinteriors.in@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'wocrxrxosoneayeu';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-email-secret',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, html, text, secret } = body;

    const providedSecret = secret || request.headers.get('x-email-secret');
    if (providedSecret !== SHARED_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid email bridge secret' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Bad Request: "to", "subject", and content are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 15000,
      socketTimeout: 20000,
    });

    const mailOptions = {
      from: `"LD Interiors & Furnitures" <${SMTP_USER}>`,
      replyTo: `"LD Interiors & Furnitures" <${SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
    };

    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
          console.error('[EMAIL-BRIDGE ERROR] sendMail failed:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    console.log(`[EMAIL-BRIDGE SUCCESS] Email dispatched to ${to}! Message ID:`, info.messageId);

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[EMAIL-BRIDGE EXCEPTION]:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch email' },
      { status: 500, headers: corsHeaders }
    );
  }
}
