/**
 * NFTGallery Component
 *
 * Display NFT collection with filtering, sorting, and pagination
 * Supports grid/list view toggle and infinite scroll
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "../../utils";
import { NFTCard } from "./NFTCard";
import type { NFTGalleryProps } from "./types";
import type { NFT } from "@/lib/services/crypto/NFTService";

export function NFTGallery({
  nfts = [],
  owner,
  chainId,
  view: initialView = "grid",
  filter,
  sortBy: initialSortBy = "recent",
  pageSize = 12,
  onNFTSelect,
  loading = false,
  emptyMessage = "No NFTs found",
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: NFTGalleryProps) {
  const [view, setView] = useState<"grid" | "list">(initialView);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredNFTs, setFilteredNFTs] = useState<NFT[]>(nfts);

  // Filter and sort NFTs
  useEffect(() => {
    let filtered = [...nfts];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.tokenId.includes(searchQuery)
      );
    }

    // Apply collection filter
    if (selectedCollection !== "all") {
      filtered = filtered.filter((nft) => nft.contract === selectedCollection);
    }

    // Apply custom filters
    if (filter) {
      if (filter.traits) {
        filtered = filtered.filter((nft) =>
          nft.attributes?.some((attr) =>
            Object.entries(filter.traits!).every(
              ([key, value]) =>
                attr.trait_type === key && attr.value === value
            )
          )
        );
      }

      if (filter.minPrice || filter.maxPrice) {
        filtered = filtered.filter((nft) => {
          const price = parseFloat(nft.lastSale?.price || "0");
          if (filter.minPrice && price < parseFloat(filter.minPrice)) return false;
          if (filter.maxPrice && price > parseFloat(filter.maxPrice)) return false;
          return true;
        });
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "rarity":
        filtered.sort((a, b) => (b.rarity?.score || 0) - (a.rarity?.score || 0));
        break;
      case "price":
        filtered.sort(
          (a, b) =>
            parseFloat(b.lastSale?.price || "0") -
            parseFloat(a.lastSale?.price || "0")
        );
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            (b.lastSale?.timestamp || 0) - (a.lastSale?.timestamp || 0)
        );
    }

    setFilteredNFTs(filtered);
    setCurrentPage(1);
  }, [nfts, searchQuery, selectedCollection, sortBy, filter]);

  // Get unique collections
  const collections = Array.from(
    new Set(nfts.map((nft) => nft.contract))
  ).map((contract) => {
    const nft = nfts.find((n) => n.contract === contract);
    return {
      address: contract,
      name: nft?.collection?.name || nft?.contractName || contract.slice(0, 8),
    };
  });

  // Pagination
  const totalPages = Math.ceil(filteredNFTs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentNFTs = filteredNFTs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Loading NFTs...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            NFT Gallery
            <Badge variant="secondary">{filteredNFTs.length}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("grid")}
              >
                <span className="text-sm">⊞</span>
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
              >
                <span className="text-sm">☰</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          {/* Search */}
          <Input
            placeholder="Search NFTs by name or token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />

          {/* Collection Filter */}
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Collections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.address} value={collection.address}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Acquired</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {currentNFTs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* NFT Grid/List */}
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
              )}
            >
              {currentNFTs.map((nft) => (
                <NFTCard
                  key={`${nft.contract}-${nft.tokenId}`}
                  nft={nft}
                  showRarity
                  showPrice
                  showOwner
                  onSelect={onNFTSelect}
                  variant={view === "list" ? "outline" : "default"}
                  className={view === "list" ? "flex-row" : ""}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredNFTs.length)}{" "}
                  of {filteredNFTs.length} NFTs
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
