---
name: Salome AI
colors:
  surface: '#131319'
  surface-dim: '#131319'
  surface-bright: '#393840'
  surface-container-lowest: '#0d0e14'
  surface-container-low: '#1b1b22'
  surface-container: '#1f1f26'
  surface-container-high: '#292930'
  surface-container-highest: '#34343b'
  on-surface: '#e4e1eb'
  on-surface-variant: '#d0c5b2'
  inverse-surface: '#e4e1eb'
  inverse-on-surface: '#303037'
  outline: '#99907e'
  outline-variant: '#4d4637'
  surface-tint: '#e6c364'
  primary: '#ffe090'
  on-primary: '#3d2e00'
  primary-container: '#e6c364'
  on-primary-container: '#665000'
  inverse-primary: '#755b00'
  secondary: '#c8c5cc'
  on-secondary: '#303035'
  secondary-container: '#47464c'
  on-secondary-container: '#b6b4bb'
  tertiary: '#d4e4ff'
  on-tertiary: '#00315d'
  tertiary-container: '#a4c9ff'
  on-tertiary-container: '#005497'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08f'
  primary-fixed-dim: '#e6c364'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#e4e1e8'
  secondary-fixed-dim: '#c8c5cc'
  on-secondary-fixed: '#1b1b20'
  on-secondary-fixed-variant: '#47464c'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a4c9ff'
  on-tertiary-fixed: '#001c39'
  on-tertiary-fixed-variant: '#004883'
  background: '#131319'
  on-background: '#e4e1eb'
  surface-variant: '#34343b'
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
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system for this product centers on an aesthetic of **High-Tech Opulence**. It targets a high-end demographic seeking seamless, concierge-level AI interaction. The personality is "The Invisible Polymath"—infinitely capable, whisper-quiet, and sophisticated.

The style is a fusion of **Luxury Minimalism** and **Ethereal Glassmorphism**. We utilize deep, charcoal backgrounds to ground the interface in premium stability, while introducing fluid, translucent layers and soft neon "activity glows" to represent the living nature of the AI. Every interaction should feel like a physical movement through a high-end digital lounge: smooth, weighted, and responsive.

## Colors
The palette is anchored by the **Signature Gold (#E6C364)**, used sparingly for primary actions and brand signifiers to maintain its value. The canvas is **Deep Charcoal (#131318)**, providing a high-contrast stage for legibility and depth.

To signify AI processing and voice activity, we introduce a secondary atmospheric palette:
- **Celestial Blue (#4A90E2):** Used for steady-state AI presence and listening modes.
- **Electric Amethyst (#8B5CF6):** Used for active synthesis and complex task processing.
- **Surface Neutral (#27272E):** Used for elevated containers and subtle borders to define structure within the dark space.

## Typography
This design system utilizes **Hanken Grotesk** exclusively to maintain a sharp, contemporary, and engineered feel. 

- **Display Text:** Used for hero statements and AI status. Use tight letter spacing and bold weights to evoke a sense of precision.
- **Body Text:** Use Regular weight for high readability against dark backgrounds. Ensure line height is generous to prevent "vibration" of white text on black.
- **Labels:** Small caps with increased tracking are used for metadata, category labels, and secondary system information to provide a technical, "instrument panel" aesthetic.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy with generous negative space to emphasize the "luxury" aspect of the brand. 

- **Desktop:** A 12-column grid with 24px gutters. Content is typically centered in a 1200px max-width container to maintain focus.
- **Mobile:** A 4-column grid with 16px margins.
- **Spacing Logic:** All spacing follows an 8px base unit. Use larger gaps (48px+) between distinct functional blocks to allow the glassmorphic layers to "breathe" against the charcoal background.

## Elevation & Depth
Depth is created through **Glassmorphism** rather than traditional drop shadows. 

1.  **Base Layer:** The solid #131318 background.
2.  **Mantle Layer:** Semi-transparent surfaces (10-15% opacity white or neutral) with a 20px - 40px backdrop blur. These surfaces should have a 1px inner border (white at 10% opacity) to catch "light" at the edges.
3.  **Active Glows:** AI activity is represented by "Atmospheric Depth"—radial gradients of Blue and Purple positioned *behind* the glass layers, creating a diffused, ethereal light source that feels internal to the device.
4.  **Interactive Elevation:** Elements do not "lift" via shadows; instead, their backdrop blur intensity increases or their inner border brightens to the Signature Gold.

## Shapes
The design system employs a **Rounded** shape language to soften the futuristic technicality of the interface.

- **Primary Containers:** 1rem (16px) corner radius.
- **Buttons and Inputs:** 0.5rem (8px) corner radius, providing a precise, tactile feel.
- **AI Visualizers:** Use perfectly circular forms or organic, fluid "blobs" with no hard corners to represent the voice assistant's waveform.

## Components

### Buttons
- **Primary:** Solid Gold (#E6C364) with Charcoal text. No shadow, but a subtle outer glow of the same color on hover.
- **Ghost:** Glassmorphic background (10% white) with a Gold 1px border. 

### Cards & Containers
- Cards use the **Mantle Layer** logic: 15% opacity fills and heavy backdrop blurs. 
- Content within cards should have a clear hierarchy, using **Label-Caps** for section headers.

### Voice Activity Visualizer
- A centerpiece component. Use a series of concentric circles or a horizontal waveform that pulses with **Celestial Blue** and **Electric Amethyst** gradients. Apply a soft blur to the edges of the pulses to simulate light emission.

### Input Fields
- Darker than the base (pure black or #0A0A0F) with a subtle 1px Surface Neutral border. On focus, the border transitions to a Blue-to-Purple gradient.

### Chips/Tags
- Small, glassmorphic pills used for suggested voice commands or booking categories. They should feature a very subtle 1px gold border if they are "recommended" actions.