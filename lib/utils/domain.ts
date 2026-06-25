/**
 * Domain detection utilities for admin subdomain routing.
 *
 * The admin panel lives on the `admin.` subdomain of whatever environment the
 * app runs in — admin.localhost (dev), admin.rigify.ge (production),
 * admin.staging.rigify.ge (staging) — derived from NEXT_PUBLIC_ROOT_DOMAIN so
 * no single host is hardcoded.
 */

function getRootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "rigify.ge";
}

/**
 * Check if the request host is the admin subdomain.
 * Matches the middleware's own `admin.` prefix check, so it works across dev,
 * staging and production. Safe because Vercel only routes configured hosts to
 * the app, so the only `admin.` hosts that reach here are our own.
 */
export function isAdminDomain(host: string): boolean {
  if (!host) return false;
  return host.startsWith("admin.");
}

/**
 * Cookie domain for admin-scoped cookies, or undefined in local dev
 * (admin.localhost cookies must not set an explicit domain).
 */
export function getAdminCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;
  return `admin.${getRootDomain()}`;
}

/**
 * Get the admin panel base URL for the current environment.
 */
export function getAdminUrl(): string {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? "http://admin.localhost:3000" : `https://admin.${getRootDomain()}`;
}

/**
 * Get the main app base URL for the current environment.
 */
export function getMainUrl(): string {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? "http://localhost:3000" : `https://${getRootDomain()}`;
}
