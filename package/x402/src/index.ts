/**
 * @one/x402 - Gasless crypto payments for Astro + React
 *
 * EIP-3009 based USDC payments on Base network with zero gas for customers
 */

// Components
export { Web3Provider } from './components/Web3Provider';
export { WalletConnectButton } from './components/WalletConnectButton';
export { X402PaymentButton } from './components/X402PaymentButton';
export { ImprovedX402PaymentButton } from './components/ImprovedX402PaymentButton';
export { X402CheckoutFlow } from './components/X402CheckoutFlow';

// Hooks
export { useX402Payment } from './hooks/useX402Payment';

// Utilities
export { X402_CONFIG } from './lib/config';

// Types
export type {
  PaymentData,
  TransactionStatus,
  X402Config,
} from './types';
