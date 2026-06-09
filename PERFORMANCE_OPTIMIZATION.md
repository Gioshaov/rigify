# Performance Optimization Plan - Rigify

**Last Updated**: June 9, 2026  
**Status**: Ready for Implementation  
**Estimated Effort**: 2-3 weeks  
**Expected Impact**: 50-70% faster across the board

---

## Executive Summary

Comprehensive performance audit revealed **systemic bottlenecks** affecting the entire application:

- **Every navigation**: 50-200ms middleware overhead (triple DB queries)
- **Every page load**: 300-500ms font blocking + missing caching
- **Business listings**: 200-500ms blank screen (client-only, no SSR)
- **Availability API**: 100-300ms N+1 query pattern
- **Dashboard interactions**: 300-400ms unoptimized re-renders

**User Impact**: "Whole app feels very slow and takes time to load after clicking around"

---

## Critical Issues Identified

### 🔴 CRITICAL (Affects Every User, Every Page)

1. **Middleware Triple Database Queries** ⚡ **50-200ms per navigation**
   - **File**: `lib/supabase/middleware.ts` (lines 154-163)
   - **Issue**: Queries 3 tables (businesses, customers, staff) on every protected route
   - **Impact**: Slows down ALL navigation between pages
   - **Fix**: Implement server-side session cache (60s TTL)

2. **Blocking Material Symbols Font** ⚡ **300-500ms FCP delay**
   - **File**: `app/layout.tsx` (lines 27-30)
   - **Issue**: Synchronous Google Fonts stylesheet blocks First Contentful Paint
   - **Impact**: User sees blank screen for 300-500ms on every page
   - **Fix**: Async font loading or self-host subset

---

### 🟡 HIGH (Major Page Load Issues)

3. **Business Listings - Client-Side Only** ⚡ **200-500ms blank screen**
   - **File**: `app/businesses/page.tsx` (line 1: `"use client"`)
   - **Issue**: No SSR, data fetches after JS loads
   - **Impact**: Blank page while fetching 100+ businesses
   - **Fix**: Convert to Server Component with SSR

4. **Customer Dashboard - Force Dynamic** ⚡ **500-1000ms per load**
   - **File**: `app/customer/dashboard/page.tsx` (line 7: `export const dynamic = 'force-dynamic'`)
   - **Issue**: Disables ALL caching, re-queries DB every time
   - **Impact**: Dashboard never benefits from caching
   - **Fix**: Use `revalidate = 30` instead

5. **Availability API - N+1 Pattern** ⚡ **100-300ms on busy days**
   - **File**: `app/api/availability/route.ts` (lines 152-172)
   - **Issue**: Nested filter loops - O(N×M) complexity (48 slots × bookings)
   - **Impact**: Slow availability checks, especially with many bookings
   - **Fix**: Pre-group bookings by staff_id using Map

---

### 🟢 MEDIUM (Performance Refinements)

6. **Sequential Database Queries** ⚡ **30-80ms per page**
   - **Files**: `app/dashboard/appointments/page.tsx`, `app/admin/.../edit/page.tsx`
   - **Issue**: 3 independent queries executed sequentially (3 RTTs instead of 1)
   - **Fix**: Wrap in `Promise.all([...])`

7. **Unoptimized Images** ⚡ **50-100ms FCP + bandwidth**
   - **Files**: `components/ui/ImageUpload.tsx`, `components/dashboard/staff/AddArtisanForm.tsx`
   - **Issue**: Native `<img>` tags instead of Next.js Image
   - **Fix**: Replace with `<Image>` component

8. **Missing Memoization** ⚡ **200-400ms interaction lag**
   - **Files**: `components/dashboard/CalendarView.tsx`, `app/dashboard/staff/page.tsx`
   - **Issue**: Re-calculates data on every render (42+ date formats per render)
   - **Fix**: Add `useMemo` for expensive calculations

9. **Large Components** ⚡ **Bundle size + re-renders**
   - **Files**: `app/dashboard/services/ServicesList.tsx` (571 lines), others
   - **Issue**: Monolithic components with excessive state
   - **Fix**: Split into smaller components with `React.memo()`

---

## Implementation Phases

### 📅 Week 1: Critical Fixes (Highest ROI)

#### Phase 1: Middleware Caching (2 days)
**Impact**: Every navigation 50-75% faster

**File**: `lib/supabase/middleware.ts`

Add session cache to avoid triple DB queries:

```typescript
// Add at top of file
const userTypeCache = new Map<string, {type: string, timestamp: number}>();
const CACHE_TTL = 60000; // 60 seconds

// Replace lines 154-163 with:
async function getUserType(userId: string, supabase: SupabaseClient) {
  const cached = userTypeCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.type;
  }
  
  const [{ data: business }, { data: customer }, { data: staff }] = await Promise.all([
    supabase.from("businesses").select("id").eq("owner_id", userId).maybeSingle(),
    supabase.from("customers").select("id").eq("id", userId).maybeSingle(),
    supabase.from("staff").select("id").eq("user_id", userId).maybeSingle()
  ]);
  
  let userType = 'unknown';
  if (business) userType = 'business';
  else if (staff) userType = 'staff';  
  else if (customer) userType = 'customer';
  
  userTypeCache.set(userId, { type: userType, timestamp: Date.now() });
  return userType;
}
```

**File**: `middleware.ts`

Optimize password check (lines 31-37):

```typescript
// Only enable in development
if (process.env.NODE_ENV === 'development' && process.env.SITE_PASSWORD) {
  // ... password check logic
}
```

---

#### Phase 2: Font Optimization (1 day)
**Impact**: FCP improves from 1.5s to 0.8-1.0s

**File**: `app/layout.tsx`

Replace lines 27-30:

```tsx
{/* Preconnect to Google Fonts */}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

{/* Material Symbols - async loading */}
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
  rel="stylesheet"
  media="print"
  onLoad="this.media='all'"
/>
<noscript>
  <link 
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
    rel="stylesheet"
  />
</noscript>
```

---

#### Phase 3: Business Page SSR (2 days)
**Impact**: Eliminates 200-500ms blank screen

**File**: `app/businesses/page.tsx`

1. Remove `"use client"` directive
2. Remove all `useState`, `useEffect`
3. Fetch data server-side:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function BusinessesPage() {
  const supabase = createClient();
  
  const { data: businessesData } = await supabase
    .from('businesses')
    .select('*, business_categories!inner(category)')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  return <BusinessGridClient businesses={businessesData || []} />;
}
```

4. Create `app/businesses/BusinessGridClient.tsx`:

```typescript
"use client";

import { useState, useMemo } from "react";
import BusinessGrid from "./BusinessGrid";

export default function BusinessGridClient({ businesses }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  
  // Client-side filtering and sorting
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;
    
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(b => 
        b.business_categories?.some(c => c.category === selectedCategory)
      );
    }
    
    // Sort logic...
    
    return filtered;
  }, [businesses, searchQuery, selectedCategory, sortBy]);
  
  return (
    <div>
      {/* Search/filter UI */}
      <BusinessGrid businesses={filteredBusinesses} />
    </div>
  );
}
```

---

### 📅 Week 2: High-Impact Optimizations

#### Phase 4: Replace force-dynamic (1 day)

**File**: `app/customer/dashboard/page.tsx`

Replace line 7:

```typescript
// From:
export const dynamic = 'force-dynamic';

// To:
export const revalidate = 30; // Cache for 30 seconds
```

---

#### Phase 5: Parallelize Queries (1 day)

**File**: `app/dashboard/appointments/page.tsx`

Replace lines 26-64:

```typescript
const [
  { data: staff },
  { data: services },
  { data: bookingsData }
] = await Promise.all([
  supabase.from("staff").select("id, name").eq("business_id", business.id).eq("is_active", true).order("name"),
  supabase.from("services").select("id, name").eq("business_id", business.id).eq("is_active", true).order("name"),
  supabase.from("bookings").select("*").eq("business_id", business.id).gte("appointment_datetime", today).lte("appointment_datetime", nextWeek).order("appointment_datetime")
]);
```

**File**: `app/admin/(auth-required)/businesses/[id]/edit/page.tsx`

Parallelize lines 9-29:

```typescript
const [businessResult, staffResult] = await Promise.all([
  admin.from("businesses").select("*").eq("id", id).single(),
  admin.from("staff").select("*").eq("business_id", id).order("name")
]);
```

---

#### Phase 6: Fix N+1 in Availability API (2 days)

**File**: `app/api/availability/route.ts`

After line 96 (after fetching bookings), add:

```typescript
// Pre-group bookings by staff_id to eliminate N+1
const bookingsByStaff = new Map<string, typeof bookings>();
bookings?.forEach(booking => {
  const staffId = booking.staff_id || 'unassigned';
  if (!bookingsByStaff.has(staffId)) {
    bookingsByStaff.set(staffId, []);
  }
  bookingsByStaff.get(staffId)!.push(booking);
});
```

Replace lines 152-172 filter logic:

```typescript
const availableSlots = slots.filter((slot) => {
  // ... slot time calculation

  if (staffId) {
    // Use pre-grouped bookings - O(1) lookup instead of O(N) filter
    const staffBookings = bookingsByStaff.get(staffId) || [];
    
    // Check for overlaps
    const hasOverlap = staffBookings.some((booking) => {
      const bookingStart = new Date(booking.appointment_datetime);
      const bookingEnd = new Date(booking.end_datetime);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
    
    if (hasOverlap) return false;
  } else {
    // "Any staff" - check if at least one staff is available
    // Similar optimization...
  }
  
  return true;
});
```

**File**: `app/api/bookings/route.ts`

Apply same Map-based grouping pattern to lines 208-216.

---

#### Phase 7: Link Prefetching (0.5 days)

Add `prefetch={true}` to all navigation Links:

**Files to update**:
- `components/dashboard/Sidebar.tsx`
- `components/ui/Header.tsx`
- `app/page.tsx` (all CTA links)
- `app/businesses/BusinessGrid.tsx`

```tsx
<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>
```

---

### 📅 Week 3: Medium-Impact Refinements

#### Phase 8: Image Optimization (1.5 days)

**File**: `components/ui/ImageUpload.tsx`

Replace line 64:

```tsx
import Image from 'next/image';

// From:
<img src={preview || currentUrl || ''} alt={`${type} preview`} className="w-full h-full object-cover" />

// To:
<Image 
  src={preview || currentUrl || '/placeholder.jpg'}
  alt={`${type} preview`}
  fill
  className="object-cover"
  unoptimized={preview?.startsWith('data:') || false}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

**File**: `components/dashboard/staff/AddArtisanForm.tsx`

Similar fix at line 226.

---

#### Phase 9: Add Memoization (2 days)

**File**: `components/dashboard/CalendarView.tsx`

Add at line 120:

```typescript
const calendarDays = useMemo(
  () => generateCalendarDays(currentYear, currentMonth),
  [currentYear, currentMonth]
);
```

Add before line 165:

```typescript
const bookingsByDate = useMemo(() => {
  const map = new Map<string, typeof bookings>();
  bookings?.forEach(booking => {
    const date = format(parseISO(booking.appointment_datetime), 'yyyy-MM-dd');
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(booking);
  });
  return map;
}, [bookings]);
```

Update render loop:

```tsx
{calendarDays.map(day => {
  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
  const dayBookings = bookingsByDate.get(dateKey) || [];
  // ...
})}
```

**File**: `app/dashboard/staff/page.tsx`

Add memoization for filtered staff list at line 188:

```typescript
const filteredStaff = useMemo(() => {
  if (!searchQuery) return staff;
  return staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [staff, searchQuery]);
```

---

#### Phase 10: Split Large Components (1 day)

**File**: `app/dashboard/services/ServicesList.tsx`

Extract components:

1. Create `components/dashboard/services/ServiceCard.tsx` (wrap in `React.memo()`)
2. Create `components/dashboard/services/ServiceEditForm.tsx`
3. Create `components/dashboard/services/DeleteConfirmModal.tsx`
4. Update main file to import and use extracted components

---

#### Phase 11: Dynamic Imports (1 day)

**Files**: Dashboard pages with modals

Add dynamic imports:

```typescript
import dynamic from 'next/dynamic';

const CreateAppointmentModal = dynamic(
  () => import('@/components/dashboard/CreateAppointmentModal'),
  { loading: () => <div>Loading...</div>, ssr: false }
);
```

---

## Verification & Testing

### Performance Metrics Baseline

**Before Optimization:**
- Homepage FCP: ~1.5s
- Customer Dashboard: 1-2s
- Business Listings: 1-2s (blank screen)
- Navigation latency: 200-400ms
- Availability API: 300-500ms
- Lighthouse Score: 60-70

**After Optimization Targets:**
- Homepage FCP: < 1.0s (✓ 33-50% faster)
- Customer Dashboard: < 600ms (✓ 60-70% faster)
- Business Listings: < 800ms (✓ 50-60% faster)
- Navigation latency: < 100ms (✓ 50-75% faster)
- Availability API: < 200ms (✓ 40-60% faster)
- Lighthouse Score: > 85 (✓ 20-30 points)

### Test Checklist

**Cold Load Test:**
1. Clear browser cache
2. Navigate to homepage → measure FCP (should be < 1.0s)
3. Navigate to /businesses → measure TTI (should be < 800ms with SSR)
4. Check Network tab: Material Symbols should load async

**Warm Navigation Test:**
1. Navigate: /dashboard → /customer/dashboard → /businesses
2. Each transition should be < 100ms
3. Check DevTools: middleware cache should eliminate DB queries after first nav

**Availability API Test:**
1. Open reschedule modal
2. Select a date with many bookings
3. Measure API response time (should be < 200ms)

**Image Optimization Test:**
1. Check Network tab for WebP/AVIF formats
2. Verify lazy loading for below-fold images
3. Confirm no CLS from image loading

---

## Quick Reference Checklist

### Week 1 Must-Complete
- [ ] Middleware caching implemented
- [ ] Font loading made async
- [ ] Business page converted to SSR
- [ ] All tests passing
- [ ] Lighthouse score > 75

### Week 2 Must-Complete
- [ ] force-dynamic replaced with revalidate
- [ ] All queries parallelized
- [ ] N+1 patterns fixed in both API routes
- [ ] Link prefetching added
- [ ] Lighthouse score > 80

### Week 3 Must-Complete
- [ ] Images optimized with Next.js Image
- [ ] Memoization added to heavy components
- [ ] Large components split
- [ ] Dynamic imports for modals
- [ ] Final Lighthouse score > 85

---

## Success Criteria

✅ **User Experience**: App feels "snappy" - no more "sluggish" feedback  
✅ **Page Loads**: All pages load in < 1 second  
✅ **Navigation**: Transitions feel instant (< 100ms)  
✅ **Interactions**: No lag when filtering, searching, or opening modals  
✅ **Lighthouse**: Performance score consistently > 85  

---

## Notes for Implementation

1. **Test after each phase** - Don't accumulate changes without testing
2. **Monitor Lighthouse scores** - Track improvement incrementally
3. **Use Chrome DevTools Performance tab** - Profile before/after
4. **Check bundle size** - `npm run build` to see JS bundle changes
5. **Test on production build** - `npm run build && npm start`
6. **Commit after each phase** - Makes rollback easier if needed

---

## Rollback Plan

If any optimization causes issues:

1. **Middleware cache**: Remove Map, revert to original triple query
2. **Font async**: Revert to blocking stylesheet (safe but slower)
3. **SSR conversion**: Add back `"use client"` if hydration issues occur
4. **N+1 fix**: Revert to original filter if Map logic has bugs

Each phase is independent - can revert one without affecting others.

---

**Ready to implement!** Start with Week 1 for maximum impact.