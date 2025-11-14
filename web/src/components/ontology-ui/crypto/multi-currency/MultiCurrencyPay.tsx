/**
 * MultiCurrencyPay - Pay in any supported token
 *
 * Features:
 * - Display price in multiple currencies
 * - Auto-detect wallet tokens
 * - Best rate finder
 * - One-click currency switch
 * - Show savings vs other tokens
 * - Gas fee comparison
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  CheckCircle2,
  TrendingDown,
  Fuel,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Effect } from "effect";
import {
  getMultiCurrencyPrices,
  calculateSavings,
  formatCurrencyAmount,
  SUPPORTED_CRYPTO,
  type CurrencyInfo,
} from "@/lib/services/crypto/ExchangeService";

export interface WalletToken {
  symbol: string;
  balance: number;
  balanceUSD: number;
}

export interface MultiCurrencyPayProps {
  priceUSD: number;
  itemName: string;
  walletTokens?: WalletToken[];
  onPaymentSelect?: (currency: string, amount: number) => void;
  showGasComparison?: boolean;
  showSavings?: boolean;
}

interface PaymentOption {
  currency: CurrencyInfo;
  amount: number;
  amountUSD: number;
  gasEstimate: number;
  totalCost: number;
  savings: number;
  savingsPercentage: number;
  available: boolean;
  balance?: number;
  estimatedTime: number;
}

export function MultiCurrencyPay({
  priceUSD,
  itemName,
  walletTokens = [],
  onPaymentSelect,
  showGasComparison = true,
  showSavings = true,
}: MultiCurrencyPayProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("usdc");
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestOption, setBestOption] = useState<PaymentOption | null>(null);

  // Load payment options
  const loadPaymentOptions = async () => {
    setLoading(true);
    try {
      // Get prices for all supported cryptocurrencies
      const currencyIds = SUPPORTED_CRYPTO.map((c) => c.id);
      const prices = await Effect.runPromise(
        getMultiCurrencyPrices("usd", currencyIds)
      );

      const options: PaymentOption[] = SUPPORTED_CRYPTO.map((currency) => {
        const price = prices[currency.symbol.toLowerCase()] || 0;
        const amount = priceUSD / price;

        // Mock gas estimates (would come from blockchain in production)
        const gasEstimate = currency.symbol === "ETH"
          ? 0.002
          : currency.symbol === "BNB"
          ? 0.0005
          : currency.symbol === "MATIC"
          ? 0.00001
          : 0.0001;

        const gasUSD = gasEstimate * (prices.eth || 2300);
        const totalCost = priceUSD + gasUSD;

        // Calculate savings vs paying with ETH
        const ethGasUSD = 0.002 * (prices.eth || 2300);
        const ethTotalCost = priceUSD + ethGasUSD;
        const savingsResult = calculateSavings(ethTotalCost, totalCost, 0);

        // Check if user has this token
        const walletToken = walletTokens.find((t) => t.symbol === currency.symbol);
        const available = walletToken ? walletToken.balance >= amount : false;

        // Estimate transaction time
        const estimatedTime = currency.symbol === "ETH"
          ? 15
          : currency.symbol === "MATIC"
          ? 2
          : currency.symbol === "SOL"
          ? 1
          : 5;

        return {
          currency,
          amount,
          amountUSD: priceUSD,
          gasEstimate,
          totalCost,
          savings: savingsResult.savingsAmount,
          savingsPercentage: savingsResult.savingsPercentage,
          available,
          balance: walletToken?.balance,
          estimatedTime,
        };
      });

      // Sort by best savings
      options.sort((a, b) => b.savings - a.savings);

      setPaymentOptions(options);

      // Find best available option
      const best = options.find((o) => o.available) || options[0];
      setBestOption(best);
      setSelectedCurrency(best.currency.id);
    } catch (error) {
      console.error("Failed to load payment options:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentOptions();
  }, [priceUSD]);

  const selectedOption = paymentOptions.find(
    (o) => o.currency.id === selectedCurrency
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with Crypto</CardTitle>
        <CardDescription>
          Choose your preferred payment method for {itemName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Total Price</p>
          <p className="text-3xl font-bold">${priceUSD.toFixed(2)}</p>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Payment Token</label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentOptions.map((option) => (
                <SelectItem key={option.currency.id} value={option.currency.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>
                      {option.currency.symbol} - {option.currency.name}
                    </span>
                    {option.available && (
                      <Badge variant="outline" className="text-xs">
                        <Wallet className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Option Details */}
        {selectedOption && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{selectedOption.currency.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOption.currency.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">
                  {selectedOption.amount.toFixed(6)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${selectedOption.amountUSD.toFixed(2)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Gas Fee */}
            {showGasComparison && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fuel className="h-4 w-4" />
                  <span>Gas Fee</span>
                </div>
                <div className="text-right">
                  <p className="font-mono">
                    {selectedOption.gasEstimate.toFixed(6)} {selectedOption.currency.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ~${(selectedOption.gasEstimate * selectedOption.amountUSD / selectedOption.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Estimated Time</span>
              </div>
              <span className="font-medium">
                ~{selectedOption.estimatedTime}s
              </span>
            </div>

            {/* Savings */}
            {showSavings && selectedOption.savings > 0 && (
              <div className="flex items-center justify-between text-sm p-2 bg-green-50 dark:bg-green-950 rounded">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingDown className="h-4 w-4" />
                  <span>Savings vs ETH</span>
                </div>
                <div className="text-right text-green-700 dark:text-green-400 font-medium">
                  <p>${selectedOption.savings.toFixed(2)}</p>
                  <p className="text-xs">
                    ({selectedOption.savingsPercentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            )}

            {/* Balance Warning */}
            {!selectedOption.available && selectedOption.balance !== undefined && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-950 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Insufficient balance. You have {selectedOption.balance.toFixed(4)} {selectedOption.currency.symbol}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Best Option Recommendation */}
        {bestOption && bestOption.currency.id !== selectedCurrency && (
          <div className="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Best Rate Available
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Pay with {bestOption.currency.symbol} to save ${bestOption.savings.toFixed(2)}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-1 text-blue-600 dark:text-blue-400"
                  onClick={() => setSelectedCurrency(bestOption.currency.id)}
                >
                  Switch to {bestOption.currency.symbol}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={!selectedOption?.available}
          onClick={() => {
            if (selectedOption) {
              onPaymentSelect?.(selectedOption.currency.symbol, selectedOption.amount);
            }
          }}
        >
          {selectedOption?.available ? (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              Pay {selectedOption.amount.toFixed(6)} {selectedOption.currency.symbol}
            </>
          ) : (
            "Insufficient Balance"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
