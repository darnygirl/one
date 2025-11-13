/**
 * Calculator Tool
 * Perform mathematical calculations
 */

import type { ToolDefinition } from '../types';

export const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'Perform mathematical calculations and evaluate expressions',
  category: 'utility',
  parameters: [
    {
      name: 'expression',
      type: 'string',
      description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(45)")',
      required: true,
    },
  ],
  async execute({ expression }) {
    try {
      // Safe math evaluation using Function constructor with restricted scope
      const sanitized = expression
        .replace(/[^0-9+\-*/().,\s]/gi, '') // Remove potentially dangerous characters
        .trim();

      // Create a safe eval context with Math functions
      const safeEval = new Function(
        'Math',
        `
        const {
          abs, acos, acosh, asin, asinh, atan, atanh, atan2,
          ceil, cbrt, exp, floor, log, log10, log2, max, min,
          pow, random, round, sign, sin, sinh, sqrt, tan, tanh,
          trunc, PI, E
        } = Math;
        return ${sanitized};
      `
      );

      const result = safeEval(Math);

      return {
        expression,
        result,
        formatted: typeof result === 'number' ? result.toFixed(6).replace(/\.?0+$/, '') : result,
      };
    } catch (error) {
      throw new Error(`Failed to calculate: ${error instanceof Error ? error.message : 'Invalid expression'}`);
    }
  },
};
