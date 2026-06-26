# Staging Environment Setup

This document is the runbook for Rigify's **staging** environment: a
password-protected copy of the app at **staging.rigify.ge**, backed by its own
Supabase project so test data never touches production.

```
 master branch ─────────► Vercel Production ──► rigify.ge          (prod Supabase)
 staging branch ─────────► Vercel (staging)  ──► staging.rigify.ge  (staging Supabase, SITE_PASSWORD on)
 feature/* branches ─────► Vercel Preview     ──► <hash>.vercel.app  (staging Supabase)
```

**Promotion flow:** `feature/*` → merge into `staging` (test on staging.rigify.ge)
→ merge `staging` into `master` (ships to production).

---

## Current staging instance (provisioned 2026-06-25)

The environment below is already live — this section records what exists so the
runbook doubles as an as-built reference. No secrets here; credentials live in the
gitignored `.env.staging.local`.

| Thing | Value |
|---|---|
| URL | https://staging.rigify.ge (gated by `SITE_PASSWORD`) |
| Supabase project | `rigify-staging` · ref `ccjteappgctnlwrmzokp` · region `eu-central-1` · free tier |
| Vercel project | `rigify` (`prj_tknNUuVSSLptxoFgtS87ckFrk0X2`), team `team-rigify-s-projects` |
| Deploy trigger | `staging` git branch → Vercel preview, aliased to staging.rigify.ge |
| Data | empty schema (all 51 migrations applied); mock data added manually |

**As-built deviations from the generic steps below:**

- **DNS:** no manual record needed — `rigify.ge` already uses Vercel nameservers
  (`ns1/ns2.vercel-dns.com`), so the subdomain is auto-managed by Vercel.
- **Vercel Authentication was disabled** for the project (`ssoProtection: null`).
  Otherwise Vercel's own SSO shadows the app's `SITE_PASSWORD` gate and only
  Vercel team members could reach staging. With it off, the shared password is the
  gate. If you re-enable it, expect the SSO login wall to return.
- **Staging env vars are scoped to `target=preview` + `gitBranch=staging`**, so they
  override the general preview values for the `staging` branch only. ⚠️ Other
  `feature/*` preview deployments still inherit the **general** preview vars, which
  currently point at the **production** Supabase project — only the `staging` branch
  is isolated. Scope per-branch vars similarly if you want a feature preview on its
  own data.

---

## Environment variable matrix

Set these in **Vercel → Project → Settings → Environment Variables**, each scoped
to the right environment. Production and staging must use **different** Supabase
projects.

| Variable | Production (`master`) | Staging (`staging` branch) |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod project URL | **staging** project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | **staging** anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod service key | **staging** service key |
| `NEXT_PUBLIC_APP_URL` | `https://rigify.ge` | `https://staging.rigify.ge` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `rigify.ge` | `staging.rigify.ge` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ka` | `ka` |
| `SITE_PASSWORD` | **(must NOT be set)** | **set it** — gates the whole site |
| `ADMIN_PREVIEW_PASSWORD` | leave unset unless you want prod admin gated | set **only** if you expose `admin.staging.rigify.ge` and want it gated |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | prod token | reuse same token |
| `RESEND_API_KEY` | prod key | reuse, or use a test key (see note) |
| `VAPI_API_KEY` | prod key | reuse / blank |

> ⚠️ **`SITE_PASSWORD` on production locks out every visitor.** The gate is
> implemented in the root `middleware.ts` (not `lib/supabase/middleware.ts`).
> It must exist on staging only. Vercel lets you scope a variable to "Preview"
> with a specific branch filter — use `staging` so it never leaks to production.

> 📧 **Resend note:** staging can send real emails. Either reuse the prod key and
> only book with your own addresses, or create a separate Resend API key /
> sandbox sender for staging to avoid confusing real recipients.

A template lives in `.env.staging.example`.

---

## One-time setup

### 1. Create the staging Supabase project

1. https://supabase.com/dashboard → **New project** (same org as prod).
   - Name: `rigify-staging`
   - Region: same as production (lowest latency / parity).
   - Save the generated DB password somewhere safe.
2. When it's ready, grab **Settings → API**: project URL, `anon` key, `service_role` key.
3. **Set auth URLs now** (not later — magic links and password resets break
   silently otherwise): **Authentication → URL Configuration** → set **Site URL**
   to `https://staging.rigify.ge` and add it to the redirect allow-list.

### 2. Apply the schema to staging

All migrations are idempotent, so we apply them in one shot:

```bash
npm run build:staging-sql
```

This generates `supabase/_staging_bootstrap.sql` (gitignored) by concatenating
every file in `supabase/migrations/` in order. Then:

1. Open the **staging** project → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/_staging_bootstrap.sql`.
3. **Run.** It should complete without errors.

> Mock/seed data: skip `supabase/seed.sql`. Per project convention, staging mock
> data is created manually (or claim a business via `/register`).

### 3. Create the `staging` git branch

```bash
git checkout master && git pull
git checkout -b staging
git push -u origin staging
```

This long-lived branch is what Vercel deploys to staging.rigify.ge.

### 4. Point Vercel at the staging branch

In the existing Vercel project:

1. **Settings → Environment Variables** — add the staging values from the matrix
   above. For each staging var, set scope to **Preview** and add a **branch
   filter** of `staging` (Vercel: the "Preview" toggle has a per-branch option).
2. **Settings → Domains** → add `staging.rigify.ge`. When prompted, assign it to
   the **`staging`** git branch (not Production).
3. Vercel shows the DNS record needed (a `CNAME` for `staging` →
   `cname.vercel-dns.com`, or whatever it displays).

### 5. Add the DNS record

At the DNS provider for `rigify.ge`, add the record Vercel showed, typically:

```
Type:  CNAME
Name:  staging
Value: cname.vercel-dns.com.
TTL:   default
```

Wait for propagation; Vercel will mark the domain **Valid** and issue an SSL cert.

### 6. Verify

1. Push any commit to `staging` (or redeploy) → wait for the Vercel build.
2. Visit **https://staging.rigify.ge** → you should hit the `/password` gate.
3. Enter `SITE_PASSWORD` → site loads against the **staging** Supabase data.
4. Confirm a booking/registration writes to the **staging** project, not prod
   (check rows in the staging dashboard).
5. Confirm **https://rigify.ge** still loads with **no** password prompt.

---

## Ongoing workflow

```bash
# build a feature
git checkout staging && git pull
git checkout -b feature/my-thing
#   ...commit work, open PR into staging...

# test on staging
#   merge the PR into staging → auto-deploys to staging.rigify.ge

# ship to production
git checkout master && git pull
git merge staging          # or open a staging → master PR
git push origin master     # auto-deploys to rigify.ge
```

Keep `staging` ahead of or equal to `master`. Periodically fast-forward `staging`
from `master` after a release so they don't diverge.

---

## Keeping schemas in sync

New migrations land in `supabase/migrations/` as usual. To apply them to staging:

- **Single new migration:** paste just that file into the staging SQL Editor, or
- **Rebuild from scratch:** re-run `npm run build:staging-sql` and re-paste (safe —
  idempotent), or
- **Supabase CLI** (if you later run `supabase link --project-ref <staging-ref>`):
  `supabase db push`.

Production migrations are applied to the prod project the same way, separately.

---

## Gotchas

- **Never** point staging env vars at the production Supabase project — the whole
  point is data isolation.
- `SITE_PASSWORD` belongs to staging only. Double-check it is **absent** from the
  Production environment scope in Vercel.
- The `admin.` subdomain has its own gate (`ADMIN_PREVIEW_PASSWORD`). If you want
  `admin.staging.rigify.ge`, add that DNS record + domain too.
- Auth redirect URLs (see step 1.3): if magic links / password resets point at the
  wrong host, the staging Supabase **Site URL** wasn't set to `https://staging.rigify.ge`.
