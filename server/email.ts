import { Resend } from 'resend';

const DEFAULT_FROM_EMAIL = 'FlashFusion <noreply@resend.dev>';
const CONNECTION_ENDPOINT_PATH = '/api/v2/connection?include_secrets=true&connector_names=resend';

type ResendConnectionSettings = {
  settings?: {
    api_key?: string;
    from_email?: string;
  };
};

type ReplitAuthHeaders = {
  Accept: 'application/json';
  X_REPLIT_TOKEN: string;
};

function resolveReplitToken(): string {
  if (process.env.REPL_IDENTITY) {
    return `repl ${process.env.REPL_IDENTITY}`;
  }

  if (process.env.WEB_REPL_RENEWAL) {
    return `depl ${process.env.WEB_REPL_RENEWAL}`;
  }

  throw new Error('X_REPLIT_TOKEN not found for repl/depl');
}

function buildConnectionUrl(): string {
  return `https://${process.env.REPLIT_CONNECTORS_HOSTNAME}${CONNECTION_ENDPOINT_PATH}`;
}

function buildAuthHeaders(): ReplitAuthHeaders {
  return {
    Accept: 'application/json',
    X_REPLIT_TOKEN: resolveReplitToken(),
  };
}

function extractConnectionSettings(payload: { items?: ResendConnectionSettings[] }): ResendConnectionSettings {
  const connectionSettings = payload.items?.[0];

  if (!connectionSettings?.settings?.api_key) {
    throw new Error('Resend not connected');
  }

  return connectionSettings;
}

function resolveBaseUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }

  if (process.env.REPLIT_DEPLOYMENT_URL) {
    return `https://${process.env.REPLIT_DEPLOYMENT_URL}`;
  }

  return 'http://localhost:5000';
}

function buildResetLink(resetToken: string): string {
  return `${resolveBaseUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;
}

async function getUncachableResendClient() {
  const response = await fetch(buildConnectionUrl(), {
    headers: buildAuthHeaders(),
  });

  const payload = (await response.json()) as { items?: ResendConnectionSettings[] };
  const connectionSettings = extractConnectionSettings(payload);

  return {
    client: new Resend(connectionSettings.settings!.api_key),
    fromEmail: connectionSettings.settings?.from_email,
  };
}

function buildEmailContent(resetLink: string): { html: string; text: string } {
  const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d0b14; color: #ffffff; padding: 40px 20px; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #131022 0%, #1a1530 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(71, 37, 244, 0.2);">
              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; background: linear-gradient(135deg, #4725f4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                FlashFusion
              </h1>
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #ffffff;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 24px; color: #a1a1aa; line-height: 1.6;">
                We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.
              </p>
              <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #4725f4, #ec4899); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <hr style="border: none; border-top: 1px solid rgba(71, 37, 244, 0.2); margin: 32px 0;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                This email was sent by FlashFusion. If you have questions, please contact support.
              </p>
            </div>
          </body>
        </html>
      `;

  const text = `Reset Your FlashFusion Password

We received a request to reset your password. Click the link below to choose a new password. This link will expire in 1 hour.

${resetLink}

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

- FlashFusion Team`;

  return { html, text };
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const resetLink = buildResetLink(resetToken);
    const { html, text } = buildEmailContent(resetLink);

    await client.emails.send({
      from: fromEmail || DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: 'Reset Your FlashFusion Password',
      html,
      text,
    });

    console.log('[Email] Password reset email sent successfully to:', toEmail);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    return false;
  }
}
