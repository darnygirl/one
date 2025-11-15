/**
 * ColorPicker - Advanced color picker
 *
 * Features:
 * - RGB/HSL/Hex inputs
 * - Eyedropper tool (if supported)
 * - Saved colors
 * - Color palette presets
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Pipette, Save, Trash2 } from "lucide-react";
import { cn } from "../utils";

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  showPresets?: boolean;
  showSaved?: boolean;
  showEyedropper?: boolean;
  presets?: string[];
  className?: string;
}

const defaultPresets = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3",
  "#000000", "#FFFFFF", "#808080", "#C0C0C0", "#800000", "#808000", "#008000",
  "#008080", "#000080", "#800080", "#FF00FF", "#00FFFF", "#FFD700",
];

export function ColorPicker({
  value = "#000000",
  onChange,
  showPresets = true,
  showSaved = true,
  showEyedropper = true,
  presets = defaultPresets,
  className,
}: ColorPickerProps) {
  const [color, setColor] = useState(value);
  const [savedColors, setSavedColors] = useState<string[]>(() => {
    const saved = localStorage.getItem("colorPicker_savedColors");
    return saved ? JSON.parse(saved) : [];
  });

  // Parse color to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // RGB to HSL
  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // HSL to RGB
  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const [rgb, setRgb] = useState(() => hexToRgb(color));
  const [hsl, setHsl] = useState(() => rgbToHsl(rgb.r, rgb.g, rgb.b));

  // Update color
  const updateColor = (newColor: string) => {
    setColor(newColor);
    onChange?.(newColor);
    const newRgb = hexToRgb(newColor);
    setRgb(newRgb);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update from RGB
  const updateFromRgb = (r: number, g: number, b: number) => {
    const newRgb = { r, g, b };
    setRgb(newRgb);
    const hex = rgbToHex(r, g, b);
    setColor(hex);
    onChange?.(hex);
    setHsl(rgbToHsl(r, g, b));
  };

  // Update from HSL
  const updateFromHsl = (h: number, s: number, l: number) => {
    const newHsl = { h, s, l };
    setHsl(newHsl);
    const newRgb = hslToRgb(h, s, l);
    setRgb(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(hex);
    onChange?.(hex);
  };

  // Save current color
  const saveColor = () => {
    if (!savedColors.includes(color)) {
      const updated = [...savedColors, color].slice(-20); // Keep last 20
      setSavedColors(updated);
      localStorage.setItem("colorPicker_savedColors", JSON.stringify(updated));
    }
  };

  // Remove saved color
  const removeSavedColor = (colorToRemove: string) => {
    const updated = savedColors.filter((c) => c !== colorToRemove);
    setSavedColors(updated);
    localStorage.setItem("colorPicker_savedColors", JSON.stringify(updated));
  };

  // Eyedropper
  const useEyedropper = async () => {
    if ("EyeDropper" in window) {
      try {
        // @ts-ignore - EyeDropper API not in types yet
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        updateColor(result.sRGBHex);
      } catch (error) {
        console.error("Eyedropper error:", error);
      }
    }
  };

  const supportsEyedropper = "EyeDropper" in window;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Color Picker</CardTitle>
          {showEyedropper && supportsEyedropper && (
            <Button
              variant="outline"
              size="sm"
              onClick={useEyedropper}
              title="Pick color from screen"
            >
              <Pipette className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Color preview */}
        <div className="flex items-center gap-3">
          <div
            className="h-20 w-20 rounded-lg border-2 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 space-y-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => updateColor(e.target.value)}
              className="h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  updateColor(e.target.value);
                }
              }}
              placeholder="#000000"
              className="font-mono"
            />
          </div>
        </div>

        {/* Color inputs */}
        <Tabs defaultValue="rgb" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rgb">RGB</TabsTrigger>
            <TabsTrigger value="hsl">HSL</TabsTrigger>
            <TabsTrigger value="hex">HEX</TabsTrigger>
          </TabsList>

          {/* RGB */}
          <TabsContent value="rgb" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Red</Label>
                <span className="text-sm text-muted-foreground">{rgb.r}</span>
              </div>
              <Slider
                value={[rgb.r]}
                onValueChange={([r]) => updateFromRgb(r, rgb.g, rgb.b)}
                min={0}
                max={255}
                step={1}
                className="[&_[role=slider]]:bg-red-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Green</Label>
                <span className="text-sm text-muted-foreground">{rgb.g}</span>
              </div>
              <Slider
                value={[rgb.g]}
                onValueChange={([g]) => updateFromRgb(rgb.r, g, rgb.b)}
                min={0}
                max={255}
                step={1}
                className="[&_[role=slider]]:bg-green-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Blue</Label>
                <span className="text-sm text-muted-foreground">{rgb.b}</span>
              </div>
              <Slider
                value={[rgb.b]}
                onValueChange={([b]) => updateFromRgb(rgb.r, rgb.g, b)}
                min={0}
                max={255}
                step={1}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>
          </TabsContent>

          {/* HSL */}
          <TabsContent value="hsl" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Hue</Label>
                <span className="text-sm text-muted-foreground">{hsl.h}°</span>
              </div>
              <Slider
                value={[hsl.h]}
                onValueChange={([h]) => updateFromHsl(h, hsl.s, hsl.l)}
                min={0}
                max={360}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Saturation</Label>
                <span className="text-sm text-muted-foreground">{hsl.s}%</span>
              </div>
              <Slider
                value={[hsl.s]}
                onValueChange={([s]) => updateFromHsl(hsl.h, s, hsl.l)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lightness</Label>
                <span className="text-sm text-muted-foreground">{hsl.l}%</span>
              </div>
              <Slider
                value={[hsl.l]}
                onValueChange={([l]) => updateFromHsl(hsl.h, hsl.s, l)}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          {/* HEX */}
          <TabsContent value="hex" className="space-y-3">
            <div className="space-y-2">
              <Label>Hex Code</Label>
              <Input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    updateColor(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="font-mono text-lg"
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>RGB: rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
              <div>HSL: hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)</div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        {showSaved && (
          <Button
            variant="outline"
            onClick={saveColor}
            className="w-full"
            disabled={savedColors.includes(color)}
          >
            <Save className="h-4 w-4 mr-2" />
            {savedColors.includes(color) ? "Already Saved" : "Save Color"}
          </Button>
        )}

        {/* Presets */}
        {showPresets && (
          <div className="space-y-2">
            <Label className="text-xs">Preset Colors</Label>
            <div className="grid grid-cols-10 gap-1">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateColor(preset)}
                  className={cn(
                    "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                    color === preset
                      ? "border-primary ring-2 ring-ring"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          </div>
        )}

        {/* Saved colors */}
        {showSaved && savedColors.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Saved Colors</Label>
            <div className="grid grid-cols-10 gap-1">
              {savedColors.map((saved) => (
                <div key={saved} className="relative group">
                  <button
                    type="button"
                    onClick={() => updateColor(saved)}
                    className={cn(
                      "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                      color === saved
                        ? "border-primary ring-2 ring-ring"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: saved }}
                    title={saved}
                  />
                  <button
                    type="button"
                    onClick={() => removeSavedColor(saved)}
                    className="absolute -top-1 -right-1 hidden group-hover:block bg-destructive text-destructive-foreground rounded-full p-0.5"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
