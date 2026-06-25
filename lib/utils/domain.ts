/**
 * Domain detection utilities for admin subdomain routing.
 *
 * The admin panel lives on the `admin.` subdomain of whatever environment the
 * app runs in — admin.localhost (dev), admin.rigify.ge (production),
 * admin.staging.rigify.ge (staging) — derived from NEXT_PUBLIC_ROOT_DOMAIN so
 * no single host is hardcoded.
 */

/** Local (non-deployed) environment — anything that isn't a production build. */
function isLocalDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

function getRootDomain(): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (!root) {
    // Missing on a deployed build means we'd silently fall back to the prod
    // host and route staging traffic to production — surface it loudly.
    if (!isLocalDev()) {
      console.warn(
        "NEXT_PUBLIC_ROOT_DOMAIN is not set; falling back to rigify.ge. " +
          "Set it per environment (e.g. staging.rigify.ge on staging)."
      );
    }
    return "rigify.ge";
  }
  return root;
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
  if (isLocalDev()) return undefined;
  return `admin.${getRootDomain()}`;
}

/**
 * Get the admin panel base URL for the current environment.
 */
export function getAdminUrl(): string {
  return isLocalDev() ? "http://admin.localhost:3000" : `https://admin.${getRootDomain()}`;
}

/**
 * Get the main app base URL for the current environment.
 */
export function getMainUrl(): string {
  return isLocalDev() ? "http://localhost:3000" : `https://${getRootDomain()}`;
}
