/**
 * TransactionService - Effect.ts service for blockchain transactions
 *
 * Handles transaction management, tracking, and history.
 * Uses Effect.ts for error handling and Convex for storage.
 */

import { Effect, pipe } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export type TransactionServiceError =
  | { _tag: "TransactionNotFoundError"; hash: string }
  | { _tag: "InvalidTransactionError"; message: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "RpcError"; message: string; code?: number }
  | { _tag: "ConvexError"; message: string };

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "cancelled"
  | "replaced";

export type TransactionType =
  | "send"
  | "receive"
  | "swap"
  | "approve"
  | "contract"
  | "mint"
  | "burn"
  | "stake"
  | "unstake";

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueUsd?: number;
  gasUsed?: string;
  gasPrice?: string;
  gasCost?: string;
  gasCostUsd?: number;
  blockNumber?: number;
  confirmations: number;
  timestamp: number;
  status: TransactionStatus;
  type: TransactionType;
  chainId: number;
  chainName: string;
  token?: {
    address: string;
    symbol: string;
    decimals: number;
  };
  metadata?: Record<string, any>;
  error?: string;
  nonce?: number;
  data?: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress?: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
  status: "success" | "failure";
  effectiveGasPrice: string;
}

export interface TransactionFilter {
  address?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  chainId?: number;
  startDate?: number;
  endDate?: number;
  minValue?: number;
  maxValue?: number;
}

export interface PendingTransaction extends Transaction {
  estimatedConfirmTime?: number;
  canSpeedUp: boolean;
  canCancel: boolean;
  replacementTx?: string;
}

export interface FailedTransaction extends Transaction {
  errorMessage: string;
  errorCode?: string;
  canRetry: boolean;
  suggestedGasPrice?: string;
}

export interface ExportFormat {
  format: "csv" | "koinly" | "cointracker" | "form8949" | "custom";
  transactions: Transaction[];
  metadata?: {
    walletAddress: string;
    dateRange: { start: number; end: number };
    totalTransactions: number;
  };
}

// ============================================================================
// Service Interface
// ============================================================================

export interface ITransactionService {
  /**
   * Get transaction by hash
   */
  getTransaction(
    hash: string,
    chainId: number
  ): Effect.Effect<Transaction, TransactionServiceError>;

  /**
   * Get transaction receipt
   */
  getTransactionReceipt(
    hash: string,
    chainId: number
  ): Effect.Effect<TransactionReceipt, TransactionServiceError>;

  /**
   * Get transaction history
   */
  getTransactionHistory(
    address: string,
    filter?: TransactionFilter,
    limit?: number,
    offset?: number
  ): Effect.Effect<Transaction[], TransactionServiceError>;

  /**
   * Get pending transactions
   */
  getPendingTransactions(
    address: string,
    chainId: number
  ): Effect.Effect<PendingTransaction[], TransactionServiceError>;

  /**
   * Get failed transactions
   */
  getFailedTransactions(
    address: string,
    chainId?: number
  ): Effect.Effect<FailedTransaction[], TransactionServiceError>;

  /**
   * Wait for transaction confirmation
   */
  waitForConfirmation(
    hash: string,
    chainId: number,
    confirmations?: number
  ): Effect.Effect<TransactionReceipt, TransactionServiceError>;

  /**
   * Speed up transaction (replace with higher gas)
   */
  speedUpTransaction(
    hash: string,
    chainId: number,
    newGasPrice: string
  ): Effect.Effect<string, TransactionServiceError>;

  /**
   * Cancel transaction
   */
  cancelTransaction(
    hash: string,
    chainId: number
  ): Effect.Effect<string, TransactionServiceError>;

  /**
   * Export transactions
   */
  exportTransactions(
    transactions: Transaction[],
    format: ExportFormat["format"]
  ): Effect.Effect<string, TransactionServiceError>;

  /**
   * Store transaction in Convex
   */
  storeTransaction(
    transaction: Transaction,
    userId: string
  ): Effect.Effect<string, TransactionServiceError>;

  /**
   * Update transaction status
   */
  updateTransactionStatus(
    hash: string,
    status: TransactionStatus,
    metadata?: Record<string, any>
  ): Effect.Effect<void, TransactionServiceError>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class TransactionService implements ITransactionService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheTime = 10000; // 10 seconds

  constructor(
    private rpcUrls: Record<number, string>,
    private convexClient?: any
  ) {}

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTime,
    });
  }

  private async rpcCall<T>(
    chainId: number,
    method: string,
    params: any[]
  ): Promise<T> {
    const rpcUrl = this.rpcUrls[chainId];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for chain ${chainId}`);
    }

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  getTransaction(
    hash: string,
    chainId: number
  ): Effect.Effect<Transaction, TransactionServiceError> {
    return Effect.gen(this, function* () {
      try {
        const cacheKey = `tx:${chainId}:${hash}`;
        const cached = this.getCached<Transaction>(cacheKey);
        if (cached) return cached;

        const tx = yield* Effect.tryPromise({
          try: () => this.rpcCall<any>(chainId, "eth_getTransactionByHash", [hash]),
          catch: (error) => ({
            _tag: "RpcError" as const,
            message: error instanceof Error ? error.message : "RPC call failed",
          }),
        });

        if (!tx) {
          return yield* Effect.fail({
            _tag: "TransactionNotFoundError" as const,
            hash,
          });
        }

        const blockNumber = yield* Effect.tryPromise({
          try: () => this.rpcCall<string>(chainId, "eth_blockNumber", []),
          catch: () => "0x0",
        });

        const confirmations = tx.blockNumber
          ? parseInt(blockNumber, 16) - parseInt(tx.blockNumber, 16)
          : 0;

        const transaction: Transaction = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to || "",
          value: tx.value,
          gasUsed: tx.gas,
          gasPrice: tx.gasPrice,
          blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : undefined,
          confirmations,
          timestamp: Date.now(),
          status: this.determineStatus(tx, confirmations),
          type: this.determineType(tx),
          chainId,
          chainName: this.getChainName(chainId),
          nonce: parseInt(tx.nonce, 16),
          data: tx.input,
        };

        this.setCache(cacheKey, transaction);
        return transaction;
      } catch (error) {
        return yield* Effect.fail({
          _tag: "NetworkError" as const,
          message: error instanceof Error ? error.message : "Network error",
        });
      }
    });
  }

  getTransactionReceipt(
    hash: string,
    chainId: number
  ): Effect.Effect<TransactionReceipt, TransactionServiceError> {
    return Effect.gen(this, function* () {
      try {
        const receipt = yield* Effect.tryPromise({
          try: () =>
            this.rpcCall<TransactionReceipt>(chainId, "eth_getTransactionReceipt", [
              hash,
            ]),
          catch: (error) => ({
            _tag: "RpcError" as const,
            message: error instanceof Error ? error.message : "RPC call failed",
          }),
        });

        if (!receipt) {
          return yield* Effect.fail({
            _tag: "TransactionNotFoundError" as const,
            hash,
          });
        }

        return receipt;
      } catch (error) {
        return yield* Effect.fail({
          _tag: "NetworkError" as const,
          message: error instanceof Error ? error.message : "Network error",
        });
      }
    });
  }

  getTransactionHistory(
    address: string,
    filter?: TransactionFilter,
    limit: number = 100,
    offset: number = 0
  ): Effect.Effect<Transaction[], TransactionServiceError> {
    return Effect.gen(this, function* () {
      if (!this.convexClient) {
        return yield* Effect.fail({
          _tag: "ConvexError" as const,
          message: "Convex client not configured",
        });
      }

      try {
        const transactions = yield* Effect.tryPromise({
          try: async () => {
            // Query Convex for transactions
            return await this.convexClient.query("transactions:list", {
              address,
              ...filter,
              limit,
              offset,
            });
          },
          catch: (error) => ({
            _tag: "ConvexError" as const,
            message: error instanceof Error ? error.message : "Database error",
          }),
        });

        return transactions;
      } catch (error) {
        return yield* Effect.fail({
          _tag: "ConvexError" as const,
          message: error instanceof Error ? error.message : "Database error",
        });
      }
    });
  }

  getPendingTransactions(
    address: string,
    chainId: number
  ): Effect.Effect<PendingTransaction[], TransactionServiceError> {
    return pipe(
      this.getTransactionHistory(address, { status: "pending", chainId }),
      Effect.map((txs) =>
        txs.map((tx) => ({
          ...tx,
          estimatedConfirmTime: this.estimateConfirmTime(tx.gasPrice || "0"),
          canSpeedUp: tx.confirmations === 0,
          canCancel: tx.confirmations === 0,
        }))
      )
    );
  }

  getFailedTransactions(
    address: string,
    chainId?: number
  ): Effect.Effect<FailedTransaction[], TransactionServiceError> {
    return pipe(
      this.getTransactionHistory(address, { status: "failed", chainId }),
      Effect.map((txs) =>
        txs.map((tx) => ({
          ...tx,
          errorMessage: tx.error || "Transaction failed",
          canRetry: true,
        }))
      )
    );
  }

  waitForConfirmation(
    hash: string,
    chainId: number,
    confirmations: number = 12
  ): Effect.Effect<TransactionReceipt, TransactionServiceError> {
    return Effect.gen(this, function* () {
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      while (attempts < maxAttempts) {
        const tx = yield* this.getTransaction(hash, chainId);

        if (tx.confirmations >= confirmations) {
          return yield* this.getTransactionReceipt(hash, chainId);
        }

        yield* Effect.sleep("5 seconds");
        attempts++;
      }

      return yield* Effect.fail({
        _tag: "NetworkError" as const,
        message: "Transaction confirmation timeout",
      });
    });
  }

  speedUpTransaction(
    hash: string,
    chainId: number,
    newGasPrice: string
  ): Effect.Effect<string, TransactionServiceError> {
    return Effect.gen(this, function* () {
      const tx = yield* this.getTransaction(hash, chainId);

      if (tx.status !== "pending") {
        return yield* Effect.fail({
          _tag: "InvalidTransactionError" as const,
          message: "Can only speed up pending transactions",
        });
      }

      // This would integrate with wallet to send replacement tx
      // For now, return a mock hash
      const replacementHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      yield* this.updateTransactionStatus(hash, "replaced", {
        replacedBy: replacementHash,
      });

      return replacementHash;
    });
  }

  cancelTransaction(
    hash: string,
    chainId: number
  ): Effect.Effect<string, TransactionServiceError> {
    return Effect.gen(this, function* () {
      const tx = yield* this.getTransaction(hash, chainId);

      if (tx.status !== "pending") {
        return yield* Effect.fail({
          _tag: "InvalidTransactionError" as const,
          message: "Can only cancel pending transactions",
        });
      }

      // This would send a 0 ETH tx to same nonce
      const cancellationHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      yield* this.updateTransactionStatus(hash, "cancelled", {
        cancelledBy: cancellationHash,
      });

      return cancellationHash;
    });
  }

  exportTransactions(
    transactions: Transaction[],
    format: ExportFormat["format"]
  ): Effect.Effect<string, TransactionServiceError> {
    return Effect.gen(this, function* () {
      switch (format) {
        case "csv":
          return this.exportToCsv(transactions);
        case "koinly":
          return this.exportToKoinly(transactions);
        case "cointracker":
          return this.exportToCoinTracker(transactions);
        case "form8949":
          return this.exportToForm8949(transactions);
        default:
          return this.exportToCsv(transactions);
      }
    });
  }

  storeTransaction(
    transaction: Transaction,
    userId: string
  ): Effect.Effect<string, TransactionServiceError> {
    return Effect.gen(this, function* () {
      if (!this.convexClient) {
        return yield* Effect.fail({
          _tag: "ConvexError" as const,
          message: "Convex client not configured",
        });
      }

      const id = yield* Effect.tryPromise({
        try: async () => {
          return await this.convexClient.mutation("transactions:create", {
            userId,
            ...transaction,
          });
        },
        catch: (error) => ({
          _tag: "ConvexError" as const,
          message: error instanceof Error ? error.message : "Database error",
        }),
      });

      return id;
    });
  }

  updateTransactionStatus(
    hash: string,
    status: TransactionStatus,
    metadata?: Record<string, any>
  ): Effect.Effect<void, TransactionServiceError> {
    return Effect.gen(this, function* () {
      if (!this.convexClient) {
        return yield* Effect.fail({
          _tag: "ConvexError" as const,
          message: "Convex client not configured",
        });
      }

      yield* Effect.tryPromise({
        try: async () => {
          await this.convexClient.mutation("transactions:updateStatus", {
            hash,
            status,
            metadata,
          });
        },
        catch: (error) => ({
          _tag: "ConvexError" as const,
          message: error instanceof Error ? error.message : "Database error",
        }),
      });
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private determineStatus(tx: any, confirmations: number): TransactionStatus {
    if (!tx.blockNumber) return "pending";
    if (confirmations >= 12) return "confirmed";
    return "pending";
  }

  private determineType(tx: any): TransactionType {
    if (tx.input === "0x") return "send";
    if (tx.input.startsWith("0x095ea7b3")) return "approve";
    return "contract";
  }

  private getChainName(chainId: number): string {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      8453: "Base",
      42161: "Arbitrum",
      10: "Optimism",
    };
    return chains[chainId] || `Chain ${chainId}`;
  }

  private estimateConfirmTime(gasPrice: string): number {
    const gwei = parseInt(gasPrice, 16) / 1e9;
    if (gwei > 50) return 30; // 30 seconds
    if (gwei > 30) return 60; // 1 minute
    if (gwei > 20) return 120; // 2 minutes
    return 300; // 5 minutes
  }

  private exportToCsv(transactions: Transaction[]): string {
    const headers = [
      "Hash",
      "Date",
      "Type",
      "From",
      "To",
      "Value",
      "Fee",
      "Status",
      "Chain",
    ];

    const rows = transactions.map((tx) => [
      tx.hash,
      new Date(tx.timestamp).toISOString(),
      tx.type,
      tx.from,
      tx.to,
      tx.value,
      tx.gasCost || "0",
      tx.status,
      tx.chainName,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  private exportToKoinly(transactions: Transaction[]): string {
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

    const rows = transactions.map((tx) => [
      new Date(tx.timestamp).toISOString(),
      tx.type === "send" ? tx.value : "",
      tx.token?.symbol || "ETH",
      tx.type === "receive" ? tx.value : "",
      tx.token?.symbol || "ETH",
      tx.gasCost || "",
      "ETH",
      "",
      "",
      tx.type,
      `${tx.type} transaction`,
      tx.hash,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  private exportToCoinTracker(transactions: Transaction[]): string {
    // Similar to Koinly format
    return this.exportToKoinly(transactions);
  }

  private exportToForm8949(transactions: Transaction[]): string {
    const headers = [
      "Description",
      "Date Acquired",
      "Date Sold",
      "Proceeds",
      "Cost Basis",
      "Gain/Loss",
    ];

    const rows = transactions
      .filter((tx) => tx.type === "send")
      .map((tx) => [
        `${tx.token?.symbol || "ETH"} Transaction`,
        new Date(tx.timestamp).toLocaleDateString(),
        new Date(tx.timestamp).toLocaleDateString(),
        tx.valueUsd?.toString() || "0",
        "0", // Would need cost basis calculation
        tx.valueUsd?.toString() || "0",
      ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function formatTransactionHash(hash: string, length: number = 10): string {
  if (hash.length <= length) return hash;
  const start = length / 2;
  const end = length / 2;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export function getTransactionExplorerUrl(
  hash: string,
  chainId: number
): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io/tx",
    137: "https://polygonscan.com/tx",
    8453: "https://basescan.org/tx",
    42161: "https://arbiscan.io/tx",
    10: "https://optimistic.etherscan.io/tx",
  };

  const baseUrl = explorers[chainId] || "https://etherscan.io/tx";
  return `${baseUrl}/${hash}`;
}

export function formatGasUsed(gasUsed: string, gasPrice: string): string {
  const gas = parseInt(gasUsed, 16);
  const price = parseInt(gasPrice, 16) / 1e9; // Convert to Gwei
  const cost = (gas * price) / 1e9; // Convert to ETH
  return cost.toFixed(6);
}

export function getTransactionStatusColor(status: TransactionStatus): string {
  switch (status) {
    case "confirmed":
      return "text-green-600 dark:text-green-400";
    case "pending":
      return "text-yellow-600 dark:text-yellow-400";
    case "failed":
      return "text-red-600 dark:text-red-400";
    case "cancelled":
      return "text-gray-600 dark:text-gray-400";
    case "replaced":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

export function getTransactionTypeIcon(type: TransactionType): string {
  const icons: Record<TransactionType, string> = {
    send: "↗",
    receive: "↙",
    swap: "⇄",
    approve: "✓",
    contract: "📝",
    mint: "⚡",
    burn: "🔥",
    stake: "🔒",
    unstake: "🔓",
  };
  return icons[type] || "•";
}
