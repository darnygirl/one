/**
 * Weather Tool (Enhanced)
 * Get weather information with 7-day forecast, alerts, and multiple location formats
 */

import type { ToolDefinition } from '../types';

export const weatherTool: ToolDefinition = {
  name: 'get_weather',
  description: 'Get current weather and 7-day forecast for a location. Supports city names, coordinates (lat,lon), and zip codes.',
  category: 'data',
  parameters: [
    {
      name: 'location',
      type: 'string',
      description: 'Location as city name ("San Francisco"), coordinates ("37.7749,-122.4194"), or zip code ("94102")',
      required: true,
    },
    {
      name: 'units',
      type: 'string',
      description: 'Temperature units (metric or imperial)',
      required: false,
      enum: ['metric', 'imperial'],
    },
    {
      name: 'forecast_days',
      type: 'number',
      description: 'Number of forecast days (1-7)',
      required: false,
    },
  ],
  async execute({ location, units = 'metric', forecast_days = 3 }) {
    try {
      // Using wttr.in API - no API key needed!
      const format = units === 'imperial' ? 'u' : 'm';
      const days = Math.min(Math.max(forecast_days, 1), 7); // Clamp between 1-7

      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1&${format}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      const current = data.current_condition[0];
      const location_info = data.nearest_area[0];
      const forecast = data.weather.slice(0, days);

      // Process forecast data
      const forecastData = forecast.map((day: any) => {
        const date = new Date(day.date);
        return {
          date: day.date,
          day_of_week: date.toLocaleDateString('en-US', { weekday: 'short' }),
          max_temp: parseInt(day.maxtempC),
          min_temp: parseInt(day.mintempC),
          avg_temp: parseInt(day.avgtempC),
          condition: day.hourly[4]?.weatherDesc[0]?.value || 'Unknown',
          condition_icon: day.hourly[4]?.weatherIconUrl[0]?.value || '',
          rain_chance: parseInt(day.hourly[4]?.chanceofrain || 0),
          snow_chance: parseInt(day.hourly[4]?.chanceofsnow || 0),
          total_precip: parseFloat(day.totalprecipMM || 0),
          humidity: parseInt(day.hourly[4]?.humidity || 0),
          uv_index: parseInt(day.uvIndex || 0),
          sunrise: day.astronomy[0]?.sunrise || '',
          sunset: day.astronomy[0]?.sunset || '',
        };
      });

      // Check for weather alerts (based on extreme conditions)
      const alerts = [];
      if (current.uvIndex >= 8) {
        alerts.push({ type: 'UV Warning', message: 'Very high UV index - take precautions' });
      }
      if (parseInt(current.windspeedKmph) > 50) {
        alerts.push({ type: 'Wind Alert', message: 'High wind speeds detected' });
      }
      if (parseInt(current.visibility) < 2) {
        alerts.push({ type: 'Visibility Warning', message: 'Low visibility conditions' });
      }

      return {
        location: `${location_info.areaName[0].value}, ${location_info.country[0].value}`,
        coordinates: {
          lat: parseFloat(location_info.latitude[0].value),
          lon: parseFloat(location_info.longitude[0].value),
        },
        current: {
          temperature: units === 'imperial' ? parseInt(current.temp_F) : parseInt(current.temp_C),
          feels_like: units === 'imperial' ? parseInt(current.FeelsLikeF) : parseInt(current.FeelsLikeC),
          condition: current.weatherDesc[0].value,
          condition_icon: current.weatherIconUrl[0].value,
          humidity: parseInt(current.humidity),
          wind_speed: units === 'imperial' ? parseFloat(current.windspeedMiles) : parseFloat(current.windspeedKmph),
          wind_direction: current.winddir16Point,
          visibility: units === 'imperial' ? parseFloat(current.visibilityMiles) : parseFloat(current.visibility),
          uv_index: parseInt(current.uvIndex),
          pressure: parseFloat(current.pressure),
          cloud_cover: parseInt(current.cloudcover),
        },
        forecast: forecastData,
        alerts: alerts,
        units: units,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get weather: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
