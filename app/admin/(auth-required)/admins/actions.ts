"use server";

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/utils/audit-log';
import { headers } from 'next/headers';
import { randomInt } from 'crypto';

/**
 * Create a new super admin user
 */
export async function createSuperAdmin(email: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email format' };
  }

  // Generate secure temporary password
  const tempPassword = generateSecurePassword();

  // Create user with admin flag
  const admin = createAdminClient();
  const { data: newUser, error } = await admin.auth.admin.createUser({
    email: email,
    password: tempPassword,
    email_confirm: true,
    app_metadata: { is_super_admin: true }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Admin with this email already exists' };
    }
    return { error: 'Failed to create admin user' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'create',
    resourceType: 'admin',
    resourceId: newUser.user.id,
    resourceName: email,
    details: { action: 'create_super_admin' },
    ipAddress,
    userAgent,
  });

  return {
    success: true,
    tempPassword, // Return to UI to display once
    adminId: newUser.user.id
  };
}

/**
 * Revoke super admin access (doesn't delete user)
 */
export async function revokeSuperAdmin(adminId: string, adminEmail: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Prevent self-revocation
  if (user.id === adminId) {
    return { error: 'Cannot revoke your own admin access' };
  }

  // Update user metadata to remove admin flag
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(adminId, {
    app_metadata: { is_super_admin: false }
  });

  if (error) {
    return { error: 'Failed to revoke admin access' };
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
    resourceType: 'admin',
    resourceId: adminId,
    resourceName: adminEmail,
    details: { action: 'revoke_super_admin_access' },
    ipAddress,
    userAgent,
  });

  return { success: true };
}

/**
 * Generate cryptographically secure temporary password
 * 16 characters with uppercase, lowercase, numbers, and symbols
 */
function generateSecurePassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;

  // Start with one character from each required category
  const chars = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    digits[randomInt(digits.length)],
    symbols[randomInt(symbols.length)],
    // Fill remaining 12 characters randomly from all categories
    ...Array.from({ length: 12 }, () => all[randomInt(all.length)]),
  ];

  // Fisher-Yates shuffle with cryptographically secure random
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
