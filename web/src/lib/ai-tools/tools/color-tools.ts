/**
 * Color Tools
 * Color conversions, palette generation, and accessibility checking
 */

import type { ToolDefinition } from '../types';

export const colorToolsTool: ToolDefinition = {
  name: 'color_tools',
  description: 'Color conversions (HEX/RGB/HSL/CMYK), palette generation (complementary, analogous, triadic), and WCAG accessibility checking',
  category: 'utility',
  parameters: [
    {
      name: 'color',
      type: 'string',
      description: 'Input color in any format: HEX (#FF5733), RGB (255,87,51), HSL (hsl(9,100%,60%))',
      required: true,
    },
    {
      name: 'action',
      type: 'string',
      description: 'Action to perform: convert, palette, accessibility, gradient',
      required: true,
      enum: ['convert', 'palette', 'accessibility', 'gradient'],
    },
    {
      name: 'palette_type',
      type: 'string',
      description: 'Type of palette to generate (for palette action)',
      required: false,
      enum: ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'],
    },
    {
      name: 'compare_color',
      type: 'string',
      description: 'Color to compare for accessibility (background color)',
      required: false,
    },
  ],
  async execute({ color, action, palette_type = 'complementary', compare_color }) {
    try {
      // Parse input color to RGB
      const rgb = parseColor(color);
      if (!rgb) {
        throw new Error('Invalid color format');
      }

      const hsl = rgbToHsl(rgb);
      const hsv = rgbToHsv(rgb);
      const cmyk = rgbToCmyk(rgb);
      const hex = rgbToHex(rgb);

      // Base color conversions (always include)
      const conversions = {
        hex: hex,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
        hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
        cmyk: `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`,
      };

      const result: any = {
        original_color: color,
        conversions: conversions,
        rgb_values: rgb,
        hsl_values: hsl,
        cmyk_values: cmyk,
        timestamp: new Date().toISOString(),
      };

      // Execute specific action
      switch (action) {
        case 'convert':
          // Conversions are already in the result
          break;

        case 'palette':
          result.palette = generatePalette(hsl, palette_type);
          result.palette_type = palette_type;
          break;

        case 'accessibility':
          if (!compare_color) {
            throw new Error('compare_color is required for accessibility action');
          }
          const bgRgb = parseColor(compare_color);
          if (!bgRgb) {
            throw new Error('Invalid compare_color format');
          }
          result.accessibility = checkAccessibility(rgb, bgRgb);
          result.compare_color = rgbToHex(bgRgb);
          break;

        case 'gradient':
          if (!compare_color) {
            throw new Error('compare_color is required for gradient action');
          }
          const endRgb = parseColor(compare_color);
          if (!endRgb) {
            throw new Error('Invalid compare_color format');
          }
          result.gradient = generateGradient(rgb, endRgb);
          result.end_color = rgbToHex(endRgb);
          break;
      }

      return result;
    } catch (error) {
      throw new Error(`Color tools error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Color parsing
function parseColor(color: string): { r: number; g: number; b: number } | null {
  color = color.trim();

  // HEX format
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      };
    }
  }

  // RGB format
  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // HSL format
  const hslMatch = color.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (hslMatch) {
    return hslToRgb({
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
    });
  }

  return null;
}

// RGB to HEX
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

// RGB to HSL
function rgbToHsl(rgb: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

// HSL to RGB
function hslToRgb(hsl: { h: number; s: number; l: number }): { r: number; g: number; b: number } {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// RGB to HSV
function rgbToHsv(rgb: { r: number; g: number; b: number }): { h: number; s: number; v: number } {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    v: v * 100,
  };
}

// RGB to CMYK
function rgbToCmyk(rgb: { r: number; g: number; b: number }): { c: number; m: number; y: number; k: number } {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;

  return {
    c: c * 100,
    m: m * 100,
    y: y * 100,
    k: k * 100,
  };
}

// Generate color palette
function generatePalette(hsl: { h: number; s: number; l: number }, type: string): any[] {
  const colors: any[] = [];

  switch (type) {
    case 'complementary':
      colors.push(hslToHex(hsl));
      colors.push(hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }));
      break;

    case 'analogous':
      colors.push(hslToHex({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }));
      colors.push(hslToHex(hsl));
      colors.push(hslToHex({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }));
      break;

    case 'triadic':
      colors.push(hslToHex(hsl));
      colors.push(hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }));
      colors.push(hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }));
      break;

    case 'tetradic':
      colors.push(hslToHex(hsl));
      colors.push(hslToHex({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }));
      colors.push(hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }));
      colors.push(hslToHex({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }));
      break;

    case 'monochromatic':
      for (let i = 20; i <= 80; i += 20) {
        colors.push(hslToHex({ h: hsl.h, s: hsl.s, l: i }));
      }
      break;
  }

  return colors.map(hex => {
    const rgb = parseColor(hex)!;
    return {
      hex: hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      name: getColorName(rgb),
    };
  });
}

function hslToHex(hsl: { h: number; s: number; l: number }): string {
  return rgbToHex(hslToRgb(hsl));
}

// Check WCAG accessibility
function checkAccessibility(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }) {
  const contrast = getContrastRatio(fg, bg);

  return {
    contrast_ratio: contrast.toFixed(2),
    wcag_aa_normal: contrast >= 4.5,
    wcag_aa_large: contrast >= 3,
    wcag_aaa_normal: contrast >= 7,
    wcag_aaa_large: contrast >= 4.5,
    rating: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA Large' : 'Fail',
    recommendations: getAccessibilityRecommendations(contrast),
  };
}

function getContrastRatio(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): number {
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getAccessibilityRecommendations(contrast: number): string[] {
  const recs: string[] = [];

  if (contrast >= 7) {
    recs.push('Excellent contrast! Meets WCAG AAA for all text sizes');
  } else if (contrast >= 4.5) {
    recs.push('Good contrast! Meets WCAG AA for normal text');
    recs.push('Consider increasing contrast for AAA compliance');
  } else if (contrast >= 3) {
    recs.push('Meets WCAG AA for large text only (18pt+ or 14pt+ bold)');
    recs.push('Increase contrast for normal text');
  } else {
    recs.push('Fails WCAG contrast requirements');
    recs.push('Increase contrast significantly for accessibility');
  }

  return recs;
}

// Generate gradient
function generateGradient(start: { r: number; g: number; b: number }, end: { r: number; g: number; b: number }) {
  const steps = 5;
  const colors = [];

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);

    const hex = rgbToHex({ r, g, b });
    colors.push({
      hex: hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      position: `${Math.round(ratio * 100)}%`,
    });
  }

  const cssLinear = `linear-gradient(to right, ${colors.map(c => c.hex).join(', ')})`;
  const cssRadial = `radial-gradient(circle, ${colors.map(c => c.hex).join(', ')})`;

  return {
    colors: colors,
    css_linear: cssLinear,
    css_radial: cssRadial,
  };
}

// Get approximate color name
function getColorName(rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb);
  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;

  if (s < 10) {
    if (l < 20) return 'Black';
    if (l < 40) return 'Dark Gray';
    if (l < 60) return 'Gray';
    if (l < 80) return 'Light Gray';
    return 'White';
  }

  if (h < 30) return 'Red';
  if (h < 60) return 'Orange';
  if (h < 90) return 'Yellow';
  if (h < 150) return 'Green';
  if (h < 210) return 'Cyan';
  if (h < 270) return 'Blue';
  if (h < 330) return 'Magenta';
  return 'Red';
}
