/**
 * WalletSwitcher Component
 *
 * Switch between multiple connected wallets
 * Shows balance for each wallet
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
import { cn, truncate } from "../../utils";
import type { WalletSwitcherProps, Wallet } from "./types";

export function WalletSwitcher({
  wallets,
  currentWallet,
  onSwitch,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: WalletSwitcherProps) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(
    currentWallet
  );

  const handleSwitch = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    onSwitch?.(wallet);
  };

  if (wallets.length === 0) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          No wallets connected
        </p>
      </Card>
    );
  }

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
          <span className="text-xl">💼</span>
          <span>Switch Wallet</span>
          <Badge variant="secondary">{wallets.length} connected</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {wallets.map((wallet, index) => {
          const isSelected =
            selectedWallet?.address === wallet.address;

          return (
            <Button
              key={wallet.address}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "w-full justify-start gap-3 h-auto py-3",
                interactive && !isSelected && "hover:bg-secondary"
              )}
              onClick={() => handleSwitch(wallet)}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {truncate(wallet.address, 20)}
                  </span>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                {wallet.ensName && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {wallet.ensName}
                  </div>
                )}
                {wallet.balance && (
                  <div className="text-xs mt-1 font-bold">
                    {wallet.balance} ETH
                  </div>
                )}
              </div>
              {wallet.connector && (
                <Badge variant="outline" className="text-xs">
                  {wallet.connector}
                </Badge>
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
