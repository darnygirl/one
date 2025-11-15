/**
 * StreamingForm - Streaming Component (Cycle 23)
 *
 * Form with live validation, auto-save drafts, and conflict resolution
 */

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  AlertTriangle,
  Clock,
} from "lucide-react";

export type FieldStatus = "idle" | "validating" | "valid" | "invalid";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "email" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  validate?: (value: any) => Promise<boolean | string>;
  debounceMs?: number;
}

export interface StreamingFormProps {
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onAutoSave?: (data: Record<string, any>) => Promise<void>;
  autoSaveDelay?: number;
  showFieldStatus?: boolean;
  showAutoSave?: boolean;
  enableConflictDetection?: boolean;
  className?: string;
}

export function StreamingForm({
  fields,
  initialData = {},
  onSubmit,
  onAutoSave,
  autoSaveDelay = 2000,
  showFieldStatus = true,
  showAutoSave = true,
  enableConflictDetection = false,
  className,
}: StreamingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: initialData,
  });

  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictData, setConflictData] = useState<Record<string, any> | null>(null);

  // Watch all fields for auto-save
  const formData = watch();

  // Auto-save logic
  useEffect(() => {
    if (!onAutoSave || !showAutoSave) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onAutoSave(formData);
        setLastAutoSave(Date.now());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [formData, onAutoSave, autoSaveDelay, showAutoSave]);

  // Field validation
  const validateField = useCallback(
    async (field: FormField, value: any) => {
      if (!field.validate) return;

      setFieldStatuses((prev) => ({ ...prev, [field.name]: "validating" }));

      try {
        const result = await field.validate(value);
        setFieldStatuses((prev) => ({
          ...prev,
          [field.name]: result === true ? "valid" : "invalid",
        }));
      } catch (error) {
        setFieldStatuses((prev) => ({ ...prev, [field.name]: "invalid" }));
      }
    },
    []
  );

  // Handle form submission
  const handleFormSubmit = async (data: Record<string, any>) => {
    if (hasConflict && enableConflictDetection) {
      // Show conflict resolution UI
      return;
    }

    try {
      await onSubmit(data);
    } catch (error: any) {
      // Check for conflict error
      if (error.code === "CONFLICT" && enableConflictDetection) {
        setHasConflict(true);
        setConflictData(error.data);
      }
    }
  };

  // Resolve conflict
  const resolveConflict = (useLocal: boolean) => {
    if (useLocal) {
      setHasConflict(false);
      setConflictData(null);
    } else if (conflictData) {
      Object.keys(conflictData).forEach((key) => {
        setValue(key, conflictData[key]);
      });
      setHasConflict(false);
      setConflictData(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-6", className)}
    >
      {/* Conflict Warning */}
      <AnimatePresence>
        {hasConflict && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  Conflict Detected
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                  This form was modified by someone else. Choose which version to keep.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(true)}
                  >
                    Keep My Changes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(false)}
                  >
                    Use Their Changes
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save Indicator */}
      {showAutoSave && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving draft...</span>
            </>
          ) : lastAutoSave ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>
                Draft saved {Math.floor((Date.now() - lastAutoSave) / 1000)}s ago
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span>Auto-save enabled</span>
            </>
          )}
        </div>
      )}

      {/* Form Fields */}
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          <div className="relative">
            {/* Field Input */}
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                {...register(field.name, {
                  required: field.required,
                  onChange: (e) => {
                    if (field.validate) {
                      const debounce = setTimeout(() => {
                        validateField(field, e.target.value);
                      }, field.debounceMs || 500);
                      return () => clearTimeout(debounce);
                    }
                  },
                })}
                className={cn(
                  showFieldStatus && fieldStatuses[field.name] === "valid" && "border-green-500",
                  showFieldStatus && fieldStatuses[field.name] === "invalid" && "border-red-500"
                )}
              />
            ) : field.type === "select" ? (
              <Select
                onValueChange={(value) => {
                  setValue(field.name, value);
                  if (field.validate) {
                    validateField(field, value);
                  }
                }}
                defaultValue={initialData[field.name]}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name, {
                  required: field.required,
                  onChange: (e) => {
                    if (field.validate) {
                      const debounce = setTimeout(() => {
                        validateField(field, e.target.value);
                      }, field.debounceMs || 500);
                      return () => clearTimeout(debounce);
                    }
                  },
                })}
                className={cn(
                  showFieldStatus && fieldStatuses[field.name] === "valid" && "border-green-500",
                  showFieldStatus && fieldStatuses[field.name] === "invalid" && "border-red-500"
                )}
              />
            )}

            {/* Field Status Indicator */}
            {showFieldStatus && fieldStatuses[field.name] && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {fieldStatuses[field.name] === "validating" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {fieldStatuses[field.name] === "valid" && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {fieldStatuses[field.name] === "invalid" && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors[field.name] && (
            <p className="text-sm text-destructive">
              {errors[field.name]?.message as string}
            </p>
          )}
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || hasConflict}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Submit
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
