/**
 * GasSettings Component
 *
 * Gas price configuration with:
 * - Gas speed selector (slow/normal/fast/instant)
 * - EIP-1559 settings (base + priority fee)
 * - Max gas limit input
 * - USD cost estimate
 * - Historical gas trends
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn, formatCurrency } from "../../utils";
import type { GasSettingsProps, GasConfig } from "./types";
import { Zap, Clock, TrendingUp, Flame } from "lucide-react";

interface GasSpeed {
  name: string;
  baseFee: number;
  priorityFee: number;
  estimatedTime: number;
  icon: React.ReactNode;
  description: string;
}

const GAS_SPEEDS: GasSpeed[] = [
  {
    name: "slow",
    baseFee: 20,
    priorityFee: 1,
    estimatedTime: 300,
    icon: <Clock className="h-4 w-4" />,
    description: "~5 min",
  },
  {
    name: "average",
    baseFee: 30,
    priorityFee: 2,
    estimatedTime: 60,
    icon: <Zap className="h-4 w-4" />,
    description: "~1 min",
  },
  {
    name: "fast",
    baseFee: 40,
    priorityFee: 3,
    estimatedTime: 30,
    icon: <TrendingUp className="h-4 w-4" />,
    description: "~30 sec",
  },
  {
    name: "instant",
    baseFee: 60,
    priorityFee: 5,
    estimatedTime: 15,
    icon: <Flame className="h-4 w-4" />,
    description: "~15 sec",
  },
];

export function GasSettings({
  chainId = 1,
  currentGasPrice = "30",
  onGasChange,
  showOptimizations = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: GasSettingsProps) {
  const [selectedSpeed, setSelectedSpeed] = useState<"slow" | "average" | "fast" | "custom">("average");
  const [customBaseFee, setCustomBaseFee] = useState("");
  const [customPriorityFee, setCustomPriorityFee] = useState("");
  const [gasLimit, setGasLimit] = useState(150000);
  const [ethPrice] = useState(2000); // Mock ETH price

  const getCurrentGasSettings = (): GasSpeed | null => {
    if (selectedSpeed === "custom") {
      return {
        name: "custom",
        baseFee: parseFloat(customBaseFee) || 0,
        priorityFee: parseFloat(customPriorityFee) || 0,
        estimatedTime: 60,
        icon: <Zap className="h-4 w-4" />,
        description: "Custom",
      };
    }
    return GAS_SPEEDS.find((s) => s.name === selectedSpeed) || GAS_SPEEDS[1];
  };

  const gasSettings = getCurrentGasSettings();
  const maxFeePerGas = gasSettings ? gasSettings.baseFee + gasSettings.priorityFee : 0;
  const gasCostEth = (maxFeePerGas * gasLimit) / 1e9;
  const gasCostUsd = gasCostEth * ethPrice;

  useEffect(() => {
    if (!gasSettings) return;

    const config: GasConfig = {
      speed: selectedSpeed,
      gasPrice: maxFeePerGas.toString(),
      maxFeePerGas: gasSettings.baseFee.toString(),
      maxPriorityFeePerGas: gasSettings.priorityFee.toString(),
      gasLimit: gasLimit.toString(),
      estimatedTime: gasSettings.estimatedTime,
      estimatedCost: gasCostUsd.toFixed(2),
    };

    onGasChange?.(config);
  }, [selectedSpeed, customBaseFee, customPriorityFee, gasLimit]);

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
              <span className="text-2xl">⛽</span>
              <span>Gas Settings</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Configure gas price and transaction speed
            </CardDescription>
          </div>
          <Badge variant="outline">
            {formatCurrency(gasCostUsd)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gas Speed Presets */}
        <div className="space-y-3">
          <Label>Transaction Speed</Label>
          <div className="grid grid-cols-2 gap-2">
            {GAS_SPEEDS.map((speed) => {
              const isSelected = selectedSpeed === speed.name;
              const speedGasCost = ((speed.baseFee + speed.priorityFee) * gasLimit) / 1e9 * ethPrice;

              return (
                <Button
                  key={speed.name}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "h-auto flex-col items-start p-3",
                    isSelected && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedSpeed(speed.name as any)}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      {speed.icon}
                      <span className="font-semibold capitalize">{speed.name}</span>
                    </div>
                    <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
                      {speed.description}
                    </Badge>
                  </div>
                  <div className="text-xs text-left w-full space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base:</span>
                      <span>{speed.baseFee} Gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span>{speed.priorityFee} Gwei</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Cost:</span>
                      <span>{formatCurrency(speedGasCost)}</span>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom Gas Settings */}
        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced (EIP-1559)</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-3 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Gas Price</Label>
                <Badge variant="outline">{maxFeePerGas} Gwei</Badge>
              </div>
              <Slider
                value={[maxFeePerGas]}
                onValueChange={(values) => {
                  setSelectedSpeed("custom");
                  setCustomBaseFee(values[0].toString());
                  setCustomPriorityFee("2");
                }}
                min={10}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher gas price = faster confirmation
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Max Base Fee (Gwei)</Label>
              <Input
                type="number"
                placeholder="30"
                value={customBaseFee}
                onChange={(e) => {
                  setCustomBaseFee(e.target.value);
                  setSelectedSpeed("custom");
                }}
                step="1"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Current network base fee: {currentGasPrice} Gwei
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Priority Fee (Gwei)</Label>
              <Input
                type="number"
                placeholder="2"
                value={customPriorityFee}
                onChange={(e) => {
                  setCustomPriorityFee(e.target.value);
                  setSelectedSpeed("custom");
                }}
                step="0.1"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Tip to miners/validators for priority
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Gas Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Gas Limit</Label>
            <Badge variant="outline">{gasLimit.toLocaleString()}</Badge>
          </div>
          <Slider
            value={[gasLimit]}
            onValueChange={(values) => setGasLimit(values[0])}
            min={21000}
            max={500000}
            step={1000}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Maximum gas units allowed for this transaction
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
          <div className="font-semibold text-sm">Cost Estimate</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base Fee</span>
              <span className="font-medium">{gasSettings?.baseFee} Gwei</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Priority Fee</span>
              <span className="font-medium">{gasSettings?.priorityFee} Gwei</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gas Limit</span>
              <span className="font-medium">{gasLimit.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground">Total Cost</span>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(gasCostUsd)}</div>
                <div className="text-xs text-muted-foreground">
                  {gasCostEth.toFixed(6)} ETH
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Est. Time</span>
              <span className="font-medium">{gasSettings?.description}</span>
            </div>
          </div>
        </div>

        {/* Gas Trend Info */}
        {showOptimizations && (
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Gas Optimization Tips</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Gas prices are typically lower on weekends</li>
              <li>• Consider batching multiple transactions</li>
              <li>• Use "Average" speed for non-urgent transactions</li>
              <li>• Check gas tracker before large transfers</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
