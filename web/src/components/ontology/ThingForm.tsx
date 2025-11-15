/**
 * ThingForm Component
 * Dynamic form generator based on thing type configuration
 */

import { type Thing, type ThingType } from "@/lib/ontology/types";
import { useThingConfig } from "@/lib/ontology/hooks/useThingConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface ThingFormProps {
  thingType: ThingType;
  initialData?: Partial<Thing>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function ThingForm({
  thingType,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: ThingFormProps) {
  const config = useThingConfig(thingType);
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData?.properties || config.properties
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = (fieldName: string) => {
    const fieldConfig = config.ui.fields[fieldName];
    const value = formData[fieldName];

    if (!fieldConfig || fieldConfig.hidden) return null;

    const label = fieldConfig.label || fieldName;

    switch (fieldConfig.component) {
      case "Heading":
      case "Text":
        if (fieldConfig.lines && fieldConfig.lines > 1) {
          return (
            <div key={fieldName} className="space-y-2">
              <Label htmlFor={fieldName}>{label}</Label>
              <Textarea
                id={fieldName}
                value={value || ""}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={label}
                rows={fieldConfig.lines}
              />
            </div>
          );
        }
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Input
              id={fieldName}
              value={value || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={label}
            />
          </div>
        );

      case "Price":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {fieldConfig.currency || "USD"}
              </span>
              <Input
                id={fieldName}
                type="number"
                step="0.01"
                value={value || 0}
                onChange={(e) =>
                  handleChange(fieldName, parseFloat(e.target.value))
                }
                placeholder="0.00"
              />
            </div>
          </div>
        );

      case "Badge":
        if (fieldConfig.labels) {
          const options = Object.keys(fieldConfig.labels);
          return (
            <div key={fieldName} className="space-y-2">
              <Label htmlFor={fieldName}>{label}</Label>
              <Select
                value={value || options[0]}
                onValueChange={(val) => handleChange(fieldName, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {fieldConfig.labels![option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        break;

      case "Checkbox":
        return (
          <div key={fieldName} className="flex items-center space-x-2">
            <Checkbox
              id={fieldName}
              checked={value || false}
              onCheckedChange={(checked) => handleChange(fieldName, checked)}
            />
            <Label htmlFor={fieldName}>{label}</Label>
          </div>
        );

      case "Switch":
        return (
          <div key={fieldName} className="flex items-center justify-between">
            <Label htmlFor={fieldName}>{label}</Label>
            <Switch
              id={fieldName}
              checked={value || false}
              onCheckedChange={(checked) => handleChange(fieldName, checked)}
            />
          </div>
        );

      case "Image":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Input
              id={fieldName}
              type="url"
              value={value || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {value && (
              <img
                src={value}
                alt={label}
                className="w-32 h-32 object-cover rounded-md"
              />
            )}
          </div>
        );

      case "TagList":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Input
              id={fieldName}
              value={Array.isArray(value) ? value.join(", ") : ""}
              onChange={(e) =>
                handleChange(
                  fieldName,
                  e.target.value.split(",").map((t) => t.trim())
                )
              }
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>
        );

      default:
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Input
              id={fieldName}
              value={value || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={label}
            />
          </div>
        );
    }
  };

  const formFields = Object.keys(config.properties).filter(
    (field) => !config.ui.fields[field]?.hidden
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formFields.map((field) => renderField(field))}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
