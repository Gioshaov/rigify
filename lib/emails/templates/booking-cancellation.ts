import { formatTbilisi } from '@/lib/utils/datetime';

type BookingCancellationProps = {
  recipientName: string;
  isCustomer: boolean;
  confirmationId: string;
  serviceName: string;
  businessName: string;
  appointmentDateTime: string;
  customerName?: string;
  cancelledBy: 'customer' | 'business';
};

export function generateBookingCancellationEmail(props: BookingCancellationProps) {
  const formattedDate = formatTbilisi(props.appointmentDateTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = formatTbilisi(props.appointmentDateTime, 'h:mm a');

  const cancelledByText = props.cancelledBy === 'customer'
    ? 'You have cancelled this booking'
    : 'This booking has been cancelled by the business';

  return {
    subject: `Booking Cancelled: ${props.serviceName} at ${props.businessName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancellation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #1a1a1a; border: 1px solid rgba(212, 175, 55, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #d4af37; text-transform: uppercase; letter-spacing: -0.02em;">RIGIFY</h1>
              <p style="margin: 8px 0 0; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.15em;">The Artisan Collective</p>
            </td>
          </tr>

          <!-- Cancellation Icon -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; color: #ef4444;">✕</span>
              </div>
              <h2 style="margin: 24px 0 8px; font-size: 28px; font-weight: 700; color: #e5e5e5;">Booking Cancelled</h2>
              <p style="margin: 0; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.15em;">Confirmation #${props.confirmationId}</p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">Hi ${props.recipientName},</p>
              <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">${cancelledByText}.</p>
            </td>
          </tr>

          <!-- Cancelled Booking Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #141414; border: 1px solid rgba(255, 255, 255, 0.05); opacity: 0.6;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Cancelled Service</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 600; color: #fff; text-decoration: line-through;">${props.serviceName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 24px;">
                    <p style="margin: 0; font-size: 14px; color: #999;">
                      <span>🏢</span> ${props.businessName}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 24px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Was Scheduled For</p>
                    <p style="margin: 0; font-size: 16px; color: #e5e5e5;">${formattedDate}</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #999;">${formattedTime}</p>
                  </td>
                </tr>
                ${!props.isCustomer && props.customerName ? `
                <tr>
                  <td style="padding: 0 24px 24px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Customer</p>
                    <p style="margin: 0; font-size: 16px; color: #e5e5e5;">${props.customerName}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          ${props.isCustomer ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: rgba(212, 175, 55, 0.05); border-left: 2px solid #d4af37; padding: 16px 20px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #d4af37;">Book Again</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e5e5;">
                  Want to reschedule? Visit ${props.businessName} to book a new appointment.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/businesses" style="display: block; width: 100%; padding: 16px; background-color: #d4af37; color: #0a0a0a; text-align: center; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
                Browse Studios
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #999;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #d4af37; text-decoration: none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.2em;">
                © 2026 Rigify. All rights reserved.
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
  };
}

const SUPPORT_EMAIL = 'support@rigify.ge';
