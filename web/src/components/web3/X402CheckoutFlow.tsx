/**
 * X402CheckoutFlow - Complete checkout with X402 payments
 * Integrates wallet connection and USDC payment
 */

import React, { useState } from 'react';
import { Web3Provider } from '@/components/web3/Web3Provider';
import { WalletConnectButton } from '@/components/web3/WalletConnectButton';
import { X402PaymentButton, type PaymentData } from '@/components/web3/X402PaymentButton';
import { useAccount } from 'wagmi';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface X402CheckoutFlowProps {
  cartItems: CartItem[];
  total: number;
  onPaymentSuccess?: (paymentData: PaymentData) => void;
}

function CheckoutContent({ cartItems, total, onPaymentSuccess }: X402CheckoutFlowProps) {
  const { isConnected, address } = useAccount();
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handlePaymentSuccess = (txHash: string, paymentData: PaymentData) => {
    console.log('Payment successful!', txHash, paymentData);
    setPaymentComplete(true);
    onPaymentSuccess?.(paymentData);

    // Redirect to confirmation page after 2 seconds
    setTimeout(() => {
      window.location.href = `/shop/order-confirmation?order=ORD-${Date.now()}&tx=${txHash}`;
    }, 2000);
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error.message}`);
  };

  if (paymentComplete) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-black dark:border-white rounded-full mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-light tracking-tight mb-2">Payment Successful!</h2>
        <p className="text-base opacity-80 mb-6">Redirecting to confirmation page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Wallet Connection */}
      <div className="border-2 border-black dark:border-white p-6">
        <h3 className="text-xl font-light tracking-tight mb-4">1. Connect Your Wallet</h3>
        <WalletConnectButton />
        {isConnected && address && (
          <div className="mt-4 p-3 border border-black dark:border-white bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="opacity-60">Wallet connected:</span>
              <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Payment */}
      {isConnected && (
        <div className="border-2 border-black dark:border-white p-6">
          <h3 className="text-xl font-light tracking-tight mb-4">2. Complete Payment</h3>
          <X402PaymentButton
            amount={total.toFixed(2)}
            resource="/shop/checkout"
            description="Complete your purchase with USDC on Base network"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            variant="primary"
          />
        </div>
      )}

      {/* Order Summary */}
      <div className="border border-black dark:border-white p-4 opacity-60">
        <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span className="tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-black dark:border-white font-bold">
            <span>Total</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="border-l-4 border-black dark:border-white pl-4 py-2 text-xs opacity-60">
        <p className="mb-1">
          <strong>Why USDC on Base?</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Ultra-low fees (~$0.0001 per transaction)</li>
          <li>Instant settlement (2-5 seconds)</li>
          <li>No chargebacks or payment disputes</li>
          <li>Global accessibility (no geographic restrictions)</li>
        </ul>
      </div>
    </div>
  );
}

export function X402CheckoutFlow(props: X402CheckoutFlowProps) {
  return (
    <Web3Provider theme="auto">
      <CheckoutContent {...props} />
    </Web3Provider>
  );
}
