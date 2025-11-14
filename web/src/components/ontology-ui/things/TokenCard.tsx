/**
 * TokenCard Component
 *
 * Display token information with balance and metadata
 * Part of THINGS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Thing, CardProps } from "../types";
import { cn, formatNumber } from "../utils";

export interface TokenCardProps extends CardProps {
  token: Thing;
  balance?: number;
  symbol?: string;
}

export function TokenCard({
  token,
  balance,
  symbol,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: TokenCardProps) {
  const tokenBalance = balance ?? (token.metadata?.balance as number);
  const tokenSymbol = symbol ?? (token.metadata?.symbol as string) ?? token.name;
  const blockchain = token.metadata?.blockchain as string;
  const contract = token.metadata?.contract as string;
  const supply = token.metadata?.supply as number;
  const decimals = token.metadata?.decimals as number;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="line-clamp-1">{tokenSymbol}</span>
            </CardTitle>
            {token.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {token.description}
              </CardDescription>
            )}
          </div>
          {blockchain && (
            <Badge variant="outline" className="ml-2">
              {blockchain}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tokenBalance !== undefined && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-lg font-bold">
              {formatNumber(tokenBalance)} {tokenSymbol}
            </span>
          </div>
        )}

        {supply !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Supply</span>
            <span className="font-mono">{formatNumber(supply)}</span>
          </div>
        )}

        {decimals !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Decimals</span>
            <span className="font-mono">{decimals}</span>
          </div>
        )}

        {contract && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Contract Address</span>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded truncate flex-1">
                {contract}
              </code>
            </div>
          </div>
        )}

        {token.metadata?.network && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🌐</span>
            <span>{token.metadata.network as string}</span>
          </div>
        )}

        {interactive && (
          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity border-t pt-2">
            View details →
          </div>
        )}
      </CardContent>
    </Card>
  );
}
