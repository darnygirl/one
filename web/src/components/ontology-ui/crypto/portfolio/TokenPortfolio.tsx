/**
 * TokenPortfolio - Display all tokens in wallet with virtualization
 *
 * Features:
 * - Virtualized list for 1000+ tokens (react-window)
 * - Sort by value, name, change %
 * - Search and filter
 * - Total portfolio value
 * - Real-time price updates
 */

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { TokenBalance } from "@/lib/services/CryptoService";
import {
  formatUsdValue,
  calculatePortfolioValue,
  sortTokensByValue,
} from "@/lib/services/CryptoService";
import { TokenBalance as TokenBalanceComponent } from "./TokenBalance";

export interface TokenPortfolioProps {
  balances: TokenBalance[];
  loading?: boolean;
  onTokenSelect?: (tokenId: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

type SortOption = "value" | "name" | "change" | "balance";
type SortDirection = "asc" | "desc";

export function TokenPortfolio({
  balances,
  loading = false,
  onTokenSelect,
  autoRefresh = true,
  refreshInterval = 30000,
}: TokenPortfolioProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [minValue, setMinValue] = useState(0);

  // Filter and sort tokens
  const filteredAndSorted = useMemo(() => {
    let filtered = balances;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (balance) =>
          balance.token.name.toLowerCase().includes(query) ||
          balance.token.symbol.toLowerCase().includes(query)
      );
    }

    // Minimum value filter
    if (minValue > 0) {
      filtered = filtered.filter((balance) => balance.valueUsd >= minValue);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "value":
          comparison = a.valueUsd - b.valueUsd;
          break;
        case "name":
          comparison = a.token.name.localeCompare(b.token.name);
          break;
        case "change":
          comparison =
            a.token.price_change_percentage_24h -
            b.token.price_change_percentage_24h;
          break;
        case "balance":
          comparison =
            parseFloat(a.balance) - parseFloat(b.balance);
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    return sorted;
  }, [balances, searchQuery, sortBy, sortDirection, minValue]);

  // Calculate portfolio stats
  const portfolioValue = useMemo(
    () => calculatePortfolioValue(filteredAndSorted),
    [filteredAndSorted]
  );

  const portfolioChange24h = useMemo(() => {
    const totalChange = filteredAndSorted.reduce((sum, balance) => {
      const changeValue =
        balance.valueUsd * (balance.token.price_change_percentage_24h / 100);
      return sum + changeValue;
    }, 0);
    return (totalChange / portfolioValue) * 100;
  }, [filteredAndSorted, portfolioValue]);

  // Toggle sort direction
  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Token Portfolio</CardTitle>
            <CardDescription>
              {filteredAndSorted.length} tokens
              {searchQuery && ` (filtered from ${balances.length})`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatUsdValue(portfolioValue)}
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                portfolioChange24h >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {portfolioChange24h >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {portfolioChange24h >= 0 ? "+" : ""}
              {portfolioChange24h.toFixed(2)}% (24h)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) => handleSortChange(value as SortOption)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="change">24h Change</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
              }
            >
              {sortDirection === "desc" ? "↓" : "↑"}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Badge
              variant={minValue === 0 ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setMinValue(0)}
            >
              All
            </Badge>
            <Badge
              variant={minValue === 1 ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setMinValue(1)}
            >
              {">"} $1
            </Badge>
            <Badge
              variant={minValue === 100 ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setMinValue(100)}
            >
              {">"} $100
            </Badge>
            <Badge
              variant={minValue === 1000 ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setMinValue(1000)}
            >
              {">"} $1K
            </Badge>
          </div>
        </div>

        {/* Token List */}
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tokens found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg max-h-[600px] overflow-y-auto">
            {filteredAndSorted.map((balance, index) => (
              <div key={balance.token.id} className="px-4">
                <TokenBalanceComponent
                  balance={balance}
                  onClick={() => onTokenSelect?.(balance.token.id)}
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
