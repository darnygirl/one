/**
 * PaymentLink Component
 *
 * Create shareable payment link with:
 * - Custom payment amount
 * - Description/memo field
 * - Expiration time
 * - Success/cancel redirect URLs
 * - Link preview and QR code
 */

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn, formatCurrency, formatRelativeTime } from "../../utils";
import type { PaymentLinkProps } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

const EXPIRY_OPTIONS = [
  { label: "1 hour", value: 3600000 },
  { label: "24 hours", value: 86400000 },
  { label: "7 days", value: 604800000 },
  { label: "30 days", value: 2592000000 },
  { label: "Never", value: 0 },
];

export function PaymentLink({
  defaultAmount,
  defaultCurrency = "ETH",
  onLinkCreated,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: PaymentLinkProps) {
  const [amount, setAmount] = useState(defaultAmount || "");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [description, setDescription] = useState("");
  const [expiryTime, setExpiryTime] = useState(EXPIRY_OPTIONS[1].value);
  const [successUrl, setSuccessUrl] = useState("");
  const [cancelUrl, setCancelUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<PaymentService.PaymentLink | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    if (!amount) return;

    setIsGenerating(true);

    try {
      const link = await Effect.runPromise(
        PaymentService.createPaymentLink(
          amount,
          currency,
          description || undefined,
          expiryTime || undefined,
          successUrl || undefined,
          cancelUrl || undefined
        )
      );

      setGeneratedLink(link);
      onLinkCreated?.(link.url);
    } catch (err) {
      console.error("Failed to generate payment link:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (!generatedLink || !navigator.share) return;

    try {
      await navigator.share({
        title: "Payment Request",
        text: description || `Pay ${amount} ${currency}`,
        url: generatedLink.url,
      });
    } catch (err) {
      console.error("Failed to share:", err);
    }
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
              <span className="text-2xl">🔗</span>
              <span>Payment Link</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Create a shareable payment link with custom settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!generatedLink ? (
          <>
            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description / Memo</Label>
              <Textarea
                id="description"
                placeholder="What is this payment for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiry">Link Expiration</Label>
              <Select
                value={expiryTime.toString()}
                onValueChange={(val) => setExpiryTime(parseInt(val))}
              >
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Redirect URLs */}
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="successUrl">Success Redirect URL (Optional)</Label>
                <Input
                  id="successUrl"
                  type="url"
                  placeholder="https://example.com/success"
                  value={successUrl}
                  onChange={(e) => setSuccessUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelUrl">Cancel Redirect URL (Optional)</Label>
                <Input
                  id="cancelUrl"
                  type="url"
                  placeholder="https://example.com/cancel"
                  value={cancelUrl}
                  onChange={(e) => setCancelUrl(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Generated Link Preview */}
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img
                  src={generatedLink.qrCode}
                  alt="Payment Link QR Code"
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                />
              </div>

              {/* Link Details */}
              <div className="space-y-3 p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-bold">
                    {generatedLink.amount} {generatedLink.currency}
                  </span>
                </div>
                {generatedLink.description && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">
                      Description
                    </span>
                    <span className="text-sm text-right max-w-[200px]">
                      {generatedLink.description}
                    </span>
                  </div>
                )}
                {generatedLink.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expires</span>
                    <Badge variant="outline">
                      {formatRelativeTime(generatedLink.expiresAt)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Payment URL */}
              <div className="space-y-2">
                <Label>Payment URL</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-secondary rounded-lg font-mono text-xs break-all">
                    {generatedLink.url}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? "✓" : "📋"}
                  </Button>
                </div>
              </div>

              {copied && (
                <Alert>
                  <AlertDescription>Copied to clipboard!</AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!generatedLink ? (
          <Button
            className="w-full"
            onClick={handleGenerateLink}
            disabled={!amount || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Payment Link"}
          </Button>
        ) : (
          <>
            <Button
              className="flex-1"
              onClick={() => setGeneratedLink(null)}
              variant="outline"
            >
              Create New
            </Button>
            {navigator.share && (
              <Button onClick={handleShare}>Share Link</Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
