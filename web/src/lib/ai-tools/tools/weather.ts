/**
 * Weather Tool
 * Get weather information for any location
 */

import type { ToolDefinition } from '../types';

export const weatherTool: ToolDefinition = {
  name: 'get_weather',
  description: 'Get current weather information for a specific location',
  category: 'data',
  parameters: [
    {
      name: 'location',
      type: 'string',
      description: 'City name or location (e.g., "San Francisco, CA" or "London, UK")',
      required: true,
    },
    {
      name: 'units',
      type: 'string',
      description: 'Temperature units (metric or imperial)',
      required: false,
      enum: ['metric', 'imperial'],
    },
  ],
  async execute({ location, units = 'metric' }) {
    try {
      // Using wttr.in API - no API key needed!
      const format = units === 'imperial' ? 'u' : 'm';
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1&${format}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      const current = data.current_condition[0];
      const location_info = data.nearest_area[0];

      return {
        location: `${location_info.areaName[0].value}, ${location_info.country[0].value}`,
        temperature: parseInt(current.temp_C),
        feels_like: parseInt(current.FeelsLikeC),
        condition: current.weatherDesc[0].value,
        humidity: parseInt(current.humidity),
        wind_speed: parseFloat(current.windspeedKmph),
        wind_direction: current.winddir16Point,
        visibility: parseFloat(current.visibility),
        uv_index: parseInt(current.uvIndex),
        units: units,
      };
    } catch (error) {
      throw new Error(`Failed to get weather: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
