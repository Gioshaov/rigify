import { Resend } from 'resend';

// Lazy initialization - only check API key when actually sending emails
// This prevents server crash on startup if key is missing
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// For backward compatibility
export const resend = {
  get emails() {
    return getResendClient().emails;
  }
};

// Default sender email (rigify.ge verified in Resend dashboard)
export const FROM_EMAIL = 'Rigify <noreply@rigify.ge>';

// Support email for replies
export const SUPPORT_EMAIL = 'support@rigify.ge';
