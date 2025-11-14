/**
 * UIComponentEditor - Edit generated component code
 *
 * Features:
 * - Syntax highlighting (Monaco editor or CodeMirror)
 * - Live preview of changes
 * - Undo/redo functionality
 * - Save to component library
 */

import { useState, useCallback } from "react";
import type { OntologyComponentProps } from "../types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "../hooks";
import { cn } from "../utils";
import { Code, Save, Undo, Redo, Play, AlertCircle } from "lucide-react";

interface UIComponentEditorProps extends OntologyComponentProps {
  initialCode: string;
  componentName: string;
  language?: "tsx" | "jsx" | "html";
  onSave?: (code: string) => void;
  onPreview?: (code: string) => void;
  autoSave?: boolean;
}

interface HistoryEntry {
  code: string;
  timestamp: number;
}

export function UIComponentEditor({
  initialCode,
  componentName,
  language = "tsx",
  onSave,
  onPreview,
  autoSave = false,
  className,
}: UIComponentEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    `editor-history-${componentName}`,
    [{ code: initialCode, timestamp: Date.now() }]
  );
  const [historyIndex, setHistoryIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ code: newCode, timestamp: Date.now() });

      // Keep only last 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Auto-save if enabled
      if (autoSave) {
        handleSave(newCode);
      }

      // Basic syntax validation
      validateCode(newCode);
    },
    [history, historyIndex, autoSave]
  );

  const validateCode = (code: string) => {
    const errors: string[] = [];

    // Basic validation
    if (code.trim().length === 0) {
      errors.push("Code cannot be empty");
    }

    // Check for unmatched brackets
    const openBrackets = (code.match(/\{/g) || []).length;
    const closeBrackets = (code.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push("Unmatched curly brackets");
    }

    setErrors(errors);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex].code);
      validateCode(history[newIndex].code);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex].code);
      validateCode(history[newIndex].code);
    }
  };

  const handleSave = async (codeToSave?: string) => {
    setIsSaving(true);
    try {
      await onSave?.(codeToSave || code);
      // Success feedback would go here
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    onPreview?.(code);
  };

  const lineNumbers = code.split("\n").length;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>{componentName}</CardTitle>
            <Badge variant="secondary">{language.toUpperCase()}</Badge>
            {autoSave && <Badge variant="outline">Auto-save</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving || errors.length > 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {/* Error banner */}
        {errors.length > 0 && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                {errors.map((error, i) => (
                  <p key={i} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Code editor */}
        <div className="flex h-full">
          {/* Line numbers */}
          <div className="bg-muted/50 px-3 py-4 text-right border-r">
            <div className="text-xs text-muted-foreground font-mono space-y-1">
              {Array.from({ length: lineNumbers }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Code textarea */}
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 p-4 font-mono text-sm bg-background resize-none focus:outline-none"
            spellCheck={false}
            placeholder="Enter your component code here..."
          />
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{lineNumbers} lines</span>
            <span>{code.length} characters</span>
            <span>History: {historyIndex + 1}/{history.length}</span>
          </div>
          <div>
            {errors.length > 0 ? (
              <span className="text-destructive">{errors.length} error(s)</span>
            ) : (
              <span className="text-green-600">No errors</span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
