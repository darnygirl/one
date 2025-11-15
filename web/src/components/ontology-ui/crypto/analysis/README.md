# Token Analysis Components (Cycles 14-19)

Comprehensive token analysis tools for cryptocurrency research, security auditing, and holder analysis.

## Components

### 1. TokenAnalyzer - Comprehensive Analysis Dashboard

Multi-panel dashboard with token overview, holder distribution, liquidity analysis, and security scoring.

**Features:**
- Token price, market cap, volume, and holders
- Tabbed interface for different analysis views
- Holder distribution visualization
- Liquidity pools summary
- Security score calculation
- Contract verification status

**Usage:**
```tsx
import { TokenAnalyzer } from '@/components/ontology-ui/crypto/analysis';

<TokenAnalyzer
  tokenAddress="0x1234..."
  showHolders={true}
  showLiquidity={true}
  showSecurity={true}
/>
```

**Props:**
- `tokenAddress: string` - Token contract address (required)
- `showHolders?: boolean` - Display holders tab (default: true)
- `showLiquidity?: boolean` - Display liquidity tab (default: true)
- `showSecurity?: boolean` - Display security tab (default: true)
- `className?: string` - Additional CSS classes

---

### 2. TokenHolders - Top Token Holders

Displays top 100 token holders with balances, percentages, and whale alerts.

**Features:**
- Top 100 holders list
- ENS name resolution
- Balance and percentage display
- Whale detection (>5% holdings)
- Search by address or ENS
- List/Chart view toggle
- Pie chart visualization

**Usage:**
```tsx
import { TokenHolders } from '@/components/ontology-ui/crypto/analysis';

<TokenHolders
  tokenAddress="0x1234..."
  limit={100}
  showChart={true}
  showWhaleAlert={true}
/>
```

**Props:**
- `tokenAddress: string` - Token contract address (required)
- `limit?: number` - Number of holders to fetch (default: 100)
- `showChart?: boolean` - Enable chart view (default: true)
- `showWhaleAlert?: boolean` - Show whale badges (default: true)
- `className?: string` - Additional CSS classes

---

### 3. TokenLiquidity - Liquidity Pools Analysis

Displays liquidity pools across multiple DEXes with TVL, volume, and APY.

**Features:**
- All DEX pools (Uniswap, Sushiswap, Curve, etc.)
- Total liquidity and volume stats
- Pool-by-pool breakdown
- APY display
- Price impact calculator
- Sort by TVL/Volume/APY

**Usage:**
```tsx
import { TokenLiquidity } from '@/components/ontology-ui/crypto/analysis';

<TokenLiquidity
  tokenAddress="0x1234..."
  showPriceImpact={true}
/>
```

**Props:**
- `tokenAddress: string` - Token contract address (required)
- `showPriceImpact?: boolean` - Show price impact calculator (default: true)
- `className?: string` - Additional CSS classes

---

### 4. TokenAudit - Security Audit Display

Shows security audit results from Certik, Slowmist, Hacken, and other auditors.

**Features:**
- Audit provider and score
- Findings summary by severity
- Contract verification status
- Download audit PDF
- Security recommendations
- Open/resolved findings tracker

**Usage:**
```tsx
import { TokenAudit } from '@/components/ontology-ui/crypto/analysis';

<TokenAudit
  tokenAddress="0x1234..."
  showContractInfo={true}
/>
```

**Props:**
- `tokenAddress: string` - Token contract address (required)
- `showContractInfo?: boolean` - Display contract verification (default: true)
- `className?: string` - Additional CSS classes

---

### 5. TokenContract - Contract Verification

Displays smart contract verification details, source code, ABI, and constructor arguments.

**Features:**
- Contract verification status
- Source code viewer with syntax highlighting
- ABI viewer (formatted and raw)
- Constructor arguments display
- Compiler version
- Copy to clipboard
- Link to block explorer

**Usage:**
```tsx
import { TokenContract } from '@/components/ontology-ui/crypto/analysis';

<TokenContract
  contractAddress="0x1234..."
  showSourceCode={true}
  showABI={true}
/>
```

**Props:**
- `contractAddress: string` - Contract address (required)
- `showSourceCode?: boolean` - Display source code tab (default: true)
- `showABI?: boolean` - Display ABI tab (default: true)
- `className?: string` - Additional CSS classes

---

### 6. TokenTransactions - Recent Transactions Feed

Live transaction feed with buy/sell indicators, amounts, and addresses.

**Features:**
- Recent transactions list (up to 50)
- Buy/sell/transfer type badges
- Transaction amount and USD value
- Wallet addresses (truncated with copy)
- Block explorer links
- Auto-refresh option
- Search and filter
- Virtualized list for performance

**Usage:**
```tsx
import { TokenTransactions } from '@/components/ontology-ui/crypto/analysis';

<TokenTransactions
  tokenAddress="0x1234..."
  limit={50}
  autoRefresh={true}
  refreshInterval={10000}
  showFilters={true}
/>
```

**Props:**
- `tokenAddress: string` - Token contract address (required)
- `limit?: number` - Number of transactions (default: 50)
- `autoRefresh?: boolean` - Auto-refresh transactions (default: false)
- `refreshInterval?: number` - Refresh interval in ms (default: 10000)
- `showFilters?: boolean` - Show search and filter UI (default: true)
- `className?: string` - Additional CSS classes

---

## Service Layer

All components use the `EtherscanService` for data fetching with Effect.ts.

### EtherscanService Functions

```typescript
import {
  getTokenAnalysis,
  getTokenHolders,
  getLiquidityPools,
  getSecurityAudit,
  getContractInfo,
  getTokenTransactions,
  calculateSecurityScore,
} from '@/lib/services/crypto/EtherscanService';
```

**Available Functions:**
- `getTokenAnalysis(tokenAddress: string)` - Get comprehensive token analysis
- `getTokenHolders(tokenAddress: string, limit?: number)` - Get top token holders
- `getLiquidityPools(tokenAddress: string)` - Get DEX liquidity pools
- `getSecurityAudit(tokenAddress: string)` - Get security audit data
- `getContractInfo(contractAddress: string)` - Get contract verification info
- `getTokenTransactions(tokenAddress: string, limit?: number)` - Get recent transactions
- `calculateSecurityScore(contract, audit, holders)` - Calculate security score

---

## Configuration

### Environment Variables

```bash
# .env
PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Get API Key:** https://etherscan.io/apis

**Note:** Components work in mock mode without API key (for development).

---

## Example: Complete Token Analysis Page

```tsx
import { TokenAnalyzer } from '@/components/ontology-ui/crypto/analysis';

export default function TokenPage({ tokenAddress }: { tokenAddress: string }) {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Token Analysis</h1>

      {/* Comprehensive dashboard */}
      <TokenAnalyzer
        tokenAddress={tokenAddress}
        showHolders={true}
        showLiquidity={true}
        showSecurity={true}
      />
    </div>
  );
}
```

---

## Example: Individual Component Usage

```tsx
import {
  TokenHolders,
  TokenLiquidity,
  TokenAudit,
  TokenContract,
  TokenTransactions,
} from '@/components/ontology-ui/crypto/analysis';

export default function TokenDetailsPage({ address }: { address: string }) {
  return (
    <div className="space-y-6">
      {/* Holders */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Token Holders</h2>
        <TokenHolders tokenAddress={address} limit={50} showWhaleAlert={true} />
      </section>

      {/* Liquidity */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Liquidity Pools</h2>
        <TokenLiquidity tokenAddress={address} showPriceImpact={true} />
      </section>

      {/* Security */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Security Audit</h2>
        <TokenAudit tokenAddress={address} showContractInfo={true} />
      </section>

      {/* Contract */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Smart Contract</h2>
        <TokenContract
          contractAddress={address}
          showSourceCode={true}
          showABI={true}
        />
      </section>

      {/* Transactions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <TokenTransactions
          tokenAddress={address}
          limit={50}
          autoRefresh={true}
          refreshInterval={10000}
        />
      </section>
    </div>
  );
}
```

---

## Example: Astro Page Integration

```astro
---
// src/pages/tokens/[address].astro
import Layout from '@/layouts/Layout.astro';
import { TokenAnalyzer } from '@/components/ontology-ui/crypto/analysis';

const { address } = Astro.params;
---

<Layout title={`Token Analysis - ${address}`}>
  <div class="container mx-auto py-8">
    <TokenAnalyzer client:load tokenAddress={address} />
  </div>
</Layout>
```

---

## Type Exports

All types are exported from the service and components:

```typescript
import type {
  TokenHolder,
  LiquidityPool,
  SecurityAudit,
  ContractInfo,
  Transaction,
  TokenAnalysis,
  EtherscanError,
} from '@/components/ontology-ui/crypto/analysis';
```

---

## Error Handling

All components handle errors gracefully using Effect.ts:

```typescript
type EtherscanError =
  | { _tag: "NetworkError"; message: string }
  | { _tag: "InvalidAddress"; address: string }
  | { _tag: "RateLimitError"; retryAfter: number }
  | { _tag: "NotFoundError"; resource: string }
  | { _tag: "ApiError"; code: string; message: string };
```

Components display appropriate error messages and fallback UI.

---

## Performance Optimizations

1. **Virtualized Lists** - TokenTransactions uses load-more pagination
2. **Lazy Loading** - Components load data on mount
3. **Auto-refresh** - Optional real-time updates for transactions
4. **Mock Mode** - Works without API for development
5. **Effect.ts** - Retry logic and error recovery

---

## Security Considerations

1. **API Keys** - Never commit API keys (use environment variables)
2. **Rate Limiting** - Service handles Etherscan rate limits
3. **Address Validation** - All addresses validated before API calls
4. **XSS Protection** - User input sanitized
5. **HTTPS Only** - All API calls over HTTPS

---

## Testing

Test components with mock data (no API key required):

```tsx
import { TokenAnalyzer } from '@/components/ontology-ui/crypto/analysis';

// Works in mock mode without ETHERSCAN_API_KEY
<TokenAnalyzer tokenAddress="0x1234567890123456789012345678901234567890" />
```

---

## Related Components

**Wallet Components (Cycles 1-7):**
- WalletConnectButton
- WalletBalance
- NetworkSwitcher

**Portfolio Components (Cycles 8-13):**
- TokenPortfolio
- TokenPrice
- TokenChart

**Next Cycles (20-25):**
- PortfolioTracker
- PortfolioAllocation
- PortfolioPnL

---

## Support

For issues or questions:
- Check mock data in `EtherscanService.ts`
- Verify API key in `.env`
- Review error messages in browser console
- See main crypto plan: `/web/src/components/ontology-ui/CRYPTO-CYCLE-PLAN.md`

---

**Built with React 19, TypeScript, Effect.ts, and shadcn/ui**
