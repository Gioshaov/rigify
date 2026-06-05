// WCAG Contrast Ratio Calculator
// Run with: node contrast-audit.js

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function checkWCAG(ratio) {
  return {
    aaLarge: ratio >= 3.0,
    aaNormal: ratio >= 4.5,
    aaaLarge: ratio >= 4.5,
    aaaNormal: ratio >= 7.0,
    ui: ratio >= 3.0
  };
}

// Color Definitions from tailwind.config.ts
const colors = {
  primary: "#e6c364",
  background: "#0a0a0f",
  surface: "#16161d",
  onSurface: "#e4e1e9",
  onSurfaceVariant: "#d0c5b2",
  onPrimary: "#0a0a0f",
  error: "#ffb4ab",
  outlineVariant: "#6c624d", // Updated from #4d4637 to meet 3:1 contrast
  // Tailwind defaults for admin section
  green300: "#86efac",
  green900: "#14532d",
  red300: "#fca5a5",
  red900: "#7f1d1d",
  gray400: "#9ca3af",
  gray800: "#1f2937",
  violet600: "#7c3aed",
  white: "#ffffff",
};

// Test all color pairs from the plan
const tests = [
  // Primary Content Text
  { name: "Body text", fg: colors.onSurface, bg: colors.background, type: "text" },
  { name: "Card text", fg: colors.onSurface, bg: colors.surface, type: "text" },
  { name: "Secondary text", fg: colors.onSurfaceVariant, bg: colors.background, type: "text" },
  { name: "Secondary on cards", fg: colors.onSurfaceVariant, bg: colors.surface, type: "text" },
  { name: "Primary headings", fg: colors.primary, bg: colors.background, type: "large" },

  // Interactive Elements
  { name: "Button primary", fg: colors.onPrimary, bg: colors.primary, type: "text" },
  { name: "Button border", fg: colors.primary, bg: colors.background, type: "ui" },
  { name: "Outline borders", fg: colors.outlineVariant, bg: colors.background, type: "ui" },

  // Error/Success States
  { name: "Error text", fg: colors.error, bg: colors.background, type: "text" },
  { name: "Admin success", fg: colors.green300, bg: colors.green900, type: "text" },
  { name: "Admin error", fg: colors.red300, bg: colors.red900, type: "text" },

  // Admin Section
  { name: "Status active", fg: colors.green300, bg: colors.green900, type: "text" },
  { name: "Status inactive", fg: colors.gray400, bg: colors.gray800, type: "text" },
  { name: "Violet buttons", fg: colors.white, bg: colors.violet600, type: "text" },
];

console.log("\n╔═══════════════════════════════════════════════════════════════════════════════╗");
console.log("║                        WCAG AA CONTRAST AUDIT RESULTS                        ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════════╝\n");

console.log("WCAG AA Requirements:");
console.log("  • Normal text (< 18pt):       4.5:1");
console.log("  • Large text (≥ 18pt bold):   3.0:1");
console.log("  • UI components (borders):    3.0:1\n");

console.log("─".repeat(95));
console.log(`${"Color Pair".padEnd(25)} ${"Foreground".padEnd(12)} ${"Background".padEnd(12)} ${"Ratio".padEnd(10)} ${"Status".padEnd(30)}`);
console.log("─".repeat(95));

const results = [];

tests.forEach(test => {
  const ratio = getContrastRatio(test.fg, test.bg);
  const wcag = checkWCAG(ratio);

  let status;
  let pass = false;

  if (test.type === "text") {
    pass = wcag.aaNormal;
    status = wcag.aaNormal ? "✅ PASS AA (Normal)" : "❌ FAIL (need 4.5:1)";
  } else if (test.type === "large") {
    pass = wcag.aaLarge;
    status = wcag.aaLarge ? "✅ PASS AA (Large)" : "❌ FAIL (need 3.0:1)";
  } else if (test.type === "ui") {
    pass = wcag.ui;
    status = wcag.ui ? "✅ PASS UI Component" : "❌ FAIL (need 3.0:1)";
  }

  console.log(
    `${test.name.padEnd(25)} ${test.fg.padEnd(12)} ${test.bg.padEnd(12)} ${ratio.toFixed(2).padEnd(10)} ${status}`
  );

  results.push({ ...test, ratio, pass, wcag });
});

console.log("─".repeat(95));

// Summary
const totalTests = results.length;
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass).length;

console.log(`\nSUMMARY: ${passed}/${totalTests} tests passed (${((passed/totalTests)*100).toFixed(0)}%)`);
console.log(`Failed: ${failed} color pairs need adjustment\n`);

// Failures detail
if (failed > 0) {
  console.log("╔═══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                                   FAILURES                                    ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════════╝\n");

  results.filter(r => !r.pass).forEach(test => {
    const needed = test.type === "text" ? 4.5 : 3.0;
    const current = test.ratio.toFixed(2);
    const deficit = (needed - test.ratio).toFixed(2);

    console.log(`⚠️  ${test.name}`);
    console.log(`   Current: ${current}:1  |  Needed: ${needed}:1  |  Deficit: ${deficit}`);
    console.log(`   FG: ${test.fg}  BG: ${test.bg}\n`);
  });
}
