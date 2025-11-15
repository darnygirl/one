import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface NetworkNode {
  id: string;
  label: string;
  type?: string;
  cluster?: string;
  data?: Record<string, unknown>;
}

export interface NetworkLink {
  source: string;
  target: string;
  label?: string;
  strength?: number;
  type?: string;
}

export interface NetworkDiagramProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  title?: string;
  showClusters?: boolean;
  interactive?: boolean;
  layoutType?: "force" | "hierarchical" | "radial" | "circular";
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
}

const clusterColors: Record<string, string> = {
  default: "hsl(var(--primary))",
  cluster1: "hsl(var(--chart-1))",
  cluster2: "hsl(var(--chart-2))",
  cluster3: "hsl(var(--chart-3))",
  cluster4: "hsl(var(--chart-4))",
  cluster5: "hsl(var(--chart-5))",
};

export function NetworkDiagram({
  nodes: inputNodes,
  links: inputLinks,
  title = "Network Diagram",
  showClusters = true,
  interactive = true,
  layoutType = "force",
  onNodeClick,
  onLinkClick,
}: NetworkDiagramProps) {
  const [layout, setLayout] = useState(layoutType);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Convert input data to ReactFlow format
  const initialNodes: Node[] = inputNodes.map((node, index) => {
    const position = getNodePosition(index, inputNodes.length, layout);

    return {
      id: node.id,
      type: "default",
      position,
      data: {
        label: (
          <div className="flex flex-col items-center gap-1">
            <div className="font-medium text-sm">{node.label}</div>
            {node.type && (
              <Badge variant="secondary" className="text-xs">
                {node.type}
              </Badge>
            )}
          </div>
        ),
        ...node.data,
      },
      style: {
        background: showClusters
          ? clusterColors[node.cluster || "default"]
          : "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        border: "2px solid hsl(var(--border))",
        borderRadius: "8px",
        padding: "10px",
        minWidth: "100px",
      },
    };
  });

  const initialEdges: Edge[] = inputLinks.map((link, index) => ({
    id: `edge-${index}`,
    source: link.source,
    target: link.target,
    label: link.label,
    animated: (link.strength || 0) > 0.7,
    style: {
      stroke: "hsl(var(--muted-foreground))",
      strokeWidth: Math.max(1, (link.strength || 0.5) * 4),
    },
    labelStyle: {
      fill: "hsl(var(--foreground))",
      fontSize: "12px",
    },
    labelBgStyle: {
      fill: "hsl(var(--background))",
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Layout algorithms
  function getNodePosition(
    index: number,
    total: number,
    layoutType: string
  ): { x: number; y: number } {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (layoutType) {
      case "circular": {
        const angle = (index * 2 * Math.PI) / total;
        const radius = Math.min(width, height) / 3;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      case "hierarchical": {
        const levels = Math.ceil(Math.sqrt(total));
        const level = Math.floor(index / levels);
        const posInLevel = index % levels;
        return {
          x: (posInLevel * width) / levels,
          y: (level * height) / levels,
        };
      }

      case "radial": {
        const rings = Math.ceil(Math.sqrt(total));
        const ring = Math.floor(index / rings);
        const posInRing = index % rings;
        const angle = (posInRing * 2 * Math.PI) / rings;
        const radius = ((ring + 1) * Math.min(width, height)) / (2 * rings);
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      default: // force
        return {
          x: Math.random() * width,
          y: Math.random() * height,
        };
    }
  }

  const handleLayoutChange = (newLayout: string) => {
    setLayout(newLayout as typeof layout);

    // Reposition nodes based on new layout
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: getNodePosition(index, nodes.length, newLayout),
    }));

    setNodes(updatedNodes);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    const originalNode = inputNodes.find((n) => n.id === node.id);
    if (originalNode) {
      setSelectedNode(originalNode);
      onNodeClick?.(originalNode);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            <Select value={layout} onValueChange={handleLayoutChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">Force</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
                <SelectItem value="circular">Circular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full border rounded-lg overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            connectionMode={ConnectionMode.Loose}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} />
            <Controls />
            <Panel position="top-right" className="bg-background p-2 rounded-lg shadow-lg">
              <div className="text-sm space-y-1">
                <div className="font-medium">Network Stats</div>
                <div className="text-muted-foreground">
                  Nodes: {nodes.length}
                </div>
                <div className="text-muted-foreground">
                  Links: {edges.length}
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="font-medium mb-2">Selected Node</div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>{" "}
                {selectedNode.id}
              </div>
              <div>
                <span className="text-muted-foreground">Label:</span>{" "}
                {selectedNode.label}
              </div>
              {selectedNode.type && (
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {selectedNode.type}
                </div>
              )}
              {selectedNode.cluster && (
                <div>
                  <span className="text-muted-foreground">Cluster:</span>{" "}
                  {selectedNode.cluster}
                </div>
              )}
            </div>
          </div>
        )}

        {showClusters && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {Array.from(new Set(inputNodes.map((n) => n.cluster).filter(Boolean))).map(
              (cluster) => (
                <Badge
                  key={cluster}
                  style={{
                    backgroundColor: clusterColors[cluster || "default"],
                  }}
                >
                  {cluster}
                </Badge>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
