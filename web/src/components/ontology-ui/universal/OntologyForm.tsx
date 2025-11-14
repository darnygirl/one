/**
 * OntologyForm - Dynamic form builder for any dimension
 *
 * Generates forms based on field schemas with validation support
 */

import { useState } from "react";
import type { Dimension, FormField, FormProps } from "../types";
import { DIMENSIONS } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../utils";

interface OntologyFormProps extends FormProps {
  dimension: Dimension;
  fields: FormField[];
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  multiStep?: boolean;
}

export function OntologyForm({
  dimension,
  fields,
  title,
  description,
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  multiStep = false,
  className,
}: OntologyFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const dimensionMeta = DIMENSIONS[dimension];
  const dimColor = `text-${dimensionMeta.color}-600 dark:text-${dimensionMeta.color}-400`;

  // Split fields into steps if multiStep
  const stepsCount = multiStep ? Math.ceil(fields.length / 3) : 1;
  const currentFields = multiStep
    ? fields.slice(currentStep * 3, (currentStep + 1) * 3)
    : fields;

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field changes
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (multiStep && currentStep < stepsCount - 1) {
      // Validate current step fields
      const stepValid = currentFields.every(
        (field) => !field.required || formData[field.name]
      );

      if (stepValid) {
        setCurrentStep((prev) => prev + 1);
      }
      return;
    }

    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? field.defaultValue ?? "";
    const error = errors[field.name];

    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(error && "border-red-500")}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(error && "border-red-500")}
              rows={4}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
            >
              <SelectTrigger className={cn(error && "border-red-500")}>
                <SelectValue placeholder={field.placeholder || "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) =>
                handleFieldChange(field.name, checked)
              }
            />
            <Label htmlFor={field.name} className="cursor-pointer">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={cn(error && "border-red-500")}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{dimensionMeta.icon}</span>
          <div>
            <CardTitle className={dimColor}>
              {title || `${dimensionMeta.name} Form`}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {multiStep && (
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: stepsCount }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  i <= currentStep
                    ? `bg-${dimensionMeta.color}-500`
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {currentFields.map(renderField)}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            {multiStep && currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
          </div>

          <Button type="submit">
            {multiStep && currentStep < stepsCount - 1 ? "Next" : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export type { OntologyFormProps };
