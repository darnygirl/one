/**
 * ChatInvoice Component
 *
 * Send invoice in chat with:
 * - Line items with quantities
 * - Total calculation
 * - Payment deadline
 * - Pay button with crypto options
 * - Payment tracking
 * - Invoice card display
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
import type { ChatInvoiceProps, Token, InvoiceLineItem, InvoiceState } from "./types";
import { Effect } from "effect";
import * as ChatPaymentService from "@/lib/services/crypto/ChatPaymentService";

const MOCK_TOKENS: Token[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, icon: "💵" },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, icon: "💲" },
];

export function ChatInvoice({
  chatId,
  tokens = MOCK_TOKENS,
  defaultToken = "USDC",
  onInvoiceCreated,
  onPaymentReceived,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatInvoiceProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.find(t => t.symbol === defaultToken) || tokens[0]
  );
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: "", total: "0.00" }
  ]);
  const [notes, setNotes] = useState("");
  const [dueInDays, setDueInDays] = useState<string>("7");
  const [isCreating, setIsCreating] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: "", total: "0.00" }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // Recalculate total
        if (field === "quantity" || field === "unitPrice") {
          const quantity = field === "quantity" ? Number(value) : item.quantity;
          const unitPrice = field === "unitPrice" ? String(value) : item.unitPrice;
          updated.total = (quantity * parseFloat(unitPrice || "0")).toFixed(2);
        }

        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0).toFixed(2);

  const handleCreateInvoice = async () => {
    if (items.some(item => !item.description || !item.unitPrice)) {
      setError("Please fill in all item details");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const dueDate = dueInDays ? Date.now() + (parseInt(dueInDays) * 86400000) : undefined;

      const result = await Effect.runPromise(
        ChatPaymentService.createInvoice({
          items,
          token: selectedToken.symbol,
          dueDate,
          notes: notes || undefined,
          chatId,
        })
      );

      setInvoice(result);
      onInvoiceCreated?.(result.id);
    } catch (err: any) {
      setError("Failed to create invoice");
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setInvoice(null);
    setItems([{ id: "1", description: "", quantity: 1, unitPrice: "", total: "0.00" }]);
    setNotes("");
    setError(null);
  };

  const getStatusColor = (status: InvoiceState["status"]) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (invoice) {
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
                <span className="text-2xl">📄</span>
                <span>Invoice</span>
              </CardTitle>
              <CardDescription className="mt-1 font-mono">
                {invoice.invoiceNumber}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Invoice Items */}
          <div className="space-y-2">
            {invoice.items.map((item, index) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} × {item.unitPrice} {invoice.token}
                  </p>
                </div>
                <div className="font-medium">{item.total} {invoice.token}</div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{invoice.subtotal} {invoice.token}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{invoice.total} {invoice.token}</span>
            </div>
          </div>

          {/* Due Date */}
          {invoice.dueDate && (
            <Alert>
              <AlertDescription>
                Due: {formatDate(invoice.dueDate)}
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Info */}
          {invoice.status === "paid" && invoice.txHash && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <AlertDescription className="space-y-1">
                <p className="text-green-800 dark:text-green-300">
                  ✓ Paid on {formatDate(invoice.paidAt!)}
                </p>
                <p className="text-xs font-mono">{invoice.txHash}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {invoice.status === "pending" && (
            <Button className="flex-1">
              Pay Invoice
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="flex-1">
            New Invoice
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
          <span className="text-2xl">📄</span>
          <span>Create Invoice</span>
        </CardTitle>
        <CardDescription className="mt-1">
          Send a professional invoice in chat
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Line Items</Label>
            <Button variant="ghost" size="sm" onClick={addItem}>
              + Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="space-y-2 p-3 bg-secondary rounded-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  className="flex-1"
                />
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                  className="w-20"
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                  className="flex-1"
                  step="0.01"
                  min="0"
                />
                <div className="flex items-center px-3 bg-background rounded-md border">
                  <span className="text-sm font-medium">{item.total}</span>
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{subtotal} {selectedToken.symbol}</span>
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueIn">Due In</Label>
          <Select value={dueInDays} onValueChange={setDueInDays}>
            <SelectTrigger id="dueIn">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes or payment terms..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="resize-none"
          />
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
          onClick={handleCreateInvoice}
          disabled={parseFloat(subtotal) <= 0 || isCreating}
        >
          {isCreating ? "Creating..." : "Create Invoice"}
        </Button>
      </CardFooter>
    </Card>
  );
}
