/**
 * Calculator Tool
 * Perform mathematical calculations with scientific functions and unit conversions
 */

import type { ToolDefinition } from '../types';

// Unit conversion definitions
const unitConversions = {
  length: {
    m: { m: 1, ft: 3.28084, km: 0.001, mi: 0.000621371, cm: 100, in: 39.3701 },
    ft: { m: 0.3048, ft: 1, km: 0.0003048, mi: 0.000189394, cm: 30.48, in: 12 },
    km: { m: 1000, ft: 3280.84, km: 1, mi: 0.621371, cm: 100000, in: 39370.1 },
    mi: { m: 1609.34, ft: 5280, km: 1.60934, mi: 1, cm: 160934, in: 63360 },
    cm: { m: 0.01, ft: 0.0328084, km: 0.00001, mi: 0.00000621371, cm: 1, in: 0.393701 },
    in: { m: 0.0254, ft: 0.0833333, km: 0.0000254, mi: 0.000015783, cm: 2.54, in: 1 },
  },
  weight: {
    kg: { kg: 1, lb: 2.20462, g: 1000, oz: 35.274 },
    lb: { kg: 0.453592, lb: 1, g: 453.592, oz: 16 },
    g: { kg: 0.001, lb: 0.00220462, g: 1, oz: 0.035274 },
    oz: { kg: 0.0283495, lb: 0.0625, g: 28.3495, oz: 1 },
  },
  volume: {
    L: { L: 1, gal: 0.264172, ml: 1000, cup: 4.22675, qt: 1.05669 },
    gal: { L: 3.78541, gal: 1, ml: 3785.41, cup: 16, qt: 4 },
    ml: { L: 0.001, gal: 0.000264172, ml: 1, cup: 0.00422675, qt: 0.00105669 },
    cup: { L: 0.236588, gal: 0.0625, ml: 236.588, cup: 1, qt: 0.25 },
    qt: { L: 0.946353, gal: 0.25, ml: 946.353, cup: 4, qt: 1 },
  },
  temperature: {
    C: (val: number, to: string) => {
      if (to === 'F') return (val * 9/5) + 32;
      if (to === 'K') return val + 273.15;
      return val;
    },
    F: (val: number, to: string) => {
      if (to === 'C') return (val - 32) * 5/9;
      if (to === 'K') return (val - 32) * 5/9 + 273.15;
      return val;
    },
    K: (val: number, to: string) => {
      if (to === 'C') return val - 273.15;
      if (to === 'F') return (val - 273.15) * 9/5 + 32;
      return val;
    },
  },
};

// Calculation history (in-memory)
const calculationHistory: Array<{ expression: string; result: number; timestamp: number }> = [];

export const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'Perform mathematical calculations with scientific functions, unit conversions, and complex numbers',
  category: 'utility',
  parameters: [
    {
      name: 'expression',
      type: 'string',
      description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(45)", "3+4i")',
      required: true,
    },
    {
      name: 'mode',
      type: 'string',
      description: 'Calculation mode: "standard", "scientific", "unit_conversion", or "complex"',
      required: false,
      enum: ['standard', 'scientific', 'unit_conversion', 'complex'],
    },
    {
      name: 'unit_from',
      type: 'string',
      description: 'Source unit for conversion (e.g., "m", "ft", "kg", "lb", "L", "gal", "C", "F")',
      required: false,
    },
    {
      name: 'unit_to',
      type: 'string',
      description: 'Target unit for conversion',
      required: false,
    },
  ],
  async execute({ expression, mode = 'standard', unit_from, unit_to }) {
    try {
      // Unit conversion mode
      if (mode === 'unit_conversion' && unit_from && unit_to) {
        const value = parseFloat(expression);
        if (isNaN(value)) {
          throw new Error('Invalid number for unit conversion');
        }

        // Find unit category
        let converted: number | null = null;
        let category = '';

        for (const [cat, units] of Object.entries(unitConversions)) {
          if (cat === 'temperature') {
            const tempConvert = units as any;
            if (tempConvert[unit_from]) {
              converted = tempConvert[unit_from](value, unit_to);
              category = cat;
              break;
            }
          } else {
            const unitMap = units as any;
            if (unitMap[unit_from] && unitMap[unit_from][unit_to]) {
              converted = value * unitMap[unit_from][unit_to];
              category = cat;
              break;
            }
          }
        }

        if (converted === null) {
          throw new Error(`Cannot convert from ${unit_from} to ${unit_to}`);
        }

        return {
          expression: `${value} ${unit_from}`,
          result: converted,
          formatted: `${value} ${unit_from} = ${converted.toFixed(4)} ${unit_to}`,
          mode: 'unit_conversion',
          category,
          steps: [
            `Input: ${value} ${unit_from}`,
            `Category: ${category}`,
            `Conversion factor applied`,
            `Result: ${converted.toFixed(4)} ${unit_to}`,
          ],
        };
      }

      // Complex number mode (basic support for a+bi notation)
      if (mode === 'complex' || expression.includes('i')) {
        // Simple complex number parser for expressions like "3+4i"
        const complexMatch = expression.match(/(-?\d+\.?\d*)\s*([+-])\s*(\d+\.?\d*)i/);
        if (complexMatch) {
          const real = parseFloat(complexMatch[1]);
          const sign = complexMatch[2] === '+' ? 1 : -1;
          const imag = parseFloat(complexMatch[3]) * sign;
          const magnitude = Math.sqrt(real * real + imag * imag);
          const angle = Math.atan2(imag, real) * (180 / Math.PI);

          return {
            expression,
            result: { real, imaginary: imag },
            formatted: `${real} ${imag >= 0 ? '+' : ''}${imag}i`,
            magnitude: magnitude.toFixed(4),
            angle: `${angle.toFixed(2)}°`,
            mode: 'complex',
            steps: [
              `Input: ${expression}`,
              `Real part: ${real}`,
              `Imaginary part: ${imag}`,
              `Magnitude: ${magnitude.toFixed(4)}`,
              `Angle: ${angle.toFixed(2)}°`,
            ],
          };
        }
      }

      // Scientific/standard mode
      const sanitized = expression
        .replace(/\^/g, '**') // Allow ^ for power
        .replace(/[^0-9+\-*/().,\s*]/gi, '')
        .trim();

      // Create safe eval context with extended Math functions
      const safeEval = new Function(
        'Math',
        `
        const {
          abs, acos, acosh, asin, asinh, atan, atanh, atan2,
          ceil, cbrt, exp, floor, log, log10, log2, max, min,
          pow, random, round, sign, sin, sinh, sqrt, tan, tanh,
          trunc, PI, E, LN2, LN10, LOG2E, LOG10E, SQRT1_2, SQRT2
        } = Math;

        // Add scientific functions
        const ln = log;
        const deg2rad = (deg) => deg * PI / 180;
        const rad2deg = (rad) => rad * 180 / PI;

        return ${sanitized};
      `
      );

      const result = safeEval(Math);

      // Add to history
      calculationHistory.push({
        expression,
        result,
        timestamp: Date.now(),
      });

      // Keep history limited to last 100 entries
      if (calculationHistory.length > 100) {
        calculationHistory.shift();
      }

      return {
        expression,
        result,
        formatted: typeof result === 'number' ? result.toFixed(6).replace(/\.?0+$/, '') : result,
        mode: mode || 'standard',
        steps: [
          `Input: ${expression}`,
          `Sanitized: ${sanitized}`,
          `Evaluated: ${result}`,
          `Formatted: ${typeof result === 'number' ? result.toFixed(6).replace(/\.?0+$/, '') : result}`,
        ],
        history: calculationHistory.slice(-10).reverse(), // Last 10 calculations
      };
    } catch (error) {
      throw new Error(`Failed to calculate: ${error instanceof Error ? error.message : 'Invalid expression'}`);
    }
  },
};
