/**
 * NFTBurn Component
 *
 * Burn NFTs with confirmation and proof of burn certificate
 * Includes reason selection and safety warnings
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn, truncate } from "../../utils";
import { formatTokenId } from "@/lib/services/crypto/NFTService";
import type { NFTBurnProps } from "./types";
import type { NFT } from "@/lib/services/crypto/NFTService";
import type { NFTBurnReason } from "./types";

const BURN_REASONS: NFTBurnReason[] = [
  {
    value: "upgrade",
    label: "Token Upgrade",
    description: "Burning to upgrade to a new version",
  },
  {
    value: "mistake",
    label: "Minted by Mistake",
    description: "NFT was created in error",
  },
  {
    value: "consolidate",
    label: "Consolidation",
    description: "Reducing supply or consolidating holdings",
  },
  {
    value: "promotion",
    label: "Promotional Burn",
    description: "Burning for promotional or gamification purposes",
  },
  {
    value: "other",
    label: "Other",
    description: "Custom reason",
  },
];

export function NFTBurn({
  nfts = [],
  selectedNFT,
  onBurnComplete,
  onCancel,
  requireConfirmation = true,
  variant = "default",
  size = "md",
  className,
}: NFTBurnProps) {
  const [nft, setNft] = useState<NFT | undefined>(selectedNFT);
  const [reason, setReason] = useState<string>("");
  const [amount, setAmount] = useState("1");
  const [confirmed, setConfirmed] = useState(false);
  const [doubleConfirmed, setDoubleConfirmed] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnStatus, setBurnStatus] = useState<"idle" | "burning" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string>("");

  const handleBurn = async () => {
    if (!nft || !confirmed || (requireConfirmation && !doubleConfirmed)) return;

    setIsBurning(true);
    setBurnStatus("burning");

    try {
      // Mock burn transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      setTxHash(mockTxHash);
      setBurnStatus("success");

      setTimeout(() => {
        onBurnComplete?.(mockTxHash);
      }, 1000);
    } catch (error) {
      console.error("Burn failed:", error);
      setBurnStatus("error");
    } finally {
      setIsBurning(false);
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    setDoubleConfirmed(false);
    setReason("");
    setBurnStatus("idle");
    onCancel?.();
  };

  const selectedReason = BURN_REASONS.find((r) => r.value === reason);

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Burn NFT
        </CardTitle>
        <CardDescription>
          Permanently destroy your NFT - this action cannot be undone
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Warning Banner */}
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border-2 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-red-900 dark:text-red-100 mb-1">
                Warning: This action is permanent!
              </div>
              <p className="text-sm text-red-800 dark:text-red-200">
                Burning an NFT will permanently destroy it and remove it from your wallet.
                This action cannot be reversed. The NFT will be sent to a burn address
                (0x000...dEaD) and become unrecoverable.
              </p>
            </div>
          </div>
        </div>

        {/* NFT Selection */}
        {!selectedNFT && nfts.length > 0 && (
          <div className="space-y-2">
            <Label>Select NFT to Burn</Label>
            <Select
              value={nft?.tokenId}
              onValueChange={(tokenId) =>
                setNft(nfts.find((n) => n.tokenId === tokenId))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an NFT to burn" />
              </SelectTrigger>
              <SelectContent>
                {nfts.map((n) => (
                  <SelectItem key={`${n.contract}-${n.tokenId}`} value={n.tokenId}>
                    <div className="flex items-center gap-2">
                      {n.imageUrl && (
                        <img
                          src={n.imageUrl}
                          alt={n.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{n.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTokenId(n.tokenId)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected NFT Display */}
        {nft && (
          <div className="relative">
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border-2 border-red-500">
              {nft.imageUrl && (
                <img
                  src={nft.imageUrl}
                  alt={nft.name}
                  className="w-24 h-24 rounded object-cover opacity-75"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg">{nft.name}</div>
                <div className="text-sm text-muted-foreground">
                  {nft.collection?.name || truncate(nft.contract, 16)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{formatTokenId(nft.tokenId)}</Badge>
                  <Badge variant="secondary">{nft.standard}</Badge>
                </div>
                {nft.lastSale && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Last sale: {nft.lastSale.price} {nft.lastSale.currency}
                  </div>
                )}
              </div>
            </div>

            {/* Burn Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl opacity-50">🔥</div>
            </div>
          </div>
        )}

        {/* Amount (for ERC-1155) */}
        {nft?.standard === "ERC-1155" && (
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Burn</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                min="1"
                max={nft.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setAmount(nft.balance || "1")}
              >
                Max
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Available: {nft.balance}
            </div>
          </div>
        )}

        {/* Burn Reason */}
        <div className="space-y-2">
          <Label>Reason for Burning (Optional)</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {BURN_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  <div>
                    <div className="font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedReason && (
            <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-lg">
              {selectedReason.description}
            </div>
          )}
        </div>

        <Separator />

        {/* Confirmations */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            />
            <Label
              htmlFor="confirm"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I understand that burning this NFT will permanently destroy it and
              this action cannot be undone.
            </Label>
          </div>

          {requireConfirmation && confirmed && (
            <div className="flex items-start gap-3">
              <Checkbox
                id="double-confirm"
                checked={doubleConfirmed}
                onCheckedChange={(checked) =>
                  setDoubleConfirmed(checked as boolean)
                }
              />
              <Label
                htmlFor="double-confirm"
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                I have triple-checked and I am absolutely sure I want to burn
                this NFT.
              </Label>
            </div>
          )}
        </div>

        {/* Burn Status */}
        {burnStatus !== "idle" && (
          <div
            className={cn(
              "p-4 rounded-lg",
              burnStatus === "burning" && "bg-yellow-100 dark:bg-yellow-900/20",
              burnStatus === "success" && "bg-green-100 dark:bg-green-900/20",
              burnStatus === "error" && "bg-red-100 dark:bg-red-900/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {burnStatus === "burning" && "🔥"}
                {burnStatus === "success" && "✓"}
                {burnStatus === "error" && "✗"}
              </span>
              <span className="font-semibold">
                {burnStatus === "burning" && "Burning NFT..."}
                {burnStatus === "success" && "NFT burned successfully"}
                {burnStatus === "error" && "Burn failed"}
              </span>
            </div>

            {txHash && (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Burn Transaction: </span>
                  <span className="font-mono">{truncate(txHash, 20)}</span>
                </div>

                {burnStatus === "success" && (
                  <div className="p-3 bg-white dark:bg-black rounded border mt-3">
                    <div className="text-xs font-semibold mb-2 uppercase tracking-wide">
                      Proof of Burn Certificate
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NFT:</span>
                        <span className="font-mono">{nft?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token ID:</span>
                        <span className="font-mono">{nft?.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tx Hash:</span>
                        <span className="font-mono">{truncate(txHash, 12)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date().toLocaleString()}</span>
                      </div>
                      {reason && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reason:</span>
                          <span>{selectedReason?.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel} disabled={isBurning}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleBurn}
          disabled={
            !nft ||
            !confirmed ||
            (requireConfirmation && !doubleConfirmed) ||
            isBurning ||
            burnStatus === "success"
          }
        >
          {isBurning ? "Burning..." : "Burn NFT"}
        </Button>
      </CardFooter>
    </Card>
  );
}
