/**
 * WalletConnectButton Component
 *
 * Multi-chain wallet connection using RainbowKit
 * Supports MetaMask, WalletConnect, Coinbase Wallet
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, truncate } from "../../utils";
import type { WalletConnectButtonProps, Wallet } from "./types";

export function WalletConnectButton({
  onConnect,
  onDisconnect,
  label = "Connect Wallet",
  showBalance = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: WalletConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Mock wallet connection (replace with actual wagmi/RainbowKit integration)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockWallet: Wallet = {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        chainId: 1,
        balance: "1.234",
        ensName: null,
        connector: "MetaMask",
      };

      setWallet(mockWallet);
      setIsConnected(true);
      onConnect?.(mockWallet);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setIsConnected(false);
    onDisconnect?.();
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className={cn("gap-2", className)}
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      >
        <span className="text-lg">👛</span>
        {isConnecting ? "Connecting..." : label}
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg",
        size === "sm" && "p-2",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">👛</span>
              <span className="font-mono text-sm">
                {truncate(wallet?.address || "", 16)}
              </span>
            </CardTitle>
            {wallet?.ensName && (
              <CardDescription className="mt-1">
                {wallet.ensName}
              </CardDescription>
            )}
          </div>
          <Badge variant="outline" className="ml-2">
            {wallet?.connector || "Connected"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showBalance && wallet?.balance && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-lg font-bold">{wallet.balance} ETH</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(wallet?.address || "");
            }}
          >
            Copy Address
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDisconnect();
            }}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
