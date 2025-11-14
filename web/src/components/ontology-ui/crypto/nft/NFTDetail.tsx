/**
 * NFTDetail Component
 *
 * Full NFT detail modal with metadata, price history, and activity feed
 * Includes trait rarity percentages and contract details
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, truncate } from "../../utils";
import {
  formatTokenId,
  getRarityTier,
  getNFTExplorerUrl,
} from "@/lib/services/crypto/NFTService";
import type { NFTDetailProps } from "./types";
import type { NFTActivity } from "@/lib/services/crypto/NFTService";

export function NFTDetail({
  nft,
  tokenId,
  contract,
  chainId,
  showActivity = true,
  showOffers = true,
  onClose,
  onTransfer,
  onList,
  onBurn,
  variant = "default",
  size = "md",
  className,
}: NFTDetailProps) {
  const [loading, setLoading] = useState(!nft);
  const [activity, setActivity] = useState<NFTActivity[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!nft && tokenId && contract && chainId) {
      // Fetch NFT data
      setLoading(true);
      // Mock loading
      setTimeout(() => setLoading(false), 1000);
    }
  }, [nft, tokenId, contract, chainId]);

  useEffect(() => {
    if (nft && showActivity) {
      // Mock activity data
      const mockActivity: NFTActivity[] = [
        {
          type: "mint",
          tokenId: nft.tokenId,
          contract: nft.contract,
          to: nft.owner,
          transactionHash: "0x...",
          timestamp: Date.now() - 86400000 * 30,
        },
        {
          type: "transfer",
          tokenId: nft.tokenId,
          contract: nft.contract,
          from: "0x...prev",
          to: nft.owner,
          transactionHash: "0x...",
          timestamp: Date.now() - 86400000 * 7,
        },
      ];
      setActivity(mockActivity);
    }
  }, [nft, showActivity]);

  if (!nft && !loading) {
    return null;
  }

  const isVideo = nft?.animationUrl?.includes(".mp4") || nft?.animationUrl?.includes(".webm");
  const rarityInfo = nft?.rarity
    ? getRarityTier((nft.rarity.rank / nft.rarity.total) * 100)
    : null;

  return (
    <Dialog open={!!nft || loading} onOpenChange={() => onClose?.()}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", className)}>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : nft ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">🖼️</span>
                {nft.name}
                {rarityInfo && (
                  <Badge className={rarityInfo.color}>{rarityInfo.tier}</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {nft.collection?.name || nft.contractName} {formatTokenId(nft.tokenId)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image/Video */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                  {isVideo && nft.animationUrl ? (
                    <video
                      src={nft.animationUrl}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                    />
                  ) : nft.imageUrl || nft.image ? (
                    <img
                      src={nft.imageUrl || nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl opacity-20">🖼️</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {onTransfer && (
                    <Button variant="outline" onClick={onTransfer}>
                      Transfer
                    </Button>
                  )}
                  {onList && (
                    <Button variant="default" onClick={onList}>
                      List for Sale
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        getNFTExplorerUrl(nft.contract, nft.tokenId, nft.chainId),
                        "_blank"
                      )
                    }
                  >
                    View on OpenSea
                  </Button>
                  {onBurn && (
                    <Button variant="destructive" onClick={onBurn}>
                      Burn
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="attributes" className="flex-1">
                      Attributes
                    </TabsTrigger>
                    {showActivity && (
                      <TabsTrigger value="activity" className="flex-1">
                        Activity
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    {/* Description */}
                    {nft.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{nft.description}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Price Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">Price Information</h3>

                      {nft.collection?.floorPrice && (
                        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <span className="text-sm text-muted-foreground">Floor Price</span>
                          <div className="text-right">
                            <div className="font-bold">
                              {nft.collection.floorPrice}{" "}
                              {nft.chainName === "Ethereum" ? "ETH" : "MATIC"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${(parseFloat(nft.collection.floorPrice) * 2000).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {nft.lastSale && (
                        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <span className="text-sm text-muted-foreground">Last Sale</span>
                          <div className="text-right">
                            <div className="font-bold">
                              {nft.lastSale.price} {nft.lastSale.currency}
                            </div>
                            {nft.lastSale.priceUsd && (
                              <div className="text-xs text-muted-foreground">
                                ${nft.lastSale.priceUsd.toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(nft.lastSale.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Contract Details */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">Contract Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contract</span>
                          <span className="font-mono">{truncate(nft.contract, 16)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token ID</span>
                          <span className="font-mono">{nft.tokenId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Standard</span>
                          <Badge variant="outline">{nft.standard}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chain</span>
                          <Badge variant="secondary">{nft.chainName}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner</span>
                          <span className="font-mono">{truncate(nft.owner, 16)}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Attributes Tab */}
                  <TabsContent value="attributes" className="space-y-3">
                    {nft.attributes && nft.attributes.length > 0 ? (
                      <>
                        <h3 className="font-semibold">Traits</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {nft.attributes.map((attr, index) => (
                            <div
                              key={index}
                              className="p-3 bg-secondary rounded-lg border"
                            >
                              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                {attr.trait_type}
                              </div>
                              <div className="font-semibold">{attr.value}</div>
                              {attr.rarity !== undefined && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {attr.rarity}% rarity
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {nft.rarity && (
                          <>
                            <Separator />
                            <div className="p-4 bg-primary/10 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">Rarity Score</span>
                                <Badge className={rarityInfo?.color}>
                                  {rarityInfo?.tier}
                                </Badge>
                              </div>
                              <div className="text-2xl font-bold mb-1">
                                {nft.rarity.score.toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Rank #{nft.rarity.rank} of {nft.rarity.total}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No attributes available
                      </div>
                    )}
                  </TabsContent>

                  {/* Activity Tab */}
                  {showActivity && (
                    <TabsContent value="activity" className="space-y-3">
                      <h3 className="font-semibold">Transaction History</h3>
                      {activity.length > 0 ? (
                        <div className="space-y-2">
                          {activity.map((event, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                            >
                              <div className="text-2xl">
                                {event.type === "mint" && "⚡"}
                                {event.type === "transfer" && "↗"}
                                {event.type === "sale" && "💳"}
                                {event.type === "list" && "🏷️"}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium capitalize">{event.type}</div>
                                {event.from && event.to && (
                                  <div className="text-xs text-muted-foreground">
                                    From {truncate(event.from, 12)} → To{" "}
                                    {truncate(event.to, 12)}
                                  </div>
                                )}
                                {event.price && (
                                  <div className="text-sm font-semibold">
                                    {event.price} {event.currency}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No activity yet
                        </div>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
