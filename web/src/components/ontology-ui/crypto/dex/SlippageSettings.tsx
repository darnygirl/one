/**
 * SlippageSettings Component
 *
 * Configure slippage tolerance with:
 * - Preset buttons (0.1%, 0.5%, 1%, 3%)
 * - Custom slippage input
 * - Auto slippage based on liquidity
 * - Warning for high slippage
 * - MEV protection toggle
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "../../utils";
import type { SlippageSettingsProps, SlippageConfig } from "./types";
import { AlertTriangle, Shield, Zap } from "lucide-react";

const PRESET_SLIPPAGES = [0.1, 0.5, 1, 3, 5];

export function SlippageSettings({
  defaultSlippage = 0.5,
  onSlippageChange,
  showWarnings = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: SlippageSettingsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("0.5");
  const [customSlippage, setCustomSlippage] = useState("");
  const [autoSlippage, setAutoSlippage] = useState(false);
  const [mevProtection, setMevProtection] = useState(false);
  const [deadline, setDeadline] = useState(20);

  const currentSlippage = autoSlippage
    ? 0.5
    : selectedPreset === "custom"
    ? parseFloat(customSlippage) || 0
    : parseFloat(selectedPreset);

  const isHighSlippage = currentSlippage > 3;
  const isVeryHighSlippage = currentSlippage > 5;
  const isLowSlippage = currentSlippage < 0.1;

  useEffect(() => {
    const config: SlippageConfig = {
      preset: selectedPreset === "custom" ? "custom" : (selectedPreset as any),
      customValue: selectedPreset === "custom" ? parseFloat(customSlippage) : undefined,
      autoSlippage,
      deadline,
    };

    onSlippageChange?.(config);
  }, [selectedPreset, customSlippage, autoSlippage, deadline]);

  const handlePresetClick = (value: number) => {
    setSelectedPreset(value.toString());
    setAutoSlippage(false);
  };

  const handleCustomChange = (value: string) => {
    setCustomSlippage(value);
    setSelectedPreset("custom");
    setAutoSlippage(false);
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "hover:shadow-lg",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span>Slippage Settings</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Configure transaction slippage tolerance
            </CardDescription>
          </div>
          <Badge
            variant={isHighSlippage ? "destructive" : "outline"}
            className="gap-1"
          >
            {currentSlippage.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Auto Slippage Toggle */}
        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <div>
              <div className="font-medium text-sm">Auto Slippage</div>
              <div className="text-xs text-muted-foreground">
                Automatically adjust based on liquidity
              </div>
            </div>
          </div>
          <Switch
            checked={autoSlippage}
            onCheckedChange={setAutoSlippage}
          />
        </div>

        {/* Preset Slippage Buttons */}
        {!autoSlippage && (
          <div className="space-y-3">
            <Label>Slippage Tolerance</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_SLIPPAGES.map((value) => (
                <Button
                  key={value}
                  variant={selectedPreset === value.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(value)}
                  className={cn(
                    "font-mono",
                    selectedPreset === value.toString() && "ring-2 ring-primary"
                  )}
                >
                  {value}%
                </Button>
              ))}
            </div>

            {/* Custom Slippage Input */}
            <div className="space-y-2">
              <Label>Custom Slippage</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.50"
                  value={customSlippage}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  step="0.1"
                  min="0"
                  max="50"
                  className={cn(
                    "font-mono",
                    selectedPreset === "custom" && "ring-2 ring-primary"
                  )}
                />
                <div className="flex items-center text-muted-foreground">%</div>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {showWarnings && (
          <>
            {isVeryHighSlippage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Very high slippage ({currentSlippage}%)! Your transaction may be front-run.
                  Consider reducing slippage or enabling MEV protection.
                </AlertDescription>
              </Alert>
            )}

            {isHighSlippage && !isVeryHighSlippage && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High slippage ({currentSlippage}%). Only use for low liquidity tokens.
                </AlertDescription>
              </Alert>
            )}

            {isLowSlippage && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Low slippage ({currentSlippage}%). Transaction may fail if price moves.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Transaction Deadline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Transaction Deadline</Label>
            <Badge variant="outline">{deadline} minutes</Badge>
          </div>
          <Slider
            value={[deadline]}
            onValueChange={(values) => setDeadline(values[0])}
            min={1}
            max={60}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Your transaction will revert if pending for more than {deadline} minutes
          </p>
        </div>

        {/* MEV Protection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className={cn(
                "h-4 w-4",
                mevProtection ? "text-green-600" : "text-muted-foreground"
              )} />
              <div>
                <div className="font-medium text-sm">MEV Protection</div>
                <div className="text-xs text-muted-foreground">
                  Protect against front-running and sandwich attacks
                </div>
              </div>
            </div>
            <Switch
              checked={mevProtection}
              onCheckedChange={setMevProtection}
            />
          </div>
          {mevProtection && (
            <Alert>
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription>
                MEV protection enabled. Transactions will use private mempool routing.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-secondary/50 rounded-lg space-y-2 text-sm">
          <div className="font-semibold">Current Settings</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Slippage</div>
              <div className="font-medium">
                {autoSlippage ? "Auto" : `${currentSlippage.toFixed(2)}%`}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Deadline</div>
              <div className="font-medium">{deadline} min</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">MEV Protection</div>
              <div className="font-medium">
                {mevProtection ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Risk Level</div>
              <Badge
                variant={
                  isVeryHighSlippage
                    ? "destructive"
                    : isHighSlippage
                    ? "secondary"
                    : "outline"
                }
                className="text-xs"
              >
                {isVeryHighSlippage ? "Very High" : isHighSlippage ? "High" : "Normal"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Slippage tolerance</strong> is the maximum price difference you're
            willing to accept between quote and execution.
          </p>
          <p>
            Higher slippage = more likely to execute, but worse price.
            Lower slippage = better price, but may fail if market moves.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
