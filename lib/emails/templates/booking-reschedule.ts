import { formatTbilisi } from '@/lib/utils/datetime';

type BookingRescheduleProps = {
  recipientName: string;
  isCustomer: boolean;
  confirmationId: string;
  serviceName: string;
  businessName: string;
  oldAppointmentDateTime: string;
  newAppointmentDateTime: string;
  staffName: string | null;
  customerName?: string;
  bookingId: string;
  businessSlug: string;
};

export function generateBookingRescheduleEmail(props: BookingRescheduleProps) {
  const oldDate = formatTbilisi(props.oldAppointmentDateTime, 'EEEE, MMMM d, yyyy');
  const oldTime = formatTbilisi(props.oldAppointmentDateTime, 'h:mm a');
  const newDate = formatTbilisi(props.newAppointmentDateTime, 'EEEE, MMMM d, yyyy');
  const newTime = formatTbilisi(props.newAppointmentDateTime, 'h:mm a');

  return {
    subject: `Booking Rescheduled: ${props.serviceName} at ${props.businessName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Rescheduled</title>
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

          <!-- Reschedule Icon -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; color: #3b82f6;">🔄</span>
              </div>
              <h2 style="margin: 24px 0 8px; font-size: 28px; font-weight: 700; color: #d4af37;">Booking Rescheduled</h2>
              <p style="margin: 0; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.15em;">Confirmation #${props.confirmationId}</p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">Hi ${props.recipientName},</p>
              <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">Your booking has been rescheduled to a new date and time.</p>
            </td>
          </tr>

          <!-- Service Info -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #d4af37; text-transform: uppercase; letter-spacing: 0.2em;">Service</p>
              <p style="margin: 0; font-size: 20px; font-weight: 600; color: #fff;">${props.serviceName}</p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #999;">
                <span style="color: #d4af37;">🏢</span> ${props.businessName}
              </p>
              ${props.staffName ? `
              <p style="margin: 4px 0 0; font-size: 14px; color: #999;">
                <span style="color: #d4af37;">👤</span> ${props.staffName}
              </p>
              ` : ''}
              ${!props.isCustomer && props.customerName ? `
              <p style="margin: 4px 0 0; font-size: 14px; color: #999;">
                <span style="color: #d4af37;">👤</span> Customer: ${props.customerName}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Old Date (Strikethrough) -->
          <tr>
            <td style="padding: 0 40px 16px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #141414; border: 1px solid rgba(255, 255, 255, 0.05); opacity: 0.5;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Previous Date & Time</p>
                    <p style="margin: 0; font-size: 16px; color: #e5e5e5; text-decoration: line-through;">${oldDate}</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #999; text-decoration: line-through;">${oldTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Arrow -->
          <tr>
            <td style="padding: 0 40px 16px; text-align: center;">
              <span style="font-size: 24px; color: #3b82f6;">↓</span>
            </td>
          </tr>

          <!-- New Date (Highlighted) -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(212, 175, 55, 0.05); border: 2px solid #d4af37;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #d4af37; text-transform: uppercase; letter-spacing: 0.2em;">New Date & Time</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 600; color: #d4af37;">${newDate}</p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #e5e5e5;">${newTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Actions -->
          ${props.isCustomer ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard" style="display: block; width: 100%; padding: 16px; background-color: #d4af37; color: #0a0a0a; text-align: center; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
                      View My Bookings
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/businesses/${props.businessSlug}" style="display: block; width: 100%; padding: 16px; background-color: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #e5e5e5; text-align: center; text-decoration: none; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em;">
                      View Business Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 0 40px 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/appointments" style="display: block; width: 100%; padding: 16px; background-color: #d4af37; color: #0a0a0a; text-align: center; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
                View in Dashboard
              </a>
            </td>
          </tr>
          `}

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
