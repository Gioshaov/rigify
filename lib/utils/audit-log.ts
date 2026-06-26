import { createAdminClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'suspend'
  | 'restore'
  | 'activate'
  | 'deactivate'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'permission_grant'
  | 'permission_revoke';

export type ResourceType =
  | 'business'
  | 'customer'
  | 'staff'
  | 'booking'
  | 'service'
  | 'review'
  | 'admin'
  | 'subscription'
  | 'settings';

export interface AuditLogParams {
  adminUserId: string;
  adminEmail: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 *
 * Uses service role client to bypass RLS and ensure logs are always created
 * even if the user's session expires or is revoked.
 *
 * @example
 * await createAuditLog({
 *   adminUserId: user.id,
 *   adminEmail: user.email,
 *   action: 'suspend',
 *   resourceType: 'customer',
 *   resourceId: customerId,
 *   resourceName: customerName,
 *   details: { reason: 'Terms violation', previousStatus: 'active' },
 * });
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const admin = createAdminClient();

    const { error } = await admin.from('audit_logs').insert({
      admin_user_id: params.adminUserId,
      admin_email: params.adminEmail,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      resource_name: params.resourceName,
      details: params.details || null,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    });

    if (error) {
      // Log to console but don't throw - audit logging failure should not block operations
      console.error('Failed to create audit log:', error);
      console.error('Audit log params:', params);
    }
  } catch (err) {
    console.error('Audit log exception:', err);
    console.error('Audit log params:', params);
  }
}

/**
 * Helper to extract IP and user agent from request headers
 *
 * @example
 * const { ipAddress, userAgent } = getRequestMetadata(request);
 */
export function getRequestMetadata(request?: Request) {
  if (!request) {
    return { ipAddress: undefined, userAgent: undefined };
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') ||
                   undefined;

  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}

