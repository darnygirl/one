/**
 * WalletAddress Component
 *
 * Display wallet address with utilities
 * Copy to clipboard, ENS resolution, avatar, truncate
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, truncate } from "../../utils";
import type { WalletAddressProps } from "./types";

export function WalletAddress({
  address,
  ensName,
  ensAvatar,
  showCopy = true,
  showQR = false,
  truncate: shouldTruncate = true,
  length = 12,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: WalletAddressProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const displayAddress = shouldTruncate
    ? truncate(address, length)
    : address;

  const generateIdenticon = (addr: string) => {
    // Simple identicon generator based on address
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    const index =
      parseInt(addr.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

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
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-xl">📋</span>
          <span>{ensName ? "ENS Name" : "Wallet Address"}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar>
            {ensAvatar ? (
              <AvatarImage src={ensAvatar} alt={ensName || address} />
            ) : (
              <AvatarFallback
                className={cn(generateIdenticon(address), "text-white")}
              >
                {address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            {ensName && (
              <div className="font-medium text-sm mb-1">
                {ensName}
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className="text-xs font-mono bg-secondary px-2 py-1 rounded truncate block">
                    {displayAddress}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">{address}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-2">
          {showCopy && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleCopy}
            >
              {isCopied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy</span>
                </>
              )}
            </Button>
          )}

          {showQR && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <span>📱</span>
              <span>QR</span>
            </Button>
          )}
        </div>

        {ensName && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              ENS Resolved
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
