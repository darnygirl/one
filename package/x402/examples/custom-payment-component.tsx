/**
 * Custom Payment Component Example
 *
 * Build your own payment UI using the useX402Payment hook
 */

import React, { useState } from 'react';
import { useX402Payment } from '@one/x402/hooks/useX402Payment';

interface CustomPaymentProps {
  productName: string;
  amount: number;
  recipientAddress: string;
}

export function CustomPaymentComponent({
  productName,
  amount,
  recipientAddress
}: CustomPaymentProps) {
  const { status, error, txHash, initiatePayment, reset } = useX402Payment();
  const [email, setEmail] = useState('');

  const handlePayment = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      await initiatePayment({
        amount,
        recipientAddress,
        itemName: productName,
        metadata: {
          email,
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  // Success state
  if (status === 'success' && txHash) {
    return (
      <div className="success-container">
        <h2>✓ Payment Successful!</h2>
        <p>Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
        <a href={`https://basescan.org/tx/${txHash}`} target="_blank">
          View on Basescan
        </a>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Payment Failed</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Try Again</button>
      </div>
    );
  }

  // Payment form
  return (
    <div className="payment-container">
      <h2>Buy {productName}</h2>
      <p className="price">${amount.toFixed(2)} USDC</p>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status !== 'idle'}
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={status !== 'idle' || !email}
        className="pay-button"
      >
        {status === 'idle' && 'Pay with USDC'}
        {status === 'connecting' && 'Connecting wallet...'}
        {status === 'signing' && 'Please sign message...'}
        {status === 'submitting' && 'Submitting transaction...'}
        {status === 'confirming' && 'Confirming...'}
      </button>

      {status !== 'idle' && (
        <p className="status-text">
          {status === 'signing' && 'Check your wallet to sign the authorization'}
          {status === 'submitting' && 'Transaction submitted to Base network'}
          {status === 'confirming' && 'Waiting for confirmation (~2 seconds)'}
        </p>
      )}
    </div>
  );
}

// Usage Example:
//
// import { Web3Provider } from '@one/x402/components/Web3Provider';
// import { CustomPaymentComponent } from './custom-payment-component';
//
// <Web3Provider>
//   <CustomPaymentComponent
//     productName="Premium Course"
//     amount={99.99}
//     recipientAddress="0xYourMerchantWallet"
//   />
// </Web3Provider>
