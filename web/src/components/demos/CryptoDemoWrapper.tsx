import React from 'react';
// Wallet Components
import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet/WalletConnectButton';
import { WalletBalance } from '@/components/ontology-ui/crypto/wallet/WalletBalance';
import { WalletSwitcher } from '@/components/ontology-ui/crypto/wallet/WalletSwitcher';
import { NetworkSwitcher } from '@/components/ontology-ui/crypto/wallet/NetworkSwitcher';

// Portfolio Components
import { TokenPortfolio } from '@/components/ontology-ui/crypto/portfolio/TokenPortfolio';
import { TokenPrice } from '@/components/ontology-ui/crypto/portfolio/TokenPrice';
import { TokenChart } from '@/components/ontology-ui/crypto/portfolio/TokenChart';
import { TokenBalance } from '@/components/ontology-ui/crypto/portfolio/TokenBalance';

// Analysis Components
import { TokenAnalyzer } from '@/components/ontology-ui/crypto/analysis/TokenAnalyzer';
import { TokenHolders } from '@/components/ontology-ui/crypto/analysis/TokenHolders';

// Portfolio Advanced
import { PortfolioTracker } from '@/components/ontology-ui/crypto/portfolio-advanced/PortfolioTracker';
import { PortfolioAllocation } from '@/components/ontology-ui/crypto/portfolio-advanced/PortfolioAllocation';

// Payment Components
import { SendToken } from '@/components/ontology-ui/crypto/payments/SendToken';
import { ReceivePayment } from '@/components/ontology-ui/crypto/payments/ReceivePayment';

// Transaction Components
import { TransactionHistory } from '@/components/ontology-ui/crypto/transactions/TransactionHistory';
import { TransactionStatus } from '@/components/ontology-ui/crypto/transactions/TransactionStatus';

// Checkout Components
import { CheckoutWidget } from '@/components/ontology-ui/crypto/checkout/CheckoutWidget';

// Multi-Currency Components
import { CurrencyConverter } from '@/components/ontology-ui/crypto/multi-currency/CurrencyConverter';

// DEX Components
import { TokenSwap } from '@/components/ontology-ui/crypto/dex/TokenSwap';
import { SwapQuote } from '@/components/ontology-ui/crypto/dex/SwapQuote';

// Liquidity Components
import { LiquidityPool } from '@/components/ontology-ui/crypto/liquidity/LiquidityPool';
import { StakingPool } from '@/components/ontology-ui/crypto/liquidity/StakingPool';

// Lending Components
import { LendingMarket } from '@/components/ontology-ui/crypto/lending/LendingMarket';
import { LendToken } from '@/components/ontology-ui/crypto/lending/LendToken';
import { BorrowToken } from '@/components/ontology-ui/crypto/lending/BorrowToken';

// Advanced DeFi
import { OptionsTrading } from '@/components/ontology-ui/crypto/advanced/OptionsTrading';
import { YieldAggregator } from '@/components/ontology-ui/crypto/advanced/YieldAggregator';

// Chat Components
import { ChatPayment } from '@/components/ontology-ui/crypto/chat/ChatPayment';
import { ChatRequest } from '@/components/ontology-ui/crypto/chat/ChatRequest';

// NFT Components
import { NFTGallery } from '@/components/ontology-ui/crypto/nft/NFTGallery';
import { NFTCard } from '@/components/ontology-ui/crypto/nft/NFTCard';
import { NFTMarketplace } from '@/components/ontology-ui/crypto/nft/NFTMarketplace';

// Token Gating
import { TokenGate } from '@/components/ontology-ui/crypto/access/TokenGate';
import { NFTGate } from '@/components/ontology-ui/crypto/access/NFTGate';

// Web3 Advanced
import { Web3Dashboard } from '@/components/ontology-ui/crypto/web3/Web3Dashboard';
import { SmartContractCall } from '@/components/ontology-ui/crypto/web3/SmartContractCall';

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

      // Wallet Components
      case 'wallet-switcher':
        return (
          <WalletSwitcher
            connectedWallets={[]}
            activeWallet={mockWalletAddress}
            onSwitch={(address) => console.log('Switched to:', address)}
            {...props}
          />
        );

      case 'network-switcher':
        return (
          <NetworkSwitcher
            currentChainId={mockChainId}
            onSwitch={(chainId) => console.log('Switched to chain:', chainId)}
            {...props}
          />
        );

      // Portfolio Components
      case 'token-balance':
        return (
          <TokenBalance
            tokenAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            walletAddress={mockWalletAddress}
            chainId={mockChainId}
            {...props}
          />
        );

      // Analysis Components
      case 'token-analyzer':
        return (
          <TokenAnalyzer
            tokenAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            chainId={mockChainId}
            {...props}
          />
        );

      case 'token-holders':
        return (
          <TokenHolders
            tokenAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            chainId={mockChainId}
            {...props}
          />
        );

      // Portfolio Advanced
      case 'portfolio-tracker':
        return (
          <PortfolioTracker
            walletAddress={mockWalletAddress}
            chainIds={[1, 137, 42161]}
            timeRange="30d"
            {...props}
          />
        );

      case 'portfolio-allocation':
        return (
          <PortfolioAllocation
            walletAddress={mockWalletAddress}
            chainIds={[1, 137, 42161]}
            {...props}
          />
        );

      // Payment Components
      case 'receive-payment':
        return (
          <ReceivePayment
            walletAddress={mockWalletAddress}
            chainId={mockChainId}
            {...props}
          />
        );

      // Transaction Components
      case 'transaction-status':
        return (
          <TransactionStatus
            txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
            chainId={mockChainId}
            {...props}
          />
        );

      // DEX Components
      case 'swap-quote':
        return (
          <SwapQuote
            fromToken="ETH"
            toToken="USDC"
            amount="1.0"
            chainId={mockChainId}
            {...props}
          />
        );

      // Liquidity Components
      case 'liquidity-pool':
        return (
          <LiquidityPool
            poolAddress="0x1234567890abcdef1234567890abcdef12345678"
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            onAddLiquidity={() => console.log('Adding liquidity')}
            onRemoveLiquidity={() => console.log('Removing liquidity')}
            {...props}
          />
        );

      case 'staking-pool':
        return (
          <StakingPool
            poolAddress="0x1234567890abcdef1234567890abcdef12345678"
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            onStake={() => console.log('Staking')}
            onUnstake={() => console.log('Unstaking')}
            {...props}
          />
        );

      // Lending Components
      case 'lending-market':
        return (
          <LendingMarket
            protocol="aave-v3"
            chainId={mockChainId}
            {...props}
          />
        );

      case 'lend-token':
        return (
          <LendToken
            tokenAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            protocol="aave-v3"
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            onLend={() => console.log('Lending')}
            {...props}
          />
        );

      case 'borrow-token':
        return (
          <BorrowToken
            tokenAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            protocol="aave-v3"
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            onBorrow={() => console.log('Borrowing')}
            {...props}
          />
        );

      // Advanced DeFi
      case 'options-trading':
        return (
          <OptionsTrading
            underlying="ETH"
            onTrade={() => console.log('Trading options')}
            {...props}
          />
        );

      case 'yield-aggregator':
        return (
          <YieldAggregator
            walletAddress={mockWalletAddress}
            chainIds={[1, 137, 42161]}
            {...props}
          />
        );

      // Chat Components
      case 'chat-request':
        return (
          <ChatRequest
            chatId="demo-chat-123"
            recipientAddress="0x8Ba1f109551bD432803012645Ac136ddd64DBA72"
            recipientName="Alice"
            onRequest={() => console.log('Request sent')}
            {...props}
          />
        );

      // NFT Components
      case 'nft-card':
        return (
          <NFTCard
            nft={{
              tokenId: '1',
              name: 'Cool NFT #1',
              image: 'https://via.placeholder.com/400',
              collection: 'Demo Collection',
              owner: mockWalletAddress,
              chainId: mockChainId,
            }}
            onClick={() => console.log('NFT clicked')}
            {...props}
          />
        );

      case 'nft-marketplace':
        return (
          <NFTMarketplace
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            onPurchase={() => console.log('Purchasing NFT')}
            {...props}
          />
        );

      // Token Gating
      case 'token-gate':
        return (
          <TokenGate
            requiredToken="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            minimumBalance="100"
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            {...props}
          >
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-500">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                🎉 Access Granted!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                You have the required tokens to access this exclusive content.
              </p>
            </div>
          </TokenGate>
        );

      case 'nft-gate':
        return (
          <NFTGate
            requiredNFT="0x1234567890abcdef1234567890abcdef12345678"
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            {...props}
          >
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-500 dark:border-purple-500">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                🏆 VIP Access!
              </h3>
              <p className="text-purple-700 dark:text-purple-300">
                You own the required NFT to access this exclusive content.
              </p>
            </div>
          </NFTGate>
        );

      // Web3 Advanced
      case 'web3-dashboard':
        return (
          <Web3Dashboard
            walletAddress={mockWalletAddress}
            supportedChains={[
              { id: 1, name: 'Ethereum' },
              { id: 137, name: 'Polygon' },
              { id: 42161, name: 'Arbitrum' },
            ]}
            onQuickAction={(action) => console.log('Quick action:', action)}
            {...props}
          />
        );

      case 'smart-contract-call':
        return (
          <SmartContractCall
            contractAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            abi={[]}
            chainId={mockChainId}
            walletAddress={mockWalletAddress}
            onCall={() => console.log('Calling contract')}
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
