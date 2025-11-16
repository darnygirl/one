/**
 * Type definitions for X402 payments
 */

export interface PaymentData {
  amount: number;
  recipientAddress: string;
  itemName?: string;
  itemDescription?: string;
  metadata?: Record<string, any>;
}

export type TransactionStatus =
  | 'idle'
  | 'connecting'
  | 'signing'
  | 'submitting'
  | 'confirming'
  | 'success'
  | 'error';

export interface X402Config {
  usdcAddress: string;
  merchantWallet: string;
  walletConnectProjectId: string;
  chainId: number;
}

export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface X402PaymentButtonProps {
  amount: number;
  recipientAddress: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
}

export interface X402CheckoutFlowProps {
  cartItems: CartItem[];
  total: number;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export interface UseX402PaymentReturn {
  status: TransactionStatus;
  error: Error | null;
  txHash: string | null;
  initiatePayment: (data: PaymentData) => Promise<void>;
  reset: () => void;
}
