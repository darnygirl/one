/**
 * Tool Settings Component
 * Settings panel for API keys, preferences, and tool management
 */

import { useState, useEffect } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';
import type { ToolDefinition } from '@/lib/ai-tools/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ToolPreferences {
  weatherUnits: 'metric' | 'imperial';
  timeFormat: '12h' | '24h';
  defaultLanguage: string;
  theme: 'light' | 'dark' | 'system';
}

const PREFERENCES_KEY = 'ai-tools-preferences';
const API_KEYS_KEY = 'ai-tools-api-keys';

const defaultPreferences: ToolPreferences = {
  weatherUnits: 'metric',
  timeFormat: '24h',
  defaultLanguage: 'en',
  theme: 'system',
};

export function ToolSettings() {
  const [preferences, setPreferences] = useState<ToolPreferences>(defaultPreferences);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [, forceUpdate] = useState(0);

  // Load preferences and API keys on mount
  useEffect(() => {
    loadPreferences();
    loadApiKeys();
  }, []);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = (newPrefs: ToolPreferences) => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const loadApiKeys = () => {
    try {
      const stored = localStorage.getItem(API_KEYS_KEY);
      if (stored) {
        setApiKeys(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const saveApiKey = (service: string, key: string) => {
    const newKeys = { ...apiKeys, [service]: key };
    try {
      localStorage.setItem(API_KEYS_KEY, JSON.stringify(newKeys));
      setApiKeys(newKeys);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  const deleteApiKey = (service: string) => {
    const newKeys = { ...apiKeys };
    delete newKeys[service];
    try {
      localStorage.setItem(API_KEYS_KEY, JSON.stringify(newKeys));
      setApiKeys(newKeys);
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const clearAllData = () => {
    toolRegistry.clearUsage();
    toolRegistry.clearFavorites();
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(API_KEYS_KEY);
    setPreferences(defaultPreferences);
    setApiKeys({});
    forceUpdate(n => n + 1);
  };

  const exportSettings = () => {
    const data = {
      preferences,
      apiKeys,
      favorites: Array.from(toolRegistry.favorites),
      usage: Object.fromEntries(toolRegistry.usage.entries()),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tools-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.preferences) {
          savePreferences(data.preferences);
        }

        if (data.apiKeys) {
          localStorage.setItem(API_KEYS_KEY, JSON.stringify(data.apiKeys));
          setApiKeys(data.apiKeys);
        }

        if (data.favorites) {
          data.favorites.forEach((name: string) => toolRegistry.addFavorite(name));
        }

        if (data.usage) {
          Object.entries(data.usage).forEach(([name, stats]) => {
            toolRegistry.usage.set(name, stats as any);
          });
        }

        forceUpdate(n => n + 1);
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const toggleApiKeyVisibility = (service: string) => {
    setShowApiKeys(prev => ({ ...prev, [service]: !prev[service] }));
  };

  // Services that commonly need API keys
  const apiKeyServices = [
    { name: 'OpenAI', key: 'openai', description: 'For AI-powered features' },
    { name: 'Google Maps', key: 'google_maps', description: 'For location services' },
    { name: 'Weather API', key: 'weather', description: 'Alternative weather provider' },
    { name: 'Currency Exchange', key: 'currency', description: 'Real-time exchange rates' },
  ];

  const stats = {
    totalTools: toolRegistry.list().length,
    favorites: toolRegistry.listFavorites().length,
    totalUsage: Array.from(toolRegistry.usage.values()).reduce((sum, s) => sum + s.count, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Tool Settings</h2>
        <p className="text-muted-foreground">
          Manage your preferences, API keys, and tool configurations
        </p>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.totalTools}</div>
              <div className="text-sm text-muted-foreground">Total Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.favorites}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.totalUsage}</div>
              <div className="text-sm text-muted-foreground">Total Uses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize default settings for tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weather Units */}
          <div className="space-y-2">
            <Label htmlFor="weather-units">Weather Units</Label>
            <Select
              value={preferences.weatherUnits}
              onValueChange={(value: 'metric' | 'imperial') =>
                savePreferences({ ...preferences, weatherUnits: value })
              }
            >
              <SelectTrigger id="weather-units">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (°C, km/h)</SelectItem>
                <SelectItem value="imperial">Imperial (°F, mph)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label htmlFor="time-format">Time Format</Label>
            <Select
              value={preferences.timeFormat}
              onValueChange={(value: '12h' | '24h') =>
                savePreferences({ ...preferences, timeFormat: value })
              }
            >
              <SelectTrigger id="time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default Language */}
          <div className="space-y-2">
            <Label htmlFor="default-language">Default Language</Label>
            <Select
              value={preferences.defaultLanguage}
              onValueChange={(value) =>
                savePreferences({ ...preferences, defaultLanguage: value })
              }
            >
              <SelectTrigger id="default-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') =>
                savePreferences({ ...preferences, theme: value })
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Store API keys securely in your browser (localStorage)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeyServices.map(service => (
            <div key={service.key} className="space-y-2">
              <Label htmlFor={`api-${service.key}`}>
                {service.name}
                {apiKeys[service.key] && (
                  <Badge variant="secondary" className="ml-2">
                    Configured
                  </Badge>
                )}
              </Label>
              <p className="text-xs text-muted-foreground">{service.description}</p>
              <div className="flex gap-2">
                <Input
                  id={`api-${service.key}`}
                  type={showApiKeys[service.key] ? 'text' : 'password'}
                  placeholder={`Enter ${service.name} API key`}
                  value={apiKeys[service.key] || ''}
                  onChange={(e) => saveApiKey(service.key, e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleApiKeyVisibility(service.key)}
                >
                  {showApiKeys[service.key] ? '👁️' : '👁️‍🗨️'}
                </Button>
                {apiKeys[service.key] && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteApiKey(service.key)}
                  >
                    🗑️
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or clear your settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            {/* Export */}
            <Button variant="outline" onClick={exportSettings} className="w-full">
              Export Settings
            </Button>

            {/* Import */}
            <div>
              <Input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
                id="import-settings"
              />
              <Label htmlFor="import-settings">
                <Button variant="outline" className="w-full" asChild>
                  <span>Import Settings</span>
                </Button>
              </Label>
            </div>

            <Separator className="my-2" />

            {/* Clear Usage */}
            <Button
              variant="outline"
              onClick={() => {
                toolRegistry.clearUsage();
                forceUpdate(n => n + 1);
              }}
              className="w-full"
            >
              Clear Usage History
            </Button>

            {/* Clear Favorites */}
            <Button
              variant="outline"
              onClick={() => {
                toolRegistry.clearFavorites();
                forceUpdate(n => n + 1);
              }}
              className="w-full"
            >
              Clear Favorites
            </Button>

            {/* Reset All */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Reset All Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset All Settings?</DialogTitle>
                  <DialogDescription>
                    This will clear all preferences, API keys, favorites, and usage history.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearAllData();
                      window.location.reload();
                    }}
                  >
                    Reset Everything
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
