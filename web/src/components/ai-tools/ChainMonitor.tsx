/**
 * Chain Monitor Component
 * Real-time visualization of chain execution with monitoring and controls
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type {
  Chain,
  NodeExecutionResult,
  ExecutionResult,
} from '@/lib/ai-tools/chain/types';

export interface ChainMonitorProps {
  chain: Chain;
  onExecutionComplete?: (result: ExecutionResult) => void;
  onError?: (error: Error) => void;
}

interface NodeStatus {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: Error;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

export function ChainMonitor({
  chain,
  onExecutionComplete,
  onError,
}: ChainMonitorProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Map<string, NodeStatus>>(
    new Map()
  );
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(
    null
  );

  // Initialize node statuses
  useEffect(() => {
    const initialStatuses = new Map<string, NodeStatus>();
    chain.nodes.forEach((node) => {
      initialStatuses.set(node.id, {
        nodeId: node.id,
        status: 'pending',
      });
    });
    setNodeStatuses(initialStatuses);
  }, [chain]);

  /**
   * Start chain execution
   */
  const startExecution = useCallback(async () => {
    setIsExecuting(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setExecutionLogs([]);
    setCurrentNodeIndex(0);

    addLog('Chain execution started');

    try {
      // Import executor dynamically to avoid circular dependencies
      const { ChainExecutor } = await import('@/lib/ai-tools/chain/executor');
      const executor = new ChainExecutor();

      // Validate chain first
      const validation = executor.validateChain(chain);
      if (!validation.valid) {
        throw new Error(`Invalid chain: ${validation.errors.join(', ')}`);
      }

      addLog(`Executing ${chain.nodes.length} nodes...`);

      // Execute with callbacks
      const result = await executor.execute(
        chain,
        {},
        {
          onNodeStart: (nodeId) => {
            updateNodeStatus(nodeId, 'running', { startTime: Date.now() });
            const node = chain.nodes.find((n) => n.id === nodeId);
            addLog(`Starting: ${node?.label || nodeId}`);
          },
          onNodeComplete: (nodeId, result) => {
            updateNodeStatus(nodeId, 'completed', {
              result,
              endTime: Date.now(),
            });
            const node = chain.nodes.find((n) => n.id === nodeId);
            addLog(`Completed: ${node?.label || nodeId}`);
          },
          onNodeError: (nodeId, error) => {
            updateNodeStatus(nodeId, 'error', { error });
            const node = chain.nodes.find((n) => n.id === nodeId);
            addLog(`Error in ${node?.label || nodeId}: ${error.message}`);
          },
          onProgress: (completed, total) => {
            setCurrentNodeIndex(completed);
            addLog(`Progress: ${completed}/${total} nodes completed`);
          },
        }
      );

      setExecutionResult(result);
      setTotalDuration(Date.now() - (startTime || Date.now()));
      addLog(`Chain execution completed: ${result.status}`);

      onExecutionComplete?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      addLog(`Chain execution failed: ${err.message}`);
      onError?.(err);
    } finally {
      setIsExecuting(false);
    }
  }, [chain, onExecutionComplete, onError, startTime]);

  /**
   * Pause execution (Note: not fully implemented in executor yet)
   */
  const pauseExecution = useCallback(() => {
    setIsPaused(true);
    addLog('Execution paused');
  }, []);

  /**
   * Resume execution
   */
  const resumeExecution = useCallback(() => {
    setIsPaused(false);
    addLog('Execution resumed');
  }, []);

  /**
   * Update node status
   */
  const updateNodeStatus = useCallback(
    (
      nodeId: string,
      status: NodeStatus['status'],
      updates: Partial<NodeStatus> = {}
    ) => {
      setNodeStatuses((prev) => {
        const newStatuses = new Map(prev);
        const current = newStatuses.get(nodeId) || { nodeId, status: 'pending' };

        const updated: NodeStatus = {
          ...current,
          status,
          ...updates,
        };

        // Calculate duration if both times are available
        if (updated.startTime && updated.endTime) {
          updated.duration = updated.endTime - updated.startTime;
        }

        newStatuses.set(nodeId, updated);
        return newStatuses;
      });
    },
    []
  );

  /**
   * Add log entry
   */
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  /**
   * Export execution logs
   */
  const exportLogs = useCallback(() => {
    const logContent = executionLogs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chain-execution-${chain.id}-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Logs exported');
  }, [executionLogs, chain.id, addLog]);

  /**
   * Get status icon
   */
  const getStatusIcon = (status: NodeStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusVariant = (
    status: NodeStatus['status']
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'running':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'error':
        return 'destructive';
    }
  };

  const totalNodes = chain.nodes.length;
  const completedNodes = Array.from(nodeStatuses.values()).filter(
    (s) => s.status === 'completed'
  ).length;
  const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{chain.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {chain.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isExecuting && !executionResult && (
                <Button onClick={startExecution}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              {isExecuting && !isPaused && (
                <Button onClick={pauseExecution} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {isPaused && (
                <Button onClick={resumeExecution}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={exportLogs} variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {completedNodes}/{totalNodes} nodes
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Execution stats */}
          {(isExecuting || executionResult) && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Status</div>
                <Badge variant={isExecuting ? 'default' : 'secondary'}>
                  {isExecuting ? 'Running' : executionResult?.status || 'Idle'}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium">
                  {totalDuration > 0
                    ? `${(totalDuration / 1000).toFixed(2)}s`
                    : '0.00s'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Errors</div>
                <div className="font-medium text-red-500">
                  {executionResult?.errors.length || 0}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Node execution timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chain.nodes.map((node, index) => {
              const status = nodeStatuses.get(node.id);
              const isActive = status?.status === 'running';

              return (
                <div key={node.id}>
                  <div
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : status?.status === 'error'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : status?.status === 'completed'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-border'
                    }`}
                  >
                    {/* Status icon */}
                    <div className="mt-0.5">
                      {getStatusIcon(status?.status || 'pending')}
                    </div>

                    {/* Node info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{node.label || node.id}</span>
                        <Badge variant={getStatusVariant(status?.status || 'pending')}>
                          {status?.status || 'pending'}
                        </Badge>
                        <code className="text-xs text-muted-foreground">
                          {node.toolName}
                        </code>
                      </div>

                      {/* Performance metrics */}
                      {status?.duration !== undefined && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Duration: {status.duration}ms
                        </div>
                      )}

                      {/* Error details */}
                      {status?.error && (
                        <div className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <div className="text-sm text-red-700 dark:text-red-400">
                              {status.error.message}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Result preview */}
                      {status?.result && status.status === 'completed' && (
                        <details className="mt-2">
                          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                            View result
                          </summary>
                          <pre className="mt-2 p-2 rounded bg-muted text-xs overflow-x-auto">
                            {JSON.stringify(status.result, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>

                    {/* Connection indicator */}
                    {index < chain.nodes.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {index < chain.nodes.length - 1 && <Separator className="my-2" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Execution logs */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 max-h-64 overflow-y-auto font-mono text-xs">
            {executionLogs.length === 0 ? (
              <div className="text-muted-foreground">
                No logs yet. Start execution to see logs.
              </div>
            ) : (
              executionLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final result */}
      {executionResult && (
        <Card>
          <CardHeader>
            <CardTitle>Final Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <Badge
                    variant={
                      executionResult.status === 'success'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {executionResult.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Duration</div>
                  <div className="font-medium">
                    {(executionResult.totalDuration / 1000).toFixed(2)}s
                  </div>
                </div>
              </div>

              {executionResult.finalOutput && (
                <div>
                  <div className="text-sm font-medium mb-2">Output:</div>
                  <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(executionResult.finalOutput, null, 2)}
                  </pre>
                </div>
              )}

              {executionResult.errors.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 text-red-500">
                    Errors:
                  </div>
                  <div className="space-y-2">
                    {executionResult.errors.map((err, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20"
                      >
                        <div className="font-medium text-sm">
                          Node: {err.nodeId}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-400 mt-1">
                          {err.error.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
