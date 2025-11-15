/**
 * ImageCropper - Image cropping component
 *
 * Features:
 * - Zoom/rotate controls
 * - Aspect ratio presets
 * - Preview
 * - Export to blob
 *
 * NOTE: This is a simplified version. For production, consider:
 * - react-easy-crop: npm install react-easy-crop
 * - react-image-crop: npm install react-image-crop
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { cn } from "../utils";

export interface AspectRatioPreset {
  label: string;
  value: number | null; // null for free aspect
  width?: number;
  height?: number;
}

const defaultAspectRatios: AspectRatioPreset[] = [
  { label: "Free", value: null },
  { label: "Square (1:1)", value: 1, width: 1, height: 1 },
  { label: "Portrait (3:4)", value: 3 / 4, width: 3, height: 4 },
  { label: "Landscape (4:3)", value: 4 / 3, width: 4, height: 3 },
  { label: "Widescreen (16:9)", value: 16 / 9, width: 16, height: 9 },
  { label: "Banner (21:9)", value: 21 / 9, width: 21, height: 9 },
];

export interface ImageCropperProps {
  src: string;
  onCrop?: (blob: Blob, url: string) => void;
  aspectRatios?: AspectRatioPreset[];
  defaultAspectRatio?: number | null;
  showPreview?: boolean;
  className?: string;
}

export function ImageCropper({
  src,
  onCrop,
  aspectRatios = defaultAspectRatios,
  defaultAspectRatio = 1,
  showPreview = true,
  className,
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(
    defaultAspectRatio
  );
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageRef.current = img;
      initializeCropArea(img);
      drawCanvas();
    };
  }, [src]);

  // Initialize crop area based on aspect ratio
  const initializeCropArea = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const containerWidth = canvas.parentElement?.clientWidth || 500;
    const containerHeight = 400;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const scale = Math.min(
      containerWidth / img.width,
      containerHeight / img.height
    );

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    let cropWidth = scaledWidth * 0.8;
    let cropHeight = scaledHeight * 0.8;

    if (aspectRatio !== null) {
      if (aspectRatio > 1) {
        cropHeight = cropWidth / aspectRatio;
      } else {
        cropWidth = cropHeight * aspectRatio;
      }
    }

    setCropArea({
      x: (containerWidth - cropWidth) / 2,
      y: (containerHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  };

  // Draw canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Draw dimmed background (entire image)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image with zoom and rotation
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );

    ctx.restore();

    // Clear crop area (make it not dimmed)
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Redraw crop area from original
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate source coordinates
    const sourceX = ((cropArea.x - centerX) / zoom / scale) + img.width / 2;
    const sourceY = ((cropArea.y - centerY) / zoom / scale) + img.height / 2;
    const sourceWidth = cropArea.width / zoom / scale;
    const sourceHeight = cropArea.height / zoom / scale;

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clip();

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );

    ctx.restore();

    // Draw crop area border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Update preview
    updatePreview();
  };

  // Update preview canvas
  const updatePreview = () => {
    const previewCanvas = previewCanvasRef.current;
    const ctx = previewCanvas?.getContext("2d");
    const canvas = canvasRef.current;

    if (!previewCanvas || !ctx || !canvas) return;

    previewCanvas.width = 200;
    previewCanvas.height = 200;

    const scale = Math.min(200 / cropArea.width, 200 / cropArea.height);

    ctx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width * scale,
      cropArea.height * scale
    );
  };

  // Redraw when controls change
  useEffect(() => {
    drawCanvas();
  }, [zoom, rotation, cropArea]);

  // Handle aspect ratio change
  const handleAspectRatioChange = (value: string) => {
    const ratio = value === "null" ? null : parseFloat(value);
    setAspectRatio(ratio);

    if (ratio !== null && imageRef.current) {
      const newCropArea = { ...cropArea };

      if (ratio > 1) {
        newCropArea.height = newCropArea.width / ratio;
      } else {
        newCropArea.width = newCropArea.height * ratio;
      }

      setCropArea(newCropArea);
    }
  };

  // Export cropped image
  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create temporary canvas for cropped area
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = cropArea.width;
    exportCanvas.height = cropArea.height;
    const ctx = exportCanvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    exportCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onCrop?.(blob, url);
      }
    }, "image/png");
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Crop Image</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="relative bg-muted rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Aspect ratio */}
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select
              value={aspectRatio === null ? "null" : aspectRatio.toString()}
              onValueChange={handleAspectRatioChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((preset) => (
                  <SelectItem
                    key={preset.label}
                    value={preset.value === null ? "null" : preset.value.toString()}
                  >
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Zoom</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Rotation</Label>
              <span className="text-sm text-muted-foreground">{rotation}°</span>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                value={[rotation]}
                onValueChange={([value]) => setRotation(value)}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview and export */}
        <div className="flex items-center gap-4">
          {showPreview && (
            <div className="space-y-2">
              <Label className="text-xs">Preview</Label>
              <canvas
                ref={previewCanvasRef}
                className="border rounded-md"
                width={200}
                height={200}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col gap-2">
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Cropped Image
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                if (imageRef.current) {
                  initializeCropArea(imageRef.current);
                }
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
