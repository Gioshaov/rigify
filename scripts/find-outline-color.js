// Find the minimum lightness for outline-variant to meet 3:1 contrast

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
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

const background = "#0a0a0f";
const currentOutline = "#4d4637";
const currentRgb = hexToRgb(currentOutline);

console.log("\nFinding new outline-variant color...");
console.log(`Current: ${currentOutline} (${getContrastRatio(currentOutline, background).toFixed(2)}:1)\n`);

// Try lightening the current color progressively
const candidates = [];

for (let factor = 1.1; factor <= 2.0; factor += 0.1) {
  const r = Math.min(255, currentRgb.r * factor);
  const g = Math.min(255, currentRgb.g * factor);
  const b = Math.min(255, currentRgb.b * factor);

  const hex = rgbToHex(r, g, b);
  const ratio = getContrastRatio(hex, background);

  if (ratio >= 3.0) {
    candidates.push({ hex, ratio, factor });
  }
}

console.log("Candidates that meet 3.0:1 ratio:\n");
candidates.slice(0, 5).forEach((c, i) => {
  console.log(`${i + 1}. ${c.hex}  →  ${c.ratio.toFixed(2)}:1  (lightened by ${((c.factor - 1) * 100).toFixed(0)}%)`);
});

if (candidates.length > 0) {
  console.log(`\n✅ Recommended: ${candidates[0].hex} (minimal change, ${candidates[0].ratio.toFixed(2)}:1)`);
}
