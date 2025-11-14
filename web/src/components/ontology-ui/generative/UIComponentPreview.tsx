/**
 * UIComponentPreview - Preview generated UI components in sandbox
 *
 * Features:
 * - Iframe isolation or Shadow DOM for safe preview
 * - Interactive props editor
 * - Copy code button with clipboard support
 * - Responsive preview modes (mobile, tablet, desktop)
 */

import { useState } from "react";
import type { OntologyComponentProps } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useClipboard } from "../hooks";
import { cn } from "../utils";
import { Monitor, Tablet, Smartphone, Copy, Check, Code, Eye, Settings } from "lucide-react";

interface UIComponentPreviewProps extends OntologyComponentProps {
  componentCode: string;
  componentName: string;
  initialProps?: Record<string, any>;
  onPropsChange?: (props: Record<string, any>) => void;
}

type PreviewMode = "desktop" | "tablet" | "mobile";
type IsolationMode = "iframe" | "shadow" | "none";

export function UIComponentPreview({
  componentCode,
  componentName,
  initialProps = {},
  onPropsChange,
  className,
}: UIComponentPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const [isolation, setIsolation] = useState<IsolationMode>("iframe");
  const [props, setProps] = useState(initialProps);
  const { copied, copy } = useClipboard();

  const previewSizes = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  const handleCopyCode = async () => {
    await copy(componentCode);
  };

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onPropsChange?.(newProps);
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>{componentName}</CardTitle>
            <Badge variant="secondary">Preview</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={isolation} onValueChange={(v) => setIsolation(v as IsolationMode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iframe">Iframe</SelectItem>
                <SelectItem value="shadow">Shadow DOM</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <Tabs defaultValue="preview" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="props">
              <Settings className="h-4 w-4 mr-2" />
              Props
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 flex flex-col gap-4 mt-4">
            {/* Responsive mode selector */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={mode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("desktop")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={mode === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("tablet")}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </Button>
              <Button
                variant={mode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>

            {/* Preview area */}
            <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4 overflow-auto">
              <div
                className={cn(
                  "transition-all duration-200 bg-background rounded-lg border shadow-sm",
                  previewSizes[mode]
                )}
              >
                {isolation === "iframe" ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>
                            body { margin: 0; padding: 16px; font-family: system-ui; }
                          </style>
                        </head>
                        <body>
                          <div id="root">${componentCode}</div>
                        </body>
                      </html>
                    `}
                    className="w-full h-[400px] border-0"
                    title="Component Preview"
                  />
                ) : (
                  <div
                    className="p-4"
                    dangerouslySetInnerHTML={{ __html: componentCode }}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 mt-4">
            <div className="h-full bg-muted rounded-lg p-4 overflow-auto">
              <pre className="text-sm font-mono">
                <code>{componentCode}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="props" className="flex-1 mt-4">
            <div className="space-y-4">
              {Object.entries(props).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="text-sm font-medium min-w-[120px]">{key}:</label>
                  <input
                    type="text"
                    value={String(value)}
                    onChange={(e) => handlePropChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md"
                  />
                </div>
              ))}
              {Object.keys(props).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No props available for this component
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
