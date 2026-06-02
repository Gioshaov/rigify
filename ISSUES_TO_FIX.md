# Rigify - Issues to Fix from Testing
**Date:** 2026-06-02  
**Context:** Just completed admin onboarding implementation + security fixes. Found 18 issues during testing.

---

## 🚨 CRITICAL SECURITY ISSUES (Fix First)

### Issue #4, #8: Admin Auth Bypass
**Severity:** CRITICAL  
**Description:** Can access `/admin` without signing in, sometimes works, sometimes doesn't  
**Files:** `app/admin/layout.tsx`, `lib/supabase/middleware.ts`  
**Root Cause:** Inconsistent authentication check  
**Fix:** Ensure middleware consistently protects `/admin` routes

### Issue #10: Email Validation Broken
**Severity:** CRITICAL  
**Description:** Onboard form accepts emails without domain extension (e.g., "test@example")  
**File:** `app/admin/onboard/actions.ts` line ~37  
**Current Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`  
**Fix:** Needs stricter validation requiring TLD

### Issue #14: Business Phone Validation Broken
**Severity:** HIGH  
**Description:** Contact form accepts invalid phone numbers like "123"  
**File:** `app/api/contact/route.ts`  
**Fix:** Add phone format validation (minimum 10 digits, must start with +)

### Issue #16: Customer Phone Validation Broken
**Severity:** HIGH  
**Description:** Customer registration accepts "123" as phone  
**File:** `app/(auth)/customer-register/actions.ts`  
**Fix:** Add phone format validation

### Issue #11: Staff Creation Broken
**Severity:** CRITICAL  
**Description:** Staff doesn't appear in Supabase `staff` or `staff_permissions` tables after onboarding  
**File:** `app/admin/onboard/actions.ts` lines 96-113  
**Root Cause:** Likely permissions or trigger issue  
**Debug Steps:**
1. Check Supabase logs for insert errors
2. Verify RLS policies on `staff` table
3. Verify trigger `staff_permissions_insert` exists

---

## 🔧 MAJOR FUNCTIONALITY ISSUES

### Issue #1: Remove Business Registration from Login
**Description:** Login page should only show customer registration, not business  
**File:** `app/(auth)/login/page.tsx` lines 29-35  
**Current:** Shows "Register as a Business or Customer"  
**Fix:** Remove business registration link, show only customer registration

### Issue #2: Admin Can't Edit Business Info
**Description:** Super admin should be able to edit business details after creation  
**File:** Need to create `app/admin/businesses/[id]/edit/page.tsx` (doesn't exist)  
**Implementation:**
- Add "Edit" button in admin businesses list
- Create edit form page
- Create edit action with validation
- Ensure super admin can update via RLS

### Issue #3: No Sign Out Button in Admin
**Description:** Admin panel has no logout functionality  
**File:** `app/admin/layout.tsx`  
**Fix:** Add sign out button in navbar

### Issue #5: Customer Dashboard Wrong Route
**Description:** After customer login, goes to `/dashboard` (business) instead of `/customer/dashboard`  
**File:** `app/(auth)/login/actions.ts` or middleware  
**Root Cause:** Login routing logic incorrect  
**Fix:** Verify customer detection and redirect logic

### Issue #7, #15, #17: Navigation Causes Sign Out
**Description:** Multiple navigation scenarios cause unexpected logout:
- Going to localhost:3000 signs everyone out
- Admin → Dashboard navigation signs out
- Staff login doesn't redirect to `/dashboard/staff-view`
**Files:** `lib/supabase/middleware.ts`, possibly session handling  
**Root Cause:** Session not persisting across navigation  
**Fix:** Review middleware session refresh logic

### Issue #9: Business Phone Accepts 4-Digit Numbers
**Description:** Onboard form accepts "1234" as valid business phone  
**File:** `app/admin/onboard/actions.ts`  
**Fix:** Add phone validation (same as #14 fix)

---

## 🎨 UI/UX ISSUES

### Issue #6: Dropdown Text Not Visible
**Description:** Category and city dropdowns in onboard form show white text on white background  
**File:** `app/admin/onboard/OnboardForm.tsx` lines 61-75, 76-90  
**Current:** `className="w-full bg-white/10 border border-white/10 ... text-white"`  
**Fix:** 
```tsx
// For <option> elements, add:
<option value="" className="bg-gray-900 text-white">Select...</option>
<option value="hair" className="bg-gray-900 text-white">Hair</option>
// Or change select background to darker color
```

### Issue #12: For-Businesses Page Mixed Languages
**Description:** Marketing page has Georgian and English mixed (should be one or other)  
**File:** `components/marketing/ForBusinessesPage.tsx`  
**Current Example:** "შეავსე განრიგი. უპასუხე ყველა ზარს" then "Fill your calendar..."  
**Fix:** 
- Option A: Make fully Georgian with English subtitle
- Option B: Make fully English with Georgian subtitle  
- Option C: Implement language switcher with `next-intl`

### Issue #13: Feature Section Wrong Word Placement
**Description:** Text layout issues in features section  
**File:** `components/marketing/ForBusinessesPage.tsx` lines 119-147  
**Fix:** Review spacing, word breaks, or responsive classes

---

## 🔨 BUILD ERRORS (Blocking)

### Issue #18: Build Fails - Unescaped Apostrophes
**Severity:** BLOCKING  
**Files:**
- `components/marketing/ForBusinessesPage.tsx` lines 99, 106, 133, 172
- `app/dashboard/staff/invite/page.tsx` line 10 (FIXED)

**Remaining errors:**
```
Line 99:63  - "call once" → needs &apos;
Line 99:96  - "competitor" context → needs &apos;
Line 106:30 - "can't find" → needs &apos;
Line 133:87 - Unknown → needs &apos;
Line 172:17 - Unknown → needs &apos;
```

**Fix:** Replace all `'` with `&apos;` in JSX content

---

## 📋 Implementation Priority

### Phase 1: Unblock Development (5 min) ✅ COMPLETE
1. ✅ Fix build errors (Issue #18) - Fixed before this session

### Phase 2: Critical Security (30 min) ✅ COMPLETE
2. ✅ Fix admin auth bypass (Issues #4, #8) - Added middleware protection for `/admin` routes
3. ✅ Fix email validation (Issue #10) - Updated regex to require valid TLD
4. ✅ Fix phone validation (Issues #9, #14, #16) - Added validation to all three forms
5. ✅ Fix staff creation (Issue #11) - Created migration `20260602000002_staff_grants.sql` to add missing grants

**Code Review Fixes:**
- ✅ Fixed admin path matching (exact /admin or /admin/* only)
- ✅ Added staff email and password validation
- ✅ Added email validation to customer registration
- ✅ Added length limits for contact form (city: 100, message: 2000)
- ✅ Enforced minimum 3-character subdomains

### Phase 3: Functionality (45 min) ✅ COMPLETE
6. ✅ Fix session/routing issues (Issues #5, #7, #15, #17) - Preserve cookies on all redirects
7. ✅ Remove business registration link (Issue #1) - Login now shows customer registration only
8. ✅ Add sign out button (Issue #3) - Added to admin navbar
9. ✅ Fix business editing (Issue #2) - Created full edit flow at `/admin/businesses/[id]/edit`

### Phase 4: UI Polish (30 min) ✅ MOSTLY COMPLETE
10. ✅ Fix dropdown visibility (Issue #6) - Added bg-gray-900 to option elements
11. ⚠️ Fix for-businesses page text (Issues #12, #13) - DEFERRED (minor UX polish, needs design review)

---

## 🧪 Verification After Fixes

**Critical Tests to Re-run:**
- [ ] `npm run build` succeeds
- [ ] Cannot access `/admin` without super admin flag in `app_metadata`
- [ ] Email "test@example" is rejected
- [ ] Phone "123" is rejected in all forms
- [ ] Staff creation inserts rows in both `staff` and `staff_permissions`
- [ ] Customer login redirects to `/customer/dashboard`
- [ ] Navigation doesn't cause logout
- [ ] Dropdown options are visible

---

## 📝 Notes

**Super Admin Setup:** Use `app_metadata.is_super_admin = true` (NOT `user_metadata`)  

**Current State:**
- 2 commits pushed to main
- Migration applied: `20260602000001_no_self_registration.sql`
- Security fixes committed but above issues remain

**Files Most Likely to Edit:**
- `app/admin/onboard/actions.ts` (validation fixes)
- `app/admin/layout.tsx` (sign out button)
- `app/(auth)/login/page.tsx` (remove business link)
- `lib/supabase/middleware.ts` (auth + session issues)
- `components/marketing/ForBusinessesPage.tsx` (apostrophes + UI)
- `app/admin/onboard/OnboardForm.tsx` (dropdown visibility)
