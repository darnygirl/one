/**
 * Crypto Wallet Component Types
 * Types for Web3 wallet components
 */

import type { CardProps } from "../../types";

// ============================================================================
// Wallet Types
// ============================================================================

export type ChainId = 1 | 137 | 42161 | 10 | 8453 | number; // Ethereum, Polygon, Arbitrum, Optimism, Base

export interface Chain {
  id: ChainId;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: string;
    public?: string;
  };
  blockExplorers?: {
    default: {
      name: string;
      url: string;
    };
  };
  icon?: string;
}

export interface Wallet {
  address: string;
  chainId: ChainId;
  balance?: string;
  ensName?: string | null;
  ensAvatar?: string | null;
  connector?: string;
}

export interface WalletBalance {
  value: bigint;
  decimals: number;
  formatted: string;
  symbol: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface WalletConnectButtonProps extends CardProps {
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
  label?: string;
  showBalance?: boolean;
}

export interface WalletSwitcherProps extends CardProps {
  wallets: Wallet[];
  currentWallet?: Wallet;
  onSwitch?: (wallet: Wallet) => void;
}

export interface NetworkSwitcherProps extends CardProps {
  chains: Chain[];
  currentChain?: Chain;
  onSwitch?: (chain: Chain) => void;
}

export interface WalletBalanceProps extends CardProps {
  address?: string;
  chainId?: ChainId;
  showUsd?: boolean;
  refreshInterval?: number;
}

export interface WalletAddressProps extends CardProps {
  address: string;
  ensName?: string | null;
  ensAvatar?: string | null;
  showCopy?: boolean;
  showQR?: boolean;
  truncate?: boolean;
  length?: number;
}

export interface WalletQRCodeProps extends CardProps {
  address: string;
  amount?: string;
  label?: string;
  size?: number;
  includeAmount?: boolean;
  downloadable?: boolean;
}

export interface WalletExportProps extends CardProps {
  onExportPrivateKey?: () => void;
  onExportSeedPhrase?: () => void;
  requirePassword?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ENSData {
  name: string | null;
  avatar: string | null;
  address: string;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  formatted: string;
  usdValue?: number;
}

export interface WalletError {
  _tag: "WalletConnectionError" | "WalletDisconnectError" | "NetworkSwitchError" | "BalanceFetchError";
  message: string;
  code?: string;
}
