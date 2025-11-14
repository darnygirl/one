/**
 * Chain Builder UI Component
 * Visual editor for creating and managing tool chains
 */

import { useState, useCallback, useEffect } from 'react';
import type { Chain, ChainNode, ChainEdge } from '@/lib/ai-tools/chain/types';
import { toolRegistry } from '@/lib/ai-tools/registry';
import { executeChain } from '@/lib/ai-tools/chain/executor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Play, Save, Download, Upload, Plus, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ChainBuilderProps {
  onChainExecute?: (result: any) => void;
}

export function ChainBuilder({ onChainExecute }: ChainBuilderProps) {
  const [chain, setChain] = useState<Chain>({
    id: crypto.randomUUID(),
    name: 'New Chain',
    description: '',
    nodes: [],
    edges: [],
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [showEdgeDialog, setShowEdgeDialog] = useState(false);
  const [edgeSource, setEdgeSource] = useState<string>('');
  const [edgeTarget, setEdgeTarget] = useState<string>('');

  const tools = toolRegistry.list();

  // Load chain from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chainBuilder:currentChain');
    if (saved) {
      try {
        setChain(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved chain:', error);
      }
    }
  }, []);

  // Save chain to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chainBuilder:currentChain', JSON.stringify(chain));
  }, [chain]);

  const addNode = useCallback((toolName: string) => {
    const newNode: ChainNode = {
      id: crypto.randomUUID(),
      toolName,
      label: toolName,
      parameters: {},
      position: { x: 100 + chain.nodes.length * 50, y: 100 + chain.nodes.length * 50 },
    };

    setChain((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));

    setShowAddNodeDialog(false);
  }, [chain.nodes.length]);

  const removeNode = useCallback((nodeId: string) => {
    setChain((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId),
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const addEdge = useCallback(() => {
    if (!edgeSource || !edgeTarget) return;

    const newEdge: ChainEdge = {
      id: crypto.randomUUID(),
      sourceNodeId: edgeSource,
      targetNodeId: edgeTarget,
      sourceOutputKey: 'result',
      targetInputKey: 'input',
    };

    setChain((prev) => ({
      ...prev,
      edges: [...prev.edges, newEdge],
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));

    setShowEdgeDialog(false);
    setEdgeSource('');
    setEdgeTarget('');
  }, [edgeSource, edgeTarget]);

  const removeEdge = useCallback((edgeId: string) => {
    setChain((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
  }, []);

  const updateNodeParameter = useCallback((nodeId: string, key: string, value: any) => {
    setChain((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, parameters: { ...node.parameters, [key]: value } }
          : node
      ),
      metadata: {
        ...prev.metadata,
        updated: new Date().toISOString(),
      },
    }));
  }, []);

  const updateEdgeMapping = useCallback(
    (edgeId: string, sourceKey: string, targetKey: string) => {
      setChain((prev) => ({
        ...prev,
        edges: prev.edges.map((edge) =>
          edge.id === edgeId
            ? { ...edge, sourceOutputKey: sourceKey, targetInputKey: targetKey }
            : edge
        ),
        metadata: {
          ...prev.metadata,
          updated: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const executeCurrentChain = useCallback(async () => {
    if (chain.nodes.length === 0) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executeChain(chain, {}, {
        onNodeStart: (nodeId) => {
          console.log('Starting node:', nodeId);
        },
        onNodeComplete: (nodeId, result) => {
          console.log('Completed node:', nodeId, result);
        },
        onNodeError: (nodeId, error) => {
          console.error('Error in node:', nodeId, error);
        },
        onProgress: (completed, total) => {
          console.log(`Progress: ${completed}/${total}`);
        },
      });

      setExecutionResult(result);
      onChainExecute?.(result);
    } catch (error) {
      console.error('Chain execution failed:', error);
      setExecutionResult({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [chain, onChainExecute]);

  const saveChain = useCallback(() => {
    const blob = new Blob([JSON.stringify(chain, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chain.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chain]);

  const loadChain = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loaded = JSON.parse(e.target?.result as string);
        setChain(loaded);
      } catch (error) {
        console.error('Failed to load chain:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  const newChain = useCallback(() => {
    setChain({
      id: crypto.randomUUID(),
      name: 'New Chain',
      description: '',
      nodes: [],
      edges: [],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    });
    setSelectedNode(null);
    setExecutionResult(null);
  }, []);

  const selectedNodeData = selectedNode
    ? chain.nodes.find((n) => n.id === selectedNode)
    : null;

  const selectedTool = selectedNodeData
    ? toolRegistry.get(selectedNodeData.toolName)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Chain Builder</CardTitle>
              <CardDescription>Create and execute tool chains</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={newChain}>
                New Chain
              </Button>
              <Button variant="outline" size="sm" onClick={saveChain}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={loadChain}
                />
              </label>
              <Button
                size="sm"
                onClick={executeCurrentChain}
                disabled={isExecuting || chain.nodes.length === 0}
              >
                <Play className="w-4 h-4 mr-1" />
                {isExecuting ? 'Running...' : 'Run Chain'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chain-name">Chain Name</Label>
              <Input
                id="chain-name"
                value={chain.name}
                onChange={(e) => setChain({ ...chain, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="chain-description">Description</Label>
              <Input
                id="chain-description"
                value={chain.description}
                onChange={(e) => setChain({ ...chain, description: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="grid grid-cols-3 gap-4">
        {/* Nodes List */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Nodes</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddNodeDialog(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {chain.nodes.length === 0 && (
              <p className="text-sm text-muted-foreground">No nodes yet. Add a tool to get started.</p>
            )}
            {chain.nodes.map((node, index) => (
              <div
                key={node.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedNode === node.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{node.label || node.toolName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{node.toolName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Node Editor */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">
              {selectedNodeData ? 'Configure Node' : 'Select a node to configure'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {selectedNodeData && selectedTool ? (
              <>
                <div>
                  <Label htmlFor="node-label">Node Label</Label>
                  <Input
                    id="node-label"
                    value={selectedNodeData.label || ''}
                    onChange={(e) =>
                      setChain((prev) => ({
                        ...prev,
                        nodes: prev.nodes.map((n) =>
                          n.id === selectedNode ? { ...n, label: e.target.value } : n
                        ),
                      }))
                    }
                    placeholder={selectedTool.name}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Parameters</h4>
                  {selectedTool.parameters.map((param) => (
                    <div key={param.name}>
                      <Label htmlFor={`param-${param.name}`}>
                        {param.name}
                        {param.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <p className="text-xs text-muted-foreground mb-1">
                        {param.description}
                      </p>
                      {param.enum ? (
                        <Select
                          value={selectedNodeData.parameters[param.name] || ''}
                          onValueChange={(value) =>
                            updateNodeParameter(selectedNode!, param.name, value)
                          }
                        >
                          <SelectTrigger id={`param-${param.name}`}>
                            <SelectValue placeholder={`Select ${param.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {param.enum.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`param-${param.name}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={selectedNodeData.parameters[param.name] || ''}
                          onChange={(e) =>
                            updateNodeParameter(
                              selectedNode!,
                              param.name,
                              param.type === 'number'
                                ? parseFloat(e.target.value)
                                : e.target.value
                            )
                          }
                          placeholder={`Enter ${param.name}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a node from the list to configure its parameters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Connections</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEdgeDialog(true)}
              disabled={chain.nodes.length < 2}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chain.edges.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No connections yet. Connect nodes to pass data between them.
            </p>
          )}
          <div className="space-y-2">
            {chain.edges.map((edge) => {
              const sourceNode = chain.nodes.find((n) => n.id === edge.sourceNodeId);
              const targetNode = chain.nodes.find((n) => n.id === edge.targetNodeId);

              return (
                <div
                  key={edge.id}
                  className="flex items-center gap-2 p-2 border rounded-lg"
                >
                  <div className="flex-1 flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{sourceNode?.label || sourceNode?.toolName}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {edge.sourceOutputKey}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="secondary">{targetNode?.label || targetNode?.toolName}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {edge.targetInputKey}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEdge(edge.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Execution Result */}
      {executionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Execution Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    executionResult.status === 'success'
                      ? 'default'
                      : executionResult.status === 'partial'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {executionResult.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Duration: {executionResult.totalDuration}ms
                </span>
              </div>
              <Textarea
                value={JSON.stringify(executionResult, null, 2)}
                readOnly
                className="font-mono text-xs h-48"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Node Dialog */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Node</DialogTitle>
            <DialogDescription>Select a tool to add to the chain</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {tools.map((tool) => (
              <Button
                key={tool.name}
                variant="outline"
                className="justify-start"
                onClick={() => addNode(tool.name)}
              >
                <div className="text-left">
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Edge Dialog */}
      <Dialog open={showEdgeDialog} onOpenChange={setShowEdgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Connection</DialogTitle>
            <DialogDescription>Connect two nodes to pass data between them</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edge-source">Source Node</Label>
              <Select value={edgeSource} onValueChange={setEdgeSource}>
                <SelectTrigger id="edge-source">
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {chain.nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label || node.toolName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edge-target">Target Node</Label>
              <Select value={edgeTarget} onValueChange={setEdgeTarget}>
                <SelectTrigger id="edge-target">
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {chain.nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id} disabled={node.id === edgeSource}>
                      {node.label || node.toolName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdgeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addEdge} disabled={!edgeSource || !edgeTarget}>
              Add Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
