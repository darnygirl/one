/**
 * NetworkSwitcher Component
 *
 * Switch between blockchain networks
 * Supports Ethereum, Polygon, Arbitrum, Optimism, Base
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../../utils";
import type { NetworkSwitcherProps, Chain } from "./types";

const CHAIN_ICONS: Record<number, string> = {
  1: "⟠", // Ethereum
  137: "⬡", // Polygon
  42161: "🔷", // Arbitrum
  10: "🔴", // Optimism
  8453: "🔵", // Base
};

export function NetworkSwitcher({
  chains,
  currentChain,
  onSwitch,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: NetworkSwitcherProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>(
    currentChain
  );
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (chainId: string) => {
    const chain = chains.find((c) => c.id.toString() === chainId);
    if (!chain) return;

    setIsSwitching(true);

    try {
      // Mock network switch (replace with actual wagmi network switching)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSelectedChain(chain);
      onSwitch?.(chain);
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  const currentChainDisplay = selectedChain || currentChain;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        size === "sm" && "p-2",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">🌐</span>
          <span>Network</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {currentChainDisplay && (
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <span className="text-2xl">
              {CHAIN_ICONS[currentChainDisplay.id] || "🔗"}
            </span>
            <div className="flex-1">
              <div className="font-medium">{currentChainDisplay.name}</div>
              <div className="text-xs text-muted-foreground">
                {currentChainDisplay.nativeCurrency.symbol}
              </div>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
        )}

        <Select
          value={selectedChain?.id.toString()}
          onValueChange={handleSwitch}
          disabled={isSwitching}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {chains.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                <div className="flex items-center gap-2">
                  <span>{CHAIN_ICONS[chain.id] || "🔗"}</span>
                  <span>{chain.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {chain.nativeCurrency.symbol}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isSwitching && (
          <div className="text-sm text-muted-foreground text-center">
            Switching network...
          </div>
        )}

        {currentChainDisplay?.blockExplorers && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              window.open(
                currentChainDisplay.blockExplorers?.default.url,
                "_blank"
              )
            }
          >
            View on {currentChainDisplay.blockExplorers.default.name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
