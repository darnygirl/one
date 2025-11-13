/**
 * Currency Converter Tool
 * Convert between different currencies
 */

import type { ToolDefinition } from '../types';

export const currencyTool: ToolDefinition = {
  name: 'convert_currency',
  description: 'Convert amounts between different currencies',
  category: 'data',
  parameters: [
    {
      name: 'amount',
      type: 'number',
      description: 'Amount to convert',
      required: true,
    },
    {
      name: 'from',
      type: 'string',
      description: 'Source currency code (e.g., "USD", "EUR", "GBP", "JPY")',
      required: true,
    },
    {
      name: 'to',
      type: 'string',
      description: 'Target currency code',
      required: true,
    },
  ],
  async execute({ amount, from, to }) {
    try {
      // Using exchangerate-api.com (free tier available)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rate = data.rates[to.toUpperCase()];

      if (!rate) {
        throw new Error(`Currency ${to.toUpperCase()} not found`);
      }

      const converted = amount * rate;

      return {
        amount,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate,
        result: converted,
        formatted: `${amount.toFixed(2)} ${from.toUpperCase()} = ${converted.toFixed(2)} ${to.toUpperCase()}`,
        timestamp: data.time_last_updated,
      };
    } catch (error) {
      throw new Error(`Failed to convert currency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
