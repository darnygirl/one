/**
 * AI Tools Panel - Client-Side Tool Execution
 *
 * Provides quick access to AI tools like calculator, weather, search, etc.
 * Tools are executed client-side using toolRegistry.execute()
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Cloud, Search, Globe, X } from 'lucide-react';
import { toolRegistry } from '@/lib/ai-tools/registry';
import { registerAllTools } from '@/lib/ai-tools/registerAllTools';

// Initialize tools
registerAllTools();

export function AIToolsPanel() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tools = [
    { id: 'calculator', name: 'Calculator', icon: Calculator, placeholder: 'Enter expression (e.g., sqrt(144) + 25 * 3)' },
    { id: 'weather', name: 'Weather', icon: Cloud, placeholder: 'Enter location (e.g., London)' },
    { id: 'web_search', name: 'Web Search', icon: Search, placeholder: 'Search query' },
    { id: 'translation', name: 'Translation', icon: Globe, placeholder: 'Enter text to translate' },
  ];

  const executeTool = async () => {
    if (!selectedTool || !input.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      let args: any = {};

      // Map inputs to tool parameters
      switch (selectedTool) {
        case 'calculator':
          args = { expression: input };
          break;
        case 'weather':
          args = { location: input };
          break;
        case 'web_search':
          args = { query: input, num_results: 10 };
          break;
        case 'translation':
          args = { text: input, target_language: 'es' }; // Default to Spanish
          break;
      }

      console.log('[AI Tools] Executing', selectedTool, 'with args:', args);
      const toolResult = await toolRegistry.execute(selectedTool, args);
      console.log('[AI Tools] Result:', toolResult);

      setResult(toolResult);
    } catch (error) {
      console.error('[AI Tools] Error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Tool execution failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.error) {
      return (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive font-medium">Error</p>
          <p className="text-sm mt-1">{result.error}</p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Result:</p>
        <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  if (!selectedTool) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => setSelectedTool(tool.id)}
          >
            <tool.icon className="h-5 w-5" />
            <span className="text-sm">{tool.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  const currentTool = tools.find(t => t.id === selectedTool);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {currentTool && <currentTool.icon className="h-5 w-5" />}
          <CardTitle className="text-lg">{currentTool?.name}</CardTitle>
          <Badge variant="secondary">AI Tool</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          setSelectedTool(null);
          setInput('');
          setResult(null);
        }}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentTool?.placeholder}
            onKeyDown={(e) => e.key === 'Enter' && executeTool()}
          />
          <Button onClick={executeTool} disabled={loading || !input.trim()}>
            {loading ? 'Running...' : 'Execute'}
          </Button>
        </div>

        {renderResult()}
      </CardContent>
    </Card>
  );
}
