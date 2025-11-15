/**
 * InvoiceGenerator Component (Cycle 43)
 *
 * Generate crypto invoices with line items
 * - Add/remove line items with quantities
 * - Calculate subtotal, tax, total
 * - Support multiple fiat currencies (USD, EUR, GBP)
 * - Set due date
 * - Add customer information
 * - Generate payment instructions
 * - Export to PDF
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "../../utils";
import type { InvoiceGeneratorProps, InvoiceLineItem } from "./types";

export function InvoiceGenerator({
  onGenerate,
  defaultCurrency = "USD",
  defaultTaxRate = 0,
  customerInfo,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: InvoiceGeneratorProps) {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: "item_1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  const [currency, setCurrency] = useState(defaultCurrency);
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [customerName, setCustomerName] = useState(customerInfo?.name || "");
  const [customerEmail, setCustomerEmail] = useState(customerInfo?.email || "");
  const [notes, setNotes] = useState("");

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item_${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleGenerate = () => {
    onGenerate?.({
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0"
      )}`,
      status: "pending",
      lineItems: lineItems.filter((item) => item.description && item.unitPrice > 0),
      subtotal,
      tax: taxRate > 0 ? tax : undefined,
      taxRate: taxRate > 0 ? taxRate : undefined,
      total,
      currency: currency as any,
      cryptoPrices: [], // Will be populated by service
      dueDate: new Date(dueDate).getTime(),
      issuedAt: Date.now(),
      notes: notes || undefined,
      customerName: customerName || undefined,
      customerEmail: customerEmail || undefined,
    });
  };

  const isValid =
    lineItems.some((item) => item.description && item.unitPrice > 0) &&
    customerName &&
    customerEmail;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        size === "sm" && "max-w-2xl",
        size === "md" && "max-w-3xl",
        size === "lg" && "max-w-4xl",
        className
      )}
    >
      <CardHeader>
        <CardTitle>Generate Invoice</CardTitle>
        <CardDescription>Create a crypto payment invoice for your customer</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Line Items</h3>
            <Button size="sm" variant="outline" onClick={addLineItem}>
              + Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(item.id, "description", e.target.value)
                    }
                    className="col-span-2"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)
                    }
                    min="1"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-medium">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeLineItem(item.id)}
                  disabled={lineItems.length === 1}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals & Settings */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate * 100}
                onChange={(e) =>
                  setTaxRate(parseFloat(e.target.value) / 100 || 0)
                }
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>

              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax ({(taxRate * 100).toFixed(1)}%)
                  </span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold font-mono">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            className="w-full min-h-20 px-3 py-2 text-sm rounded-md border border-input bg-background"
            placeholder="Payment terms, delivery instructions, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleGenerate}
          disabled={!isValid}
        >
          Generate Invoice
        </Button>
      </CardFooter>
    </Card>
  );
}
