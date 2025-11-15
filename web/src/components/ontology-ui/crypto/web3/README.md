# Web3 Integration Components (Cycles 97-100)

**Advanced Web3 components for smart contracts, multi-sig wallets, and unified dashboards.**

## Components

### 97. SmartContractCall
**Call any smart contract with dynamic ABI-based interface.**

Features:
- Contract address verification
- ABI upload or fetch from block explorer
- Function selector with read/write distinction
- Dynamic input fields based on ABI types
- Gas estimation for write functions
- Transaction simulation before execution
- Real-time call results display

Usage:
```tsx
import { SmartContractCall } from '@/components/ontology-ui/crypto/web3';

<SmartContractCall
  defaultAddress="0x..."
  onCallComplete={(result) => console.log(result)}
/>
```

### 98. ContractInteraction
**Interactive contract explorer with full functionality.**

Features:
- Save and manage multiple contracts
- Browse all read/write functions
- Event logs monitoring
- Transaction history
- Contract state visualization
- Tabbed interface for organization

Usage:
```tsx
import { ContractInteraction } from '@/components/ontology-ui/crypto/web3';

<ContractInteraction
  defaultContract={{
    address: "0x...",
    name: "My Contract",
    abi: "[...]"
  }}
  onTransactionSent={(hash) => console.log(hash)}
/>
```

### 99. MultiSigWallet
**Multi-signature wallet creation and management.**

Features:
- Create multi-sig wallets (2-of-3, 3-of-5, etc.)
- Add/remove signers
- Propose transactions
- Sign pending transactions
- Execute when threshold met
- Signature progress tracking
- Transaction history

Usage:
```tsx
import { MultiSigWallet } from '@/components/ontology-ui/crypto/web3';

<MultiSigWallet
  userAddress="0x..."
  onWalletCreated={(wallet) => console.log(wallet)}
  onTransactionExecuted={(hash) => console.log(hash)}
/>
```

### 100. Web3Dashboard
**Unified Web3 dashboard - THE FINAL COMPONENT! 🎉**

Features:
- Multi-chain portfolio overview
- Active DeFi positions tracking
- NFT collections summary
- Recent transaction history
- Token gating status
- Quick actions (send, swap, stake, bridge)
- Customizable widget layout
- Real-time value aggregation

Usage:
```tsx
import { Web3Dashboard } from '@/components/ontology-ui/crypto/web3';

<Web3Dashboard
  walletAddress="0x..."
  supportedChains={["Ethereum", "Polygon", "Arbitrum"]}
  onQuickAction={(action) => console.log(action)}
/>
```

## Web3 Service

All components use the `Web3Service` for Effect.ts-based Web3 operations:

```typescript
import {
  parseABI,
  readContract,
  writeContract,
  simulateContractCall,
  createMultiSig,
  proposeTransaction,
  signTransaction,
  executeTransaction,
} from '@/lib/services/crypto/Web3Service';
```

## Integration Examples

### Smart Contract Interaction Flow
```typescript
// 1. Parse ABI
const parsedABI = await Effect.runPromise(parseABI(abiJSON));

// 2. Simulate call
const simulation = await Effect.runPromise(
  simulateContractCall({
    address: "0x...",
    functionName: "transfer",
    args: ["0x...", 1000n]
  }, parsedABI)
);

// 3. Execute if simulation succeeds
if (simulation.success) {
  const result = await Effect.runPromise(
    writeContract({
      address: "0x...",
      functionName: "transfer",
      args: ["0x...", 1000n]
    }, parsedABI)
  );
}
```

### Multi-Sig Wallet Flow
```typescript
// 1. Create wallet
const wallet = await Effect.runPromise(
  createMultiSig(
    ["0xOwner1", "0xOwner2", "0xOwner3"],
    2 // 2-of-3 threshold
  )
);

// 2. Propose transaction
const tx = await Effect.runPromise(
  proposeTransaction(wallet, "0xRecipient", 1000000000000000000n, "0x")
);

// 3. Sign by owner 1
const signed1 = await Effect.runPromise(
  signTransaction(tx, "0xOwner1", wallet)
);

// 4. Sign by owner 2
const signed2 = await Effect.runPromise(
  signTransaction(signed1, "0xOwner2", wallet)
);

// 5. Execute (threshold met)
const result = await Effect.runPromise(
  executeTransaction(signed2, wallet)
);
```

## Features

### ABI Handling
- Upload ABI JSON files
- Fetch from block explorers (Etherscan, etc.)
- Parse and validate ABI structure
- Type-safe function argument validation
- Dynamic UI generation from ABI

### Contract Calls
- Read functions (view/pure)
- Write functions (nonpayable/payable)
- Gas estimation
- Transaction simulation
- Error handling with Effect.ts

### Multi-Signature
- Flexible threshold configuration
- Signature collection
- Transaction execution
- Audit trail
- Owner management

### Dashboard Features
- Multi-chain aggregation
- Portfolio tracking
- DeFi position monitoring
- NFT collection overview
- Transaction history
- Token gating status
- Customizable widgets

## Error Handling

All services use Effect.ts tagged errors:

```typescript
// Contract errors
ContractCallError
ABIParseError
SimulationError

// Multi-sig errors
MultiSigError
```

Example:
```typescript
try {
  const result = await Effect.runPromise(
    readContract(call, abi)
  );
} catch (error) {
  if (error instanceof ContractCallError) {
    console.error("Contract call failed:", error.message);
  }
}
```

## 🎉 Completion Milestone

**These are components 97-100 of the 100-cycle Cryptocurrency Components plan!**

This completes the entire Web3 integration suite, covering:
- Phase 1: Wallet & Token Analysis (Cycles 1-25)
- Phase 2: Crypto Payments (Cycles 26-50)
- Phase 3: DeFi Integration (Cycles 51-75)
- Phase 4: Chat Commerce & Web3 (Cycles 76-100)

**Total: 100 production-ready cryptocurrency components! 🚀**
