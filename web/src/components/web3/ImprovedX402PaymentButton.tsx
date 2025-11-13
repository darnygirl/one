/**
 * Improved X402 Payment Button
 *
 * Based on Coinbase X402 best practices:
 * - Clear loading states
 * - Better error messages
 * - Session support
 * - Success feedback
 * - Accessibility
 *
 * Usage:
 * ```tsx
 * <ImprovedX402PaymentButton
 *   amount="10.00"
 *   label="Pay $10 USDC"
 *   sessionEnabled={true}
 *   onSuccess={(data) => router.push('/success')}
 * />
 * ```
 */

import React from 'react';
import { useAccount } from 'wagmi';
import { useX402Payment } from '@/hooks/useX402Payment';
import { WalletConnectButton } from './WalletConnectButton';

export interface ImprovedX402PaymentButtonProps {
  amount: string;
  label?: string;
  resource?: string;
  sessionEnabled?: boolean;
  sessionDuration?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function ImprovedX402PaymentButton({
  amount,
  label,
  resource,
  sessionEnabled = false,
  sessionDuration,
  onSuccess,
  onError,
  className = '',
  variant = 'primary',
}: ImprovedX402PaymentButtonProps) {
  const { isConnected } = useAccount();

  const {
    pay,
    isLoading,
    isProcessing,
    isSuccess,
    error,
    session,
    paymentData,
    reset,
  } = useX402Payment({
    amount,
    resource,
    sessionEnabled,
    sessionDuration,
    onSuccess,
    onError,
  });

  // Auto-hide success message after 3 seconds
  React.useEffect(() => {
    if (isSuccess && !isLoading) {
      const timer = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isLoading, reset]);

  const buttonText = React.useMemo(() => {
    if (isSuccess && paymentData) {
      return sessionEnabled ? '✓ Session Created!' : '✓ Payment Complete!';
    }
    if (isLoading) {
      if (isProcessing) {
        return 'Confirm in Wallet...';
      }
      return 'Processing...';
    }
    return label || `Pay $${amount} USDC`;
  }, [isSuccess, isLoading, isProcessing, label, amount, paymentData, sessionEnabled]);

  const baseStyles = 'w-full px-8 py-4 border-2 border-black dark:border-white font-bold text-xs tracking-[0.3em] uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80',
    secondary: 'bg-transparent hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black',
  };

  const buttonClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  // If not connected, show wallet connect button
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="text-center text-sm opacity-60 mb-4">
          Connect your wallet to pay with USDC
        </div>
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Button */}
      <button
        onClick={pay}
        disabled={isLoading || isSuccess}
        className={buttonClassName}
        aria-label={buttonText}
      >
        {buttonText}
      </button>

      {/* Session Info */}
      {isSuccess && session && (
        <div className="p-4 border-2 border-black dark:border-white bg-black/5 dark:bg-white/5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 border-2 border-black dark:border-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1">Session Created</p>
              <p className="text-xs opacity-60 mb-2">Valid for {formatDuration(sessionDuration || 86400)}</p>
              <p className="text-xs font-mono bg-black/5 dark:bg-white/5 p-2 border border-black dark:border-white break-all">
                {session}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message (non-session) */}
      {isSuccess && !session && paymentData && (
        <div className="p-4 border-2 border-black dark:border-white bg-black/5 dark:bg-white/5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 border-2 border-black dark:border-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1">Payment Confirmed</p>
              <a
                href={`https://basescan.org/tx/${paymentData.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:opacity-60 transition-opacity flex items-center gap-1"
              >
                View on BaseScan
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-red-500 mb-1">Payment Failed</p>
              <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>
              <button
                onClick={reset}
                className="mt-2 text-xs font-bold tracking-wide underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details */}
      {!isSuccess && !error && (
        <div className="text-center text-xs opacity-40 space-y-1">
          <p>Network: Base</p>
          <p>Asset: USDC</p>
          <p>Fee: ~$0.0001</p>
        </div>
      )}
    </div>
  );
}

/**
 * Format duration in human-readable format
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}
