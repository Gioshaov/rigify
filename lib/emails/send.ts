'use server'

import { resend, FROM_EMAIL } from './resend';
import { generateBookingConfirmationCustomerEmail } from './templates/booking-confirmation-customer';
import { generateBookingConfirmationBusinessEmail } from './templates/booking-confirmation-business';
import { generateBookingCancellationEmail } from './templates/booking-cancellation';
import { generateBookingRescheduleEmail } from './templates/booking-reschedule';

type SendEmailResult = {
  success: boolean;
  error?: string;
  emailId?: string;
};

/**
 * Send booking confirmation email to customer
 */
export async function sendBookingConfirmationToCustomer(params: {
  customerEmail: string;
  customerName: string;
  confirmationId: string;
  serviceName: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessPhone: string | null;
  businessSlug: string;
  appointmentDateTime: string;
  duration: number;
  price: number | null;
  staffName: string | null;
  bookingId: string;
}): Promise<SendEmailResult> {
  try {
    const emailContent = generateBookingConfirmationCustomerEmail(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[Email] Resend API error:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send booking confirmation email to business
 */
export async function sendBookingConfirmationToBusiness(params: {
  businessEmail: string;
  businessName: string;
  confirmationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceName: string;
  appointmentDateTime: string;
  duration: number;
  price: number | null;
  staffName: string | null;
  bookingId: string;
}): Promise<SendEmailResult> {
  try {
    const emailContent = generateBookingConfirmationBusinessEmail(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.businessEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[Email] Failed to send booking confirmation to business:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error sending booking confirmation to business:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send cancellation notice to customer
 */
export async function sendCancellationToCustomer(params: {
  customerEmail: string;
  customerName: string;
  confirmationId: string;
  serviceName: string;
  businessName: string;
  appointmentDateTime: string;
  cancelledBy: 'customer' | 'business';
}): Promise<SendEmailResult> {
  try {
    const emailContent = generateBookingCancellationEmail({
      recipientName: params.customerName,
      isCustomer: true,
      confirmationId: params.confirmationId,
      serviceName: params.serviceName,
      businessName: params.businessName,
      appointmentDateTime: params.appointmentDateTime,
      cancelledBy: params.cancelledBy,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[Email] Failed to send cancellation notice to customer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error sending cancellation notice to customer:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send cancellation notice to business
 */
export async function sendCancellationToBusiness(params: {
  businessEmail: string;
  businessName: string;
  confirmationId: string;
  customerName: string;
  serviceName: string;
  appointmentDateTime: string;
  cancelledBy: 'customer' | 'business';
}): Promise<SendEmailResult> {
  try {
    const emailContent = generateBookingCancellationEmail({
      recipientName: params.businessName,
      isCustomer: false,
      confirmationId: params.confirmationId,
      serviceName: params.serviceName,
      businessName: params.businessName,
      appointmentDateTime: params.appointmentDateTime,
      customerName: params.customerName,
      cancelledBy: params.cancelledBy,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.businessEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[Email] Failed to send cancellation notice to business:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error sending cancellation notice to business:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send reschedule notice to customer
 */
export async function sendRescheduleToCustomer(params: {
  customerEmail: string;
  customerName: string;
  confirmationId: string;
  serviceName: string;
  businessName: string;
  businessSlug: string;
  oldAppointmentDateTime: string;
  newAppointmentDateTime: string;
  staffName: string | null;
  bookingId: string;
}): Promise<SendEmailResult> {
  try {
    const emailContent = generateBookingRescheduleEmail({
      recipientName: params.customerName,
      isCustomer: true,
      confirmationId: params.confirmationId,
      serviceName: params.serviceName,
      businessName: params.businessName,
      businessSlug: params.businessSlug,
      oldAppointmentDateTime: params.oldAppointmentDateTime,
      newAppointmentDateTime: params.newAppointmentDateTime,
      staffName: params.staffName,
      bookingId: params.bookingId,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[Email] Failed to send reschedule notice to customer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error sending reschedule notice to customer:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send reschedule notice to business
 */
export async function sendRescheduleToBusiness(params: {
  businessEmail: string;
  businessName: string;
  confirmationId: string;
  customerName: string;
  serviceName: string;
  businessSlug: string;
  oldAppointmentDateTime: string;
  newAppointmentDateTime: string;
  staffName: string | null;
  bookingId: string;
}): Promise<SendEmailResult> {
  try {
    const emailContent = generateBookingRescheduleEmail({
      recipientName: params.businessName,
      isCustomer: false,
      confirmationId: params.confirmationId,
      serviceName: params.serviceName,
      businessName: params.businessName,
      businessSlug: params.businessSlug,
      oldAppointmentDateTime: params.oldAppointmentDateTime,
      newAppointmentDateTime: params.newAppointmentDateTime,
      staffName: params.staffName,
      customerName: params.customerName,
      bookingId: params.bookingId,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.businessEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('[Email] Failed to send reschedule notice to business:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error sending reschedule notice to business:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
