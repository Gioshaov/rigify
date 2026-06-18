import { formatTbilisi } from '@/lib/utils/datetime';

type BookingConfirmationCustomerProps = {
  customerName: string;
  confirmationId: string;
  serviceName: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessPhone: string | null;
  appointmentDateTime: string;
  duration: number;
  price: number | null;
  staffName: string | null;
  businessSlug: string;
  bookingId: string;
};

export function generateBookingConfirmationCustomerEmail(props: BookingConfirmationCustomerProps) {
  const formattedDate = formatTbilisi(props.appointmentDateTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = formatTbilisi(props.appointmentDateTime, 'h:mm a');
  const priceDisplay = props.price ? `₾${props.price.toFixed(0)}` : 'TBD';

  return {
    subject: `Booking Confirmed: ${props.serviceName} at ${props.businessName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
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

          <!-- Success Icon -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto; background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; color: #d4af37;">✓</span>
              </div>
              <h2 style="margin: 24px 0 8px; font-size: 28px; font-weight: 700; color: #d4af37;">Booking Confirmed!</h2>
              <p style="margin: 0; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.15em;">Confirmation #${props.confirmationId}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">Hi ${props.customerName},</p>
              <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">Your appointment has been confirmed. We look forward to seeing you!</p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #141414; border: 1px solid rgba(255, 255, 255, 0.05);">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #d4af37; text-transform: uppercase; letter-spacing: 0.2em;">Service</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 600; color: #fff;">${props.serviceName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 24px;">
                    <p style="margin: 0; font-size: 14px; color: #999;">
                      <span style="color: #d4af37;">🏢</span> ${props.businessName}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 16px 0; width: 50%;">
                          <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Date & Time</p>
                          <p style="margin: 0; font-size: 16px; color: #d4af37;">${formattedDate}</p>
                          <p style="margin: 4px 0 0; font-size: 14px; color: #e5e5e5;">${formattedTime}</p>
                        </td>
                        <td style="padding: 16px 0; width: 50%;">
                          <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Duration</p>
                          <p style="margin: 0; font-size: 16px; color: #e5e5e5;">${props.duration} minutes</p>
                        </td>
                      </tr>
                      ${props.staffName ? `
                      <tr>
                        <td style="padding: 16px 0; width: 50%; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Artisan</p>
                          <p style="margin: 0; font-size: 16px; color: #e5e5e5;">${props.staffName}</p>
                        </td>
                        <td style="padding: 16px 0; width: 50%; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Price</p>
                          <p style="margin: 0; font-size: 16px; color: #e5e5e5;">${priceDisplay}</p>
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td colspan="2" style="padding: 16px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Price</p>
                          <p style="margin: 0; font-size: 16px; color: #e5e5e5;">${priceDisplay}</p>
                        </td>
                      </tr>
                      `}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Location -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: rgba(212, 175, 55, 0.05); border-left: 2px solid #d4af37; padding: 16px 20px;">
                <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; color: #d4af37; text-transform: uppercase; letter-spacing: 0.15em;">Location</p>
                <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #e5e5e5;">${props.businessAddress}</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #999;">${props.businessCity}</p>
                ${props.businessPhone ? `<p style="margin: 8px 0 0; font-size: 14px; color: #999;">${props.businessPhone}</p>` : ''}
              </div>
            </td>
          </tr>

          <!-- Actions -->
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

          <!-- Preparation Note -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999;">
                <strong style="color: #e5e5e5;">Preparation:</strong> Please arrive 5-10 minutes early. If you need to cancel or reschedule, please do so at least 24 hours in advance.
              </p>
            </td>
          </tr>

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
