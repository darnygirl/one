/**
 * Time/Date Tool
 * World clock, meeting time finder, countdowns, and date calculations
 */

import type { ToolDefinition } from '../types';

// Common holidays (simplified, US-centric for demo)
const holidays2024: Record<string, string> = {
  '2024-01-01': 'New Year\'s Day',
  '2024-02-14': 'Valentine\'s Day',
  '2024-07-04': 'Independence Day (US)',
  '2024-10-31': 'Halloween',
  '2024-12-25': 'Christmas',
  '2024-12-31': 'New Year\'s Eve',
};

// Business hours by timezone (9 AM - 5 PM local time)
const businessHours = { start: 9, end: 17 };

function getWorldClocks(timezones: string[]): any[] {
  const now = new Date();
  return timezones.map(tz => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        weekday: 'short',
      });
      const formatted = formatter.format(now);
      const parts = formatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');

      return {
        timezone: tz,
        time: formatted,
        hour,
        isBusinessHours: hour >= businessHours.start && hour < businessHours.end,
        formatted,
      };
    } catch (error) {
      return { timezone: tz, error: 'Invalid timezone' };
    }
  });
}

function findBestMeetingTime(timezones: string[]): any {
  const now = new Date();
  const bestHours: number[] = [];

  // Check each hour of the day
  for (let hour = 0; hour < 24; hour++) {
    const testDate = new Date(now);
    testDate.setHours(hour, 0, 0, 0);

    let allInBusinessHours = true;
    for (const tz of timezones) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          hour12: false,
        });
        const parts = formatter.formatToParts(testDate);
        const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');

        if (tzHour < businessHours.start || tzHour >= businessHours.end) {
          allInBusinessHours = false;
          break;
        }
      } catch (error) {
        allInBusinessHours = false;
        break;
      }
    }

    if (allInBusinessHours) {
      bestHours.push(hour);
    }
  }

  return {
    bestHours,
    formatted: bestHours.map(h => `${h}:00 UTC`),
    hasOverlap: bestHours.length > 0,
    overlappingHours: bestHours.length,
  };
}

function calculateCountdown(targetDate: string): any {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) {
    return {
      expired: true,
      message: 'Target date has passed',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diff / 1000),
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  };
}

function calculateDateDifference(date1: string, date2: string): any {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44); // Average month length
  const years = Math.floor(days / 365.25); // Account for leap years

  return {
    days,
    weeks,
    months,
    years,
    formatted: years > 0 ? `${years} years, ${months % 12} months` : `${months} months, ${days % 30} days`,
  };
}

function getHolidays(year: number, month?: number): any[] {
  const holidays: any[] = [];

  for (const [date, name] of Object.entries(holidays2024)) {
    const [y, m, d] = date.split('-').map(Number);
    if (month && m !== month) continue;

    holidays.push({
      date,
      name,
      dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
    });
  }

  return holidays;
}

export const timeTool: ToolDefinition = {
  name: 'get_time',
  description: 'World clock, meeting time finder, countdown timers, date calculations, and holiday lookups',
  category: 'utility',
  parameters: [
    {
      name: 'mode',
      type: 'string',
      description: 'Operation mode: "current", "world_clock", "meeting_time", "countdown", "date_calc", "holidays"',
      required: false,
      enum: ['current', 'world_clock', 'meeting_time', 'countdown', 'date_calc', 'holidays'],
    },
    {
      name: 'timezone',
      type: 'string',
      description: 'Timezone (e.g., "America/New_York", "Europe/London", "Asia/Tokyo", "UTC")',
      required: false,
    },
    {
      name: 'timezones',
      type: 'array',
      description: 'Array of timezones for world clock or meeting time finder',
      required: false,
    },
    {
      name: 'target_date',
      type: 'string',
      description: 'Target date for countdown (ISO format: YYYY-MM-DD)',
      required: false,
    },
    {
      name: 'date1',
      type: 'string',
      description: 'First date for date calculation (ISO format)',
      required: false,
    },
    {
      name: 'date2',
      type: 'string',
      description: 'Second date for date calculation (ISO format)',
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
  async execute({
    mode = 'current',
    timezone = 'UTC',
    timezones = [],
    target_date,
    date1,
    date2,
    format = '24h'
  }) {
    try {
      const now = new Date();

      // World Clock Mode
      if (mode === 'world_clock' && timezones.length > 0) {
        return {
          mode: 'world_clock',
          clocks: getWorldClocks(timezones),
          timestamp: now.getTime(),
        };
      }

      // Meeting Time Finder
      if (mode === 'meeting_time' && timezones.length > 0) {
        return {
          mode: 'meeting_time',
          timezones,
          ...findBestMeetingTime(timezones),
        };
      }

      // Countdown Timer
      if (mode === 'countdown' && target_date) {
        return {
          mode: 'countdown',
          target: target_date,
          ...calculateCountdown(target_date),
        };
      }

      // Date Calculation
      if (mode === 'date_calc' && date1 && date2) {
        return {
          mode: 'date_calc',
          from: date1,
          to: date2,
          ...calculateDateDifference(date1, date2),
        };
      }

      // Holidays
      if (mode === 'holidays') {
        return {
          mode: 'holidays',
          year: now.getFullYear(),
          holidays: getHolidays(now.getFullYear()),
        };
      }

      // Current Time (default)
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
        mode: 'current',
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
