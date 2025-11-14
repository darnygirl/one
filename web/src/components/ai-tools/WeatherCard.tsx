/**
 * Weather Card Component (Enhanced)
 * Displays current weather, 7-day forecast, alerts, and charts
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud, Wind, Droplets, Eye, Sun, Sunrise, Sunset,
  AlertTriangle, Gauge, CloudRain, CloudSnow
} from 'lucide-react';

interface ForecastDay {
  date: string;
  day_of_week: string;
  max_temp: number;
  min_temp: number;
  avg_temp: number;
  condition: string;
  condition_icon?: string;
  rain_chance: number;
  snow_chance: number;
  total_precip: number;
  humidity: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
}

interface WeatherAlert {
  type: string;
  message: string;
}

interface WeatherData {
  location: string;
  coordinates?: { lat: number; lon: number };
  current: {
    temperature: number;
    feels_like: number;
    condition: string;
    condition_icon?: string;
    humidity: number;
    wind_speed: number;
    wind_direction: string;
    visibility: number;
    uv_index: number;
    pressure: number;
    cloud_cover: number;
  };
  forecast?: ForecastDay[];
  alerts?: WeatherAlert[];
  units: string;
  timestamp?: string;
}

export function WeatherCard({ data }: { data: WeatherData }) {
  const tempUnit = data.units === 'imperial' ? '°F' : '°C';
  const speedUnit = data.units === 'imperial' ? 'mph' : 'km/h';
  const distUnit = data.units === 'imperial' ? 'mi' : 'km';

  // Get min/max from forecast for chart
  const temps = data.forecast?.map(f => ({ max: f.max_temp, min: f.min_temp })) || [];
  const maxTemp = temps.length > 0 ? Math.max(...temps.map(t => t.max)) : data.current.temperature;
  const minTemp = temps.length > 0 ? Math.min(...temps.map(t => t.min)) : data.current.temperature;
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, idx) => (
            <Alert key={idx} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.type}:</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            {data.location}
            {data.coordinates && (
              <span className="text-xs text-muted-foreground font-normal">
                ({data.coordinates.lat.toFixed(2)}, {data.coordinates.lon.toFixed(2)})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Temperature Display */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-6xl font-bold">{data.current.temperature}{tempUnit}</div>
              <div className="text-lg text-muted-foreground">
                Feels like {data.current.feels_like}{tempUnit}
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-xl px-4 py-2 mb-2">
                {data.current.condition}
              </Badge>
              {data.current.condition_icon && (
                <img src={data.current.condition_icon} alt={data.current.condition} className="w-16 h-16 ml-auto" />
              )}
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-base font-semibold">{data.current.humidity}%</div>
                <div className="text-xs text-muted-foreground">Humidity</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-base font-semibold">{data.current.wind_speed.toFixed(1)} {speedUnit}</div>
                <div className="text-xs text-muted-foreground">Wind {data.current.wind_direction}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-base font-semibold">{data.current.visibility} {distUnit}</div>
                <div className="text-xs text-muted-foreground">Visibility</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-base font-semibold">UV {data.current.uv_index}</div>
                <div className="text-xs text-muted-foreground">UV Index</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-base font-semibold">{data.current.pressure} mb</div>
                <div className="text-xs text-muted-foreground">Pressure</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-base font-semibold">{data.current.cloud_cover}%</div>
                <div className="text-xs text-muted-foreground">Cloud Cover</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Forecast */}
      {data.forecast && data.forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {data.forecast.length}-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.forecast.map((day, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  {/* Day */}
                  <div className="w-12 font-semibold text-sm">
                    {idx === 0 ? 'Today' : day.day_of_week}
                  </div>

                  {/* Icon & Condition */}
                  <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                    {day.condition_icon && (
                      <img src={day.condition_icon} alt={day.condition} className="w-10 h-10" />
                    )}
                    <span className="text-sm">{day.condition}</span>
                  </div>

                  {/* Precipitation Chances */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-[100px]">
                    {day.rain_chance > 0 && (
                      <div className="flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-blue-400" />
                        {day.rain_chance}%
                      </div>
                    )}
                    {day.snow_chance > 0 && (
                      <div className="flex items-center gap-1">
                        <CloudSnow className="w-3 h-3 text-blue-300" />
                        {day.snow_chance}%
                      </div>
                    )}
                  </div>

                  {/* Temperature Bar */}
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-sm font-medium text-blue-600 w-10 text-right">
                      {day.min_temp}°
                    </span>
                    <div className="flex-1 h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded-full relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-200 rounded-l-full"
                        style={{ width: `${((day.min_temp - minTemp) / tempRange) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 right-0 h-full bg-red-200 rounded-r-full"
                        style={{ width: `${((maxTemp - day.max_temp) / tempRange) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-red-600 w-10">
                      {day.max_temp}°
                    </span>
                  </div>

                  {/* Sun Times */}
                  <div className="flex gap-2 text-xs text-muted-foreground min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <Sunrise className="w-3 h-3" />
                      {day.sunrise}
                    </div>
                    <div className="flex items-center gap-1">
                      <Sunset className="w-3 h-3" />
                      {day.sunset}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
