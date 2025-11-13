/**
 * Time/Date Tool
 * Get current time in different timezones
 */

import type { ToolDefinition } from '../types';

export const timeTool: ToolDefinition = {
  name: 'get_time',
  description: 'Get current time and date in different timezones',
  category: 'utility',
  parameters: [
    {
      name: 'timezone',
      type: 'string',
      description: 'Timezone (e.g., "America/New_York", "Europe/London", "Asia/Tokyo", "UTC")',
      required: false,
    },
    {
      name: 'format',
      type: 'string',
      description: 'Time format: "12h" or "24h"',
      required: false,
      enum: ['12h', '24h'],
    },
  ],
  async execute({ timezone = 'UTC', format = '24h' }) {
    try {
      const now = new Date();

      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: format === '12h',
        weekday: 'long',
      };

      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);

      const result: any = {};
      parts.forEach(part => {
        result[part.type] = part.value;
      });

      const formatted = formatter.format(now);
      const timestamp = now.getTime();
      const iso = now.toISOString();

      return {
        timezone,
        formatted,
        timestamp,
        iso,
        year: result.year,
        month: result.month,
        day: result.day,
        weekday: result.weekday,
        hour: result.hour,
        minute: result.minute,
        second: result.second,
        dayPeriod: result.dayPeriod,
      };
    } catch (error) {
      throw new Error(`Failed to get time: ${error instanceof Error ? error.message : 'Invalid timezone'}`);
    }
  },
};
