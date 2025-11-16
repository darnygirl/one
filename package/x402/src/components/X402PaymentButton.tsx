/**
 * X402PaymentButton - USDC payment button with X402 protocol
 * Handles payment signing, transaction submission, and confirmation
 * Follows product-landing.astro minimalist black/white design
 */

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseUnits, formatUnits } from 'viem';
import { USDC_ADDRESSES, USDC_ABI, PAYMENT_RECIPIENT, parseUSDC, formatUSDC } from '@/lib/web3/config';

interface X402PaymentButtonProps {
  /** Amount in USD (e.g., "10.50") */
  amount: string;
  /** Resource being paid for */
  resource: string;
  /** Description of payment */
  description?: string;
  /** Callback when payment succeeds */
  onSuccess?: (txHash: string, paymentData: PaymentData) => void;
  /** Callback when payment fails */
  onError?: (error: Error) => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Disable button */
  disabled?: boolean;
}

export interface PaymentData {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  network: string;
  asset: string;
}

export function X402PaymentButton({
  amount,
  resource,
  description,
  onSuccess,
  onError,
  variant = 'primary',
  disabled = false,
}: X402PaymentButtonProps) {
  const { address, isConnected, chain } = useAccount();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse amount to USDC units (6 decimals)
  const amountInUnits = parseUSDC(amount);

  // Check USDC balance
  const { data: balance } = useReadContract({
    address: USDC_ADDRESSES.base,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  // Write contract hook for USDC transfer
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if user has sufficient balance
  const hasInsufficientBalance = balance && balance < amountInUnits;

  // Handle payment
  const handlePayment = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (chain?.id !== base.id) {
      setError('Please switch to Base network');
      return;
    }

    if (hasInsufficientBalance) {
      setError(`Insufficient USDC balance. You have ${formatUSDC(balance!)} USDC, but need ${amount} USDC`);
      return;
    }

    setIsPaying(true);
    setError(null);

    try {
      // Execute USDC transfer
      writeContract(
        {
          address: USDC_ADDRESSES.base,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [PAYMENT_RECIPIENT as `0x${string}`, amountInUnits],
          chainId: base.id,
        },
        {
          onSuccess: (txHash) => {
            // Wait for confirmation
            console.log('Transaction submitted:', txHash);
          },
          onError: (err) => {
            console.error('Transaction error:', err);
            setError(err.message || 'Transaction failed');
            setIsPaying(false);
            onError?.(err as Error);
          },
        }
      );
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setIsPaying(false);
      onError?.(err as Error);
    }
  };

  // Handle confirmation
  React.useEffect(() => {
    if (isConfirmed && hash) {
      const paymentData: PaymentData = {
        txHash: hash,
        from: address!,
        to: PAYMENT_RECIPIENT,
        amount,
        timestamp: Date.now(),
        network: 'base',
        asset: 'USDC',
      };

      onSuccess?.(hash, paymentData);
      setIsPaying(false);
    }
  }, [isConfirmed, hash, address, amount, onSuccess]);

  // Determine button state
  const getButtonState = () => {
    if (!isConnected) return 'Connect wallet to pay';
    if (hasInsufficientBalance) return 'Insufficient USDC balance';
    if (isPaying || isWritePending) return 'Initiating payment...';
    if (isConfirming) return 'Confirming transaction...';
    if (isConfirmed) return 'Payment confirmed!';
    return `Pay ${amount} USDC`;
  };

  const isButtonDisabled =
    disabled || !isConnected || hasInsufficientBalance || isPaying || isWritePending || isConfirming || isConfirmed;

  // Button styles based on variant
  const buttonClasses =
    variant === 'primary'
      ? 'px-8 py-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed w-full'
      : 'px-8 py-4 border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full';

  return (
    <div className="space-y-4">
      {/* Payment Info */}
      <div className="border-2 border-black dark:border-white p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60">Amount</span>
          <span className="text-2xl font-light tabular-nums">${amount}</span>
        </div>
        {description && (
          <p className="text-sm opacity-80 mt-2">{description}</p>
        )}
        {balance && (
          <div className="mt-3 pt-3 border-t border-black dark:border-white flex justify-between text-xs">
            <span className="opacity-60">Your USDC Balance</span>
            <span className="font-bold tabular-nums">{formatUSDC(balance)} USDC</span>
          </div>
        )}
      </div>

      {/* Payment Button */}
      <button onClick={handlePayment} disabled={isButtonDisabled} className={buttonClasses}>
        <div className="flex items-center justify-center gap-2">
          {(isPaying || isWritePending || isConfirming) && (
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {isConfirmed && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-xs font-bold tracking-[0.2em] uppercase">{getButtonState()}</span>
        </div>
      </button>

      {/* Error Display */}
      {error && (
        <div className="border-2 border-red-500 p-4 text-red-500">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-xs font-bold tracking-wide uppercase mb-1">Payment Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Hash */}
      {hash && (
        <div className="border border-black dark:border-white p-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="opacity-60">Transaction</span>
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:opacity-60 transition-opacity flex items-center gap-1"
            >
              {hash.slice(0, 6)}...{hash.slice(-4)}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* X402 Protocol Badge */}
      <div className="flex items-center justify-center gap-2 text-xs opacity-40">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secured by X402 Protocol</span>
      </div>
    </div>
  );
}
