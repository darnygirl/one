/**
 * ChatSplit Component
 *
 * Split bill in group chat with:
 * - Add participants from chat
 * - Enter total amount
 * - Equal or custom split
 * - Payment tracking per person
 * - Reminder notifications
 * - Settlement status
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { ChatSplitProps, Token, ChatUser, BillSplitState } from "./types";
import { Effect } from "effect";
import * as ChatPaymentService from "@/lib/services/crypto/ChatPaymentService";

const MOCK_TOKENS: Token[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, icon: "💵" },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, icon: "💲" },
];

export function ChatSplit({
  chatId,
  participants = [],
  tokens = MOCK_TOKENS,
  defaultToken = "USDC",
  onSplitCreated,
  onPaymentMade,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatSplitProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.find(t => t.symbol === defaultToken) || tokens[0]
  );
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [isCreating, setIsCreating] = useState(false);
  const [split, setSplit] = useState<BillSplitState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleParticipant = (userId: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
      const newCustomAmounts = { ...customAmounts };
      delete newCustomAmounts[userId];
      setCustomAmounts(newCustomAmounts);
    } else {
      newSelected.add(userId);
    }
    setSelectedParticipants(newSelected);
  };

  const setCustomAmount = (userId: string, amount: string) => {
    setCustomAmounts({ ...customAmounts, [userId]: amount });
  };

  const perPersonAmount = totalAmount && selectedParticipants.size > 0
    ? (parseFloat(totalAmount) / selectedParticipants.size).toFixed(2)
    : "0.00";

  const customTotal = Object.values(customAmounts).reduce(
    (sum, amount) => sum + parseFloat(amount || "0"),
    0
  ).toFixed(2);

  const handleCreateSplit = async () => {
    if (!totalAmount || selectedParticipants.size === 0) {
      setError("Please enter an amount and select participants");
      return;
    }

    if (splitMode === "custom" && parseFloat(customTotal) !== parseFloat(totalAmount)) {
      setError(`Custom amounts must total ${totalAmount} ${selectedToken.symbol}`);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const participantsList = Array.from(selectedParticipants).map(userId => {
        const user = participants.find(p => p.id === userId)!;
        return {
          id: user.id,
          name: user.name,
          address: user.address,
          customAmount: splitMode === "custom" ? customAmounts[userId] : undefined,
        };
      });

      const result = await Effect.runPromise(
        ChatPaymentService.createBillSplit({
          totalAmount,
          token: selectedToken.symbol,
          participants: participantsList,
          description: description || "Bill split",
          chatId,
        })
      );

      setSplit(result);
      onSplitCreated?.(result.id);
    } catch (err: any) {
      setError("Failed to create split");
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setSplit(null);
    setTotalAmount("");
    setDescription("");
    setSelectedParticipants(new Set());
    setCustomAmounts({});
    setError(null);
  };

  const getStatusColor = (status: BillSplitState["status"]) => {
    switch (status) {
      case "complete": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "partial": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  if (split) {
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
                <span className="text-2xl">💰</span>
                <span>Bill Split</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {split.description}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(split.status)}>
              {split.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Total */}
          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {split.totalAmount} {split.token}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {split.participants.length} participants
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {split.amountPaid} / {split.totalAmount} {split.token}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{
                  width: `${(parseFloat(split.amountPaid) / parseFloat(split.totalAmount)) * 100}%`
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Participants */}
          <div className="space-y-2">
            <Label>Participants</Label>
            {split.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {participant.amount} {split.token}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.paid ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      ✓ Paid
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {split.status === "complete" && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <AlertDescription className="text-green-800 dark:text-green-300">
                ✓ All payments received!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={handleReset} variant="outline" className="w-full">
            New Split
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
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span>Split Bill</span>
        </CardTitle>
        <CardDescription className="mt-1">
          Split expenses equally or with custom amounts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., Dinner, Rent, Movie tickets"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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

        {/* Total Amount */}
        <div className="space-y-2">
          <Label htmlFor="total">Total Amount</Label>
          <Input
            id="total"
            type="number"
            placeholder="0.00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        {/* Split Mode */}
        <div className="space-y-2">
          <Label>Split Mode</Label>
          <div className="flex gap-2">
            <Button
              variant={splitMode === "equal" ? "default" : "outline"}
              onClick={() => setSplitMode("equal")}
              className="flex-1"
            >
              Equal
            </Button>
            <Button
              variant={splitMode === "custom" ? "default" : "outline"}
              onClick={() => setSplitMode("custom")}
              className="flex-1"
            >
              Custom
            </Button>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <Label>Select Participants ({selectedParticipants.size})</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {participants.map((participant) => {
              const isSelected = selectedParticipants.has(participant.id);
              const amount = splitMode === "equal"
                ? perPersonAmount
                : customAmounts[participant.id] || "";

              return (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-3 bg-secondary rounded-lg"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleParticipant(participant.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {participant.address.slice(0, 8)}...{participant.address.slice(-6)}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-24">
                      {splitMode === "custom" ? (
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setCustomAmount(participant.id, e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{amount}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {splitMode === "equal" && selectedParticipants.size > 0 && (
            <p className="text-sm text-muted-foreground">
              Each person pays: {perPersonAmount} {selectedToken.symbol}
            </p>
          )}

          {splitMode === "custom" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custom total:</span>
              <span className="font-medium">
                {customTotal} / {totalAmount} {selectedToken.symbol}
              </span>
            </div>
          )}
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
          onClick={handleCreateSplit}
          disabled={!totalAmount || selectedParticipants.size === 0 || isCreating}
        >
          {isCreating ? "Creating..." : "Create Split"}
        </Button>
      </CardFooter>
    </Card>
  );
}
