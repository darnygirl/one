/**
 * ReceivePayment Component
 *
 * Generate payment request with:
 * - QR code with address
 * - Copy address button
 * - Optional amount field
 * - Share link generation
 * - Multiple currencies
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "../../utils";
import type { ReceivePaymentProps } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

const DEFAULT_CURRENCIES = ["ETH", "USDC", "USDT", "DAI"];

export function ReceivePayment({
  address,
  chainId = 1,
  currencies = DEFAULT_CURRENCIES,
  showQR = true,
  onCopy,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ReceivePaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRequest = async () => {
    setIsGenerating(true);

    try {
      const request = await Effect.runPromise(
        PaymentService.createPaymentRequest(
          address,
          amount || undefined,
          selectedCurrency,
          3600000 // 1 hour expiry
        )
      );

      setQrCode(request.qrCode);
      setPaymentLink(request.link);
    } catch (err) {
      console.error("Failed to generate payment request:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment Request",
          text: `Send ${amount || "any amount of"} ${selectedCurrency} to this address`,
          url: paymentLink,
        });
      } catch (err) {
        console.error("Failed to share:", err);
      }
    }
  };

  useEffect(() => {
    handleGenerateRequest();
  }, [address, amount, selectedCurrency]);

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
              <span className="text-2xl">📥</span>
              <span>Receive Payment</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Generate a payment request with QR code
            </CardDescription>
          </div>
          <Badge variant="outline">Chain {chainId}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code Display */}
        {showQR && qrCode && (
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <img
              src={qrCode}
              alt="Payment QR Code"
              className="w-48 h-48 border-2 border-gray-200 rounded-lg"
            />
          </div>
        )}

        {/* Address Display */}
        <div className="space-y-2">
          <Label>Your Address</Label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-secondary rounded-lg font-mono text-sm break-all">
              {address}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyAddress}
              className="shrink-0"
            >
              {copied ? "✓" : "📋"}
            </Button>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (Optional)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Leave empty for any amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.000001"
            min="0"
          />
          <p className="text-xs text-muted-foreground">
            Specify an amount to pre-fill the payment request
          </p>
        </div>

        {/* Payment Link */}
        {paymentLink && (
          <div className="space-y-2">
            <Label>Payment Link</Label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-secondary rounded-lg font-mono text-xs break-all">
                {paymentLink}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                📋
              </Button>
            </div>
          </div>
        )}

        {copied && (
          <Alert>
            <AlertDescription>Copied to clipboard!</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleGenerateRequest}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Regenerate QR"}
        </Button>
        {navigator.share && (
          <Button variant="outline" onClick={handleShare}>
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
