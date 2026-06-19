"use server";

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createAuditLog } from '@/lib/utils/audit-log';
import { headers } from 'next/headers';


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
        status: customer.status,
      }
    },
    ipAddress,
    userAgent,
  });

  return { success: true };
}

/**
 * Update customer status (toggle active/suspended from detail page)
 */
export async function updateCustomerStatus(customerId: string, newStatus: 'active' | 'suspended', customerName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' };
  }

  const admin = createAdminClient();

  // Get current status
  const { data: currentCustomer } = await admin
    .from('customers')
    .select('status')
    .eq('id', customerId)
    .single();

  if (!currentCustomer) {
    return { success: false, message: 'Customer not found' };
  }

  // Update status
  const { error } = await admin
    .from('customers')
    .update({ status: newStatus })
    .eq('id', customerId);

  if (error) {
    return { success: false, message: 'Failed to update customer status' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: newStatus === 'active' ? 'activate' : 'suspend',
    resourceType: 'customer',
    resourceId: customerId,
    resourceName: customerName,
    details: { previousStatus: currentCustomer.status, newStatus },
    ipAddress,
    userAgent,
  });

  return { success: true, message: `Customer ${newStatus === 'active' ? 'activated' : 'suspended'} successfully` };
}

/**
 * Update customer info (name, phone, email)
 */
export async function updateCustomer(customerId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' };
  }

  // Extract and validate fields
  const name = formData.get('name')?.toString().trim();
  const phone = formData.get('phone')?.toString().trim();
  const email = formData.get('email')?.toString().trim();

  if (!name || name.length < 2 || name.length > 100) {
    return { success: false, message: 'Name must be 2-100 characters' };
  }

  if (!phone || !/^\+995\d{9}$/.test(phone)) {
    return { success: false, message: 'Phone must be in Georgian format (+995XXXXXXXXX)' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Invalid email format' };
  }

  const admin = createAdminClient();

  // Get current customer data for audit log
  const { data: currentCustomer } = await admin
    .from('customers')
    .select('name, phone, email')
    .eq('id', customerId)
    .single();

  if (!currentCustomer) {
    return { success: false, message: 'Customer not found' };
  }

  // Check if email is already in use by another customer
  const { data: existingEmail } = await admin
    .from('customers')
    .select('id')
    .eq('email', email)
    .neq('id', customerId)
    .single();

  if (existingEmail) {
    return { success: false, message: 'Email already in use by another customer' };
  }

  // Update customer
  const { error } = await admin
    .from('customers')
    .update({ name, phone, email })
    .eq('id', customerId);

  if (error) {
    return { success: false, message: 'Failed to update customer' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'update',
    resourceType: 'customer',
    resourceId: customerId,
    resourceName: name,
    details: {
      changes: {
        name: { from: currentCustomer.name, to: name },
        phone: { from: currentCustomer.phone, to: phone },
        email: { from: currentCustomer.email, to: email },
      }
    },
    ipAddress,
    userAgent,
  });

  // Revalidate paths
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${customerId}`);

  return { success: true, message: 'Customer updated successfully' };
}
