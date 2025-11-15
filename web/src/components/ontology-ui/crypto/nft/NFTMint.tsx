/**
 * NFTMint Component
 *
 * Mint new NFTs with IPFS metadata upload
 * Supports image/video upload, metadata form, and royalty settings
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../utils";
import type { NFTMintProps } from "./types";
import type { NFTMintForm } from "./types";

export function NFTMint({
  collection,
  chainId = 1,
  standard = "ERC-721",
  onMintComplete,
  onCancel,
  variant = "default",
  size = "md",
  className,
}: NFTMintProps) {
  const [form, setForm] = useState<NFTMintForm>({
    name: "",
    description: "",
    image: null,
    animationUrl: null,
    externalUrl: "",
    attributes: [],
    collection,
    royaltyRecipient: "",
    royaltyPercentage: 5,
    amount: 1,
  });

  const [newAttribute, setNewAttribute] = useState({
    trait_type: "",
    value: "",
    display_type: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isMinting, setIsMinting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintStatus, setMintStatus] = useState<"idle" | "uploading" | "minting" | "success" | "error">("idle");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm({ ...form, image: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addAttribute = () => {
    if (!newAttribute.trait_type || !newAttribute.value) return;

    setForm({
      ...form,
      attributes: [
        ...form.attributes,
        {
          trait_type: newAttribute.trait_type,
          value: newAttribute.value,
          display_type: newAttribute.display_type || undefined,
        },
      ],
    });

    setNewAttribute({ trait_type: "", value: "", display_type: "" });
  };

  const removeAttribute = (index: number) => {
    setForm({
      ...form,
      attributes: form.attributes.filter((_, i) => i !== index),
    });
  };

  const handleMint = async () => {
    if (!form.name || !form.image) return;

    setIsMinting(true);
    setMintStatus("uploading");

    try {
      // Mock IPFS upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setMintStatus("minting");

      // Mock minting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTokenId = Math.floor(Math.random() * 10000).toString();
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      setMintStatus("success");

      setTimeout(() => {
        onMintComplete?.(mockTokenId, mockTxHash);
      }, 1000);
    } catch (error) {
      console.error("Minting failed:", error);
      setMintStatus("error");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Mint NFT
        </CardTitle>
        <CardDescription>
          Create a new {standard} NFT with custom metadata
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image">NFT Image/Video *</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setForm({ ...form, image: null });
                    setImagePreview("");
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-2">📁</div>
                <Label htmlFor="image" className="cursor-pointer">
                  <span className="text-primary hover:underline">
                    Click to upload
                  </span>
                  {" "}or drag and drop
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, GIF, MP4 (max 100MB)
                </p>
                <Input
                  id="image"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome NFT"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your NFT..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalUrl">External URL (optional)</Label>
            <Input
              id="externalUrl"
              placeholder="https://..."
              value={form.externalUrl}
              onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            />
          </div>
        </div>

        <Separator />

        {/* Attributes */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Attributes (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Add properties that describe your NFT
            </p>
          </div>

          {/* Existing Attributes */}
          {form.attributes.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {form.attributes.map((attr, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg border group relative">
                  <div className="text-xs text-muted-foreground uppercase">
                    {attr.trait_type}
                  </div>
                  <div className="font-semibold">{attr.value}</div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => removeAttribute(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Attribute */}
          <div className="flex gap-2">
            <Input
              placeholder="Trait type (e.g., Color)"
              value={newAttribute.trait_type}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, trait_type: e.target.value })
              }
            />
            <Input
              placeholder="Value (e.g., Blue)"
              value={newAttribute.value}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, value: e.target.value })
              }
            />
            <Button onClick={addAttribute} variant="outline">
              Add
            </Button>
          </div>
        </div>

        <Separator />

        {/* Advanced Settings */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Advanced Settings</Label>
          </div>

          {standard === "ERC-1155" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Supply Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: parseInt(e.target.value) })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="royalty">Royalty Percentage (%)</Label>
            <Input
              id="royalty"
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={form.royaltyPercentage}
              onChange={(e) =>
                setForm({ ...form, royaltyPercentage: parseFloat(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              You'll earn {form.royaltyPercentage}% on secondary sales
            </p>
          </div>

          {form.royaltyPercentage! > 0 && (
            <div className="space-y-2">
              <Label htmlFor="royaltyRecipient">Royalty Recipient (optional)</Label>
              <Input
                id="royaltyRecipient"
                placeholder="0x... (defaults to your wallet)"
                value={form.royaltyRecipient}
                onChange={(e) =>
                  setForm({ ...form, royaltyRecipient: e.target.value })
                }
              />
            </div>
          )}
        </div>

        {/* Minting Status */}
        {mintStatus !== "idle" && (
          <div
            className={cn(
              "p-4 rounded-lg",
              mintStatus === "uploading" && "bg-blue-100 dark:bg-blue-900/20",
              mintStatus === "minting" && "bg-yellow-100 dark:bg-yellow-900/20",
              mintStatus === "success" && "bg-green-100 dark:bg-green-900/20",
              mintStatus === "error" && "bg-red-100 dark:bg-red-900/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {mintStatus === "uploading" && "☁️"}
                {mintStatus === "minting" && "⏳"}
                {mintStatus === "success" && "✓"}
                {mintStatus === "error" && "✗"}
              </span>
              <span className="font-semibold">
                {mintStatus === "uploading" && `Uploading to IPFS... ${uploadProgress}%`}
                {mintStatus === "minting" && "Minting NFT..."}
                {mintStatus === "success" && "NFT minted successfully!"}
                {mintStatus === "error" && "Minting failed"}
              </span>
            </div>
            {mintStatus === "uploading" && (
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {imagePreview && form.name && (
          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-sm font-semibold mb-2">Mint Preview</div>
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <div className="font-semibold">{form.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {form.description}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{standard}</Badge>
                  {form.attributes.length > 0 && (
                    <Badge variant="secondary">{form.attributes.length} traits</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isMinting}>
          Cancel
        </Button>
        <Button
          onClick={handleMint}
          disabled={!form.name || !form.image || isMinting || mintStatus === "success"}
        >
          {isMinting ? "Minting..." : "Mint NFT"}
        </Button>
      </CardFooter>
    </Card>
  );
}
