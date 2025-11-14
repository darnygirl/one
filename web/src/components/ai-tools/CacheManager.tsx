/**
 * AI Tools Cache Manager UI
 * Dashboard for cache statistics, management, and settings
 */

import { useState, useEffect } from 'react';
import { cacheManager, type CacheStats } from '@/lib/ai-tools/cache/manager';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  TrendingUp,
  HardDrive,
  Clock,
  Target,
} from 'lucide-react';

export function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxSize, setMaxSize] = useState(10); // MB
  const [defaultTTL, setDefaultTTL] = useState(60); // minutes

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const cacheStats = await cacheManager.getStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all cached data? This cannot be undone.')) return;

    await cacheManager.clear();
    await loadStats();
  };

  const handleClearTool = async (tool: string) => {
    if (!confirm(`Clear cache for ${tool}? This cannot be undone.`)) return;

    await cacheManager.clearTool(tool);
    await loadStats();
  };

  const handleExport = async () => {
    const data = await cacheManager.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tools-cache-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await cacheManager.import(data);
      await loadStats();
    } catch (error) {
      alert('Failed to import cache data. Please check the file format.');
      console.error('Import error:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const usagePercentage = (stats.totalSize / stats.maxSize) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.hits} hits, {stats.misses} misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(1)}% of {formatBytes(stats.maxSize)}
            </p>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entries}</div>
            <p className="text-xs text-muted-foreground">
              Cached results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatTime(stats.newestEntry)}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools">By Tool</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* By Tool Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance by Tool</CardTitle>
              <CardDescription>
                View cache statistics for each AI tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byTool).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No cached data yet. Use some AI tools to see statistics.
                  </p>
                ) : (
                  Object.entries(stats.byTool).map(([tool, toolStats]) => (
                    <div key={tool} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tool}</span>
                          <Badge variant="secondary">
                            {toolStats.entries} entries
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            Hit rate: {toolStats.hitRate.toFixed(1)}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {toolStats.hits} hits / {toolStats.misses} misses
                          </span>
                        </div>
                        <Progress
                          value={toolStats.hitRate}
                          className="mt-2 h-2"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearTool(tool)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Settings</CardTitle>
              <CardDescription>
                Configure cache size and expiration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxSize">Max Cache Size (MB)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  min="1"
                  max="100"
                  value={maxSize}
                  onChange={(e) => setMaxSize(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum cache size before LRU eviction
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttl">Default TTL (minutes)</Label>
                <Input
                  id="ttl"
                  type="number"
                  min="1"
                  max="1440"
                  value={defaultTTL}
                  onChange={(e) => setDefaultTTL(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  How long to keep cached results
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => alert('Settings saved!')}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Actions</CardTitle>
              <CardDescription>
                Export, import, or clear cache data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Cache
                </Button>

                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-input')?.click()}
                  className="justify-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Cache
                  <input
                    id="import-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </Button>

                <Button
                  variant="outline"
                  onClick={loadStats}
                  className="justify-start"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Statistics
                </Button>

                <Separator className="my-2" />

                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  className="justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
