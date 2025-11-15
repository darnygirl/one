/**
 * NFTMarketplace Component
 *
 * List/buy NFTs with marketplace integration
 * Supports fixed price listings, auctions, and offers
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn, truncate } from "../../utils";
import { formatTokenId } from "@/lib/services/crypto/NFTService";
import type { NFTMarketplaceProps } from "./types";

export function NFTMarketplace({
  nft,
  mode = "list",
  listings = [],
  offers = [],
  onList,
  onBuy,
  onMakeOffer,
  onAcceptOffer,
  variant = "default",
  size = "md",
  className,
}: NFTMarketplaceProps) {
  const [listPrice, setListPrice] = useState("");
  const [listCurrency, setListCurrency] = useState("ETH");
  const [listDuration, setListDuration] = useState("7");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerCurrency, setOfferCurrency] = useState("WETH");
  const [offerDuration, setOfferDuration] = useState("3");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleList = async () => {
    if (!listPrice || !nft) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onList?.(listPrice, listCurrency);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!offerPrice) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const expiresAt = Date.now() + parseInt(offerDuration) * 86400000;
      onMakeOffer?.(offerPrice, expiresAt);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={cn("max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          NFT Marketplace
        </CardTitle>
        <CardDescription>
          List your NFT for sale or make an offer
        </CardDescription>
      </CardHeader>

      {/* NFT Preview */}
      {nft && (
        <CardContent className="pb-4">
          <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
            {nft.imageUrl && (
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-20 h-20 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <div className="font-semibold">{nft.name}</div>
              <div className="text-sm text-muted-foreground">
                {nft.collection?.name || truncate(nft.contract, 16)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{formatTokenId(nft.tokenId)}</Badge>
                {nft.collection?.floorPrice && (
                  <Badge variant="secondary">
                    Floor: {nft.collection.floorPrice} ETH
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}

      <CardContent>
        <Tabs defaultValue={mode}>
          <TabsList className="w-full">
            <TabsTrigger value="list" className="flex-1">
              List for Sale
            </TabsTrigger>
            <TabsTrigger value="buy" className="flex-1">
              Buy Now
            </TabsTrigger>
            <TabsTrigger value="offer" className="flex-1">
              Make Offer
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex-1">
              View Offers
            </TabsTrigger>
          </TabsList>

          {/* List for Sale Tab */}
          <TabsContent value="list" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="list-price">Listing Price</Label>
              <div className="flex gap-2">
                <Input
                  id="list-price"
                  type="number"
                  placeholder="0.00"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="flex-1"
                />
                <Select value={listCurrency} onValueChange={setListCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="WETH">WETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {listPrice && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(listPrice) * 2000).toLocaleString()} USD
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={listDuration} onValueChange={setListDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="0">No expiration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Fees Breakdown */}
            <div className="space-y-2">
              <div className="font-semibold mb-2">Fees</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketplace Fee (2.5%)</span>
                  <span>
                    {listPrice ? (parseFloat(listPrice) * 0.025).toFixed(4) : "0"} {listCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator Royalty (5%)</span>
                  <span>
                    {listPrice ? (parseFloat(listPrice) * 0.05).toFixed(4) : "0"} {listCurrency}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>You'll receive</span>
                  <span>
                    {listPrice ? (parseFloat(listPrice) * 0.925).toFixed(4) : "0"} {listCurrency}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleList}
              disabled={!listPrice || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Listing..." : "List NFT"}
            </Button>
          </TabsContent>

          {/* Buy Now Tab */}
          <TabsContent value="buy" className="space-y-4 mt-4">
            {listings.length > 0 ? (
              <>
                {listings.map((listing) => (
                  <div
                    key={listing.listingId}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {listing.price} {listing.currency}
                        </div>
                        {listing.priceUsd && (
                          <div className="text-sm text-muted-foreground">
                            ${listing.priceUsd.toLocaleString()} USD
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary">{listing.marketplace}</Badge>
                    </div>

                    <div className="text-sm">
                      <div className="text-muted-foreground">Seller</div>
                      <div className="font-mono">{truncate(listing.seller, 16)}</div>
                    </div>

                    {listing.expiresAt && (
                      <div className="text-xs text-muted-foreground">
                        Expires: {new Date(listing.expiresAt).toLocaleDateString()}
                      </div>
                    )}

                    <Button
                      onClick={() => onBuy?.(listing.listingId)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Buy Now
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active listings
              </div>
            )}
          </TabsContent>

          {/* Make Offer Tab */}
          <TabsContent value="offer" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="offer-price">Offer Price</Label>
              <div className="flex gap-2">
                <Input
                  id="offer-price"
                  type="number"
                  placeholder="0.00"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="flex-1"
                />
                <Select value={offerCurrency} onValueChange={setOfferCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WETH">WETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {nft?.collection?.floorPrice && offerPrice && (
                <div className="text-sm text-muted-foreground">
                  {((parseFloat(offerPrice) / parseFloat(nft.collection.floorPrice)) * 100).toFixed(0)}% of floor price
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-duration">Offer Duration</Label>
              <Select value={offerDuration} onValueChange={setOfferDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleMakeOffer}
              disabled={!offerPrice || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Submitting..." : "Make Offer"}
            </Button>
          </TabsContent>

          {/* View Offers Tab */}
          <TabsContent value="offers" className="space-y-4 mt-4">
            {offers.length > 0 ? (
              <>
                {offers.map((offer) => (
                  <div key={offer.offerId} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {offer.price} {offer.currency}
                        </div>
                        {offer.priceUsd && (
                          <div className="text-sm text-muted-foreground">
                            ${offer.priceUsd.toLocaleString()} USD
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          offer.expiresAt > Date.now() ? "default" : "secondary"
                        }
                      >
                        {offer.expiresAt > Date.now() ? "Active" : "Expired"}
                      </Badge>
                    </div>

                    <div className="text-sm">
                      <div className="text-muted-foreground">From</div>
                      <div className="font-mono">{truncate(offer.offerer, 16)}</div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </div>

                    {offer.expiresAt > Date.now() && (
                      <Button
                        onClick={() => onAcceptOffer?.(offer.offerId)}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        Accept Offer
                      </Button>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No offers yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
