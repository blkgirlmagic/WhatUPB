import { Resend } from "resend";
import crypto from "crypto";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Generate HMAC token for unsubscribe links (no auth needed)
export function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.RESEND_API_KEY || "fallback-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(userId)
    .digest("hex")
    .substring(0, 32);
}

export function verifyUnsubscribeToken(
  userId: string,
  token: string
): boolean {
  return generateUnsubscribeToken(userId) === token;
}

export async function sendNewMessageNotification(
  recipientEmail: string,
  recipientId: string,
  username?: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log("[email] Skipped: RESEND_API_KEY not set");
    return;
  }
  console.log("[email] RESEND_API_KEY is set, preparing email...");

  const token = generateUnsubscribeToken(recipientId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://whatupb.com";
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?uid=${recipientId}&token=${token}`;
  const inboxUrl = `${baseUrl}/inbox`;
  const profileUrl = username ? `https://whatupb.com/${username}` : "https://whatupb.com";
  const profileDisplay = username ? `whatupb.com/${username}` : "whatupb.com";

  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: "WhatUPB <notifications@whatupb.com>",
    to: recipientEmail,
    subject: "Someone left you a message",
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0c0c10;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0c10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:700;color:#a5b4fc;letter-spacing:0.05em;">WhatUPB</span>
            </td>
          </tr>
          <!-- Single Card -->
          <tr>
            <td style="background-color:#141418;border:1px solid #2a2a35;border-radius:14px;padding:40px 32px;text-align:center;">
              <p style="color:#ededed;font-size:20px;font-weight:700;margin:0 0 12px;">
                Someone left you a message
              </p>
              <p style="color:#71717a;font-size:14px;margin:0 0 28px;line-height:1.5;">
                You received an anonymous message on WhatUPB. Open your inbox to read it.
              </p>
              <a href="${inboxUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-weight:600;font-size:15px;padding:12px 32px;border-radius:12px;text-decoration:none;">
                Read Message
              </a>
              <!-- Divider -->
              <div style="border-top:1px solid #2a2a35;margin:32px 0 24px;"></div>
              <!-- Share section -->
              <p style="color:#a5b4fc;font-size:14px;font-weight:600;margin:0 0 6px;">
                Want more messages?
              </p>
              <p style="color:#71717a;font-size:13px;margin:0 0 16px;">
                Share your WhatUPB link:
              </p>
              <a href="${profileUrl}" style="display:inline-block;background-color:#1c1c24;border:1px solid #2a2a35;border-radius:10px;padding:12px 24px;color:#a5b4fc;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">
                ${profileDisplay}
              </a>
              <p style="color:#52525b;font-size:11px;margin:10px 0 0;">
                Tap and hold to copy link
              </p>
              <p style="color:#3f3f46;font-size:12px;font-style:italic;margin:18px 0 0;">
                Say what you mean.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="color:#3f3f46;font-size:12px;margin:0;line-height:1.5;">
                You're receiving this because you have an account on WhatUPB.<br>
                <a href="${unsubscribeUrl}" style="color:#6366f1;text-decoration:underline;">Unsubscribe</a> from email notifications.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (emailError) {
    console.error("[email] Resend API error:", emailError);
    throw new Error(`Resend error: ${JSON.stringify(emailError)}`);
  }
  console.log("[email] Resend API success:", emailResult);
}
