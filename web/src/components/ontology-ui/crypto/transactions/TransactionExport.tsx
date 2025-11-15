/**
 * TransactionExport Component
 *
 * Export transactions for tax purposes.
 * Supports CSV, Koinly, CoinTracker, and Form 8949 formats.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../utils";
import type { Transaction, TransactionType } from "@/lib/services/crypto/TransactionService";

interface TransactionExportProps {
  transactions: Transaction[];
  walletAddress?: string;
  onExport?: (format: ExportFormat, transactions: Transaction[]) => void;
  className?: string;
}

type ExportFormat = "csv" | "koinly" | "cointracker" | "form8949" | "custom";

export function TransactionExport({
  transactions,
  walletAddress,
  onExport,
  className,
}: TransactionExportProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedTypes, setSelectedTypes] = useState<Set<TransactionType>>(
    new Set(["send", "receive", "swap"])
  );
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filter transactions based on selections
  const filteredTransactions = transactions.filter((tx) => {
    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).getTime();
      if (tx.timestamp < startDate) return false;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).getTime();
      if (tx.timestamp > endDate) return false;
    }

    // Type filter
    if (!selectedTypes.has(tx.type)) return false;

    return true;
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (onExport) {
        await onExport(format, filteredTransactions);
      } else {
        // Default export implementation
        const csvContent = generateExport(format, filteredTransactions);
        downloadFile(csvContent, `transactions-${format}-${Date.now()}.csv`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const generateExport = (format: ExportFormat, txs: Transaction[]): string => {
    switch (format) {
      case "koinly":
        return generateKoinlyFormat(txs);
      case "cointracker":
        return generateCoinTrackerFormat(txs);
      case "form8949":
        return generateForm8949(txs);
      case "custom":
        return generateCustomFormat(txs);
      default:
        return generateCsvFormat(txs);
    }
  };

  const generateCsvFormat = (txs: Transaction[]): string => {
    const headers = [
      "Date",
      "Time",
      "Type",
      "Hash",
      "From",
      "To",
      "Amount",
      "Token",
      "USD Value",
      "Fee",
      "Fee USD",
      "Status",
      "Chain",
      "Block Number",
    ];

    const rows = txs.map((tx) => [
      new Date(tx.timestamp).toLocaleDateString(),
      new Date(tx.timestamp).toLocaleTimeString(),
      tx.type,
      tx.hash,
      tx.from,
      tx.to,
      (parseFloat(tx.value) / 1e18).toString(),
      tx.token?.symbol || "ETH",
      tx.valueUsd?.toString() || "",
      tx.gasCost || "",
      tx.gasCostUsd?.toString() || "",
      tx.status,
      tx.chainName,
      tx.blockNumber?.toString() || "",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const generateKoinlyFormat = (txs: Transaction[]): string => {
    const headers = [
      "Date",
      "Sent Amount",
      "Sent Currency",
      "Received Amount",
      "Received Currency",
      "Fee Amount",
      "Fee Currency",
      "Net Worth Amount",
      "Net Worth Currency",
      "Label",
      "Description",
      "TxHash",
    ];

    const rows = txs.map((tx) => [
      new Date(tx.timestamp).toISOString(),
      tx.type === "send" ? (parseFloat(tx.value) / 1e18).toString() : "",
      tx.type === "send" ? tx.token?.symbol || "ETH" : "",
      tx.type === "receive" ? (parseFloat(tx.value) / 1e18).toString() : "",
      tx.type === "receive" ? tx.token?.symbol || "ETH" : "",
      tx.gasCost || "",
      "ETH",
      "",
      "",
      tx.type,
      `${tx.type} transaction on ${tx.chainName}`,
      tx.hash,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const generateCoinTrackerFormat = (txs: Transaction[]): string => {
    const headers = [
      "Date",
      "Received Quantity",
      "Received Currency",
      "Sent Quantity",
      "Sent Currency",
      "Fee Amount",
      "Fee Currency",
      "Tag",
      "Transaction Hash",
    ];

    const rows = txs.map((tx) => [
      new Date(tx.timestamp).toISOString(),
      tx.type === "receive" ? (parseFloat(tx.value) / 1e18).toString() : "",
      tx.type === "receive" ? tx.token?.symbol || "ETH" : "",
      tx.type === "send" ? (parseFloat(tx.value) / 1e18).toString() : "",
      tx.type === "send" ? tx.token?.symbol || "ETH" : "",
      tx.gasCost || "",
      "ETH",
      tx.type,
      tx.hash,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const generateForm8949 = (txs: Transaction[]): string => {
    const headers = [
      "(a) Description of property",
      "(b) Date acquired",
      "(c) Date sold or disposed",
      "(d) Proceeds",
      "(e) Cost or other basis",
      "(f) Code(s)",
      "(g) Amount of adjustment",
      "(h) Gain or (loss)",
    ];

    const rows = txs
      .filter((tx) => tx.type === "send" || tx.type === "swap")
      .map((tx) => [
        `${tx.token?.symbol || "ETH"} - ${tx.hash.slice(0, 10)}`,
        new Date(tx.timestamp).toLocaleDateString(),
        new Date(tx.timestamp).toLocaleDateString(),
        tx.valueUsd?.toString() || "0",
        "0", // Cost basis would need to be calculated separately
        "",
        "",
        tx.valueUsd?.toString() || "0",
      ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const generateCustomFormat = (txs: Transaction[]): string => {
    return JSON.stringify(
      {
        metadata: {
          walletAddress,
          exportDate: new Date().toISOString(),
          totalTransactions: txs.length,
          dateRange: {
            start: dateRange.start || "all",
            end: dateRange.end || "all",
          },
          types: Array.from(selectedTypes),
        },
        transactions: txs,
      },
      null,
      2
    );
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleType = (type: TransactionType) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const transactionTypes: TransactionType[] = [
    "send",
    "receive",
    "swap",
    "approve",
    "contract",
    "mint",
    "burn",
    "stake",
    "unstake",
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Export Transactions</CardTitle>
        <CardDescription>
          Export your transaction history for tax reporting and analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (Generic)</SelectItem>
              <SelectItem value="koinly">Koinly Format</SelectItem>
              <SelectItem value="cointracker">CoinTracker Format</SelectItem>
              <SelectItem value="form8949">IRS Form 8949</SelectItem>
              <SelectItem value="custom">Custom JSON</SelectItem>
            </SelectContent>
          </Select>

          {/* Format Descriptions */}
          <div className="text-sm text-muted-foreground">
            {format === "csv" && "Standard CSV format compatible with most applications"}
            {format === "koinly" && "Import directly into Koinly for tax calculations"}
            {format === "cointracker" &&
              "Import directly into CoinTracker for portfolio tracking"}
            {format === "form8949" && "IRS Form 8949 compatible format for US taxes"}
            {format === "custom" && "Full JSON export with all transaction data"}
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range (Optional)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Transaction Types */}
        <div className="space-y-2">
          <Label>Transaction Types</Label>
          <div className="grid grid-cols-3 gap-2">
            {transactionTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.has(type)}
                  onCheckedChange={() => toggleType(type)}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Options */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="metadata"
            checked={includeMetadata}
            onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
          />
          <label
            htmlFor="metadata"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Include metadata (wallet address, export date, etc.)
          </label>
        </div>

        <Separator />

        {/* Summary */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="font-semibold text-sm">Export Summary</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Transactions</div>
              <div className="font-medium">{transactions.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Filtered Transactions</div>
              <div className="font-medium">{filteredTransactions.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Date Range</div>
              <div className="font-medium">
                {dateRange.start && dateRange.end
                  ? `${dateRange.start} to ${dateRange.end}`
                  : "All dates"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Format</div>
              <Badge variant="secondary">{format.toUpperCase()}</Badge>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={handleExport}
          disabled={isExporting || filteredTransactions.length === 0}
          className="w-full"
        >
          {isExporting
            ? "Exporting..."
            : `Export ${filteredTransactions.length} Transactions`}
        </Button>

        {filteredTransactions.length === 0 && (
          <div className="text-sm text-muted-foreground text-center">
            No transactions match your filters
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
