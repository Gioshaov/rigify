# Admin Panel - Subdomain Setup

The Rigify super admin panel is accessible via a separate subdomain.

---

## Local Development

**Main Site**: http://localhost:3001  
**Admin Panel**: http://admin.localhost:3001

Modern browsers (Chrome, Firefox, Edge) support `.localhost` subdomains natively - no hosts file changes needed.

### Testing Locally

1. Start dev server: `npm run dev`
2. Open http://admin.localhost:3001 in your browser
3. You should see the super admin dashboard

---

## Production

**Main Site**: https://rigify.ge  
**Admin Panel**: https://admin.rigify.ge

### Vercel Configuration

In your Vercel project settings:

1. **Domains** → Add `admin.rigify.ge`
2. Vercel will automatically handle the subdomain routing via middleware
3. Both domains point to the same deployment

### DNS Configuration

Add these DNS records in your domain registrar (e.g., Cloudflare):

```
Type: CNAME
Name: admin
Target: cname.vercel-dns.com
```

---

## How It Works

The middleware (`middleware.ts`) detects the subdomain:

- **On `admin.rigify.ge`** → Routes to `/admin` (super admin panel)
- **On `rigify.ge`** → Normal routing (marketplace, customer/business dashboards)
- **Accessing `/admin` on main domain** → Redirects to `admin.rigify.ge`

This keeps the admin panel completely isolated on a separate subdomain.

---

## Security

The super admin panel requires authentication via `is_super_admin` flag in Supabase `auth.users.app_metadata`.

Only users with this flag set to `true` can access the admin panel.
