# Access Control Components (Cycles 90-96)

Token gating, NFT gating, membership tiers, and access control components with merkle tree verification.

## Components

### 1. TokenGate (Cycle 90)
Gates content based on token ownership with flexible requirements.

**Features:**
- Multiple token options (OR logic)
- Minimum balance checking
- Grace period support
- Wallet connection prompt
- Real-time balance monitoring

**Usage:**
```tsx
import { TokenGate } from '@/components/ontology-ui/crypto/access';

<TokenGate
  requirements={[
    {
      address: "0x1234...",
      symbol: "TOKEN",
      minBalance: "1000000000000000000", // 1 token
      chain: "ethereum"
    }
  ]}
  gracePeriod={60000} // 1 minute grace period
  onAccessChange={(hasAccess) => console.log('Access:', hasAccess)}
>
  <div>Premium content here</div>
</TokenGate>
```

### 2. NFTGate (Cycle 91)
Gates content based on NFT ownership with trait-based filtering.

**Features:**
- Collection-based gating
- Specific token ID requirements
- Trait-based filtering
- Visual gate indicator
- Ownership verification

**Usage:**
```tsx
import { NFTGate } from '@/components/ontology-ui/crypto/access';

<NFTGate
  requirement={{
    collection: "0x5678...",
    tokenId: "42", // Optional: specific token
    traits: { // Optional: required traits
      background: "gold",
      rarity: "legendary"
    },
    chain: "ethereum"
  }}
  showIndicator={true}
  onAccessChange={(hasAccess) => console.log('NFT Access:', hasAccess)}
>
  <div>NFT holder exclusive content</div>
</NFTGate>
```

### 3. MembershipTier (Cycle 92)
Display membership levels based on token/NFT holdings.

**Features:**
- Multiple tier levels (bronze, silver, gold, platinum, diamond)
- Token and NFT requirements per tier
- Progress visualization
- Benefits display
- Tier history tracking

**Usage:**
```tsx
import { MembershipTier } from '@/components/ontology-ui/crypto/access';

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    badge: "🥉",
    requirements: {
      tokens: [{ address: "0x...", symbol: "TOKEN", minBalance: "100", chain: "ethereum" }],
      logic: "AND"
    },
    benefits: ["10% discount", "Early access"]
  },
  {
    id: "silver",
    name: "Silver",
    badge: "🥈",
    requirements: {
      tokens: [{ address: "0x...", symbol: "TOKEN", minBalance: "1000", chain: "ethereum" }],
      logic: "AND"
    },
    benefits: ["20% discount", "Priority support", "Exclusive events"]
  }
];

<MembershipTier
  tiers={tiers}
  showUpgradePath={true}
  showHistory={true}
  onTierChange={(tier) => console.log('Current tier:', tier)}
/>
```

### 4. AccessPass (Cycle 93)
Generate and manage time-limited access passes.

**Features:**
- Time-limited passes (1h, 24h, 7d, 30d)
- QR code generation
- Pass verification
- Revocation support
- Transferable/non-transferable option
- Pass history

**Usage:**
```tsx
import { AccessPass } from '@/components/ontology-ui/crypto/access';

<AccessPass
  issuer="0x1234..." // Optional: issuer address
  showHistory={true}
  onPassCreated={(pass) => console.log('Pass created:', pass)}
  onPassVerified={(pass, valid) => console.log('Pass valid:', valid)}
/>
```

### 5. ClaimAirdrop (Cycle 94)
Claim token airdrops with merkle proof verification.

**Features:**
- Eligibility checking
- Claimable amount display
- Gas estimation
- Claim history
- Multiple campaign support
- Time window enforcement

**Usage:**
```tsx
import { ClaimAirdrop } from '@/components/ontology-ui/crypto/access';

const campaigns = [
  {
    id: "campaign-1",
    token: "TOKEN",
    totalAmount: "1000000000000000000000", // 1000 tokens
    merkleRoot: "0xabc...",
    startTime: Date.now(),
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    claimed: {}
  }
];

<ClaimAirdrop
  campaigns={campaigns}
  showHistory={true}
  onClaimSuccess={(campaignId, amount) => console.log('Claimed:', amount)}
/>
```

### 6. MerkleProof (Cycle 95)
Generate and verify merkle proofs for whitelist verification.

**Features:**
- Merkle tree generation
- Proof generation for addresses
- Proof verification
- Tree visualization
- Batch verification
- Export/import functionality

**Usage:**
```tsx
import { MerkleProof } from '@/components/ontology-ui/crypto/access';

<MerkleProof
  addresses={["0x123...", "0x456...", "0x789..."]}
  onProofGenerated={(proof, address) => console.log('Proof:', proof)}
  onProofVerified={(valid, address) => console.log('Valid:', valid)}
/>
```

### 7. Whitelist (Cycle 96)
Manage whitelist for token sales and access control.

**Features:**
- Add/remove addresses manually
- CSV import/export
- Whitelist verification
- Allocation per address
- Tier management
- Snapshot creation
- Search and filtering

**Usage:**
```tsx
import { Whitelist } from '@/components/ontology-ui/crypto/access';

<Whitelist
  initialWhitelist={[
    { address: "0x123...", allocation: "1000", tier: "vip" },
    { address: "0x456...", allocation: "500", tier: "standard" }
  ]}
  allowImport={true}
  allowExport={true}
  showAllocation={true}
  onChange={(whitelist) => console.log('Whitelist updated:', whitelist)}
/>
```

## Effect.ts Service

All components use the `AccessControlService` for business logic:

```typescript
import {
  checkTokenBalance,
  checkNFTOwnership,
  checkNFTTraits,
  calculateMembershipTier,
  generateAccessPass,
  verifyAccessPass,
  createMerkleTree,
  generateMerkleProof,
  verifyMerkleProof,
  checkAirdropEligibility,
  addToWhitelist,
  removeFromWhitelist,
  verifyWhitelist,
  MerkleTree,
} from '@/lib/services/crypto/AccessControlService';
```

## Merkle Tree Implementation

The service includes a complete merkle tree implementation:

```typescript
const tree = new MerkleTree(addresses);
const root = tree.getRoot();
const proof = tree.getProof(address);
const isValid = tree.verify(address, proof, root);
```

**Features:**
- Keccak256 hashing
- Sorted pair hashing
- Efficient proof generation
- On-chain compatible
- Gas-optimized

## Access Control Patterns

### Pattern 1: Token-Gated Content

```tsx
<TokenGate
  requirements={[{ address: "0x...", symbol: "TOKEN", minBalance: "1", chain: "ethereum" }]}
>
  <PremiumFeature />
</TokenGate>
```

### Pattern 2: NFT-Gated Content with Traits

```tsx
<NFTGate
  requirement={{
    collection: "0x...",
    traits: { rarity: "legendary" },
    chain: "ethereum"
  }}
>
  <ExclusiveContent />
</NFTGate>
```

### Pattern 3: Tiered Membership

```tsx
<MembershipTier
  tiers={[bronze, silver, gold]}
  showUpgradePath={true}
/>
```

### Pattern 4: Airdrop Claims with Merkle Proof

```tsx
// 1. Create merkle tree
const tree = new MerkleTree(eligibleAddresses);
const merkleRoot = tree.getRoot();

// 2. Deploy campaign
const campaign = {
  id: "airdrop-1",
  token: "TOKEN",
  totalAmount: "1000000",
  merkleRoot,
  startTime: Date.now(),
  endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
  claimed: {}
};

// 3. Users claim
<ClaimAirdrop campaigns={[campaign]} />
```

### Pattern 5: Whitelist Management

```tsx
// Import CSV
<Whitelist
  allowImport={true}
  allowExport={true}
  onChange={(whitelist) => {
    // Create merkle tree from whitelist
    const addresses = whitelist.map(e => e.address);
    const tree = new MerkleTree(addresses);
  }}
/>
```

## Security Considerations

### 1. Token Balance Checks
- Always check minimum balance on-chain
- Use BigInt for precise calculations
- Monitor for balance changes

### 2. NFT Ownership
- Verify ownership on-chain
- Check trait data from reliable sources
- Consider token standard (ERC-721 vs ERC-1155)

### 3. Merkle Proofs
- Store merkle root on-chain
- Validate proof length
- Use sorted pair hashing
- Prevent replay attacks

### 4. Access Passes
- Sign passes with private key
- Verify signatures on-chain
- Implement revocation mechanism
- Use time-limited validity

### 5. Whitelist Management
- Multi-sig for whitelist changes
- Snapshot before campaigns
- Audit trail for changes
- Rate limiting for imports

## Gas Optimization

### Batch Operations
```typescript
// Batch verify whitelist
const results = await batchVerifyWhitelist(addresses, whitelist);
```

### Merkle Tree Efficiency
- O(log n) proof size
- O(log n) verification
- Gas-efficient on-chain verification

### Optimized Storage
- Store merkle root only (32 bytes)
- Generate proofs off-chain
- Verify on-chain

## Integration with Convex

Store access control data in Convex:

```typescript
// Store whitelist
await ctx.db.insert("whitelists", {
  campaignId: "campaign-1",
  merkleRoot: tree.getRoot(),
  addresses: whitelist,
  timestamp: Date.now()
});

// Store membership tiers
await ctx.db.insert("membership_tiers", {
  userId: user._id,
  tier: "gold",
  achievedAt: Date.now()
});

// Store access passes
await ctx.db.insert("access_passes", {
  passId: pass.id,
  holder: pass.holder,
  expiresAt: pass.expiresAt,
  revoked: false
});
```

## Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { TokenGate } from './TokenGate';

test('shows premium content when token balance is sufficient', async () => {
  render(
    <TokenGate requirements={[mockRequirement]}>
      <div>Premium Content</div>
    </TokenGate>
  );

  await waitFor(() => {
    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });
});
```

## Performance

- **TokenGate**: Real-time balance monitoring via wagmi
- **NFTGate**: Cached NFT ownership checks
- **MembershipTier**: Optimistic tier calculation
- **AccessPass**: Client-side pass generation
- **MerkleProof**: O(log n) proof generation
- **Whitelist**: Efficient search and filtering

## Accessibility

- Keyboard navigation support
- Screen reader announcements
- ARIA labels for status indicators
- Focus management for modals

## Mobile Responsive

- Touch-friendly buttons
- Responsive table layouts
- Mobile-optimized QR codes
- Collapsible sections

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Web3 wallet integration (MetaMask, WalletConnect)
- Mobile wallet support (Phantom, Coinbase Wallet)

---

**Built with Effect.ts for robust access control and merkle tree verification! 🔐**
