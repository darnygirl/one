/**
 * NFTCard Component
 *
 * Individual NFT card display with image, metadata, and actions
 * Shows rarity, price, and owner information
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, truncate } from "../../utils";
import { formatTokenId, getRarityTier } from "@/lib/services/crypto/NFTService";
import type { NFTCardProps } from "./types";

export function NFTCard({
  nft,
  showRarity = true,
  showPrice = true,
  showOwner = false,
  onSelect,
  onTransfer,
  onList,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: NFTCardProps) {
  const hasImage = nft.imageUrl || nft.image;
  const isVideo = nft.animationUrl?.includes(".mp4") || nft.animationUrl?.includes(".webm");

  const rarityInfo = nft.rarity
    ? getRarityTier((nft.rarity.rank / nft.rarity.total) * 100)
    : null;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 overflow-hidden",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        size === "sm" && "max-w-xs",
        size === "lg" && "max-w-2xl",
        className
      )}
      onClick={() => onSelect?.(nft)}
    >
      {/* NFT Image/Video */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {hasImage ? (
          isVideo && nft.animationUrl ? (
            <video
              src={nft.animationUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={nft.imageUrl || nft.image}
              alt={nft.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-20">🖼️</span>
          </div>
        )}

        {/* Rarity Badge */}
        {showRarity && rarityInfo && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className={cn("backdrop-blur-sm", rarityInfo.color)}>
              {rarityInfo.tier}
            </Badge>
          </div>
        )}

        {/* ERC-1155 Balance */}
        {nft.balance && parseInt(nft.balance) > 1 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="backdrop-blur-sm">
              ×{nft.balance}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{nft.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="truncate">
                {nft.collection?.name || nft.contractName || truncate(nft.contract, 12)}
              </span>
              <Badge variant="outline" className="text-xs">
                {formatTokenId(nft.tokenId)}
              </Badge>
            </CardDescription>
          </div>

          {/* Standard Badge */}
          <Badge variant="outline" className="shrink-0 text-xs">
            {nft.standard}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price Info */}
        {showPrice && (
          <div className="space-y-2">
            {nft.collection?.floorPrice && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Floor Price</span>
                <span className="font-medium">
                  {nft.collection.floorPrice} {nft.chainName === "Ethereum" ? "ETH" : "MATIC"}
                </span>
              </div>
            )}

            {nft.lastSale && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sale</span>
                <div className="text-right">
                  <div className="font-medium">
                    {nft.lastSale.price} {nft.lastSale.currency}
                  </div>
                  {nft.lastSale.priceUsd && (
                    <div className="text-xs text-muted-foreground">
                      ${nft.lastSale.priceUsd.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Owner Info */}
        {showOwner && (
          <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${nft.owner}`} />
              <AvatarFallback>{nft.owner.slice(2, 4)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">Owner</div>
              <div className="text-sm font-mono truncate">{truncate(nft.owner, 14)}</div>
            </div>
          </div>
        )}

        {/* Rarity Score */}
        {showRarity && nft.rarity && (
          <div className="flex items-center justify-between p-2 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">Rarity Rank</span>
            <span className="text-sm font-bold">
              #{nft.rarity.rank} / {nft.rarity.total}
            </span>
          </div>
        )}
      </CardContent>

      {/* Quick Actions */}
      {interactive && (onTransfer || onList) && (
        <CardFooter className="flex gap-2 pt-3">
          {onTransfer && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onTransfer(nft);
              }}
            >
              Transfer
            </Button>
          )}
          {onList && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onList(nft);
              }}
            >
              List for Sale
            </Button>
          )}
        </CardFooter>
      )}

      {/* Chain Badge */}
      <div className="absolute bottom-2 right-2">
        <Badge variant="secondary" className="text-xs backdrop-blur-sm">
          {nft.chainName}
        </Badge>
      </div>
    </Card>
  );
}
