/**
 * CheckoutWidget Component (Cycle 40)
 *
 * Crypto checkout widget for product purchases
 * - Product/service display with image
 * - Price in USD with live crypto conversion
 * - Multiple crypto options (ETH, USDC, USDT, etc.)
 * - QR code payment support
 * - Connect wallet or scan to pay
 * - Payment timer (15 min expiry)
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "../../utils";
import type { CheckoutWidgetProps, CryptoCurrency } from "./types";

export function CheckoutWidget({
  productName,
  productDescription,
  productImage,
  usdAmount,
  onPaymentComplete,
  onExpire,
  expiryMinutes = 15,
  supportedCurrencies = ["ETH", "USDC", "USDT"],
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: CheckoutWidgetProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>(
    supportedCurrencies[0] as CryptoCurrency
  );
  const [showQR, setShowQR] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(expiryMinutes * 60);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock crypto prices (replace with actual price API)
  const cryptoPrices: Record<CryptoCurrency, number> = {
    ETH: 2000,
    USDC: 1,
    USDT: 1,
    DAI: 1,
    MATIC: 0.7,
    BTC: 40000,
  };

  const cryptoAmount = (usdAmount / cryptoPrices[selectedCurrency]).toFixed(
    selectedCurrency === "BTC" ? 8 : 6
  );

  const paymentAddress = `0x${Math.random().toString(16).slice(2, 42)}`;

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handlePayment = async (method: "wallet" | "qr") => {
    setIsProcessing(true);

    try {
      if (method === "wallet") {
        // Mock wallet payment
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onPaymentComplete?.({
          paymentId: `pay_${Date.now()}`,
          transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          amount: cryptoAmount,
          currency: selectedCurrency,
          status: "confirmed",
          confirmations: 12,
          timestamp: Date.now(),
        });
      } else {
        setShowQR(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        size === "sm" && "max-w-md",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
        className
      )}
    >
      {/* Timer Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant={timeRemaining < 60 ? "destructive" : "outline"}
          className="text-xs"
        >
          ⏱️ {formatTime(timeRemaining)}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="text-2xl">Checkout</CardTitle>
        <CardDescription>Complete your purchase with crypto</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Product Display */}
        <div className="flex gap-4">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{productName}</h3>
            {productDescription && (
              <p className="text-sm text-muted-foreground">{productDescription}</p>
            )}
            <p className="text-2xl font-bold mt-2">${usdAmount.toFixed(2)}</p>
          </div>
        </div>

        <Separator />

        {/* Currency Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select
            value={selectedCurrency}
            onValueChange={(value) => setSelectedCurrency(value as CryptoCurrency)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {supportedCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {currency === "ETH" && "Ξ"}
                      {currency === "USDC" && "💵"}
                      {currency === "USDT" && "₮"}
                      {currency === "DAI" && "◈"}
                      {currency === "MATIC" && "⬢"}
                      {currency === "BTC" && "₿"}
                    </span>
                    <span>{currency}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Display */}
        <div className="bg-secondary p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-mono">${usdAmount.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">You Pay</span>
            <span className="text-xl font-bold font-mono">
              {cryptoAmount} {selectedCurrency}
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            Rate: 1 {selectedCurrency} = ${cryptoPrices[selectedCurrency].toLocaleString()}
          </div>
        </div>

        {/* QR Code Display */}
        {showQR && (
          <div className="border rounded-lg p-4 text-center space-y-3">
            <div className="bg-white p-4 inline-block rounded">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">QR</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Scan to pay</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs bg-secondary px-2 py-1 rounded">
                  {paymentAddress.slice(0, 12)}...{paymentAddress.slice(-8)}
                </code>
                <Button size="sm" variant="ghost" onClick={copyAddress}>
                  📋
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {!showQR && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>✓ Connect your wallet to pay instantly</p>
            <p>✓ Or scan QR code with your mobile wallet</p>
            <p>✓ Network fees will be added automatically</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!showQR ? (
          <>
            <Button
              className="flex-1"
              onClick={() => handlePayment("wallet")}
              disabled={isProcessing || timeRemaining === 0}
            >
              {isProcessing ? "Processing..." : "Connect Wallet"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handlePayment("qr")}
              disabled={timeRemaining === 0}
            >
              Show QR Code
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowQR(false)}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={() => handlePayment("wallet")}>
              I've Paid
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
