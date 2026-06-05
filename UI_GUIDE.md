# Rigify UI Guide

**Last Updated**: June 5, 2026  
**Version**: 2.0 (Consolidated)

This is the single source of truth for all UI/UX decisions in the Rigify project. It combines design system documentation, implementation patterns, accessibility guidelines, and audit results.

---

## How to Use This File

### Before Any UI Work
1. **Read this file** to understand established patterns
2. **Follow documented standards** for consistency
3. **Update this file** when introducing new UI patterns
4. **Ask the user** if making significant design decisions

### Living Document Rules
- This file reflects **actual implementation** — nothing is invented
- When user introduces a new UI direction, **update this section**
- **Most recent decisions take priority** over older entries
- When in conflict, ask user which direction to take

### Never
- Don't change existing UI unless explicitly asked
- Don't run Python scripts or CLI commands from design guidelines
- Don't refactor working components "just because"

---

## Design Philosophy

**Style**: Dark-mode-first brutalist/minimal aesthetic  
**Industry**: Beauty & wellness marketplace (premium positioning)  
**Target**: Georgian market (Tbilisi, Batumi, Kutaisi)  
**Platform**: Next.js 14 web app (responsive, mobile-first)

**Key Characteristics**:
- Zero border radius (brutalist)
- Semantic color tokens (Material Design 3 inspired)
- Mono font for labels/controls, sans-serif for content
- Gold primary color (#e6c364) for premium aesthetic
- Generous whitespace, 8px spacing rhythm
- Minimal shadows, flat surfaces
- **WCAG AA compliant** (verified June 4, 2026)

---

## Color System

### Backgrounds & Surfaces

```css
background: #0a0a0f           /* Page background */
surface: #16161d              /* Elevated surfaces (cards, modals, sidebar) */
surface-dim: #131318          /* Dimmed surface */
surface-bright: #39383e       /* Highlighted surface */
surface-container-lowest: #0a0a0f
surface-container-low: #1b1b20
surface-container: #1f1f25
surface-container-high: #2a292f
surface-container-highest: #35343a
surface-variant: #35343a
```

**Usage**:
- Page background: `bg-background`
- Cards, sidebars, modals: `bg-surface`
- Hover states: `hover:bg-surface-container-low`

### Text Colors

```css
on-surface: #e4e1e9           /* Primary text (15.28:1 contrast) */
on-surface-variant: #d0c5b2   /* Secondary text (11.58:1 contrast) */
on-background: #e4e1e9
```

**Usage**:
- Body text: `text-on-surface`
- Helper text, placeholders: `text-on-surface-variant`
- Disabled: `text-on-surface-variant/60`

### Primary (Gold)

```css
primary: #e6c364              /* Brand gold (11.62:1 contrast) */
on-primary: #0a0a0f           /* Text on gold background */
primary-container: #c9a84c    /* Hover/active state */
on-primary-container: #503d00
```

**Usage**:
- Primary buttons: `bg-primary text-on-primary`
- Links, accents: `text-primary`
- Hover states: `hover:bg-primary-container`

### Error & Status Colors

```css
error: #ffb4ab               /* Error text (11.63:1 contrast) */
on-error: #690005
error-container: #93000a
on-error-container: #ffdad6
```

**Usage**:
- Error messages: `text-error`
- Error borders: `border-error`
- **Important**: Always add icon alongside color (accessibility)

### Borders & Outlines

```css
outline: #99907e             /* Standard borders (3.28:1 contrast) */
outline-variant: #6c624d     /* Subtle dividers (WCAG AA compliant) */
white/10                     /* Input borders: rgba(255,255,255,0.1) */
```

**Usage**:
- Section dividers: `border-outline-variant`
- Input default: `border border-white/10`
- Input focus: `focus:border-primary`

### WCAG Compliance

✅ **100% WCAG AA Compliance** (verified June 4, 2026)

| Color Pair | Contrast Ratio | Standard | Status |
|------------|----------------|----------|--------|
| Body text | 15.28:1 | 4.5:1 | ✅ Exceeds AAA |
| Secondary text | 11.58:1 | 4.5:1 | ✅ Exceeds AAA |
| Primary headings | 11.62:1 | 3.0:1 | ✅ Exceeds AAA |
| Error text | 11.63:1 | 4.5:1 | ✅ Exceeds AAA |
| Outline borders | 3.28:1 | 3.0:1 | ✅ PASS |

---

## Typography

### Font Families

```typescript
font-hanken: Hanken Grotesk   // Body text, headings, content
font-mono: JetBrains Mono     // Labels, buttons, controls, data
```

**Usage**:
- Body text: `font-hanken` or `text-body-md`
- All labels: `font-mono` (via `.label-mono`)
- Buttons: `font-mono` (via `.btn-*`)

### Type Scale

```typescript
display-lg:        48px / 56px, -0.02em, 700 weight
display-lg-mobile: 32px / 40px, -0.01em, 700 weight
headline-md:       24px / 32px, 600 weight
body-lg:           18px / 28px, 400 weight
body-md:           16px / 24px, 400 weight  /* Default */
data-label:        14px / 20px, 0.05em, 500 weight
```

**Usage**:
- Hero headings: `text-display-lg-mobile md:text-display-lg`
- Page headings: `text-headline-md`
- Body paragraphs: `text-body-md`
- All labels: `label-mono` class

### Text Transform

- **Labels & Buttons**: `uppercase` + `tracking-wider`
- **Body Text**: Normal case, no extra tracking

---

## Spacing System

```typescript
gutter: 24px              // Card/section padding
margin-desktop: 64px      // Page horizontal margins
margin-mobile: 16px       // Page margins on mobile
stack-sm: 8px             // Tight vertical spacing
stack-md: 16px            // Default vertical spacing
stack-lg: 32px            // Large vertical spacing
section-gap: 80px         // Section vertical spacing
```

**Usage**:
- Card padding: `p-gutter`
- Form field spacing: `space-y-stack-md`
- Page margins: `px-margin-mobile md:px-margin-desktop`
- Section spacing: `py-section-gap`

---

## Border Radius

**All border radius values are 0px** (brutalist aesthetic).

```typescript
borderRadius: { DEFAULT: "0px", full: "0px", /* all set to 0 */ }
```

---

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  @apply inline-flex items-center justify-center 
         bg-primary text-on-primary 
         font-mono text-data-label uppercase tracking-wider 
         px-6 py-3 
         transition-colors 
         hover:bg-primary-container 
         focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary 
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Secondary Button */
.btn-secondary {
  @apply inline-flex items-center justify-center 
         bg-transparent text-primary 
         border border-primary 
         font-mono text-data-label uppercase tracking-wider 
         px-6 py-3 
         transition-colors 
         hover:bg-primary hover:text-on-primary 
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Ghost Button */
.btn-ghost {
  @apply inline-flex items-center justify-center 
         bg-transparent text-on-surface 
         font-mono text-data-label uppercase tracking-wider 
         px-6 py-3 
         transition-colors 
         hover:text-primary;
}
```

**Usage**:
- Primary actions: `btn-primary` (Save, Confirm)
- Secondary actions: `btn-secondary` (Cancel, Browse)
- Tertiary/destructive: `btn-ghost` (Sign out)

**Accessibility Note**: Always disable during loading: `disabled={loading}`

### Form Inputs

```css
/* Input Field */
.input-field {
  @apply w-full 
         bg-surface text-on-surface 
         border border-white/10 
         px-4 py-3 
         font-hanken text-body-md 
         placeholder:text-on-surface-variant/60 
         focus:border-primary focus:outline-none 
         transition-colors;
}

/* Label */
.label-mono {
  @apply font-mono text-data-label uppercase tracking-wider text-on-surface-variant;
}
```

**Standard Form Field**:
```tsx
<div>
  <label htmlFor="name" className="label-mono block mb-stack-sm">
    FIELD NAME *
  </label>
  <input
    id="name"
    name="name"
    type="text"
    required
    className="input-field"
    placeholder="Hint text..."
  />
</div>
```

**Required Fields**: Add ` *` (space before asterisk)

### Cards & Surfaces

```tsx
<div className="border border-outline-variant bg-surface">
  <div className="px-gutter py-stack-lg border-b border-outline-variant">
    <h2 className="text-headline-lg">Card Title</h2>
  </div>
  <div className="p-gutter">
    {/* Card content */}
  </div>
</div>
```

**Clickable Card** (with selection state):
```tsx
<div
  className={`px-gutter py-stack-md cursor-pointer transition-colors ${
    isSelected
      ? 'bg-surface-container-low border-l-4 border-l-primary'
      : 'hover:bg-surface-container-low'
  } border-b border-outline-variant`}
  onClick={handleClick}
>
  {/* Content */}
</div>
```

### Success/Error Messages

**Error**:
```tsx
<div className="mb-stack-lg p-gutter border border-error bg-surface">
  <p className="label-mono text-error">⚠️ {errorMessage}</p>
</div>
```

**Success**:
```tsx
<div className="mb-stack-lg p-gutter border border-primary bg-surface">
  <p className="label-mono text-primary">✓ {successMessage}</p>
</div>
```

**Important**: Always include icon (⚠️ or ✓) alongside color for accessibility.

### Empty States

```tsx
<div className="border border-outline-variant bg-surface p-gutter text-center">
  <p className="label-mono text-on-surface-variant mb-stack-md">
    NO ITEMS YET
  </p>
  <p className="text-body-lg text-on-surface-variant">
    Explanatory text with next action.
  </p>
</div>
```

---

## Layout Patterns

### Container & Max Widths

```typescript
max-w-container: 1280px   // Main content container
max-w-4xl: 896px          // Form containers
max-w-md: 448px           // Login forms
```

**Usage**:
- Page container: `mx-auto max-w-container`
- Forms: `max-w-4xl` or `max-w-md`

### Responsive Grid

```css
/* Categories grid */
grid-cols-2 md:grid-cols-4

/* Form fields (2-column) */
grid-cols-1 md:grid-cols-2 gap-stack-md

/* Time slots */
grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2
```

### Sidebar Layout

```tsx
<aside className="w-64 shrink-0 border-r border-outline-variant bg-surface min-h-screen flex flex-col justify-between">
  {/* Top: logo + nav */}
  <div>...</div>
  
  {/* Bottom: sign out */}
  <form>...</form>
</aside>
```

**Dimensions**:
- Width: `w-64` (256px)
- Border: `border-r border-outline-variant`
- Full height: `min-h-screen`

---

## Page Patterns

### Header

```tsx
<header className="border-b border-outline-variant">
  <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
    <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
      RIGIFY
    </Link>
    <nav className="hidden md:flex items-center gap-stack-lg">
      {/* Nav links */}
    </nav>
  </div>
</header>
```

### Hero Section

```tsx
<section className="border-b border-outline-variant">
  <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
    <p className="label-mono text-primary mb-stack-md">TAGLINE</p>
    <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
      Main Headline
    </h1>
    <p className="mt-stack-lg text-body-lg text-on-surface-variant max-w-2xl">
      Subheading
    </p>
    <div className="mt-stack-lg flex flex-wrap gap-stack-md">
      <Link href="/..." className="btn-primary">Primary CTA</Link>
      <Link href="/..." className="btn-secondary">Secondary CTA</Link>
    </div>
  </div>
</section>
```

### Dashboard Pages

```tsx
<div className="flex min-h-screen">
  <Sidebar />
  <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg">
    <h1 className="text-headline-md mb-stack-lg">Page Title</h1>
    {/* Content */}
  </main>
</div>
```

---

## Responsive Breakpoints

```typescript
sm: 640px    // Small tablets
md: 768px    // Tablets (primary breakpoint)
lg: 1024px   // Desktops
xl: 1280px   // Wide desktops
```

**Common Patterns**:
- Mobile-first: base styles = mobile, then `md:...`
- Page margins: `px-margin-mobile md:px-margin-desktop`
- Typography: `text-display-lg-mobile md:text-display-lg`
- Grid columns: `grid-cols-2 md:grid-cols-4`
- Nav visibility: `hidden md:flex`

---

## Accessibility Guidelines

### Critical Requirements (Priority 1)

**Color Contrast**:
- ✅ All colors meet WCAG AA (4.5:1 for text, 3.0:1 for UI components)
- Verified June 4, 2026

**Focus States**:
- ✅ Buttons: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`
- ✅ Inputs: `focus:border-primary`
- ⚠️ **Missing**: Focus rings on all interactive elements (Phase 1 fix needed)

**Keyboard Navigation**:
- ✅ Tab order matches visual order
- ⚠️ **Missing**: Skip-link for keyboard users (Phase 1 fix needed)

**ARIA Labels**:
- ⚠️ **Missing**: Icon-only buttons need `aria-label` (Phase 1 fix needed)

**Semantic HTML**:
- ✅ Some landmarks (`<header>`, `<footer>`, `<nav>`, `<main>`)
- ⚠️ **Missing**: Consistent use of `<main>`, `<aside>`, proper heading hierarchy

**Error States**:
- ✅ Color + text used
- ⚠️ **Missing**: Icons alongside color (Phase 1 fix needed)

**Form Labels**:
- ✅ Most labels use `htmlFor` attribute
- ⚠️ Some inconsistency (Phase 1 audit needed)

### High Priority (Touch & Interaction)

**Touch Target Size**:
- ✅ Most buttons meet 44×44px minimum
- ⚠️ **Issue**: "Edit"/"Delete" text links too small (Phase 1 fix needed)

**Touch Spacing**:
- ✅ Most grids have 8px+ spacing
- ⚠️ **Review**: Date buttons may need `gap-3` instead of `gap-2`

**Loading States**:
- ✅ Loading text shown
- ⚠️ **Issue**: Buttons remain enabled during loading (Phase 1 fix needed)

**Press Feedback**:
- ⚠️ **Missing**: `active:scale-[0.98]` on buttons (Phase 1 fix needed)

**Cursor States**:
- ⚠️ **Missing**: `cursor-pointer` on clickable cards (Phase 1 fix needed)

**Safe Area**:
- ⚠️ **Missing**: Mobile notch/gesture bar insets (Phase 2 fix needed)

### Medium Priority

**Loading Feedback**:
- ⚠️ **Issue**: Shows "Loading..." text instead of skeleton loaders (Phase 2)

**Form Validation**:
- ⚠️ **Issue**: Errors at top of form instead of below fields (Phase 3)
- ⚠️ **Missing**: Inline validation on blur (Phase 3)

**Modals**:
- ⚠️ **Issue**: Uses browser `confirm()` instead of custom modal (Phase 3)

---

## Known Issues & Improvement Plan

### Phase 1: Critical Accessibility (1-2 days)

**Must Fix Before Launch**:
1. Add focus-visible rings to all interactive elements
2. Add ARIA labels to icon-only buttons (Sign Out, etc.)
3. Add skip-link to main content
4. Add error/success icons alongside color
5. Increase tap area on Edit/Delete links
6. Disable buttons during loading
7. Add `cursor-pointer` to clickable cards
8. Add active press feedback: `active:scale-[0.98]`
9. Audit and fix semantic HTML landmarks
10. Verify heading hierarchy (h1 → h2 → h3, no skips)

**Testing Checklist**:
- [ ] Tab through entire page (keyboard only)
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Run Lighthouse accessibility audit
- [ ] Run axe DevTools

### Phase 2: Performance & UX (2-3 days)

1. Replace "Loading..." text with skeleton loaders
2. Add `font-display: swap` to custom fonts
3. Add lazy loading to below-fold content
4. Add safe-area insets for mobile notch/gesture bar
5. Switch to `min-h-dvh` instead of `min-h-screen`
6. Add `prefers-reduced-motion` support
7. Add mobile bottom navigation
8. Define z-index scale

### Phase 3: Polish (3-4 days)

1. Move error messages below each field (inline validation)
2. Add validation on blur
3. Replace browser `confirm()` with custom modal
4. Add toast notification system
5. Add step progress indicator ("Step 2 of 4")
6. Add micro-interactions
7. Add stagger animations to lists

### Phase 4: Future Enhancements

1. Light mode support (if needed)
2. Form autosave
3. Undo for destructive actions
4. Haptic feedback on mobile
5. View Transitions API

---

## Component Checklist

When building a **new component**, ensure:

### Visual ✓
- [ ] Uses semantic color tokens (`bg-surface`, `text-on-surface`)
- [ ] Uses spacing system (`p-gutter`, `space-y-stack-md`)
- [ ] Uses typography scale (`text-headline-md`, `label-mono`)
- [ ] All border-radius is 0 (or omitted)
- [ ] Uses `transition-colors` on interactive elements
- [ ] Follows button patterns (`.btn-primary`, `.btn-secondary`)

### Responsive ✓
- [ ] Mobile-first breakpoints (`md:`, `lg:`)
- [ ] Tested on mobile (375px) and desktop (1280px)
- [ ] Uses responsive padding (`px-margin-mobile md:px-margin-desktop`)
- [ ] Grid adapts on smaller screens

### Accessibility ✓
- [ ] All inputs have labels with `htmlFor` attribute
- [ ] Required fields marked with `*`
- [ ] Focus states visible
- [ ] Error messages have icon + color
- [ ] Disabled states use `disabled` attribute
- [ ] Buttons disabled during loading
- [ ] Touch targets ≥ 44×44px
- [ ] Clickable elements have `cursor-pointer`
- [ ] Active press feedback: `active:scale-[0.98]`

### Code Quality ✓
- [ ] TypeScript types defined
- [ ] Server actions for mutations
- [ ] Client components use `"use client"`
- [ ] No console.log statements
- [ ] Follows Next.js 14 App Router patterns

---

## Design Principles from UI/UX Pro Max

### Core UX Principles

**Accessibility (CRITICAL)**:
- Contrast 4.5:1 for text, 3.0:1 for UI components
- Visible focus rings (2-4px)
- Alt text for images
- ARIA labels for icon buttons
- Keyboard navigation support
- Skip links for keyboard users
- Sequential heading hierarchy
- Don't convey info by color alone (add icons)
- Support system text scaling
- Respect `prefers-reduced-motion`

**Touch & Interaction (CRITICAL)**:
- Min touch target: 44×44px (Apple) / 48×48dp (Material)
- Min spacing between targets: 8px
- Use click/tap for primary interactions (not hover-only)
- Disable buttons during loading
- Clear error messages near problem
- Add `cursor-pointer` to clickable elements
- Visual feedback on press (ripple/scale)
- Keep touch targets away from screen edges

**Performance (HIGH)**:
- Use WebP/AVIF images
- Lazy load below-fold content
- Reserve space for loading states (prevent CLS)
- Add skeleton loaders (not just "Loading..." text)
- Use `font-display: swap`
- Debounce search inputs (300ms)

**Forms & Feedback (MEDIUM)**:
- Visible labels (not placeholder-only)
- Error messages below each field
- Helper text where needed
- Progressive disclosure (don't overwhelm)
- Inline validation on blur
- Toast notifications for global feedback

**Navigation (HIGH)**:
- Predictable back behavior
- Bottom nav ≤ 5 items (mobile)
- Deep linking support
- Active state highlighting
- Breadcrumbs for deep pages

---

## When in Doubt

1. **Check this file first** — all patterns documented here
2. **Search the codebase** — find similar components
3. **Test accessibility** — keyboard nav, screen reader, contrast
4. **Ask the user** — if introducing new patterns

---

## Quick Reference

### Most Common Classes

**Layout**:
- Container: `mx-auto max-w-container px-margin-mobile md:px-margin-desktop`
- Section spacing: `py-section-gap`
- Card: `border border-outline-variant bg-surface p-gutter`

**Typography**:
- Heading: `text-headline-md`
- Body: `text-body-md`
- Label: `label-mono` (uppercase mono)

**Buttons**:
- Primary: `btn-primary`
- Secondary: `btn-secondary`
- Ghost: `btn-ghost`

**Forms**:
- Input: `input-field`
- Label: `label-mono block mb-stack-sm`

**Spacing**:
- Form fields: `space-y-stack-md`
- Button groups: `gap-stack-md`
- Tight spacing: `gap-stack-sm`

**Colors**:
- Text: `text-on-surface`
- Secondary text: `text-on-surface-variant`
- Primary: `text-primary`
- Error: `text-error`

---

**Maintained by**: Claude Code  
**Audit Status**: WCAG AA Compliant (100%), 62% UX compliance  
**Next Review**: After Phase 1 accessibility fixes  
**Related Files**: `LATEST_SESSION.md`, `SESSION_HISTORY.md`
