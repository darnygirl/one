/**
 * ChatEscrow Component
 *
 * Escrow payment in chat with:
 * - Create escrow agreement
 * - Terms and conditions
 * - Deadline and milestones
 * - Release funds control
 * - Dispute resolution
 * - Escrow status tracking
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { ChatEscrowProps, Token, EscrowState, Milestone } from "./types";
import { Effect } from "effect";
import * as ChatPaymentService from "@/lib/services/crypto/ChatPaymentService";

const MOCK_TOKENS: Token[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, balance: "5000", icon: "💵" },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, balance: "3000", icon: "💲" },
];

export function ChatEscrow({
  chatId,
  recipientId,
  recipientName,
  recipientAddress,
  tokens = MOCK_TOKENS,
  defaultToken = "USDC",
  onEscrowCreated,
  onFundsReleased,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatEscrowProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.find(t => t.symbol === defaultToken) || tokens[0]
  );
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");
  const [deadlineDays, setDeadlineDays] = useState<string>("7");
  const [milestones, setMilestones] = useState<Array<{ description: string; percentage: number }>>([]);
  const [newMilestone, setNewMilestone] = useState({ description: "", percentage: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [escrow, setEscrow] = useState<EscrowState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addMilestone = () => {
    if (newMilestone.description && newMilestone.percentage > 0) {
      const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0) + newMilestone.percentage;
      if (totalPercentage <= 100) {
        setMilestones([...milestones, { ...newMilestone }]);
        setNewMilestone({ description: "", percentage: 0 });
      } else {
        setError("Total milestone percentage cannot exceed 100%");
      }
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const totalMilestonePercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);

  const handleCreateEscrow = async () => {
    if (!amount || !terms) {
      setError("Please enter amount and terms");
      return;
    }

    if (milestones.length > 0 && totalMilestonePercentage !== 100) {
      setError("Milestones must total 100%");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const deadline = deadlineDays ? Date.now() + (parseInt(deadlineDays) * 86400000) : undefined;

      const result = await Effect.runPromise(
        ChatPaymentService.createEscrow({
          amount,
          token: selectedToken.symbol,
          recipient: recipientAddress,
          terms,
          deadline,
          milestones: milestones.length > 0 ? milestones : undefined,
          chatId,
        })
      );

      setEscrow(result);
      onEscrowCreated?.(result.id);
    } catch (err: any) {
      setError("Failed to create escrow");
    } finally {
      setIsCreating(false);
    }
  };

  const handleReleaseFunds = async (releaseAmount?: string) => {
    if (!escrow) return;

    setIsReleasing(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        ChatPaymentService.releaseEscrow(escrow.id, releaseAmount)
      );

      setEscrow(result);
      onFundsReleased?.(releaseAmount || escrow.amount);
    } catch (err: any) {
      setError("Failed to release funds");
    } finally {
      setIsReleasing(false);
    }
  };

  const handleReset = () => {
    setEscrow(null);
    setAmount("");
    setTerms("");
    setMilestones([]);
    setError(null);
  };

  const getStatusColor = (status: EscrowState["status"]) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "released": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "disputed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (escrow) {
    return (
      <Card
        className={cn(
          "group relative transition-all duration-200",
          interactive && "hover:shadow-lg",
          size === "sm" && "p-3",
          size === "md" && "p-4",
          size === "lg" && "p-6",
          className
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>Escrow Agreement</span>
              </CardTitle>
              <CardDescription className="mt-1">
                ID: {escrow.id.slice(0, 16)}...
              </CardDescription>
            </div>
            <Badge className={getStatusColor(escrow.status)}>
              {escrow.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="p-4 bg-secondary rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {escrow.amount} {escrow.token}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">
                  {escrow.amountRemaining} {escrow.token}
                </p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Sender</p>
              <p className="text-sm font-mono">{escrow.sender.slice(0, 10)}...</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Recipient</p>
              <p className="text-sm font-mono">{escrow.recipient.slice(0, 10)}...</p>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{escrow.terms}</p>
            </div>
          </div>

          {/* Deadline */}
          {escrow.deadline && (
            <Alert>
              <AlertDescription>
                Deadline: {formatDate(escrow.deadline)}
              </AlertDescription>
            </Alert>
          )}

          {/* Milestones */}
          {escrow.milestones && escrow.milestones.length > 0 && (
            <div className="space-y-2">
              <Label>Milestones</Label>
              {escrow.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{milestone.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {milestone.percentage}% ({(parseFloat(escrow.amount) * milestone.percentage / 100).toFixed(2)} {escrow.token})
                    </p>
                  </div>
                  {milestone.released ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      ✓ Released
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleReleaseFunds((parseFloat(escrow.amount) * milestone.percentage / 100).toFixed(2))}
                      disabled={isReleasing || escrow.status !== "active"}
                    >
                      Release
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Transaction */}
          {escrow.txHash && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Transaction Hash</Label>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                {escrow.txHash}
              </p>
            </div>
          )}

          {escrow.status === "released" && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <AlertDescription className="text-green-800 dark:text-green-300">
                ✓ All funds have been released
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {escrow.status === "active" && !escrow.milestones && (
            <Button
              className="flex-1"
              onClick={() => handleReleaseFunds()}
              disabled={isReleasing}
            >
              {isReleasing ? "Releasing..." : "Release All Funds"}
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="flex-1">
            New Escrow
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "hover:shadow-lg",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Create Escrow</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Secure payment with {recipientName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipient */}
        <div className="p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{recipientName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Token Selection */}
        <div className="space-y-2">
          <Label htmlFor="token">Currency</Label>
          <Select
            value={selectedToken?.symbol}
            onValueChange={(symbol) =>
              setSelectedToken(tokens.find((t) => t.symbol === symbol) || tokens[0])
            }
          >
            <SelectTrigger id="token">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <span>{token.icon}</span>
                    <span className="font-medium">{token.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Escrow Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        {/* Terms */}
        <div className="space-y-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            placeholder="Describe the conditions for releasing funds..."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Select value={deadlineDays} onValueChange={setDeadlineDays}>
            <SelectTrigger id="deadline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Milestones (Optional) */}
        <div className="space-y-2">
          <Label>Milestones (Optional)</Label>
          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{milestone.description}</p>
                  <p className="text-xs text-muted-foreground">{milestone.percentage}%</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                >
                  ×
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Milestone description"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="%"
                value={newMilestone.percentage || ""}
                onChange={(e) => setNewMilestone({ ...newMilestone, percentage: parseInt(e.target.value) || 0 })}
                className="w-20"
                min="1"
                max="100"
              />
              <Button variant="outline" size="sm" onClick={addMilestone}>
                Add
              </Button>
            </div>

            {milestones.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Total: {totalMilestonePercentage}% / 100%
              </p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCreateEscrow}
          disabled={!amount || !terms || isCreating}
        >
          {isCreating ? "Creating..." : `Create Escrow (${amount || "0"} ${selectedToken?.symbol})`}
        </Button>
      </CardFooter>
    </Card>
  );
}
