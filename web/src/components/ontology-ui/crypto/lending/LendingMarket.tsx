/**
 * LendingMarket Component (Cycle 65)
 *
 * View lending markets across multiple protocols (Aave, Compound).
 *
 * Features:
 * - List of lending protocols with market data
 * - Available markets with APY comparison
 * - Supply/borrow APY display
 * - Filter by asset, chain, protocol, APY
 * - Sort by TVL, APY, utilization
 * - Market overview dashboard with key metrics
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { LendingMarket } from "@/lib/services/crypto/LendingService";

interface LendingMarketProps {
  markets?: LendingMarket[];
  onSelectMarket?: (market: LendingMarket) => void;
  isLoading?: boolean;
}

type SortField = "tvl" | "supplyAPY" | "borrowAPY" | "utilization";
type SortDirection = "asc" | "desc";

export function LendingMarketComponent({
  markets = [],
  onSelectMarket,
  isLoading = false
}: LendingMarketProps) {
  const [filteredMarkets, setFilteredMarkets] = useState<LendingMarket[]>(markets);
  const [searchQuery, setSearchQuery] = useState("");
  const [protocolFilter, setProtocolFilter] = useState<string>("all");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("tvl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...markets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.asset.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Protocol filter
    if (protocolFilter !== "all") {
      filtered = filtered.filter((m) => m.protocol === protocolFilter);
    }

    // Chain filter
    if (chainFilter !== "all") {
      filtered = filtered.filter((m) => m.chain === chainFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "tvl":
          aValue = parseFloat(a.tvl);
          bValue = parseFloat(b.tvl);
          break;
        case "supplyAPY":
          aValue = a.supplyAPY;
          bValue = b.supplyAPY;
          break;
        case "borrowAPY":
          aValue = a.borrowAPY;
          bValue = b.borrowAPY;
          break;
        case "utilization":
          aValue = a.utilization;
          bValue = b.utilization;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredMarkets(filtered);
  }, [markets, searchQuery, protocolFilter, chainFilter, sortField, sortDirection]);

  // Calculate aggregate stats
  const totalTVL = markets.reduce((sum, m) => sum + parseFloat(m.tvl), 0);
  const avgSupplyAPY = markets.length > 0
    ? markets.reduce((sum, m) => sum + m.supplyAPY, 0) / markets.length
    : 0;
  const avgBorrowAPY = markets.length > 0
    ? markets.reduce((sum, m) => sum + m.borrowAPY, 0) / markets.length
    : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total TVL</div>
            <div className="text-2xl font-bold">{formatCurrency(totalTVL.toString())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Avg Supply APY</div>
            <div className="text-2xl font-bold text-green-600">{avgSupplyAPY.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Avg Borrow APY</div>
            <div className="text-2xl font-bold text-blue-600">{avgBorrowAPY.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lending Markets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={protocolFilter} onValueChange={setProtocolFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Protocols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="aave">Aave</SelectItem>
                <SelectItem value="compound">Compound</SelectItem>
                <SelectItem value="maker">Maker</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Chains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortField}-${sortDirection}`}
              onValueChange={(value) => {
                const [field, direction] = value.split("-") as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tvl-desc">TVL (High to Low)</SelectItem>
                <SelectItem value="tvl-asc">TVL (Low to High)</SelectItem>
                <SelectItem value="supplyAPY-desc">Supply APY (High to Low)</SelectItem>
                <SelectItem value="supplyAPY-asc">Supply APY (Low to High)</SelectItem>
                <SelectItem value="borrowAPY-desc">Borrow APY (High to Low)</SelectItem>
                <SelectItem value="borrowAPY-asc">Borrow APY (Low to High)</SelectItem>
                <SelectItem value="utilization-desc">Utilization (High to Low)</SelectItem>
                <SelectItem value="utilization-asc">Utilization (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Markets Table */}
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-muted/50 rounded-lg font-medium text-sm">
              <div>Asset</div>
              <div>Protocol</div>
              <div className="text-right">Supply APY</div>
              <div className="text-right">Borrow APY</div>
              <div className="text-right">TVL</div>
              <div className="text-right">Utilization</div>
              <div className="text-right">Action</div>
            </div>

            {/* Market Rows */}
            {filteredMarkets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No markets found
              </div>
            ) : (
              filteredMarkets.map((market, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-4 items-center">
                      {/* Asset */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                          {market.asset[0]}
                        </div>
                        <div>
                          <div className="font-medium">{market.asset}</div>
                          <div className="text-xs text-muted-foreground">{market.chain}</div>
                        </div>
                      </div>

                      {/* Protocol */}
                      <div>
                        <Badge variant="outline" className="capitalize">
                          {market.protocol}
                        </Badge>
                      </div>

                      {/* Supply APY */}
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {market.supplyAPY.toFixed(2)}%
                        </div>
                      </div>

                      {/* Borrow APY */}
                      <div className="text-right">
                        <div className="font-medium text-blue-600">
                          {market.borrowAPY.toFixed(2)}%
                        </div>
                      </div>

                      {/* TVL */}
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(market.tvl)}</div>
                      </div>

                      {/* Utilization */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="font-medium">{market.utilization}%</div>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${market.utilization}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <Button
                          size="sm"
                          onClick={() => onSelectMarket?.(market)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Details */}
      <Card>
        <CardHeader>
          <CardTitle>About Lending Markets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Supply (Lend)</h3>
              <p className="text-sm text-muted-foreground">
                Supply your tokens to earn interest. You'll receive receipt tokens
                (aTokens for Aave, cTokens for Compound) that accrue interest over time.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Borrow</h3>
              <p className="text-sm text-muted-foreground">
                Borrow tokens by supplying collateral. Your collateral must exceed
                your borrowed amount by the collateral factor to avoid liquidation.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Utilization</h3>
              <p className="text-sm text-muted-foreground">
                Shows how much of the available supply is currently borrowed.
                Higher utilization typically means higher APYs.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Collateral Factor</h3>
              <p className="text-sm text-muted-foreground">
                The percentage of your collateral value you can borrow against.
                For example, 0.75 means you can borrow up to 75% of your collateral value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
