---
name: Rigify Premium
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
  primary: '#ffe090'
  on-primary: '#3d2e00'
  primary-container: '#e6c364'
  on-primary-container: '#665000'
  inverse-primary: '#755b00'
  secondary: '#c7c5d3'
  on-secondary: '#302f3a'
  secondary-container: '#494853'
  on-secondary-container: '#b9b7c4'
  tertiary: '#d9e2ff'
  on-tertiary: '#162f5e'
  tertiary-container: '#b0c6ff'
  on-tertiary-container: '#3b5183'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08f'
  primary-fixed-dim: '#e6c364'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#e3e1ef'
  secondary-fixed-dim: '#c7c5d3'
  on-secondary-fixed: '#1b1b25'
  on-secondary-fixed-variant: '#464651'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#b0c6ff'
  on-tertiary-fixed: '#001944'
  on-tertiary-fixed-variant: '#2f4576'
  background: '#131318'
  on-background: '#e4e1e9'
  surface-variant: '#35343a'
  pure-white: '#ffffff'
  muted-gold: '#9d8653'
  surface-elevated: '#22222e'
  text-primary: '#ffffff'
  text-secondary: '#a1a1aa'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  label-mono-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.2em
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered to position the product as a high-end, exclusive marketplace for beauty and wellness. The aesthetic is rooted in **Modern Minimalism** with a **Tactile** edge, favoring sharp precision over soft ornamentation. It evokes the feeling of a premium concierge service—sophisticated, efficient, and authoritative.

The target audience consists of discerning clients seeking luxury grooming and wellness services, alongside professional artisans who value a platform that mirrors the quality of their work. The UI must feel like a dark gallery space where high-quality photography is the focal point, supported by a rigid, architectural interface.

Key stylistic pillars include:
- **Sharp Precision:** A strict rejection of rounded corners to maintain a professional, structural look.
- **Lustrous Accents:** Using gold not as a primary fill, but as a deliberate highlight for navigation and action.
- **Deep Immersion:** A dark-mode-first approach that reduces eye strain and allows imagery to pop.

## Colors

The palette is built on a "void" architecture. The background is a near-black obsidian (#0a0a0f) which provides infinite depth. Surface containers use a deep charcoal (#1a1a24) to create subtle separation without breaking the dark immersion.

**Primary Gold (#e6c364)** is used strictly for "Active" states, primary Call-to-Actions, and verified badges. It represents the "Gold Standard" of the marketplace. 
**Muted Gold (#9d8653)** is reserved for decorative elements or secondary highlights where the high-vibrancy primary gold would be too distracting.

All text defaults to **Pure White** for maximum legibility against the dark background, while secondary metadata utilizes a muted gray-blue to maintain hierarchy.

## Typography

Typography is a dual-system approach balancing humanism with technical precision. 

1.  **Hanken Grotesk** serves as the primary typeface for both headings and body text. Its clean, geometric forms provide excellent legibility in both Georgian (KA) and English (EN) scripts. Headlines should use tighter tracking and heavier weights to command attention.
2.  **JetBrains Mono** is the "utility" font. It is used exclusively for metadata, prices, durations, and status labels. It must always be presented in **UPPERCASE** with expanded letter-spacing (0.15em - 0.2em) to evoke the feel of a luxury watch or a high-end technical instrument.

For Georgian text, ensure line-height is increased by approximately 10% compared to English to accommodate the unique ascenders and descenders of the Mkhedruli alphabet.

## Layout & Spacing

This design system utilizes a **Fixed Grid** philosophy for desktop to maintain a cinematic, composed feel, transitioning to a fluid system for mobile devices. 

- **Desktop:** 12-column grid, 1280px max-width, with 24px gutters.
- **Tablet:** 8-column grid, fluid width.
- **Mobile:** 4-column grid, fluid width, 16px side margins.

The spacing rhythm is strictly based on 8px increments. Vertical rhythm is critical; sections should be separated by large clear zones (64px or 80px) to give the content "room to breathe," reinforcing the premium positioning.

## Elevation & Depth

In a dark, sharp-edged environment, depth is created through **Tonal Layering** and **Low-Contrast Outlines** rather than soft shadows.

- **Level 0 (Base):** #0a0a0f. Reserved for the main page background.
- **Level 1 (Cards/Sections):** #1a1a24. Used for primary content containers.
- **Level 2 (Overlays/Modals):** #22222e. Used for dropdowns, modals, and hovering elements.

Instead of heavy drop shadows, use a 1px solid border (#ffffff with 10% opacity) to define the edges of containers. This maintains the "Sharp" aesthetic while ensuring components remain distinct from the background. For active gold elements, a subtle outer glow using the primary gold at 20% opacity may be used to simulate a "neon thread" effect.

## Shapes

The shape language is strictly **Geometric and Sharp**. There are no rounded corners (0px border-radius) in any UI element. 

This decision is fundamental to the brand’s "utilitarian luxury" identity. All buttons, input fields, cards, and image containers must adhere to this rule. When elements are grouped (e.g., a set of filter chips), they should appear as a series of interlocking rectangles, emphasizing the grid and structural integrity of the layout.

## Components

### Buttons
- **Primary:** Solid Gold (#e6c364) background, Black (#0a0a0f) text, bold Hanken Grotesk. Sharp 0px corners.
- **Secondary:** Transparent background, 1px Gold border, Gold text.
- **Ghost:** Transparent background, White text, 1px white border at 20% opacity.

### Inputs & Selection
- **Text Fields:** Deep charcoal (#1a1a24) background, 1px border (#ffffff, 10% opacity). On focus, the border changes to Primary Gold.
- **Checkboxes/Radios:** Square (0px radius). When active, they are filled with Primary Gold with a black checkmark/inset.

### Cards
- **Service Cards:** Feature a high-aspect ratio image (e.g., 4:5) with a 1px internal border. The content area below uses the charcoal surface (#1a1a24). 
- **Badges:** Use JetBrains Mono for labels inside cards (e.g., "AVAILABLE", "PREMIUM").

### Lists & Navigation
- **Navigation:** Links in white, turning gold on hover. Use JetBrains Mono for the main navigation bar to emphasize the technical, marketplace aspect.
- **Status Indicators:** Use a simple 1px gold vertical line to the left of "active" list items to indicate focus.