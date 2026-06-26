import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Semantic stacking scale for the global overlapping layers. Local
      // in-component stacking keeps numeric z-10 / z-20. Overlays (modal/toast)
      // are portaled to <body>, so these compete in one root stacking context.
      zIndex: {
        nav: "40", // fixed / sticky page headers + bottom navs
        dropdown: "50", // menus, popovers, select dropdowns
        modal: "100", // modal & dialog backdrops
        toast: "200", // notifications — always on top
      },
      colors: {
        background: "#0a0a0f",
        surface: "#1a1a24",
        "surface-dim": "#131318",
        "surface-bright": "#39383e",
        "surface-container-lowest": "#0a0a0f",
        "surface-container-low": "#1b1b20",
        "surface-container": "#1f1f25",
        "surface-container-high": "#2a292f",
        "surface-container-highest": "#35343a",
        "surface-variant": "#35343a",
        "surface-elevated": "#2a292f",
        "on-surface": "#e4e1e9",
        "on-surface-variant": "#d0c5b2",
        "on-background": "#e4e1e9",
        "inverse-surface": "#e4e1e9",
        "inverse-on-surface": "#303036",
        outline: "#99907e",
        "outline-variant": "#4d4637",
        "surface-tint": "#e6c364",
        primary: "#e6c364",
        "on-primary": "#0a0a0f",
        "primary-container": "#c9a84c",
        "on-primary-container": "#503d00",
        "inverse-primary": "#755b00",
        "primary-fixed": "#ffe08f",
        "primary-fixed-dim": "#e6c364",
        "on-primary-fixed": "#241a00",
        "on-primary-fixed-variant": "#584400",
        secondary: "#c8c5cf",
        "on-secondary": "#303037",
        "secondary-container": "#494850",
        "on-secondary-container": "#b9b7c1",
        "secondary-fixed": "#e4e1eb",
        "secondary-fixed-dim": "#c8c5cf",
        "on-secondary-fixed": "#1b1b22",
        "on-secondary-fixed-variant": "#47464e",
        tertiary: "#c7c5d4",
        "on-tertiary": "#2f2f3b",
        "tertiary-container": "#acaab8",
        "on-tertiary-container": "#3f3f4a",
        "tertiary-fixed": "#e3e1f0",
        "tertiary-fixed-dim": "#c7c5d3",
        "on-tertiary-fixed": "#1a1b25",
        "on-tertiary-fixed-variant": "#464651",
        error: "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "muted-gold": "#c9a84c",
        "pure-white": "#ffffff",
        "text-primary": "#e4e1e9",
        "text-secondary": "#d0c5b2",
      },
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
      },
      fontFamily: {
        hanken: ["var(--font-hanken)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "data-label": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "500" }],
        "data-numeric": ["16px", { lineHeight: "16px", fontWeight: "600" }],
      },
      spacing: {
        gutter: "24px",
        "margin-desktop": "64px",
        "margin-mobile": "16px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "section-gap": "80px",
      },
      maxWidth: {
        container: "1280px",
        "container-max": "1280px",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
