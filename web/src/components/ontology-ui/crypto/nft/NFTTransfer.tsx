/**
 * NFTTransfer Component
 *
 * Transfer NFT to another address with ENS support and gas estimation
 */

import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { cn, truncate } from "../../utils";
import { formatTokenId } from "@/lib/services/crypto/NFTService";
import type { NFTTransferProps } from "./types";
import type { NFT } from "@/lib/services/crypto/NFTService";

export function NFTTransfer({
  nfts = [],
  selectedNFT,
  onTransferComplete,
  onCancel,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: NFTTransferProps) {
  const [nft, setNft] = useState<NFT | undefined>(selectedNFT);
  const [recipient, setRecipient] = useState("");
  const [ensName, setEnsName] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string>("0.002");
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string>("");

  // Validate Ethereum address
  useEffect(() => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(recipient);
    setIsValidAddress(isValid);

    // Mock ENS resolution
    if (recipient.endsWith(".eth")) {
      setTimeout(() => {
        setEnsName("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
        setIsValidAddress(true);
      }, 500);
    } else {
      setEnsName(null);
    }
  }, [recipient]);

  const handleTransfer = async () => {
    if (!nft || !isValidAddress) return;

    setIsTransferring(true);
    setTxStatus("pending");

    try {
      // Mock transfer (replace with actual wagmi/viem integration)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      setTxHash(mockTxHash);
      setTxStatus("success");

      setTimeout(() => {
        onTransferComplete?.(mockTxHash);
      }, 1000);
    } catch (error) {
      console.error("Transfer failed:", error);
      setTxStatus("error");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCancel = () => {
    setRecipient("");
    setAmount("1");
    setTxStatus("idle");
    onCancel?.();
  };

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">↗</span>
          Transfer NFT
        </CardTitle>
        <CardDescription>
          Send your NFT to another wallet address
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* NFT Selection */}
        {!selectedNFT && nfts.length > 0 && (
          <div className="space-y-2">
            <Label>Select NFT</Label>
            <Select
              value={nft?.tokenId}
              onValueChange={(tokenId) =>
                setNft(nfts.find((n) => n.tokenId === tokenId))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an NFT to transfer" />
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

        {/* Selected NFT Preview */}
        {nft && (
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
                <Badge variant="secondary">{nft.standard}</Badge>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x... or name.eth"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className={cn(
              recipient &&
                (isValidAddress
                  ? "border-green-500"
                  : "border-red-500")
            )}
          />
          {ensName && (
            <div className="text-sm text-muted-foreground">
              Resolves to: {truncate(ensName, 16)}
            </div>
          )}
          {recipient && !isValidAddress && !recipient.endsWith(".eth") && (
            <div className="text-sm text-red-500">Invalid Ethereum address</div>
          )}
        </div>

        {/* Amount (for ERC-1155) */}
        {nft?.standard === "ERC-1155" && (
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max={nft.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Available: {nft.balance}
            </div>
          </div>
        )}

        {/* Gas Estimate */}
        <div className="p-4 bg-secondary rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Estimated Gas Fee</span>
            <span className="font-semibold">{gasEstimate} ETH</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ≈ ${(parseFloat(gasEstimate) * 2000).toFixed(2)} USD
          </div>
        </div>

        {/* Transaction Status */}
        {txStatus !== "idle" && (
          <div
            className={cn(
              "p-4 rounded-lg",
              txStatus === "pending" && "bg-yellow-100 dark:bg-yellow-900/20",
              txStatus === "success" && "bg-green-100 dark:bg-green-900/20",
              txStatus === "error" && "bg-red-100 dark:bg-red-900/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {txStatus === "pending" && "⏳"}
                {txStatus === "success" && "✓"}
                {txStatus === "error" && "✗"}
              </span>
              <span className="font-semibold">
                {txStatus === "pending" && "Transfer in progress..."}
                {txStatus === "success" && "Transfer successful!"}
                {txStatus === "error" && "Transfer failed"}
              </span>
            </div>
            {txHash && (
              <div className="text-sm">
                <span className="text-muted-foreground">Transaction: </span>
                <span className="font-mono">{truncate(txHash, 20)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isTransferring}
        >
          Cancel
        </Button>
        <Button
          onClick={handleTransfer}
          disabled={!nft || !isValidAddress || isTransferring || txStatus === "success"}
        >
          {isTransferring ? "Transferring..." : "Transfer NFT"}
        </Button>
      </CardFooter>
    </Card>
  );
}
