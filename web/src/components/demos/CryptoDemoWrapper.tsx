import React from 'react';
import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet/WalletConnectButton';
import { WalletBalance } from '@/components/ontology-ui/crypto/wallet/WalletBalance';
import { TokenPortfolio } from '@/components/ontology-ui/crypto/portfolio/TokenPortfolio';
import { TokenPrice } from '@/components/ontology-ui/crypto/portfolio/TokenPrice';
import { TokenChart } from '@/components/ontology-ui/crypto/portfolio/TokenChart';
import { CurrencyConverter } from '@/components/ontology-ui/crypto/multi-currency/CurrencyConverter';
import { TokenSwap } from '@/components/ontology-ui/crypto/dex/TokenSwap';
import { ChatPayment } from '@/components/ontology-ui/crypto/chat/ChatPayment';
import { NFTGallery } from '@/components/ontology-ui/crypto/nft/NFTGallery';
import { SendToken } from '@/components/ontology-ui/crypto/payments/SendToken';
import { CheckoutWidget } from '@/components/ontology-ui/crypto/checkout/CheckoutWidget';
import { TransactionHistory } from '@/components/ontology-ui/crypto/transactions/TransactionHistory';

export interface CryptoDemoWrapperProps {
  component: string;
  props?: Record<string, any>;
}

/**
 * Demo wrapper that renders crypto components with mock data
 */
export function CryptoDemoWrapper({ component, props = {} }: CryptoDemoWrapperProps) {
  // Mock wallet address for demos
  const mockWalletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const mockChainId = 1; // Ethereum mainnet

  // Render component based on name
  const renderComponent = () => {
    switch (component) {
      case 'wallet-connect-button':
        return (
          <WalletConnectButton
            showBalance={true}
            onConnect={(address) => console.log('Connected:', address)}
            onDisconnect={() => console.log('Disconnected')}
            {...props}
          />
        );

      case 'wallet-balance':
        return (
          <WalletBalance
            address={mockWalletAddress}
            showUsd={true}
            refreshInterval={30000}
            {...props}
          />
        );

      case 'token-portfolio':
        return (
          <TokenPortfolio
            walletAddress={mockWalletAddress}
            chainId={mockChainId}
            onTokenSelect={(token) => console.log('Selected:', token)}
            {...props}
          />
        );

      case 'token-price':
        return (
          <TokenPrice
            coinId="bitcoin"
            showChart={true}
            showChange={true}
            refreshInterval={30000}
            {...props}
          />
        );

      case 'token-chart':
        return (
          <TokenChart
            coinId="ethereum"
            timeRange="7d"
            showVolume={true}
            height={400}
            {...props}
          />
        );

      case 'currency-converter':
        return (
          <CurrencyConverter
            defaultFrom="bitcoin"
            defaultTo="usd"
            showChart={true}
            refreshInterval={30000}
            {...props}
          />
        );

      case 'token-swap':
        return (
          <TokenSwap
            walletAddress={mockWalletAddress}
            chainId={mockChainId}
            onSwap={(txHash) => console.log('Swapped:', txHash)}
            {...props}
          />
        );

      case 'send-token':
        return (
          <SendToken
            walletAddress={mockWalletAddress}
            chainId={mockChainId}
            onSend={(txHash) => console.log('Sent:', txHash)}
            {...props}
          />
        );

      case 'checkout-widget':
        return (
          <CheckoutWidget
            amount={99.99}
            currency="USD"
            merchantName="Demo Store"
            productName="Premium Subscription"
            onPaymentComplete={(txHash) => console.log('Payment complete:', txHash)}
            {...props}
          />
        );

      case 'transaction-history':
        return (
          <TransactionHistory
            walletAddress={mockWalletAddress}
            chainId={mockChainId}
            pageSize={10}
            {...props}
          />
        );

      case 'chat-payment':
        return (
          <ChatPayment
            chatId="demo-chat-123"
            recipientAddress="0x8Ba1f109551bD432803012645Ac136ddd64DBA72"
            recipientName="Alice"
            defaultToken="USDC"
            onSend={(txHash) => console.log('Payment sent:', txHash)}
            {...props}
          />
        );

      case 'nft-gallery':
        return (
          <NFTGallery
            nfts={[]} // Will use mock data from component
            owner={mockWalletAddress}
            chainId={mockChainId}
            view="grid"
            onNFTSelect={(nft) => console.log('Selected NFT:', nft)}
            {...props}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Component: {component}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              This component is ready to use. Import it in your React application to see it in action.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="crypto-demo-wrapper">
      {renderComponent()}
    </div>
  );
}
