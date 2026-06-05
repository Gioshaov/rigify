---
name: Rigify Lux
colors:
  surface: '#131318'
  surface-dim: '#131318'
  surface-bright: '#39383e'
  surface-container-lowest: '#0e0e13'
  surface-container-low: '#1b1b20'
  surface-container: '#1f1f25'
  surface-container-high: '#2a292f'
  surface-container-highest: '#35343a'
  on-surface: '#e4e1e9'
  on-surface-variant: '#d0c5b2'
  inverse-surface: '#e4e1e9'
  inverse-on-surface: '#303036'
  outline: '#99907e'
  outline-variant: '#4d4637'
  surface-tint: '#e6c364'
  primary: '#e6c364'
  on-primary: '#3d2e00'
  primary-container: '#c9a84c'
  on-primary-container: '#503d00'
  inverse-primary: '#755b00'
  secondary: '#c8c5cf'
  on-secondary: '#303037'
  secondary-container: '#494850'
  on-secondary-container: '#b9b7c1'
  tertiary: '#c7c5d4'
  on-tertiary: '#2f2f3b'
  tertiary-container: '#acaab8'
  on-tertiary-container: '#3f3f4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08f'
  primary-fixed-dim: '#e6c364'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#e4e1eb'
  secondary-fixed-dim: '#c8c5cf'
  on-secondary-fixed: '#1b1b22'
  on-secondary-fixed-variant: '#47464e'
  tertiary-fixed: '#e3e1f0'
  tertiary-fixed-dim: '#c7c5d3'
  on-tertiary-fixed: '#1a1b25'
  on-tertiary-fixed-variant: '#464651'
  background: '#131318'
  on-background: '#e4e1e9'
  surface-variant: '#35343a'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  data-numeric:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 16px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

The design system is engineered for a premium beauty and wellness marketplace, targeting a high-end Georgian and international clientele. The aesthetic is "Nocturnal Opulence"—a sophisticated, dark-mode-first approach that prioritizes high-fidelity surfaces and sharp precision over organic softness.

The brand personality is authoritative, exclusive, and precise. It evokes the feeling of a private concierge service. We utilize a **Minimalist-Lux** style, characterized by:
- Deep, ink-like backgrounds that provide maximum contrast for golden accents.
- A "sharp-edge" philosophy to communicate professional rigor and architectural stability.
- Generous whitespace (macro-spacing) to ensure the interface feels unhurried and premium.
- Subtle, high-definition borders instead of heavy shadows to define structure.

## Colors

The palette is anchored in a deep black-blue (#0a0a0f) to create an infinite depth, allowing the Gold/Amber accent (#c9a84c) to act as a beacon for primary actions and luxury status.

- **Primary (Gold):** Used sparingly for calls to action, active states, and premium badges.
- **Surface Tiers:** We use #16161d and #2a2a35 for card backgrounds and container layering to create subtle depth without breaking the dark aesthetic.
- **Typography:** Pure white (#ffffff) is reserved for headings to ensure maximum legibility against the dark background, while a muted grey (#a1a1aa) is used for secondary body text to reduce visual noise.

## Typography

This design system utilizes a dual-font strategy to balance editorial elegance with technical precision. 

1. **Hanken Grotesk:** A sharp, contemporary sans-serif used for all prose and headings. Its geometric clarity supports Georgian, English, and Russian scripts with consistent vertical metrics.
2. **JetBrains Mono:** Employed for all data-dense information—specifically booking times, prices, and availability slots. The monospaced nature emphasizes the "booking" and "scheduling" aspect of the platform, providing a technical, high-end feel.

**Key Rules:**
- Headings use tight letter spacing for a "compressed" luxury look.
- Data labels are always uppercase with increased tracking for readability.
- Support for multi-script layouts ensures that Georgian characters maintain the same visual weight as Latin and Cyrillic.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain a cinematic, centered feel, while transitioning to a fluid model for mobile devices.

- **The 4px Rule:** All spacing increments must be multiples of 4px.
- **Desktop:** A 12-column grid with a maximum width of 1280px. Large 64px margins ensure content never feels "cramped" against the screen edges.
- **Mobile:** A 4-column fluid grid with 16px margins.
- **Vertical Rhythm:** We use aggressive "section gaps" (80px+) to separate different service categories or featured artisans, reinforcing the premium, airy brand feel.

## Elevation & Depth

This design system rejects heavy shadows in favor of **Tonal Layering** and **Subtle Outlines**.

- **Depth through Surfaces:**
    - Level 0 (Background): #0a0a0f
    - Level 1 (Cards/Containers): #16161d
    - Level 2 (Modals/Popovers): #2a2a35
- **Borders:** Instead of shadows, use 1px solid borders. For Level 1 surfaces, use `rgba(255,255,255,0.05)`. For interactive gold elements, use `rgba(201, 168, 76, 0.3)`.
- **Active State:** When an element is focused or elevated, a subtle "Gold Glow" can be applied (0px blur, 1px spread gold border) rather than a traditional drop shadow.

## Shapes

The shape language is strictly **Sharp (0px roundedness)**. 

Every UI element—from primary buttons and input fields to image thumbnails and cards—must feature 90-degree corners. This evokes architectural precision and high-end fashion branding. Roundness is forbidden to avoid a "consumer-grade" or "friendly" look; we aim for "professional" and "exclusive."

- **Buttons:** Perfectly rectangular.
- **Images:** Sharp corners, no border radius.
- **Selection States:** Hard-edged strokes.

## Components

### Buttons
- **Primary:** Background #c9a84c, text #0a0a0f (black). Sharp corners. All-caps typography.
- **Secondary:** Transparent background, 1px gold border. Text #c9a84c.
- **Ghost:** White text, no border. Used for tertiary actions.

### Input Fields
- **Default State:** #16161d background, 1px border `rgba(255,255,255,0.1)`.
- **Focus State:** 1px gold border (#c9a84c). No outer glow.
- **Typography:** Body-md for input text; Data-label (Mono) for floating labels.

### Cards
- Background #16161d. No shadow. 
- A subtle 1px top-border of #2a2a35 can be used to add a "rim light" effect.
- Content should have generous padding (24px+).

### Time Slots (Grid)
- Individual slots use JetBrains Mono.
- **Available:** 1px border `rgba(201, 168, 76, 0.4)`, text white.
- **Selected:** Background #c9a84c, text black.
- **Unavailable:** Strikethrough text, opacity 0.3.

### Navigation
- Top-aligned, fixed height. 
- Uses thin, gold-tinted dividers between major language switchers (GE | EN | RU).