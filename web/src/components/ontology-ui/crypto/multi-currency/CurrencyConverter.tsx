/**
 * CurrencyConverter - Convert between crypto and fiat currencies
 *
 * Features:
 * - Dual input (from/to)
 * - Real-time exchange rates
 * - Support 50+ cryptocurrencies
 * - Support 20+ fiat currencies
 * - Swap button to reverse
 * - Historical rates chart
 * - Calculator mode
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, LineChart } from "lucide-react";
import { Effect } from "effect";
import {
  getExchangeRate,
  convertCurrency,
  getHistoricalRates,
  formatCurrencyAmount,
  SUPPORTED_CRYPTO,
  SUPPORTED_FIAT,
  type ConversionResult,
  type HistoricalRate,
} from "@/lib/services/crypto/ExchangeService";
import { Sparklines, SparklinesLine } from "react-sparklines";

export interface CurrencyConverterProps {
  defaultFrom?: string;
  defaultTo?: string;
  defaultAmount?: number;
  showChart?: boolean;
  showHistorical?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function CurrencyConverter({
  defaultFrom = "bitcoin",
  defaultTo = "usd",
  defaultAmount = 1,
  showChart = true,
  showHistorical = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: CurrencyConverterProps) {
  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [fromAmount, setFromAmount] = useState(String(defaultAmount));
  const [toAmount, setToAmount] = useState("0");
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const allCurrencies = [...SUPPORTED_CRYPTO, ...SUPPORTED_FIAT];

  // Perform conversion
  const performConversion = async () => {
    if (!fromAmount || Number(fromAmount) <= 0) return;

    setLoading(true);
    try {
      const result = await Effect.runPromise(
        convertCurrency(fromCurrency, toCurrency, Number(fromAmount))
      );

      setConversion(result);
      setToAmount(result.result.toFixed(6));
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load historical rates
  const loadHistoricalRates = async () => {
    if (!showHistorical) return;

    try {
      const rates = await Effect.runPromise(
        getHistoricalRates(fromCurrency, toCurrency, 30)
      );
      setHistoricalRates(rates);
    } catch (error) {
      console.error("Failed to load historical rates:", error);
    }
  };

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  // Initial conversion
  useEffect(() => {
    performConversion();
    loadHistoricalRates();
  }, [fromCurrency, toCurrency]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      performConversion();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fromCurrency, toCurrency, fromAmount]);

  // Handle amount changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      performConversion();
    }, 500);

    return () => clearTimeout(debounce);
  }, [fromAmount]);

  const priceChange = historicalRates.length > 1
    ? ((historicalRates[historicalRates.length - 1].rate - historicalRates[0].rate) / historicalRates[0].rate) * 100
    : 0;

  const chartData = historicalRates.map((r) => r.rate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Currency Converter</CardTitle>
            <CardDescription>
              Convert between 50+ cryptocurrencies and 20+ fiat currencies
            </CardDescription>
          </div>
          {conversion && (
            <Badge variant="outline" className="text-xs">
              Rate: 1 = {conversion.rate.toFixed(6)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* From Currency */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              From
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-lg font-mono"
                disabled={loading}
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Cryptocurrencies
                  </div>
                  {SUPPORTED_CRYPTO.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.symbol} - {currency.name}
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Fiat Currencies
                  </div>
                  {SUPPORTED_FIAT.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.symbol} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              disabled={loading}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              To
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={loading ? "Calculating..." : toAmount}
                readOnly
                className="flex-1 text-lg font-mono bg-muted"
              />
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Cryptocurrencies
                  </div>
                  {SUPPORTED_CRYPTO.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.symbol} - {currency.name}
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Fiat Currencies
                  </div>
                  {SUPPORTED_FIAT.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.symbol} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Conversion Details */}
        {conversion && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-mono">
                  1 = {conversion.rate.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (0.3%)</span>
                <span className="font-mono text-destructive">
                  -{formatCurrencyAmount(conversion.fee, toCurrency)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>You Receive</span>
                <span className="font-mono text-lg">
                  {formatCurrencyAmount(conversion.result, toCurrency)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Historical Chart */}
        {showChart && showHistorical && chartData.length > 1 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">30-Day History</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(priceChange).toFixed(2)}%
                </div>
              </div>
              <div className="border rounded-lg p-3 bg-muted/20">
                <Sparklines data={chartData} width={400} height={80}>
                  <SparklinesLine
                    color={priceChange >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                    style={{ strokeWidth: 2 }}
                  />
                </Sparklines>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          {autoRefresh && (
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Auto-refresh: {refreshInterval / 1000}s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
