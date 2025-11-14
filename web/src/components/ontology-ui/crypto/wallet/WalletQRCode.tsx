/**
 * WalletQRCode Component
 *
 * Generate QR code for receiving payments
 * Include amount, download image
 */

import React, { useState } from "react";
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
import { cn, truncate } from "../../utils";
import type { WalletQRCodeProps } from "./types";

export function WalletQRCode({
  address,
  amount,
  label: labelProp,
  size: qrSize = 256,
  includeAmount = false,
  downloadable = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: WalletQRCodeProps) {
  const [customAmount, setCustomAmount] = useState(amount || "");
  const [customLabel, setCustomLabel] = useState(labelProp || "");

  const handleDownload = () => {
    // Mock download (replace with actual QR code generation and download)
    console.log("Downloading QR code for:", address);
  };

  const qrData = includeAmount && customAmount
    ? `ethereum:${address}?value=${customAmount}`
    : address;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span>Receive Payment</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Scan QR code to send to this address
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code Display (placeholder) */}
        <div
          className="flex items-center justify-center bg-white p-4 rounded-lg border-2 border-border mx-auto"
          style={{ width: qrSize, height: qrSize }}
        >
          <div className="text-center">
            <div className="text-6xl mb-2">📱</div>
            <div className="text-xs text-muted-foreground font-mono">
              QR Code
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {truncate(address, 16)}
            </div>
          </div>
        </div>

        {/* Address Display */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Address</Label>
          <code className="text-xs font-mono bg-secondary px-3 py-2 rounded block truncate">
            {address}
          </code>
        </div>

        {/* Amount Input (Optional) */}
        {includeAmount && (
          <div className="space-y-1">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
            {customAmount && (
              <Badge variant="secondary" className="text-xs mt-2">
                QR includes amount: {customAmount} ETH
              </Badge>
            )}
          </div>
        )}

        {/* Label Input (Optional) */}
        <div className="space-y-1">
          <Label htmlFor="label">Label (Optional)</Label>
          <Input
            id="label"
            type="text"
            placeholder="Payment description"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigator.clipboard.writeText(address)}
          >
            <span>📋</span>
            <span>Copy Address</span>
          </Button>

          {downloadable && (
            <Button
              variant="default"
              className="flex-1 gap-2"
              onClick={handleDownload}
            >
              <span>⬇️</span>
              <span>Download QR</span>
            </Button>
          )}
        </div>

        {customLabel && (
          <div className="text-xs text-muted-foreground text-center border-t pt-3">
            {customLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
