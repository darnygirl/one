/**
 * TokenBalance - Individual token balance display
 *
 * Features:
 * - Token icon and name
 * - Balance in token units
 * - USD value
 * - 24h change percentage
 * - Compact and full variants
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TokenBalance as TokenBalanceType } from "@/lib/services/CryptoService";
import {
  formatUsdValue,
  formatPriceChange,
  getPriceChangeColor,
} from "@/lib/services/CryptoService";

export interface TokenBalanceProps {
  balance: TokenBalanceType;
  onClick?: () => void;
  compact?: boolean;
  showAddress?: boolean;
}

export function TokenBalance({
  balance,
  onClick,
  compact = false,
  showAddress = false,
}: TokenBalanceProps) {
  const { token } = balance;
  const changeColor = getPriceChangeColor(token.price_change_percentage_24h);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 py-3 border-b last:border-b-0 ${
          onClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""
        }`}
        onClick={onClick}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={token.image} alt={token.name} />
          <AvatarFallback>{token.symbol.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{token.name}</p>
            <Badge variant="outline" className="text-xs">
              {token.symbol.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {balance.balanceFormatted}
          </p>
        </div>

        <div className="text-right">
          <p className="font-medium">{formatUsdValue(balance.valueUsd)}</p>
          <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
            {token.price_change_percentage_24h > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : token.price_change_percentage_24h < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {formatPriceChange(token.price_change_percentage_24h)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={token.image} alt={token.name} />
            <AvatarFallback className="text-lg">
              {token.symbol.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{token.name}</h3>
              <Badge>{token.symbol.toUpperCase()}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className="text-xl font-bold">{balance.balanceFormatted}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Value</p>
                <p className="text-xl font-bold">
                  {formatUsdValue(balance.valueUsd)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="font-medium">
                  ${token.current_price.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                <div className={`flex items-center gap-1 font-medium ${changeColor}`}>
                  {token.price_change_percentage_24h > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : token.price_change_percentage_24h < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  {formatPriceChange(token.price_change_percentage_24h)}
                </div>
              </div>
            </div>

            {showAddress && balance.address && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {balance.address}
                </code>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
