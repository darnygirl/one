# NFT Components

Complete NFT integration for ERC-721 and ERC-1155 standards with gallery, marketplace, minting, and burning functionality.

## Components

### NFTGallery

Display NFT collection with filtering, sorting, and pagination.

**Features:**
- Grid/list view toggle
- Search by name or token ID
- Filter by collection, traits, price range
- Sort by recent, rarity, price, name
- Pagination with page size control
- Infinite scroll support
- Multi-chain NFT support

**Usage:**
```tsx
import { NFTGallery } from '@/components/ontology-ui/crypto/nft';

<NFTGallery
  nfts={myNFTs}
  owner="0x..."
  chainId={1}
  view="grid"
  sortBy="rarity"
  pageSize={12}
  onNFTSelect={(nft) => console.log(nft)}
  filter={{
    traits: { Background: "Blue" },
    minPrice: "1.0",
    maxPrice: "10.0"
  }}
/>
```

### NFTCard

Individual NFT card display with metadata and quick actions.

**Features:**
- NFT image/video display with zoom
- Collection name and token ID
- Rarity badge (Legendary, Epic, Rare, etc.)
- Floor price and last sale price
- Owner address with ENS support
- Quick transfer and list actions
- ERC-721 and ERC-1155 support

**Usage:**
```tsx
import { NFTCard } from '@/components/ontology-ui/crypto/nft';

<NFTCard
  nft={myNFT}
  showRarity
  showPrice
  showOwner
  onSelect={(nft) => console.log('Selected:', nft)}
  onTransfer={(nft) => console.log('Transfer:', nft)}
  onList={(nft) => console.log('List:', nft)}
/>
```

### NFTDetail

Full NFT detail modal with comprehensive metadata and activity.

**Features:**
- Full-size image/video/audio display
- Complete metadata with all attributes
- Trait rarity percentages
- Price history chart
- Activity feed (transfers, sales, listings)
- Contract details (address, token ID, standard)
- OpenSea integration
- Transfer, list, and burn actions

**Usage:**
```tsx
import { NFTDetail } from '@/components/ontology-ui/crypto/nft';

<NFTDetail
  nft={selectedNFT}
  showActivity
  showOffers
  onClose={() => setSelectedNFT(null)}
  onTransfer={() => setShowTransfer(true)}
  onList={() => setShowList(true)}
  onBurn={() => setShowBurn(true)}
/>
```

### NFTTransfer

Transfer NFT to another address with ENS support.

**Features:**
- NFT selection from wallet
- Recipient address input with ENS resolution
- ERC-1155 amount selection
- Gas estimation
- Transfer confirmation with status tracking
- Transaction receipt display

**Usage:**
```tsx
import { NFTTransfer } from '@/components/ontology-ui/crypto/nft';

<NFTTransfer
  nfts={myNFTs}
  selectedNFT={selectedNFT}
  onTransferComplete={(txHash) => {
    console.log('Transfer complete:', txHash);
  }}
  onCancel={() => setShowTransfer(false)}
/>
```

### NFTMarketplace

List/buy NFTs with marketplace integration.

**Features:**
- List NFT for sale (fixed price)
- Buy NFT with crypto
- Make offer functionality
- Accept/reject offers
- Marketplace fees display (OpenSea, Rarible, etc.)
- Royalty information
- Multi-currency support (ETH, WETH, USDC)
- Listing duration options

**Usage:**
```tsx
import { NFTMarketplace } from '@/components/ontology-ui/crypto/nft';

<NFTMarketplace
  nft={myNFT}
  mode="list"
  listings={activeListings}
  offers={currentOffers}
  onList={(price, currency) => {
    console.log('List for', price, currency);
  }}
  onBuy={(listingId) => {
    console.log('Buy listing', listingId);
  }}
  onMakeOffer={(price, expiresAt) => {
    console.log('Offer', price, 'expires', expiresAt);
  }}
  onAcceptOffer={(offerId) => {
    console.log('Accept offer', offerId);
  }}
/>
```

### NFTMint

Mint new NFTs with IPFS metadata upload.

**Features:**
- Upload image/video to IPFS
- Metadata form (name, description, attributes)
- Collection selection
- Royalty settings (0-10%)
- Minting preview
- Upload progress tracking
- Mint confirmation and transaction status
- ERC-1155 supply amount

**Usage:**
```tsx
import { NFTMint } from '@/components/ontology-ui/crypto/nft';

<NFTMint
  collection="0x..."
  chainId={1}
  standard="ERC-721"
  onMintComplete={(tokenId, txHash) => {
    console.log('Minted:', tokenId, txHash);
  }}
  onCancel={() => setShowMint(false)}
/>
```

### NFTBurn

Burn NFTs with safety confirmations.

**Features:**
- NFT selection to burn
- Burn reason selection (upgrade, mistake, etc.)
- Double confirmation warnings
- ERC-1155 amount selection
- Burn transaction status
- Proof of burn certificate

**Usage:**
```tsx
import { NFTBurn } from '@/components/ontology-ui/crypto/nft';

<NFTBurn
  nfts={myNFTs}
  selectedNFT={selectedNFT}
  requireConfirmation
  onBurnComplete={(txHash) => {
    console.log('Burned:', txHash);
  }}
  onCancel={() => setShowBurn(false)}
/>
```

## NFT Standards

### ERC-721 (Non-Fungible Token)

**Standard:** Each token is unique and non-divisible.

**Use Cases:**
- Art NFTs
- Collectibles
- Gaming items
- Real estate
- Tickets

**Key Features:**
- Unique token IDs
- Single owner per token
- Transfer entire token
- Metadata URI per token

**Interface Methods:**
```solidity
function ownerOf(uint256 tokenId) external view returns (address);
function transferFrom(address from, address to, uint256 tokenId) external;
function tokenURI(uint256 tokenId) external view returns (string);
```

### ERC-1155 (Multi-Token Standard)

**Standard:** Supports both fungible and non-fungible tokens in one contract.

**Use Cases:**
- Gaming (multiple item types)
- Collectible sets
- Ticketing (multiple seats)
- Fractional ownership

**Key Features:**
- Multiple token IDs in one contract
- Batch transfers
- Balance amounts per token
- Single metadata URI for all tokens

**Interface Methods:**
```solidity
function balanceOf(address account, uint256 id) external view returns (uint256);
function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external;
function uri(uint256 id) external view returns (string);
```

## Rarity Calculation

NFT rarity is calculated based on trait occurrence:

```typescript
// Each trait has a rarity percentage (0-100)
// Lower percentage = rarer trait

const rarityScore = traits.reduce((score, trait) => {
  return score + (100 - trait.rarity);
}, 0);

// Rank is determined by comparing scores across collection
const rank = 1 + collection.filter(nft => nft.score > thisNFT.score).length;

// Rarity tiers
const percentile = (rank / totalSupply) * 100;

if (percentile >= 95) return "Legendary";
if (percentile >= 80) return "Epic";
if (percentile >= 60) return "Rare";
if (percentile >= 40) return "Uncommon";
return "Common";
```

## IPFS Integration

All NFT metadata is stored on IPFS for decentralization.

### Metadata Format

```json
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "ipfs://QmHash/image.png",
  "animation_url": "ipfs://QmHash/animation.mp4",
  "external_url": "https://example.com",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue",
      "rarity": 25
    },
    {
      "trait_type": "Eyes",
      "value": "Laser",
      "rarity": 5
    }
  ]
}
```

### Upload to IPFS

```typescript
import { IPFSService } from '@/lib/services/crypto/IPFSService';

const ipfs = new IPFSService(
  'https://api.web3.storage',
  'YOUR_API_KEY'
);

// Upload image
const imageResult = await ipfs.uploadFile({
  path: 'image.png',
  content: imageBlob
});

// Upload metadata
const metadata = {
  name: 'My NFT',
  description: 'Cool NFT',
  image: `ipfs://${imageResult.cid}`,
  attributes: [...]
};

const metadataResult = await ipfs.uploadMetadata(metadata);

// Token URI for minting
const tokenURI = `ipfs://${metadataResult.cid}`;
```

## Marketplace Integration

### OpenSea

**API Endpoint:** `https://api.opensea.io/api/v2`

**Get NFT:**
```typescript
const nft = await fetch(
  `https://api.opensea.io/api/v2/chain/ethereum/contract/${contract}/nfts/${tokenId}`
);
```

**Get Collection Floor Price:**
```typescript
const stats = await fetch(
  `https://api.opensea.io/api/v2/collections/${slug}/stats`
);
```

### Rarible

**API Endpoint:** `https://api.rarible.org/v0.1`

**Get NFT:**
```typescript
const nft = await fetch(
  `https://api.rarible.org/v0.1/items/ETHEREUM:${contract}:${tokenId}`
);
```

## Effect.ts Service Integration

All NFT operations use Effect.ts for error handling:

```typescript
import { NFTService } from '@/lib/services/crypto/NFTService';
import { Effect } from 'effect';

const nftService = new NFTService(
  { 1: 'https://eth-mainnet.alchemyapi.io/v2/...' },
  'https://ipfs.io/ipfs/',
  'OPENSEA_API_KEY'
);

// Get NFT with error handling
const result = await Effect.runPromise(
  nftService.getNFT(contract, tokenId, chainId)
);

// Handle errors
Effect.runPromise(
  nftService.transferNFT(contract, tokenId, from, to, chainId)
).then(
  (txHash) => console.log('Transfer success:', txHash),
  (error) => {
    if (error._tag === 'TransferError') {
      console.error('Transfer failed:', error.message);
    }
  }
);
```

## Multi-Chain Support

Components support multiple blockchains:

| Chain | Chain ID | Native Token | Marketplace |
|-------|----------|--------------|-------------|
| Ethereum | 1 | ETH | OpenSea, Rarible |
| Polygon | 137 | MATIC | OpenSea |
| Base | 8453 | ETH | OpenSea |
| Arbitrum | 42161 | ETH | OpenSea |
| Optimism | 10 | ETH | OpenSea |

```typescript
// Switch chain support
<NFTGallery
  nfts={nfts}
  chainId={137} // Polygon
  owner="0x..."
/>
```

## Best Practices

### 1. Gas Optimization

- Use batch operations for multiple NFTs
- Estimate gas before transactions
- Allow users to set gas prices

### 2. Security

- Verify contract addresses
- Double-confirm burn operations
- Validate metadata before minting
- Check allowances before transfers

### 3. User Experience

- Show transaction progress
- Provide clear error messages
- Display gas costs upfront
- Support ENS names
- Enable dark mode

### 4. Performance

- Cache NFT metadata
- Lazy load images
- Use pagination for large collections
- Optimize IPFS gateway selection

## Error Handling

All components handle common errors:

```typescript
type NFTServiceError =
  | { _tag: "NFTNotFoundError"; tokenId: string }
  | { _tag: "InvalidNFTError"; message: string }
  | { _tag: "TransferError"; message: string }
  | { _tag: "MintError"; message: string }
  | { _tag: "BurnError"; message: string }
  | { _tag: "IPFSError"; message: string }
  | { _tag: "MarketplaceError"; message: string };
```

## Examples

### Complete NFT Marketplace App

```tsx
import {
  NFTGallery,
  NFTDetail,
  NFTTransfer,
  NFTMarketplace,
  NFTMint,
  NFTBurn
} from '@/components/ontology-ui/crypto/nft';

function NFTApp() {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [view, setView] = useState('gallery'); // gallery, detail, transfer, etc.

  return (
    <div>
      {view === 'gallery' && (
        <NFTGallery
          nfts={nfts}
          onNFTSelect={(nft) => {
            setSelectedNFT(nft);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <NFTDetail
          nft={selectedNFT}
          onClose={() => setView('gallery')}
          onTransfer={() => setView('transfer')}
          onList={() => setView('marketplace')}
          onBurn={() => setView('burn')}
        />
      )}

      {view === 'transfer' && (
        <NFTTransfer
          selectedNFT={selectedNFT}
          onTransferComplete={() => setView('gallery')}
          onCancel={() => setView('detail')}
        />
      )}

      {view === 'marketplace' && (
        <NFTMarketplace
          nft={selectedNFT}
          onList={() => setView('gallery')}
        />
      )}
    </div>
  );
}
```

## Resources

### NFT Standards
- [EIP-721: Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-1155: Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)

### IPFS Resources
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Web3.Storage](https://web3.storage/)
- [Pinata](https://pinata.cloud/)
- [NFT.Storage](https://nft.storage/)

### Marketplaces
- [OpenSea API](https://docs.opensea.io/reference/api-overview)
- [Rarible API](https://api.rarible.org/v0.1/doc)
- [LooksRare API](https://docs.looksrare.org/)

### Tools
- [NFTPort API](https://www.nftport.xyz/)
- [Alchemy NFT API](https://docs.alchemy.com/reference/nft-api-quickstart)
- [Moralis NFT API](https://docs.moralis.io/web3-data-api/evm/nft-api)

## Support

For issues or questions:
- Check the [ONE Platform Documentation](https://one.ie/docs)
- Review the [Crypto Components Guide](../README.md)
- Open an issue on GitHub

---

**Built with Effect.ts, viem, IPFS, and React 19**
