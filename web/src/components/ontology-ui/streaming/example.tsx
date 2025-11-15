/**
 * Complete AI Streaming Example
 * Demonstrates all streaming components working together
 */

import { useState } from 'react';
import {
  StreamingResponse,
  ThinkingIndicator,
  ToolCallDisplay,
  GenerativeUIContainer,
  CodeBlockStreaming,
  MarkdownStreaming,
} from './';
import type { StreamingMessage, ToolCall } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AIStreamingExample() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [currentStream, setCurrentStream] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Simulate AI response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: StreamingMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Show thinking
    setIsThinking(true);
    setThinkingProgress(0);

    // Simulate thinking progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setThinkingProgress(i);
    }

    setIsThinking(false);

    // Simulate tool call
    const toolCall: ToolCall = {
      id: 'call_' + Date.now(),
      name: 'search_database',
      arguments: { query: input, limit: 10 },
      status: 'running',
      timestamp: new Date(),
    };
    setToolCalls([toolCall]);

    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    toolCall.status = 'completed';
    toolCall.result = { count: 5, items: ['Result 1', 'Result 2'] };
    setToolCalls([{ ...toolCall }]);

    // Stream response
    setIsStreaming(true);
    const response = `Based on your query "${input}", I found several interesting results.\n\nHere's a code example:\n\n\`\`\`typescript\nconst results = await searchDatabase({ query: "${input}", limit: 10 });\nconsole.log(\`Found \${results.count} items\`);\n\`\`\`\n\n**Summary:**\n- Found 5 matching items\n- Query executed in 120ms\n- Results are sorted by relevance`;

    // Simulate streaming
    for (let i = 0; i <= response.length; i += 5) {
      setCurrentStream(response.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Add complete message
    const aiMessage: StreamingMessage = {
      id: (Date.now() + 1).toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
    setCurrentStream('');
    setIsStreaming(false);
    setToolCalls([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>AI Streaming Components Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Demonstrates all streaming components: responses, thinking indicators,
            tool calls, code blocks, and markdown rendering.
          </p>
        </CardContent>
      </Card>

      {/* Chat messages */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <Card key={msg.id}>
            <CardContent className="pt-6">
              {msg.role === 'user' ? (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium mb-1">You</p>
                  <p>{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium mb-2">AI Assistant</p>
                  <MarkdownStreaming
                    content={msg.content}
                    isStreaming={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <ThinkingIndicator
            isThinking={true}
            message="Analyzing your request..."
            progress={thinkingProgress}
            stage="Processing query"
            variant="dots"
          />
        )}

        {/* Tool calls */}
        {toolCalls.map((call) => (
          <ToolCallDisplay
            key={call.id}
            toolCall={call}
            defaultExpanded={true}
          />
        ))}

        {/* Streaming response */}
        {isStreaming && currentStream && (
          <Card>
            <CardContent className="pt-6">
              <p className="font-medium mb-2">AI Assistant</p>
              <MarkdownStreaming
                content={currentStream}
                isStreaming={true}
                showCursor={true}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isStreaming || isThinking}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isStreaming || isThinking || !input.trim()}
        >
          {isStreaming || isThinking ? 'Processing...' : 'Send'}
        </Button>
      </form>

      {/* Component showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Component Showcase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code block example */}
          <div>
            <h3 className="font-medium mb-2">Code Block with Streaming</h3>
            <CodeBlockStreaming
              code={`function fibonacci(n: number): number {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10)); // 55`}
              language="typescript"
              filename="fibonacci.ts"
              showLineNumbers={true}
            />
          </div>

          {/* Generative UI example */}
          <div>
            <h3 className="font-medium mb-2">Generative UI Container</h3>
            <GenerativeUIContainer loading={false}>
              <div className="p-4 space-y-2">
                <p className="font-medium">Dynamically Generated Content</p>
                <p className="text-sm text-muted-foreground">
                  This content is safely rendered inside an error boundary.
                </p>
              </div>
            </GenerativeUIContainer>
          </div>

          {/* Thinking variants */}
          <div>
            <h3 className="font-medium mb-2">Thinking Indicators</h3>
            <div className="space-y-2">
              <ThinkingIndicator
                message="Dots variant"
                variant="dots"
              />
              <ThinkingIndicator
                message="Spinner variant"
                variant="spinner"
              />
              <ThinkingIndicator
                message="Pulse variant"
                variant="pulse"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
