/**
 * ThingEditor - Editor for updating thing properties
 *
 * Allows editing of thing details, tags, metadata, and settings through tabbed interface
 */

import { useState } from "react";
import type { Thing, FormProps } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ThingEditorProps extends FormProps {
  thing: Thing;
  onSave?: (data: Partial<Thing>) => void;
  onCancel?: () => void;
}

export function ThingEditor({
  thing,
  onSave,
  onCancel,
  className,
}: ThingEditorProps) {
  const [formData, setFormData] = useState<Partial<Thing>>({
    name: thing.name,
    description: thing.description || "",
    tags: thing.tags || [],
    metadata: thing.metadata || {},
    status: thing.status || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [metadataKey, setMetadataKey] = useState("");
  const [metadataValue, setMetadataValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const addMetadata = () => {
    if (metadataKey.trim() && metadataValue.trim()) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          [metadataKey.trim()]: metadataValue.trim(),
        },
      });
      setMetadataKey("");
      setMetadataValue("");
    }
  };

  const removeMetadata = (key: string) => {
    const newMetadata = { ...formData.metadata };
    delete newMetadata[key];
    setFormData({
      ...formData,
      metadata: newMetadata,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Edit Thing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="thing-editor-form">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Thing name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Thing description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  placeholder="Status (e.g., active, draft, archived)"
                />
              </div>
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags && formData.tags.length > 0 ? (
                    formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags yet</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag-input">Add Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Enter tag name"
                  />
                  <Button type="button" onClick={addTag} variant="secondary">
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <div className="space-y-2">
                <Label>Current Metadata</Label>
                <div className="space-y-2">
                  {formData.metadata && Object.keys(formData.metadata).length > 0 ? (
                    Object.entries(formData.metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{key}:</span>{" "}
                          <span className="text-muted-foreground">
                            {String(value)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMetadata(key)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No metadata yet
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add Metadata</Label>
                <div className="flex gap-2">
                  <Input
                    value={metadataKey}
                    onChange={(e) => setMetadataKey(e.target.value)}
                    placeholder="Key"
                  />
                  <Input
                    value={metadataValue}
                    onChange={(e) => setMetadataValue(e.target.value)}
                    placeholder="Value"
                  />
                  <Button type="button" onClick={addMetadata} variant="secondary">
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label>Thing Type</Label>
                <p className="text-sm text-muted-foreground">{thing.type}</p>
              </div>

              <div className="space-y-2">
                <Label>Thing ID</Label>
                <p className="text-sm font-mono text-muted-foreground">
                  {thing._id}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Group ID</Label>
                <p className="text-sm font-mono text-muted-foreground">
                  {thing.groupId}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Owner ID</Label>
                <p className="text-sm font-mono text-muted-foreground">
                  {thing.ownerId}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {onSave && (
          <Button type="submit" form="thing-editor-form">
            Save Changes
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
