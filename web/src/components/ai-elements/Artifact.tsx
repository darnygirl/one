/**
 * Artifact Component (Vibe Coding)
 *
 * Display code or documents as artifacts
 * Can be edited, copied, or downloaded
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from './CodeBlock';

interface ArtifactProps {
  title: string;
  type: 'code' | 'document' | 'data';
  content: string;
  language?: string;
  description?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

export function Artifact({
  title,
  type,
  content,
  language = 'text',
  description,
  editable = false,
  onEdit,
}: ArtifactProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const typeIcons = {
    code: '💻',
    document: '📄',
    data: '📊',
  };

  const typeColors = {
    code: 'from-blue-500 to-cyan-500',
    document: 'from-green-500 to-emerald-500',
    data: 'from-purple-500 to-pink-500',
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="my-4 border-2 border-violet-200 dark:border-violet-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[type]} flex items-center justify-center`}>
              <span className="text-lg">{typeIcons[type]}</span>
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{type}</Badge>
            {language !== 'text' && (
              <Badge variant="outline">{language}</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {editable && !isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                💾 Download
              </Button>
            </div>
          </div>

          <TabsContent value="preview">
            {type === 'code' ? (
              <CodeBlock
                code={isEditing ? editedContent : content}
                language={language}
                showLineNumbers={true}
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {isEditing ? editedContent : content}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    ✓ Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditedContent(content);
                      setIsEditing(false);
                    }}
                  >
                    ✗ Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <CodeBlock
                code={content}
                language={language}
                showLineNumbers={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
