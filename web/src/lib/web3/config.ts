/**
 * Web3 Configuration for X402 Payments
 * Base Network Configuration with USDC
 */

import { base, baseSepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

/**
 * USDC Contract Addresses
 */
export const USDC_ADDRESSES = {
  // Base Mainnet
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  // Base Sepolia Testnet
  baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
} as const;

/**
 * Payment Recipient Address (Platform Treasury)
 */
export const PAYMENT_RECIPIENT =
  import.meta.env.PUBLIC_X402_RECIPIENT_ADDRESS ||
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

/**
 * WalletConnect Project ID
 * Get yours at: https://cloud.walletconnect.com/
 */
const projectId = import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

/**
 * Wagmi Configuration
 */
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Injected wallets (MetaMask, etc.)
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect
    walletConnect({
      projectId,
      metadata: {
        name: 'ONE Platform',
        description: 'E-Commerce with X402 Crypto Payments',
        url: 'https://one.ie',
        icons: ['https://one.ie/favicon.ico'],
      },
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'ONE Platform',
      appLogoUrl: 'https://one.ie/favicon.ico',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

/**
 * USDC Token ABI (ERC-20 + Permit)
 */
export const USDC_ABI = [
  // Standard ERC-20
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  // ERC-2612 Permit
  {
    constant: false,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', type: 'bytes32' }],
    type: 'function',
  },
] as const;

/**
 * Helper: Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2);
}

/**
 * Helper: Parse USDC amount (6 decimals)
 */
export function parseUSDC(amount: string): bigint {
  return BigInt(Math.round(parseFloat(amount) * 1e6));
}

/**
 * Network Names
 */
export const NETWORK_NAMES = {
  [base.id]: 'Base',
  [baseSepolia.id]: 'Base Sepolia',
} as const;
