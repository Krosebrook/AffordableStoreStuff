import { Resend } from 'resend';

async function getUncachableResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }

  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email as string | undefined
  };
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.REPLIT_DEPLOYMENT_URL 
        ? `https://${process.env.REPLIT_DEPLOYMENT_URL}`
        : 'http://localhost:5000';
    
    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    
    const result = await client.emails.send({
      from: fromEmail || 'FlashFusion <noreply@resend.dev>',
      to: toEmail,
      subject: 'Reset Your FlashFusion Password',
      html: `
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
      `,
      text: `Reset Your FlashFusion Password

We received a request to reset your password. Click the link below to choose a new password. This link will expire in 1 hour.

${resetLink}

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

- FlashFusion Team`
    });

    console.log('[Email] Password reset email sent successfully to:', toEmail);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    return false;
  }
}
