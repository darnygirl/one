/**
 * useX402Payment Hook - Improved X402 Payment Flow
 *
 * Based on Coinbase X402 best practices:
 * - Better state management
 * - Session-based payments
 * - Clear error handling
 * - Loading states
 *
 * Usage:
 * ```tsx
 * const { pay, isLoading, error, success, session } = useX402Payment({
 *   amount: '100.00',
 *   onSuccess: (data) => console.log('Payment success!', data),
 * });
 * ```
 */

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { USDC_ADDRESSES, USDC_ABI, parseUSDC, PAYMENT_RECIPIENT } from '@/lib/web3/config';

export interface PaymentData {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  network: string;
  asset: string;
  sessionId?: string;
}

export interface UseX402PaymentOptions {
  amount: string;
  resource?: string;
  sessionEnabled?: boolean; // If true, create a session after payment
  sessionDuration?: number; // Duration in seconds (default: 24 hours)
  onSuccess?: (data: PaymentData) => void;
  onError?: (error: Error) => void;
}

export interface UseX402PaymentReturn {
  pay: () => Promise<void>;
  isLoading: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  error: Error | null;
  session: string | null;
  paymentData: PaymentData | null;
  reset: () => void;
}

export function useX402Payment(options: UseX402PaymentOptions): UseX402PaymentReturn {
  const {
    amount,
    resource = '/protected',
    sessionEnabled = false,
    sessionDuration = 86400, // 24 hours default
    onSuccess,
    onError,
  } = options;

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Local state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [session, setSession] = useState<string | null>(null);

  // Reset function
  const reset = useCallback(() => {
    resetWrite();
    setIsProcessing(false);
    setError(null);
    setPaymentData(null);
    setSession(null);
  }, [resetWrite]);

  // Main payment function
  const pay = useCallback(async () => {
    try {
      // Validation
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (chain?.id !== base.id) {
        throw new Error('Please switch to Base network');
      }

      // Parse amount
      const amountInUnits = parseUSDC(amount);
      if (amountInUnits <= 0n) {
        throw new Error('Invalid payment amount');
      }

      // Clear previous errors
      setError(null);
      setIsProcessing(true);

      // Execute USDC transfer
      writeContract({
        address: USDC_ADDRESSES.base,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [PAYMENT_RECIPIENT, amountInUnits],
        chainId: base.id,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed');
      setError(error);
      setIsProcessing(false);
      onError?.(error);
    }
  }, [isConnected, address, chain, amount, writeContract, onError]);

  // Handle transaction confirmation
  React.useEffect(() => {
    if (isConfirmed && hash && address) {
      const data: PaymentData = {
        txHash: hash,
        from: address,
        to: PAYMENT_RECIPIENT,
        amount,
        timestamp: Date.now(),
        network: 'base',
        asset: 'USDC',
      };

      // Create session if enabled
      if (sessionEnabled) {
        const sessionId = generateSessionId(hash, address);
        const expiresAt = Date.now() + sessionDuration * 1000;

        // Store session in localStorage
        const sessionData = {
          sessionId,
          paymentData: data,
          expiresAt,
          resource,
        };

        localStorage.setItem(`x402_session_${sessionId}`, JSON.stringify(sessionData));
        data.sessionId = sessionId;
        setSession(sessionId);
      }

      setPaymentData(data);
      setIsProcessing(false);
      onSuccess?.(data);
    }
  }, [isConfirmed, hash, address, amount, sessionEnabled, sessionDuration, resource, onSuccess]);

  // Handle write errors
  React.useEffect(() => {
    if (writeError) {
      setError(writeError);
      setIsProcessing(false);
      onError?.(writeError);
    }
  }, [writeError, onError]);

  return {
    pay,
    isLoading: isProcessing || isConfirming,
    isProcessing,
    isSuccess: isConfirmed,
    error: error || writeError,
    session,
    paymentData,
    reset,
  };
}

/**
 * Generate a unique session ID from transaction hash and address
 */
function generateSessionId(txHash: string, address: string): string {
  const combined = `${txHash}-${address}-${Date.now()}`;
  // Simple hash function (in production, use a proper hash like SHA-256)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `session_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if a session is valid
 */
export function isSessionValid(sessionId: string): boolean {
  const sessionData = localStorage.getItem(`x402_session_${sessionId}`);
  if (!sessionData) return false;

  try {
    const data = JSON.parse(sessionData);
    return Date.now() < data.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Get session data
 */
export function getSessionData(sessionId: string): any | null {
  const sessionData = localStorage.getItem(`x402_session_${sessionId}`);
  if (!sessionData) return null;

  try {
    const data = JSON.parse(sessionData);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(`x402_session_${sessionId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Clear expired sessions
 */
export function clearExpiredSessions(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('x402_session_')) {
      const sessionData = localStorage.getItem(key);
      if (sessionData) {
        try {
          const data = JSON.parse(sessionData);
          if (Date.now() > data.expiresAt) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  });
}
