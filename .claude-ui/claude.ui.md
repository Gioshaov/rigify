# Rigify UI Design System

**Last Updated**: 2026-06-04

This file documents every UI decision established in the Rigify codebase. All values are extracted from actual implementation — nothing is invented or guessed.

---

## Meta Instructions

### Before Any UI Work
1. **Always read `.claude/skills/ui-ux-pro-max/SKILL.md`** for design principles and UX guidelines
2. Use that skill for **design judgment only** — do NOT run Python scripts or CLI commands
3. **Never change existing UI** unless explicitly asked by the user
4. **Keep all new UI consistent** with the documented values in this file

### Living Document Rules
- This file is a **living document** — when the user introduces a new UI direction, component style, or design decision in a prompt, **update this file** to reflect the new standard
- After updating, **follow the new standard** going forward
- **The most recently established design direction always takes priority** over older entries in this file
- When in conflict, ask the user which direction to take, then update this file

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
- Success/error message containers: `bg-surface-container`

### Text Colors

```css
on-surface: #e4e1e9           /* Primary text */
on-surface-variant: #d0c5b2   /* Secondary text, labels */
on-background: #e4e1e9        /* Text on page background */
inverse-surface: #e4e1e9
inverse-on-surface: #303036
```

**Usage**:
- Body text: `text-on-surface`
- Helper text, placeholders: `text-on-surface-variant`
- Reduced opacity for disabled: `text-on-surface-variant/60`

### Primary (Gold)

```css
primary: #e6c364              /* Brand gold */
on-primary: #0a0a0f           /* Text on gold background */
primary-container: #c9a84c    /* Hover/active state */
on-primary-container: #503d00
inverse-primary: #755b00
primary-fixed: #ffe08f
primary-fixed-dim: #e6c364
on-primary-fixed: #241a00
on-primary-fixed-variant: #584400
surface-tint: #e6c364         /* Tint for elevated surfaces */
```

**Usage**:
- Primary buttons: `bg-primary text-on-primary`
- Links, accents, active states: `text-primary`
- Hover states: `hover:bg-primary-container`
- Selection: `::selection { background-color: #c9a84c; color: #0a0a0f; }`

### Secondary

```css
secondary: #c8c5cf
on-secondary: #303037
secondary-container: #494850
on-secondary-container: #b9b7c1
secondary-fixed: #e4e1eb
secondary-fixed-dim: #c8c5cf
on-secondary-fixed: #1b1b22
on-secondary-fixed-variant: #47464e
```

**Usage**: Reserved for future use (not currently applied)

### Tertiary

```css
tertiary: #c7c5d4
on-tertiary: #2f2f3b
tertiary-container: #acaab8
on-tertiary-container: #3f3f4a
tertiary-fixed: #e3e1f0
tertiary-fixed-dim: #c7c5d3
on-tertiary-fixed: #1a1b25
on-tertiary-fixed-variant: #464651
```

**Usage**: Reserved for future use (not currently applied)

### Error & Status Colors

```css
error: #ffb4ab               /* Error text, borders */
on-error: #690005            /* Text on error background */
error-container: #93000a
on-error-container: #ffdad6
```

**Usage**:
- Error messages: `text-error`
- Error borders: `border-error`
- Success uses primary color: `text-primary`, `border-primary`

### Borders & Outlines

```css
outline: #99907e             /* Standard borders */
outline-variant: #4d4637     /* Subtle dividers, inactive borders */
white/10                     /* Input field borders (rgba(255,255,255,0.1)) */
```

**Usage**:
- Section dividers: `border-outline-variant`
- Card borders: `border border-outline-variant`
- Input default state: `border border-white/10`
- Input focus state: `focus:border-primary`

---

## Typography

### Font Families

```typescript
font-hanken: Hanken Grotesk   // Body text, headings, content
font-mono: JetBrains Mono     // Labels, buttons, controls, data
font-sans: Hanken Grotesk     // Alias for font-hanken
```

**Usage**:
- Body text: `font-hanken` or `text-body-md`
- All labels: `font-mono` (via `.label-mono`)
- Buttons: `font-mono` (via `.btn-*`)
- Data/numeric: `font-mono`

### Type Scale

```typescript
display-lg:        48px / 56px line-height, -0.02em letter-spacing, 700 weight
display-lg-mobile: 32px / 40px line-height, -0.01em letter-spacing, 700 weight
headline-md:       24px / 32px line-height, 600 weight
body-lg:           18px / 28px line-height, 400 weight
body-md:           16px / 24px line-height, 400 weight  /* Default body text */
data-label:        14px / 20px line-height, 0.05em letter-spacing, 500 weight
data-numeric:      16px / 16px line-height, 600 weight
```

**Usage**:
- Hero headings: `text-display-lg-mobile md:text-display-lg`
- Page/section headings: `text-headline-md`
- Service names, card titles: `text-headline-sm` (not in config, uses 18px/600)
- Body paragraphs: `text-body-md`
- Large paragraphs: `text-body-lg`
- All labels: `label-mono` class (applies `text-data-label uppercase tracking-wider`)

### Font Weights

```css
400 - Regular (body text)
500 - Medium (labels, data-label)
600 - Semibold (headlines, headings)
700 - Bold (display-lg)
```

### Text Transform & Letter Spacing

**Labels & Buttons**:
- All labels: `uppercase` + `tracking-wider` (via `.label-mono`)
- All buttons: `uppercase` + `tracking-wider` (via `.btn-*`)
- Brand/logo: `uppercase` + `tracking-[0.2em]`

**Body Text**:
- Normal case, no extra tracking

---

## Spacing System

### Semantic Spacing

```typescript
gutter: 24px              // Card/section padding
margin-desktop: 64px      // Page horizontal margins on desktop
margin-mobile: 16px       // Page horizontal margins on mobile
stack-sm: 8px             // Tight vertical spacing
stack-md: 16px            // Default vertical spacing
stack-lg: 32px            // Large vertical spacing
stack-xs: 4px             // Extra small (not in config, but used)
section-gap: 80px         // Section vertical spacing
```

**Usage**:
- Card padding: `p-gutter` (24px all sides)
- Card horizontal padding: `px-gutter`
- Card vertical padding: `py-stack-lg`
- Form field spacing: `space-y-stack-md`
- Button groups: `gap-stack-md`
- Tight spacing: `gap-stack-sm` or `mt-stack-xs`
- Page margins: `px-margin-mobile md:px-margin-desktop`
- Section spacing: `py-section-gap`

### Grid Gaps

```css
gap-2: 8px    /* Date/time button grids */
gap-px: 1px   /* Category grid dividers */
```

---

## Border Radius

**All border radius values are set to 0px** (brutalist aesthetic).

```typescript
borderRadius: {
  none: "0px",
  sm: "0px",
  DEFAULT: "0px",
  md: "0px",
  lg: "0px",
  xl: "0px",
  "2xl": "0px",
  "3xl": "0px",
  full: "0px",
}
```

**Exception**: Date/time picker buttons use `rounded` (becomes 0px anyway), but visually appear as sharp rectangles.

---

## Layout

### Container & Max Widths

```typescript
max-w-container: 1280px   // Main content container
max-w-4xl: 896px          // Form containers
max-w-3xl: 768px          // Narrow content (hero text)
max-w-2xl: 672px          // Subheadings, paragraphs
max-w-md: 448px           // Login form, narrow forms
max-w-xs: 320px           // Duration input
```

**Usage**:
- Page container: `mx-auto max-w-container`
- Forms: `max-w-4xl` or `max-w-md`
- Hero text: `max-w-3xl`
- Paragraphs: `max-w-2xl`

### Responsive Grid

```css
/* Categories grid */
grid-cols-2 md:grid-cols-4

/* Form fields (2-column) */
grid-cols-1 md:grid-cols-2 gap-stack-md

/* Date picker */
grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2

/* Time slots */
grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2

/* Staff selection */
grid-cols-1 md:grid-cols-2 gap-stack-md
```

### Sidebar Layout

```tsx
/* Business & Customer Sidebars */
<aside className="w-64 shrink-0 border-r border-outline-variant bg-surface min-h-screen flex flex-col justify-between">
  {/* Top section (logo + nav) */}
  <div>...</div>
  
  {/* Bottom section (sign out) */}
  <form>...</form>
</aside>
```

**Dimensions**:
- Width: `w-64` (256px)
- Border: `border-r border-outline-variant`
- Background: `bg-surface`
- Full height: `min-h-screen`
- Flexbox: `flex flex-col justify-between`

**Logo Section**:
- Padding: `px-gutter py-stack-lg`
- Border: `border-b border-outline-variant`
- Logo: `font-mono text-data-label uppercase tracking-[0.2em] text-primary`
- Business name: `mt-stack-md text-on-surface text-body-md`
- City: `label-mono mt-1` (uppercase via class)

**Nav Section**:
- Padding: `px-gutter py-stack-md`
- Spacing: `space-y-1`
- Nav item: `block font-mono text-data-label uppercase tracking-wider px-3 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors`

**Sign Out Section**:
- Padding: `px-gutter py-stack-md`
- Border: `border-t border-outline-variant`
- Button: `btn-ghost !justify-start !px-3`

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
- Primary actions: `btn-primary` (Add, Save, Confirm)
- Secondary actions: `btn-secondary` (Cancel, Browse)
- Tertiary/destructive: `btn-ghost` (Sign out)
- Loading state: Keep button enabled but show "Loading..." text (not ideal, to be improved)
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed` (built-in)

**Size Variants**:
- Smaller padding: `!py-2` (used in header nav)
- Full width: `w-full` (used in booking summary)

**Text Link Buttons** (used in ServicesList):
```tsx
<button className="label-mono text-primary hover:underline text-sm">
  Edit
</button>
<button className="label-mono text-error hover:underline text-sm">
  Delete
</button>
```

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

**Usage**:
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

**Textarea**:
```tsx
<textarea
  rows={4}
  className="input-field resize-none"
/>
```

**Select Dropdown**:
```tsx
<select className="input-field">
  <option>...</option>
</select>
```

**Disabled State**:
```tsx
disabled={loading}
```

**Width Constraints**:
- Default: `w-full`
- Narrow fields: `max-w-md` or `max-w-xs`

### Labels

**Standard Label**:
```tsx
<label className="label-mono block mb-stack-sm">
  LABEL TEXT *
</label>
```

**Required Indicator**:
- Asterisk: ` *` (space before asterisk in label text)

**Helper Text**:
```tsx
<p className="mt-stack-xs text-body-sm text-on-surface-variant">
  Helper text explaining the field
</p>
```

### Cards & Surfaces

```css
/* Card Surface */
.card-surface {
  @apply bg-surface border-t border-surface-container-high p-gutter;
}
```

**Standard Card**:
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

**Clickable Card** (BookingForm service selection):
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

### Success/Error Messages

**Success**:
```tsx
<div className="mb-stack-lg p-gutter border border-primary bg-surface">
  <p className="label-mono text-primary">✓ SUCCESS MESSAGE</p>
</div>
```

**Error**:
```tsx
<div className="mb-stack-lg p-gutter border border-error bg-surface">
  <p className="label-mono text-error">{errorMessage}</p>
</div>
```

**Inline Error** (BookingForm):
```tsx
{error && (
  <div className="border border-error bg-surface p-gutter">
    <p className="label-mono text-error">{error}</p>
  </div>
)}
```

**Success Variant** (ServicesList uses bg-surface-container):
```tsx
<div className="mb-stack-md p-gutter border border-primary bg-surface-container">
  <p className="label-mono text-primary">{result.message}</p>
</div>
```

### Loading States

**Current Pattern** (to be improved):
```tsx
{loading ? 'Loading...' : 'Normal Text'}
{loading ? 'Saving...' : 'Save Changes'}
```

**Text Loading** (BookingForm):
```tsx
{loadingSlots ? (
  <p className="text-body-md text-on-surface-variant">
    Loading available times...
  </p>
) : (
  {/* Content */}
)}
```

**Note**: No skeleton loaders implemented yet (planned in Phase 2).

### Status Badges

```tsx
<span className={`label-mono text-xs px-2 py-1 rounded ${
  isActive
    ? 'bg-primary/20 text-primary'
    : 'bg-surface-container text-on-surface-variant'
}`}>
  {isActive ? 'ACTIVE' : 'INACTIVE'}
</span>
```

**Note**: Uses `rounded` but evaluates to 0px due to config.

### Confirmation Dialogs

**Current Pattern** (to be improved):
```tsx
if (!confirm('Are you sure you want to delete this service?')) return
```

**Note**: Uses browser native `confirm()` — should be replaced with custom modal (planned in Phase 3).

---

## Page Patterns

### Header (Homepage)

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

**Dimensions**:
- Height: `h-16` (64px)
- Border: `border-b border-outline-variant`
- Padding: `px-margin-mobile md:px-margin-desktop`
- Logo tracking: `tracking-[0.2em]`

### Footer (Homepage)

```tsx
<footer className="border-t border-outline-variant">
  <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-stack-md text-on-surface-variant">
    <p className="label-mono">© {new Date().getFullYear()} RIGIFY</p>
    <p className="label-mono">RIGIFY.GE</p>
  </div>
</footer>
```

### Hero Section

```tsx
<section className="border-b border-outline-variant">
  <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
    <p className="label-mono text-primary mb-stack-md">TAGLINE · CITIES</p>
    <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
      Main Headline
    </h1>
    <p className="mt-stack-lg text-body-lg text-on-surface-variant max-w-2xl">
      Subheading paragraph
    </p>
    <div className="mt-stack-lg flex flex-wrap gap-stack-md">
      <Link href="/..." className="btn-primary">Primary CTA</Link>
      <Link href="/..." className="btn-secondary">Secondary CTA</Link>
    </div>
  </div>
</section>
```

### Login/Auth Pages

**Split Layout** (login page):
```tsx
<main className="min-h-screen flex items-stretch">
  {/* Left Panel */}
  <div className="hidden md:flex w-1/2 bg-surface border-r border-outline-variant flex-col justify-between p-margin-desktop">
    {/* Logo, content, footer */}
  </div>
  
  {/* Right Panel */}
  <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop">
    <div className="w-full max-w-md">
      {/* Form */}
    </div>
  </div>
</main>
```

### Dashboard Pages

**Structure**:
```tsx
<div className="flex min-h-screen">
  <Sidebar /> {/* or CustomerSidebar */}
  <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg">
    {/* Page content */}
  </main>
</div>
```

**Page Title**:
```tsx
<h1 className="text-headline-md mb-stack-lg">Page Title</h1>
```

**Section Headers**:
```tsx
<h2 className="text-headline-lg mb-stack-lg border-b border-outline-variant pb-stack-md">
  Section Title
</h2>
```

---

## Interaction States

### Hover States

**Links**:
```css
hover:text-primary
hover:underline
```

**Buttons** (built into `.btn-*` classes):
```css
.btn-primary:       hover:bg-primary-container
.btn-secondary:     hover:bg-primary hover:text-on-primary
.btn-ghost:         hover:text-primary
```

**Nav Items**:
```css
hover:text-primary hover:bg-surface-container-low
```

**Cards/Clickable Surfaces**:
```css
hover:bg-surface-container-low
hover:bg-surface-container
hover:bg-surface
```

### Focus States

**Current Pattern**:
```css
/* Buttons */
focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary

/* Inputs */
focus:border-primary focus:outline-none
```

**Note**: Not all interactive elements have focus states (accessibility issue, planned fix in Phase 1).

### Active States

**Selected Card**:
```css
bg-surface-container-low border-l-4 border-l-primary
```

**Selected Button** (date/time picker):
```css
border-primary bg-primary text-white
```

**Note**: No `active:scale-[0.98]` press feedback yet (planned in Phase 1).

### Disabled States

```css
disabled:opacity-50 disabled:cursor-not-allowed
```

### Transition

```css
transition-colors  /* Default for most interactive elements */
```

---

## Dark Mode (Only Mode)

**Current Implementation**: Dark mode only, no light mode.

**When Light Mode is Added** (future):
- Use `darkMode: "class"` in Tailwind config (already set)
- Define light mode color tokens
- Test all contrast ratios separately for light mode
- Use semantic tokens, not raw hex values

---

## Responsive Breakpoints

```typescript
/* Tailwind defaults used */
sm: 640px    // Small tablets
md: 768px    // Tablets, primary breakpoint
lg: 1024px   // Desktops
xl: 1280px   // Wide desktops
```

**Common Patterns**:
- Mobile-first: base styles = mobile, then `md:...`
- Page margins: `px-margin-mobile md:px-margin-desktop`
- Typography: `text-display-lg-mobile md:text-display-lg`
- Grid columns: `grid-cols-2 md:grid-cols-4`
- Nav visibility: `hidden md:flex`
- Flex direction: `flex flex-col md:flex-row`

---

## Icons & Assets

**Current State**: No icons implemented yet.

**When Adding Icons**:
- Use SVG icons only (Heroicons, Lucide, or similar)
- Never use emojis as icons (except in success messages where ✓ is text)
- Consistent stroke width and style
- Size tokens: icon-sm, icon-md (24px), icon-lg

**Checkmark in Success Messages**:
- Uses text character: `✓` (not an icon component)

---

## Animation & Transitions

**Current Pattern**:
```css
transition-colors  /* All interactive elements */
```

**Timing**: Default duration (150ms in Tailwind)

**Note**: No custom animations, micro-interactions, or motion design tokens defined yet (planned in Phase 3).

---

## Accessibility

### Current State

**What's Implemented**:
- Semantic HTML in places (`<header>`, `<footer>`, `<nav>`, `<main>`, `<aside>`)
- Labels with `htmlFor` attributes (some inconsistency)
- Required field indicators (`*`)
- Focus states on buttons (via `focus-visible`)
- Focus states on inputs (via `focus:border-primary`)
- Disabled states with semantic `disabled` attribute

**Critical Gaps** (planned fixes in Phase 1):
- No focus-visible rings on all buttons consistently
- No ARIA labels on icon-only buttons (Sign Out)
- No skip-link for keyboard users
- Color-only error states (no icons)
- Fixed px font sizes (no dynamic text scaling support)
- No `prefers-reduced-motion` support
- Inconsistent semantic HTML landmarks
- Some inputs missing `id`/`htmlFor` pairing

### Keyboard Navigation

**Current Support**:
- Tab order follows visual order
- Form inputs focusable
- Buttons focusable
- Links focusable

**Missing**:
- ESC key to close modals (no modals yet)
- Skip to main content link

### Screen Readers

**Minimal Support**:
- Some semantic HTML
- Form labels present

**Missing**:
- ARIA labels on icon-only buttons
- `aria-live` regions for dynamic messages
- `role="alert"` on error messages

---

## Form Validation

### Current Pattern

**Client-Side**:
- HTML5 validation: `required`, `type="email"`, `type="tel"`, `min`, `step`
- No inline validation (planned in Phase 3)
- No validation on blur (planned in Phase 3)

**Error Display**:
- Errors shown at top of form (should be below each field)
- Error messages: `{result.error}` or `{error}`
- No error icons (color-only, accessibility issue)

**Success Display**:
- Success messages at top of form
- Uses `{result.success}` and `{result.message}`
- No success icons

---

## Data Display

### Prices

```tsx
<p className="text-headline-sm">₾{service.price}</p>
```

**Currency**: Georgian Lari (₾)  
**Format**: No thousands separator, 2 decimal places when needed

### Duration

```tsx
<p className="label-mono text-on-surface-variant">
  {service.duration_minutes} MIN
</p>
```

**Format**: Number + "MIN" in uppercase

### Dates

**Date Options** (BookingForm):
```tsx
{
  value: '2026-06-04',
  label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Thu, Jun 4'
}
```

**Date Display**:
```tsx
{new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
```

**Note**: Timezone handling uses Tbilisi (UTC+4) via `date-fns-tz` utilities.

### Time

**Time Slots** (availability API):
```tsx
{availableSlots.map((slot) => (
  <button>{slot}</button>  // e.g., "10:00", "14:30"
))}
```

**Format**: 24-hour time (HH:MM)

---

## Multi-Step Forms

### BookingForm Pattern

**Steps**:
1. Select Service (required)
2. Select Staff (optional, if staff exists)
3. Select Date & Time (required)
4. Customer Details (required)

**Step Indicators**:
```tsx
<h2 className="text-headline-lg">1. Select Service</h2>
{selectedService && (
  <span className="label-mono text-primary">✓ SELECTED</span>
)}
```

**Progressive Disclosure**:
- Step 1 always visible
- Step 2+ rendered conditionally based on `step >= N`
- State: `const [step, setStep] = useState(1)`

**Step Advancement**:
- Auto-advance on selection (onClick sets next step)
- Final step shows submit button

**Note**: No step progress indicator (e.g., "Step 2 of 4") — planned in Phase 3.

---

## Image Uploads

### Component Pattern

```tsx
<ImageUpload
  businessId={business.id}
  type="cover"
  currentUrl={coverImageUrl}
  onUploadComplete={(url) => {
    setCoverImageUrl(url)
    setIsDirty(true)
  }}
  variant="business"
/>
```

**Types**: `"cover"` or `"logo"`  
**Variant**: `"business"` (others may be added later)

**Hidden Input for Form Submission**:
```tsx
<input type="hidden" name="cover_image_url" value={coverImageUrl || ''} />
```

---

## Unsaved Changes Warning

### Current Pattern

```tsx
const [isDirty, setIsDirty] = useState(false)

useEffect(() => {
  const handleInput = () => setIsDirty(true)
  const form = document.querySelector("form")
  if (form) {
    form.addEventListener("input", handleInput)
    return () => form.removeEventListener("input", handleInput)
  }
}, [])

// Display indicator
{isDirty && (
  <p className="label-mono text-on-surface-variant">
    UNSAVED CHANGES
  </p>
)}

// Disable save button when pristine
<button disabled={loading || !isDirty} className="btn-primary">
  {loading ? "Saving..." : "Save Changes"}
</button>
```

---

## Known Anti-Patterns (To Be Fixed)

### Phase 1 (Critical)
- Missing focus-visible rings on many interactive elements
- No ARIA labels on icon-only buttons
- No skip-link
- Color-only error states
- Browser native `confirm()` for destructive actions

### Phase 2 (High Priority)
- No skeleton loaders (just "Loading..." text)
- No active press feedback (`active:scale-[0.98]`)
- Small tap targets on Edit/Delete text links
- Errors shown at top of form instead of below each field

### Phase 3 (Medium Priority)
- No inline validation (on blur)
- No toast notification system
- No step progress indicator ("Step 2 of 4")
- No retry buttons on errors
- No stagger animations on lists

---

## Component Checklist

When building a **new component**, ensure:

### Visual
- [ ] Uses semantic color tokens (`bg-surface`, `text-on-surface`, etc.)
- [ ] Uses spacing system (`p-gutter`, `space-y-stack-md`, etc.)
- [ ] Uses typography scale (`text-headline-md`, `label-mono`, etc.)
- [ ] All border-radius is 0 (or omitted, relies on config)
- [ ] Uses `transition-colors` on interactive elements
- [ ] Follows established button patterns (`.btn-primary`, `.btn-secondary`, `.btn-ghost`)
- [ ] Follows input pattern (`.input-field`, `.label-mono`)

### Responsive
- [ ] Mobile-first breakpoints (`md:`, `lg:`)
- [ ] Tested on mobile (375px) and desktop (1280px)
- [ ] Uses responsive padding (`px-margin-mobile md:px-margin-desktop`)
- [ ] Grid adapts on smaller screens

### Accessibility
- [ ] All inputs have labels with `htmlFor` attribute
- [ ] Required fields marked with `*`
- [ ] Form validation uses HTML5 attributes
- [ ] Focus states visible (buttons have `focus-visible`, inputs have `focus:border-primary`)
- [ ] Disabled states use `disabled` attribute + opacity
- [ ] Error messages have semantic color + text (icon to be added in Phase 1)

### Interaction
- [ ] Hover states on links/buttons
- [ ] Loading states disable form submission
- [ ] Success/error feedback shown after actions
- [ ] Transitions smooth (`transition-colors`)

### Code Quality
- [ ] TypeScript types defined
- [ ] Server actions for mutations
- [ ] Client components use `"use client"`
- [ ] No console.log statements
- [ ] Follows Next.js 14 App Router patterns

---

## When in Doubt

1. **Check this file first** — all established patterns are documented here
2. **Read SKILL.md** — for design principles and UX best practices
3. **Search the codebase** — find similar components and follow their pattern
4. **Ask the user** — if introducing a new pattern or making a design decision

---

**Last Updated**: 2026-06-04  
**Version**: 1.0  
**Next Review**: After Phase 1 accessibility fixes
