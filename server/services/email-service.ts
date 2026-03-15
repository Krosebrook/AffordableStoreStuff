import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@affordablestorestuff.com";
const APP_URL = process.env.APP_URL ?? "https://affordablestorestuff.com";

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error(
      "[EMAIL] RESEND_API_KEY is not set. Cannot send emails."
    );
  }
  if (!resend) {
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
}

/**
 * Send a password reset email with a signed reset link.
 * @param to       Recipient email address
 * @param token    The raw reset token (will be embedded in the link)
 * @param username The user's username (for personalisation)
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string,
  username: string
): Promise<void> {
  const client = getResendClient();
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your AffordableStoreStuff password",
    html: `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
    <h2>Password Reset</h2>
    <p>Hi <strong>${escapeHtml(username)}</strong>,</p>
    <p>We received a request to reset the password for your AffordableStoreStuff account.</p>
    <p>
      <a href="${resetUrl}"
         style="display: inline-block; padding: 12px 24px; background: #2563EB; color: #fff;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reset Password
      </a>
    </p>
    <p>This link expires in <strong>1 hour</strong>.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
    <p style="font-size: 12px; color: #888;">
      If the button above doesn't work, copy and paste this URL into your browser:<br />
      <a href="${resetUrl}" style="color: #2563EB;">${resetUrl}</a>
    </p>
  </body>
</html>
    `.trim(),
    text: `
Hi ${username},

We received a request to reset the password for your AffordableStoreStuff account.

Reset your password by visiting:
${resetUrl}

This link expires in 1 hour.

If you did not request a password reset, you can safely ignore this email.
    `.trim(),
  });

  if (error) {
    throw new Error(`[EMAIL] Failed to send password reset email: ${error.message}`);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
