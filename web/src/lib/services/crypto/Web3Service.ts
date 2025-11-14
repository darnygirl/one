/**
 * Web3 Service
 *
 * Effect.ts service for Web3 operations:
 * - Smart contract calls (read/write)
 * - ABI parsing and validation
 * - Multi-sig wallet operations
 * - Transaction simulation
 * - Contract event monitoring
 */

import { Effect, Data } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export class ContractCallError extends Data.TaggedError("ContractCallError")<{
  message: string;
}> {}

export class ABIParseError extends Data.TaggedError("ABIParseError")<{
  message: string;
}> {}

export class MultiSigError extends Data.TaggedError("MultiSigError")<{
  message: string;
}> {}

export class SimulationError extends Data.TaggedError("SimulationError")<{
  message: string;
}> {}

export type Web3Error =
  | ContractCallError
  | ABIParseError
  | MultiSigError
  | SimulationError;

// ============================================================================
// Smart Contract Types
// ============================================================================

export interface ABIFunction {
  name: string;
  type: "function" | "constructor" | "receive" | "fallback";
  stateMutability: "pure" | "view" | "nonpayable" | "payable";
  inputs: ABIParameter[];
  outputs: ABIParameter[];
}

export interface ABIParameter {
  name: string;
  type: string;
  components?: ABIParameter[]; // For struct types
}

export interface ABIEvent {
  name: string;
  type: "event";
  inputs: Array<ABIParameter & { indexed: boolean }>;
}

export interface ParsedABI {
  functions: ABIFunction[];
  events: ABIEvent[];
  constructor?: ABIFunction;
}

export interface ContractCall {
  address: string;
  functionName: string;
  args: unknown[];
  value?: bigint;
}

export interface CallResult {
  success: boolean;
  data: unknown;
  gasUsed?: bigint;
  error?: string;
}

export interface SimulationResult {
  success: boolean;
  gasEstimate: bigint;
  returnValue?: unknown;
  error?: string;
  stateChanges: StateChange[];
}

export interface StateChange {
  address: string;
  slot: string;
  before: string;
  after: string;
}

// ============================================================================
// ABI Parsing
// ============================================================================

/**
 * Parse and validate contract ABI
 */
export const parseABI = (
  abi: string
): Effect.Effect<ParsedABI, ABIParseError> =>
  Effect.gen(function* () {
    try {
      const parsed = JSON.parse(abi);

      if (!Array.isArray(parsed)) {
        return yield* Effect.fail(
          new ABIParseError({ message: "ABI must be an array" })
        );
      }

      const functions: ABIFunction[] = [];
      const events: ABIEvent[] = [];
      let constructor: ABIFunction | undefined;

      for (const item of parsed) {
        if (item.type === "function") {
          functions.push(item as ABIFunction);
        } else if (item.type === "event") {
          events.push(item as ABIEvent);
        } else if (item.type === "constructor") {
          constructor = item as ABIFunction;
        }
      }

      return {
        functions,
        events,
        constructor,
      };
    } catch (error) {
      return yield* Effect.fail(
        new ABIParseError({
          message: `Failed to parse ABI: ${(error as Error).message}`,
        })
      );
    }
  });

/**
 * Validate function arguments against ABI
 */
export const validateFunctionArgs = (
  func: ABIFunction,
  args: unknown[]
): Effect.Effect<boolean, ABIParseError> =>
  Effect.gen(function* () {
    if (args.length !== func.inputs.length) {
      return yield* Effect.fail(
        new ABIParseError({
          message: `Expected ${func.inputs.length} arguments, got ${args.length}`,
        })
      );
    }

    // Type validation (basic)
    for (let i = 0; i < args.length; i++) {
      const param = func.inputs[i];
      const arg = args[i];

      if (param.type === "address" && typeof arg !== "string") {
        return yield* Effect.fail(
          new ABIParseError({
            message: `Argument ${i} (${param.name}) must be a string address`,
          })
        );
      }

      if (param.type.startsWith("uint") && typeof arg !== "number" && typeof arg !== "bigint") {
        return yield* Effect.fail(
          new ABIParseError({
            message: `Argument ${i} (${param.name}) must be a number`,
          })
        );
      }
    }

    return true;
  });

/**
 * Get function signature (for transaction data)
 */
export const getFunctionSignature = (
  func: ABIFunction
): Effect.Effect<string, ABIParseError> =>
  Effect.gen(function* () {
    const types = func.inputs.map((input) => input.type).join(",");
    const signature = `${func.name}(${types})`;
    return signature;
  });

// ============================================================================
// Smart Contract Calls
// ============================================================================

/**
 * Simulate contract call (without sending transaction)
 */
export const simulateContractCall = (
  call: ContractCall,
  abi: ParsedABI
): Effect.Effect<SimulationResult, SimulationError> =>
  Effect.gen(function* () {
    const func = abi.functions.find((f) => f.name === call.functionName);

    if (!func) {
      return yield* Effect.fail(
        new SimulationError({
          message: `Function ${call.functionName} not found in ABI`,
        })
      );
    }

    // Validate args
    yield* validateFunctionArgs(func, call.args);

    // Mock simulation (in production, use eth_call or tenderly)
    const gasEstimate = BigInt(
      func.stateMutability === "view" || func.stateMutability === "pure"
        ? 21000
        : 150000
    );

    return {
      success: true,
      gasEstimate,
      returnValue: func.outputs.length > 0 ? "0x0" : undefined,
      stateChanges: [],
    };
  });

/**
 * Execute read-only contract call
 */
export const readContract = (
  call: ContractCall,
  abi: ParsedABI
): Effect.Effect<CallResult, ContractCallError> =>
  Effect.gen(function* () {
    const func = abi.functions.find((f) => f.name === call.functionName);

    if (!func) {
      return yield* Effect.fail(
        new ContractCallError({
          message: `Function ${call.functionName} not found`,
        })
      );
    }

    if (func.stateMutability !== "view" && func.stateMutability !== "pure") {
      return yield* Effect.fail(
        new ContractCallError({
          message: `Function ${call.functionName} is not a read function`,
        })
      );
    }

    // Mock read (in production, use viem's readContract)
    return {
      success: true,
      data: "0x0000000000000000000000000000000000000000000000000000000000000000",
      gasUsed: BigInt(21000),
    };
  });

/**
 * Execute write contract transaction
 */
export const writeContract = (
  call: ContractCall,
  abi: ParsedABI
): Effect.Effect<CallResult, ContractCallError> =>
  Effect.gen(function* () {
    const func = abi.functions.find((f) => f.name === call.functionName);

    if (!func) {
      return yield* Effect.fail(
        new ContractCallError({
          message: `Function ${call.functionName} not found`,
        })
      );
    }

    if (func.stateMutability === "view" || func.stateMutability === "pure") {
      return yield* Effect.fail(
        new ContractCallError({
          message: `Function ${call.functionName} is read-only`,
        })
      );
    }

    // Simulate first
    const simulation = yield* simulateContractCall(call, abi);

    if (!simulation.success) {
      return yield* Effect.fail(
        new ContractCallError({
          message: `Simulation failed: ${simulation.error}`,
        })
      );
    }

    // Mock write (in production, use viem's writeContract)
    return {
      success: true,
      data: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      gasUsed: simulation.gasEstimate,
    };
  });

// ============================================================================
// Multi-Signature Wallet
// ============================================================================

export interface MultiSigWallet {
  address: string;
  owners: string[];
  threshold: number;
  nonce: number;
}

export interface MultiSigTransaction {
  id: string;
  to: string;
  value: bigint;
  data: string;
  nonce: number;
  signatures: MultiSigSignature[];
  executed: boolean;
}

export interface MultiSigSignature {
  signer: string;
  signature: string;
  timestamp: Date;
}

/**
 * Create multi-sig wallet configuration
 */
export const createMultiSig = (
  owners: string[],
  threshold: number
): Effect.Effect<MultiSigWallet, MultiSigError> =>
  Effect.gen(function* () {
    if (owners.length === 0) {
      return yield* Effect.fail(
        new MultiSigError({ message: "At least one owner required" })
      );
    }

    if (threshold < 1 || threshold > owners.length) {
      return yield* Effect.fail(
        new MultiSigError({
          message: `Threshold must be between 1 and ${owners.length}`,
        })
      );
    }

    // Check for duplicate owners
    const uniqueOwners = new Set(owners);
    if (uniqueOwners.size !== owners.length) {
      return yield* Effect.fail(
        new MultiSigError({ message: "Duplicate owners not allowed" })
      );
    }

    return {
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      owners,
      threshold,
      nonce: 0,
    };
  });

/**
 * Propose transaction to multi-sig wallet
 */
export const proposeTransaction = (
  wallet: MultiSigWallet,
  to: string,
  value: bigint,
  data: string
): Effect.Effect<MultiSigTransaction, MultiSigError> =>
  Effect.gen(function* () {
    const transaction: MultiSigTransaction = {
      id: `tx-${wallet.nonce}-${Date.now()}`,
      to,
      value,
      data,
      nonce: wallet.nonce,
      signatures: [],
      executed: false,
    };

    return transaction;
  });

/**
 * Sign multi-sig transaction
 */
export const signTransaction = (
  transaction: MultiSigTransaction,
  signer: string,
  wallet: MultiSigWallet
): Effect.Effect<MultiSigTransaction, MultiSigError> =>
  Effect.gen(function* () {
    if (!wallet.owners.includes(signer)) {
      return yield* Effect.fail(
        new MultiSigError({ message: "Signer is not an owner" })
      );
    }

    if (transaction.signatures.some((sig) => sig.signer === signer)) {
      return yield* Effect.fail(
        new MultiSigError({ message: "Already signed by this owner" })
      );
    }

    const signature: MultiSigSignature = {
      signer,
      signature: `0x${Math.random().toString(16).slice(2, 130)}`,
      timestamp: new Date(),
    };

    return {
      ...transaction,
      signatures: [...transaction.signatures, signature],
    };
  });

/**
 * Execute multi-sig transaction (when threshold met)
 */
export const executeTransaction = (
  transaction: MultiSigTransaction,
  wallet: MultiSigWallet
): Effect.Effect<CallResult, MultiSigError> =>
  Effect.gen(function* () {
    if (transaction.executed) {
      return yield* Effect.fail(
        new MultiSigError({ message: "Transaction already executed" })
      );
    }

    if (transaction.signatures.length < wallet.threshold) {
      return yield* Effect.fail(
        new MultiSigError({
          message: `Need ${wallet.threshold} signatures, have ${transaction.signatures.length}`,
        })
      );
    }

    // Verify all signatures are from owners
    for (const sig of transaction.signatures) {
      if (!wallet.owners.includes(sig.signer)) {
        return yield* Effect.fail(
          new MultiSigError({ message: `Invalid signer: ${sig.signer}` })
        );
      }
    }

    // Mock execution
    return {
      success: true,
      data: transaction.data,
      gasUsed: BigInt(150000),
    };
  });

// ============================================================================
// Contract Events
// ============================================================================

export interface EventLog {
  address: string;
  eventName: string;
  args: Record<string, unknown>;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

/**
 * Parse event logs from transaction receipt
 */
export const parseEventLogs = (
  logs: unknown[],
  abi: ParsedABI
): Effect.Effect<EventLog[], ABIParseError> =>
  Effect.gen(function* () {
    // Mock event parsing (in production, use viem's decodeEventLog)
    return [];
  });

/**
 * Subscribe to contract events
 */
export const watchContractEvents = (
  address: string,
  eventName: string,
  abi: ParsedABI,
  callback: (event: EventLog) => void
): Effect.Effect<() => void, ABIParseError> =>
  Effect.gen(function* () {
    const event = abi.events.find((e) => e.name === eventName);

    if (!event) {
      return yield* Effect.fail(
        new ABIParseError({ message: `Event ${eventName} not found` })
      );
    }

    // Mock subscription (in production, use viem's watchContractEvent)
    const unsubscribe = () => {
      console.log(`Unsubscribed from ${eventName}`);
    };

    return unsubscribe;
  });

// ============================================================================
// Gas Estimation
// ============================================================================

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  totalCost: bigint;
}

/**
 * Estimate gas for contract call
 */
export const estimateGas = (
  call: ContractCall,
  abi: ParsedABI
): Effect.Effect<GasEstimate, ContractCallError> =>
  Effect.gen(function* () {
    const simulation = yield* simulateContractCall(call, abi);

    const gasPrice = BigInt(50_000_000_000); // 50 gwei
    const gasLimit = simulation.gasEstimate;
    const totalCost = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      maxFeePerGas: BigInt(100_000_000_000), // 100 gwei
      maxPriorityFeePerGas: BigInt(2_000_000_000), // 2 gwei
      totalCost,
    };
  });

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Verify contract address
 */
export const verifyContractAddress = (
  address: string
): Effect.Effect<boolean, ContractCallError> =>
  Effect.gen(function* () {
    if (!address.startsWith("0x") || address.length !== 42) {
      return yield* Effect.fail(
        new ContractCallError({ message: "Invalid contract address format" })
      );
    }

    // Mock verification (in production, check if contract exists)
    return true;
  });

/**
 * Get contract bytecode
 */
export const getContractBytecode = (
  address: string
): Effect.Effect<string, ContractCallError> =>
  Effect.gen(function* () {
    yield* verifyContractAddress(address);

    // Mock bytecode (in production, use eth_getCode)
    return "0x6080604052...";
  });

/**
 * Check if address is contract
 */
export const isContract = (
  address: string
): Effect.Effect<boolean, ContractCallError> =>
  Effect.gen(function* () {
    const bytecode = yield* getContractBytecode(address);
    return bytecode !== "0x" && bytecode.length > 2;
  });
