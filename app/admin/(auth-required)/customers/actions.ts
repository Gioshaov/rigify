"use server";

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createAuditLog } from '@/lib/utils/audit-log';
import { headers } from 'next/headers';

/**
 * Suspend a customer account
 */
export async function suspendCustomer(customerId: string, customerName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Use admin client to fetch current status and update
  const admin = createAdminClient();

  // Get current status
  const { data: currentCustomer } = await admin
    .from('customers')
    .select('status')
    .eq('id', customerId)
    .single();

  if (!currentCustomer) {
    return { error: 'Customer not found' };
  }

  if (currentCustomer.status === 'suspended') {
    return { error: 'Customer is already suspended' };
  }

  const { error } = await admin
    .from('customers')
    .update({ status: 'suspended' })
    .eq('id', customerId);

  if (error) {
    return { error: 'Failed to suspend customer' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'suspend',
    resourceType: 'customer',
    resourceId: customerId,
    resourceName: customerName,
    details: { previousStatus: currentCustomer.status, newStatus: 'suspended' },
    ipAddress,
    userAgent,
  });

  return { success: true };
}

/**
 * Activate a suspended customer account
 */
export async function activateCustomer(customerId: string, customerName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Use admin client to fetch current status and update
  const admin = createAdminClient();

  // Get current status
  const { data: currentCustomer } = await admin
    .from('customers')
    .select('status')
    .eq('id', customerId)
    .single();

  if (!currentCustomer) {
    return { error: 'Customer not found' };
  }

  if (currentCustomer.status === 'active') {
    return { error: 'Customer is already active' };
  }

  const { error } = await admin
    .from('customers')
    .update({ status: 'active' })
    .eq('id', customerId);

  if (error) {
    return { error: 'Failed to activate customer' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'activate',
    resourceType: 'customer',
    resourceId: customerId,
    resourceName: customerName,
    details: { previousStatus: currentCustomer.status, newStatus: 'active' },
    ipAddress,
    userAgent,
  });

  return { success: true };
}

/**
 * Delete a customer account (cascades to bookings via FK)
 */
export async function deleteCustomer(customerId: string, customerName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Use admin client to delete customer
  const admin = createAdminClient();

  // First get customer details for audit log
  const { data: customer } = await admin
    .from('customers')
    .select('name, email, phone, status')
    .eq('id', customerId)
    .single();

  if (!customer) {
    return { error: 'Customer not found' };
  }

  // Delete customer (cascades to bookings)
  const { error } = await admin
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) {
    return { error: 'Failed to delete customer' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'delete',
    resourceType: 'customer',
    resourceId: customerId,
    resourceName: customerName,
    details: {
      deletedData: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      }
    },
    ipAddress,
    userAgent,
  });

  return { success: true };
}
