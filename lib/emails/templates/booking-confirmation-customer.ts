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
  const durationDisplay = `${props.duration} min`;

  return {
    subject: `Booking Confirmed: ${props.serviceName} at ${props.businessName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-header-stack { display: block !important; text-align: left !important; }
      .mobile-confirmation { display: block !important; margin-top: 8px !important; }
      .mobile-label-width { width: 110px !important; font-size: 9px !important; }
      .mobile-hero-title { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 0;">
        <!-- Container -->
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #111111;">

          <!-- 1. HEADER ROW -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #1f1f1f;" class="mobile-padding">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: left;" class="mobile-header-stack">
                    <span style="font-size: 13px; font-weight: 700; color: #d4a843; letter-spacing: 0.2em;">RIGIFY</span>
                  </td>
                  <td style="text-align: right;" class="mobile-header-stack mobile-confirmation">
                    <span style="font-size: 10px; color: #555555; letter-spacing: 0.1em; font-family: 'Courier New', monospace;">CONFIRMATION #${props.confirmationId}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. HERO -->
          <tr>
            <td style="padding: 32px 32px 24px;" class="mobile-padding">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #e8e6f0; letter-spacing: 0.08em;" class="mobile-hero-title">BOOKING CONFIRMED</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #888888; line-height: 1.6;">Hi ${props.customerName}, your appointment has been confirmed. Please find the transaction details below.</p>
            </td>
          </tr>

          <!-- 3. DATA TABLE -->
          <tr>
            <td style="padding: 0 32px;" class="mobile-padding">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">

                <!-- SERVICE -->
                <tr>
                  <td style="width: 140px; padding: 14px 24px 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;" class="mobile-label-width">
                    <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">SERVICE</span>
                  </td>
                  <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">
                    <div style="font-size: 14px; color: #e8e6f0; font-weight: 500; margin-bottom: 4px;">${props.serviceName}</div>
                    <div style="font-size: 11px; color: #555555;">${props.businessName}</div>
                  </td>
                </tr>

                <!-- DATE & TIME -->
                <tr>
                  <td style="width: 140px; padding: 14px 24px 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;" class="mobile-label-width">
                    <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">DATE & TIME</span>
                  </td>
                  <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">
                    <span style="font-size: 14px; color: #d4a843; font-weight: 500;">${formattedDate} — ${formattedTime}</span>
                  </td>
                </tr>

                <!-- DURATION -->
                <tr>
                  <td style="width: 140px; padding: 14px 24px 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;" class="mobile-label-width">
                    <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">DURATION</span>
                  </td>
                  <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">
                    <span style="font-size: 14px; color: #e8e6f0; font-weight: 500;">${durationDisplay}</span>
                  </td>
                </tr>

                ${props.staffName ? `
                <!-- ARTISAN -->
                <tr>
                  <td style="width: 140px; padding: 14px 24px 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;" class="mobile-label-width">
                    <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">ARTISAN</span>
                  </td>
                  <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">
                    <span style="font-size: 14px; color: #e8e6f0; font-weight: 500;">${props.staffName}</span>
                  </td>
                </tr>
                ` : ''}

                <!-- PRICE -->
                <tr>
                  <td style="width: 140px; padding: 14px 24px 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;" class="mobile-label-width">
                    <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">PRICE</span>
                  </td>
                  <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">
                    <span style="font-size: 14px; color: #e8e6f0; font-weight: 500;">${priceDisplay}</span>
                  </td>
                </tr>

                <!-- LOCATION -->
                <tr>
                  <td style="width: 140px; padding: 14px 24px 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;" class="mobile-label-width">
                    <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">LOCATION</span>
                  </td>
                  <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">
                    <div style="font-size: 14px; color: #e8e6f0; font-weight: 500; margin-bottom: 4px;">${props.businessAddress}, ${props.businessCity}</div>
                    ${props.businessPhone ? `<div style="font-size: 11px; color: #555555;">${props.businessPhone}</div>` : ''}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 4. CTA -->
          <tr>
            <td style="padding: 28px 32px;" class="mobile-padding">
              <a href="https://rigify.ge/customer/dashboard" style="display: inline-block; width: auto; padding: 12px 24px; background-color: transparent; border: 1px solid #333333; color: #e8e6f0; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; border-radius: 2px;">VIEW BOOKING</a>
            </td>
          </tr>

          <!-- 5. PREPARATION NOTICE -->
          <tr>
            <td style="padding: 0 32px 24px;" class="mobile-padding">
              <div style="margin-bottom: 6px;">
                <span style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 0.12em;">PREPARATION NOTICE</span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.6;">Please arrive 5-10 minutes early. Cancellations or rescheduling require 24-hour advance notice to avoid service fees.</p>
            </td>
          </tr>

          <!-- 6. FOOTER -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #1a1a1a;" class="mobile-padding">
              <p style="margin: 0; font-size: 10px; color: #444444; letter-spacing: 0.08em; font-family: 'Courier New', monospace;">© 2026 RIGIFY. ALL RIGHTS RESERVED. // ${SUPPORT_EMAIL}</p>
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
