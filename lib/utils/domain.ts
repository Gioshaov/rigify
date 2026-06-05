/**
 * Domain detection utilities for admin subdomain routing
 */

/**
 * Check if the request is from the admin subdomain
 * Development: admin.localhost:3000
 * Production: admin.rigify.ge
 */
export function isAdminDomain(host: string): boolean {
  if (!host) return false;

  // Development
  if (host.startsWith('admin.localhost')) return true;

  // Production
  if (host.startsWith('admin.rigify.ge')) return true;

  return false;
}

/**
 * Get the admin URL based on environment
 */
export function getAdminUrl(): string {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? 'http://admin.localhost:3000' : 'https://admin.rigify.ge';
}

/**
 * Get the main app URL based on environment
 */
export function getMainUrl(): string {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? 'http://localhost:3000' : 'https://rigify.ge';
}
