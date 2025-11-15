# Advanced DeFi Components (Cycles 72-75)

Complete advanced DeFi trading and analytics components with Effect.ts integration.

## Components

### 1. OptionsTrading.tsx (Cycle 72)

Options trading interface with Black-Scholes pricing model.

**Features:**
- Call/Put option selection
- Strike price selector
- Expiration date picker (7, 14, 30, 60, 90 days)
- Premium calculation using Black-Scholes
- Greeks display (Delta, Gamma, Theta, Vega, Rho)
- Implied volatility input
- Active positions management
- Real-time P&L tracking

**Usage:**
```tsx
import { OptionsTrading } from '@/components/ontology-ui/crypto/advanced';

<OptionsTrading
  symbol="ETH"
  currentPrice={3500}
  onTrade={(position) => console.log('New option position:', position)}
/>
```

**Greeks Explained:**
- **Delta (Δ)**: Rate of change of option price vs underlying price
- **Gamma (Γ)**: Rate of change of delta
- **Theta (Θ)**: Time decay (daily)
- **Vega (ν)**: Sensitivity to volatility changes
- **Rho (ρ)**: Sensitivity to interest rate changes

---

### 2. FuturesTrading.tsx (Cycle 73)

Perpetual futures trading with leverage and risk management.

**Features:**
- Long/Short position selection
- Leverage slider (1x-20x)
- Position size calculator
- Liquidation price calculation
- Take Profit / Stop Loss settings
- Funding rate display
- Active positions with real-time P&L
- Margin requirement calculation

**Usage:**
```tsx
import { FuturesTrading } from '@/components/ontology-ui/crypto/advanced';

<FuturesTrading
  symbol="BTC"
  currentPrice={68500}
  fundingRate={0.01}
  onTrade={(position) => console.log('New futures position:', position)}
/>
```

**Risk Calculations:**
- **Liquidation Price**: Price at which position is auto-closed
- **Margin Required**: Initial capital needed (notional / leverage)
- **Funding Rate**: Periodic payment between longs and shorts
- **Risk/Reward Ratio**: Potential profit vs potential loss

---

### 3. YieldAggregator.tsx (Cycle 74)

Auto-find best yields across 20+ DeFi protocols.

**Features:**
- Scan multiple protocols (Aave, Compound, Lido, Curve, etc.)
- Sort by APY, risk score, or TVL
- Risk tolerance filter (low/medium/high)
- Optimal portfolio allocation
- Auto-allocate across protocols
- Active position tracking
- Weighted APY calculation

**Usage:**
```tsx
import { YieldAggregator } from '@/components/ontology-ui/crypto/advanced';

<YieldAggregator
  walletBalance={50000}
  onDeposit={(opportunity, amount) => console.log('Deposited:', opportunity, amount)}
/>
```

**Supported Strategies:**
- **Lending**: Supply assets to earn interest (Aave, Compound)
- **Staking**: Lock tokens for rewards (Lido, Rocket Pool)
- **Liquidity Pools**: Provide liquidity for trading fees (Uniswap, Curve)

**Risk Scoring:**
- 0-25: Low risk (blue-chip protocols)
- 26-50: Medium risk (established protocols)
- 51-100: High risk (newer or complex protocols)

---

### 4. RiskScorecard.tsx (Cycle 75)

Comprehensive DeFi protocol risk assessment.

**Features:**
- Multi-factor risk analysis
- Audit score (0-30 points)
- TVL score (0-20 points)
- Longevity score (0-15 points)
- Team score (0-15 points)
- Insurance score (0-10 points)
- Exploit history score (0-10 points)
- Overall score (0-100)
- Protocol comparison
- Risk recommendations

**Usage:**
```tsx
import { RiskScorecard } from '@/components/ontology-ui/crypto/advanced';

<RiskScorecard
  defaultProtocol="Aave V3"
  onAssessmentComplete={(scorecard) => console.log('Assessment:', scorecard)}
/>
```

**Rating System:**
- **80-100**: Low Risk (institutional grade)
- **60-79**: Medium Risk (acceptable for most users)
- **40-59**: High Risk (advanced users only)
- **0-39**: Very High Risk (extreme caution)

**Assessment Factors:**
1. **Audit Score**: Number and quality of security audits
2. **TVL Score**: Total value locked (higher = more trust)
3. **Longevity Score**: Time since launch (battle-tested)
4. **Team Score**: Doxxed team vs anonymous
5. **Insurance Score**: Insurance coverage availability
6. **Exploit History**: Past security incidents

---

## Effect.ts Integration

All components use `AdvancedDeFiService.ts` for business logic:

```typescript
import {
  calculateOptionsGreeks,
  calculateOptionsPricing,
  calculateFuturesPosition,
  aggregateYields,
  calculateOptimalAllocation,
  calculateRiskScore,
} from '@/lib/services/crypto/AdvancedDeFiService';
```

### Error Handling

```typescript
try {
  const greeks = await Effect.runPromise(
    calculateOptionsGreeks(spotPrice, strikePrice, timeToExpiry, volatility, riskFreeRate, 'call')
  );
} catch (error) {
  // Handle OptionsCalculationError
}
```

---

## Protocol Integration

### Options Trading
- **Protocols**: Opyn, Hegic, Lyra
- **Chains**: Ethereum, Arbitrum, Optimism
- **Model**: Black-Scholes pricing

### Futures Trading
- **Protocols**: dYdX, GMX, Gains Network
- **Chains**: Ethereum, Arbitrum, Polygon
- **Features**: Cross-margin, isolated margin, perpetual swaps

### Yield Aggregation
- **Sources**: DeFi Llama API, direct protocol queries
- **Protocols**: Aave, Compound, Lido, Curve, Uniswap, Rocket Pool
- **Chains**: Multi-chain support

### Risk Assessment
- **Data Sources**: DeFi Safety, CertiK, Trail of Bits
- **Audits**: OpenZeppelin, Trail of Bits, ABDK, Quantstamp
- **Insurance**: Nexus Mutual, InsurAce

---

## Real-World Usage

### Portfolio Management
```tsx
// Assess risk before investing
<RiskScorecard defaultProtocol="Curve Finance" />

// Find best yields
<YieldAggregator walletBalance={100000} />

// Options hedging
<OptionsTrading symbol="ETH" currentPrice={3500} />
```

### Trading Strategies
```tsx
// Long with leverage
<FuturesTrading symbol="BTC" currentPrice={68500} />

// Covered call writing
<OptionsTrading symbol="ETH" currentPrice={3500} />
```

---

## Best Practices

### Options Trading
1. Always check Greeks before buying
2. Consider time decay (theta)
3. Use appropriate expiration dates
4. Manage position size
5. Set stop losses on underlying

### Futures Trading
1. Never use max leverage
2. Always set TP/SL
3. Monitor liquidation price
4. Account for funding rates
5. Use stop-loss orders

### Yield Farming
1. Assess protocol risk first
2. Diversify across protocols
3. Consider impermanent loss
4. Monitor APY changes
5. Use auto-compounding when available

### Risk Management
1. Check audit scores (>20/30)
2. Prefer established protocols (TVL >$100M)
3. Verify team identity
4. Look for insurance coverage
5. Review exploit history

---

## Testing

Each component includes:
- Mock data for development
- Loading states
- Error handling
- TypeScript types
- Effect.ts integration

---

## Future Enhancements

### Options Trading
- [ ] Option chain display
- [ ] Volatility smile charts
- [ ] Multi-leg strategies (spreads, straddles)
- [ ] IV surface visualization
- [ ] Historical Greeks charts

### Futures Trading
- [ ] Order book integration
- [ ] Advanced charting (TradingView)
- [ ] Position scaling
- [ ] Trailing stop loss
- [ ] Auto-deleveraging alerts

### Yield Aggregation
- [ ] IL calculator for LPs
- [ ] Historical APY charts
- [ ] Gas cost optimization
- [ ] Zaps (one-click entry)
- [ ] Automated rebalancing

### Risk Assessment
- [ ] Real-time monitoring
- [ ] Custom weight factors
- [ ] Historical risk trends
- [ ] Exploit alert system
- [ ] Community sentiment analysis

---

**Built for professional DeFi traders and investors.**
