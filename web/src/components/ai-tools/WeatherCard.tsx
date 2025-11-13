/**
 * Weather Card Component
 * Displays weather information
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Wind, Droplets, Eye, Sun } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  feels_like: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  visibility: number;
  uv_index: number;
  units: string;
}

export function WeatherCard({ data }: { data: WeatherData }) {
  const tempUnit = data.units === 'imperial' ? '°F' : '°C';
  const speedUnit = data.units === 'imperial' ? 'mph' : 'km/h';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          {data.location}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{data.temperature}{tempUnit}</div>
            <div className="text-sm text-muted-foreground">
              Feels like {data.feels_like}{tempUnit}
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {data.condition}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{data.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">
                {data.wind_speed} {speedUnit}
              </div>
              <div className="text-xs text-muted-foreground">
                Wind {data.wind_direction}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">{data.visibility} km</div>
              <div className="text-xs text-muted-foreground">Visibility</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-sm font-medium">UV {data.uv_index}</div>
              <div className="text-xs text-muted-foreground">UV Index</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
