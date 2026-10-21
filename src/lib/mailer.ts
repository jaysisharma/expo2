// Sends a plain transactional email: Resend when RESEND_API_KEY is set, otherwise SMTP.
import "server-only";
import nodemailer from "nodemailer";
import { getResendClient } from "./resend";

export async function sendMail({ to, subject, html }: { to: string[]; subject: string; html: string }) {
  const fromName = process.env.SMTP_FROM_NAME || "Himalayan Green Energy Expo";

  const resend = getResendClient();
  if (resend && process.env.RESEND_FROM_EMAIL) {
    const { error } = await resend.emails.send({
      from: `${fromName} <${process.env.RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return "resend";
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("No email provider configured (set RESEND_API_KEY + RESEND_FROM_EMAIL, or SMTP_USER + SMTP_PASS)");
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({ from: `"${fromName}" <${user}>`, to: to.join(", "), subject, html });
  return "smtp";
}
