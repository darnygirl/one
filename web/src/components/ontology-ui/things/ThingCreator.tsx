/**
 * ThingCreator - Multi-step form for creating things
 *
 * Wizard-style creation flow: Type → Details → Tags → Submit
 */

import { useState } from "react";
import type { Thing, ThingType, FormProps } from "../types";
import type { Id } from "convex/_generated/dataModel";
import { ThingTypeSelector } from "./ThingTypeSelector";
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
import { Badge } from "@/components/ui/badge";
import { getThingTypeDisplay, getThingTypeIcon, cn } from "../utils";

interface ThingCreatorProps extends FormProps {
  groupId: Id<"groups">;
}

type Step = "type" | "details" | "tags" | "review";

interface FormData {
  type?: ThingType;
  name: string;
  description: string;
  tags: string[];
  status?: string;
}

export function ThingCreator({
  groupId,
  onSubmit,
  onCancel,
  initialData,
  mode = "create",
  className,
}: ThingCreatorProps) {
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [formData, setFormData] = useState<FormData>({
    type: initialData?.type,
    name: initialData?.name || "",
    description: initialData?.description || "",
    tags: initialData?.tags || [],
    status: initialData?.status || "draft",
  });
  const [tagInput, setTagInput] = useState("");

  const steps: Step[] = ["type", "details", "tags", "review"];
  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const canProceed = () => {
    switch (currentStep) {
      case "type":
        return !!formData.type;
      case "details":
        return formData.name.trim().length > 0;
      case "tags":
        return true; // Tags are optional
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isLastStep && canProceed()) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = () => {
    if (canProceed() && formData.type) {
      const thingData = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        groupId,
        tags: formData.tags,
        status: formData.status,
        createdAt: Date.now(),
      };
      onSubmit?.(thingData);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{mode === "create" ? "Create New Thing" : "Edit Thing"}</span>
          <div className="flex gap-1">
            {steps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "w-8 h-1 rounded",
                  index <= currentStepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="min-h-[400px]">
        {/* Step 1: Type Selection */}
        {currentStep === "type" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Thing Type</h3>
              <p className="text-sm text-muted-foreground">
                Choose the type of thing you want to create
              </p>
            </div>
            <ThingTypeSelector
              selectedType={formData.type}
              onSelect={(type) => setFormData((prev) => ({ ...prev, type }))}
            />
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === "details" && formData.type && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>{getThingTypeIcon(formData.type)}</span>
                <span>{getThingTypeDisplay(formData.type)} Details</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Provide the basic information for your {getThingTypeDisplay(formData.type).toLowerCase()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder={`Enter ${getThingTypeDisplay(formData.type).toLowerCase()} name`}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={`Describe your ${getThingTypeDisplay(formData.type).toLowerCase()}`}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  placeholder="e.g., draft, published, archived"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tags */}
        {currentStep === "tags" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Add Tags (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Tags help organize and categorize your things
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags ({formData.tags.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === "review" && formData.type && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review and Submit</h3>
              <p className="text-sm text-muted-foreground">
                Review your thing before creating it
              </p>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{getThingTypeIcon(formData.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-semibold">{formData.name}</h4>
                    <Badge variant="secondary">{getThingTypeDisplay(formData.type)}</Badge>
                  </div>
                  {formData.description && (
                    <p className="text-muted-foreground">{formData.description}</p>
                  )}
                </div>
              </div>

              {formData.status && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium">Status: </span>
                  <Badge variant="outline" className="capitalize">
                    {formData.status}
                  </Badge>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium mb-2 block">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div>
          {!isFirstStep && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              {mode === "create" ? "Create Thing" : "Update Thing"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
