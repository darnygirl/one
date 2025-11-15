/**
 * NFTService - Effect.ts service for NFT operations
 *
 * Handles NFT fetching, transfer, minting, burning, and marketplace operations.
 * Supports ERC-721 and ERC-1155 standards.
 * Uses Effect.ts for error handling and IPFS for metadata storage.
 */

import { Effect, pipe } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export type NFTServiceError =
  | { _tag: "NFTNotFoundError"; tokenId: string; contract: string }
  | { _tag: "InvalidNFTError"; message: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "MetadataError"; message: string; uri?: string }
  | { _tag: "TransferError"; message: string }
  | { _tag: "MintError"; message: string }
  | { _tag: "BurnError"; message: string }
  | { _tag: "IPFSError"; message: string }
  | { _tag: "MarketplaceError"; message: string }
  | { _tag: "RpcError"; message: string; code?: number };

// ============================================================================
// NFT Types
// ============================================================================

export type NFTStandard = "ERC-721" | "ERC-1155";

export interface NFT {
  tokenId: string;
  contract: string;
  contractName?: string;
  standard: NFTStandard;
  owner: string;
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes?: NFTAttribute[];
  metadata?: Record<string, any>;
  tokenUri?: string;
  chainId: number;
  chainName: string;
  collection?: {
    name: string;
    description?: string;
    image?: string;
    floorPrice?: string;
  };
  rarity?: {
    score: number;
    rank: number;
    total: number;
  };
  lastSale?: {
    price: string;
    priceUsd?: number;
    currency: string;
    timestamp: number;
    marketplace: string;
  };
  balance?: string; // For ERC-1155
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
  max_value?: number;
  rarity?: number; // Percentage (0-100)
}

export interface NFTCollection {
  contract: string;
  name: string;
  symbol?: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  externalUrl?: string;
  totalSupply: number;
  ownedCount: number;
  floorPrice?: string;
  floorPriceUsd?: number;
  volume24h?: string;
  volume24hUsd?: number;
  standard: NFTStandard;
  chainId: number;
}

export interface NFTTransfer {
  from: string;
  to: string;
  tokenId: string;
  contract: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  value?: string; // For sales
  marketplace?: string;
}

export interface NFTActivity {
  type: "mint" | "transfer" | "sale" | "list" | "offer" | "burn";
  tokenId: string;
  contract: string;
  from?: string;
  to?: string;
  price?: string;
  priceUsd?: number;
  currency?: string;
  marketplace?: string;
  transactionHash: string;
  timestamp: number;
}

export interface NFTMarketplaceListing {
  tokenId: string;
  contract: string;
  seller: string;
  price: string;
  priceUsd?: number;
  currency: string;
  marketplace: string;
  expiresAt?: number;
  listingId: string;
}

export interface NFTOffer {
  tokenId: string;
  contract: string;
  offerer: string;
  price: string;
  priceUsd?: number;
  currency: string;
  expiresAt: number;
  offerId: string;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: NFTAttribute[];
  background_color?: string;
  [key: string]: any;
}

export interface NFTMintRequest {
  contract: string;
  to: string;
  tokenUri?: string;
  metadata?: NFTMetadata;
  amount?: number; // For ERC-1155
  royaltyRecipient?: string;
  royaltyPercentage?: number; // 0-100
}

export interface NFTFilter {
  collection?: string;
  owner?: string;
  traits?: Record<string, string | number>;
  minPrice?: string;
  maxPrice?: string;
  standard?: NFTStandard;
  chainId?: number;
}

export interface RarityScore {
  tokenId: string;
  score: number;
  rank: number;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    rarity: number;
    occurrence: number;
    total: number;
  }>;
}

// ============================================================================
// Service Interface
// ============================================================================

export interface INFTService {
  /**
   * Get NFT by token ID and contract
   */
  getNFT(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<NFT, NFTServiceError>;

  /**
   * Get all NFTs owned by address
   */
  getNFTsByOwner(
    owner: string,
    chainId: number,
    filter?: NFTFilter
  ): Effect.Effect<NFT[], NFTServiceError>;

  /**
   * Get NFT collection info
   */
  getCollection(
    contract: string,
    chainId: number
  ): Effect.Effect<NFTCollection, NFTServiceError>;

  /**
   * Get NFT metadata from token URI
   */
  getMetadata(
    tokenUri: string
  ): Effect.Effect<NFTMetadata, NFTServiceError>;

  /**
   * Get NFT activity/history
   */
  getActivity(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<NFTActivity[], NFTServiceError>;

  /**
   * Calculate rarity score
   */
  calculateRarity(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<RarityScore, NFTServiceError>;

  /**
   * Transfer NFT
   */
  transferNFT(
    contract: string,
    tokenId: string,
    from: string,
    to: string,
    chainId: number,
    amount?: number
  ): Effect.Effect<string, NFTServiceError>;

  /**
   * Mint NFT
   */
  mintNFT(
    request: NFTMintRequest,
    chainId: number
  ): Effect.Effect<{ tokenId: string; transactionHash: string }, NFTServiceError>;

  /**
   * Burn NFT
   */
  burnNFT(
    contract: string,
    tokenId: string,
    owner: string,
    chainId: number,
    amount?: number
  ): Effect.Effect<string, NFTServiceError>;

  /**
   * List NFT for sale
   */
  listNFT(
    contract: string,
    tokenId: string,
    price: string,
    currency: string,
    marketplace: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError>;

  /**
   * Buy NFT
   */
  buyNFT(
    listingId: string,
    marketplace: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError>;

  /**
   * Make offer on NFT
   */
  makeOffer(
    contract: string,
    tokenId: string,
    price: string,
    currency: string,
    expiresAt: number,
    chainId: number
  ): Effect.Effect<string, NFTServiceError>;

  /**
   * Accept offer
   */
  acceptOffer(
    offerId: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class NFTService implements INFTService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheTime = 30000; // 30 seconds

  constructor(
    private rpcUrls: Record<number, string>,
    private ipfsGateway: string = "https://ipfs.io/ipfs/",
    private openseaApiKey?: string
  ) {}

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTime,
    });
  }

  private async rpcCall<T>(
    chainId: number,
    method: string,
    params: any[]
  ): Promise<T> {
    const rpcUrl = this.rpcUrls[chainId];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for chain ${chainId}`);
    }

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  getNFT(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<NFT, NFTServiceError> {
    return Effect.gen(this, function* () {
      const cacheKey = `nft:${chainId}:${contract}:${tokenId}`;
      const cached = this.getCached<NFT>(cacheKey);
      if (cached) return cached;

      // Get token URI
      const tokenUri = yield* this.getTokenURI(contract, tokenId, chainId);

      // Fetch metadata
      const metadata = yield* this.getMetadata(tokenUri);

      // Get owner
      const owner = yield* this.getOwner(contract, tokenId, chainId);

      // Get collection info
      const collection = yield* Effect.tryPromise({
        try: () => this.fetchCollectionInfo(contract, chainId),
        catch: () => null,
      });

      const nft: NFT = {
        tokenId,
        contract,
        standard: yield* this.detectStandard(contract, chainId),
        owner,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        imageUrl: this.resolveIpfsUrl(metadata.image),
        animationUrl: metadata.animation_url
          ? this.resolveIpfsUrl(metadata.animation_url)
          : undefined,
        externalUrl: metadata.external_url,
        attributes: metadata.attributes,
        metadata,
        tokenUri,
        chainId,
        chainName: this.getChainName(chainId),
        collection: collection || undefined,
      };

      this.setCache(cacheKey, nft);
      return nft;
    });
  }

  getNFTsByOwner(
    owner: string,
    chainId: number,
    filter?: NFTFilter
  ): Effect.Effect<NFT[], NFTServiceError> {
    return Effect.gen(this, function* () {
      // In production, this would use Alchemy/Moralis API
      // For now, return mock data
      const mockNFTs: NFT[] = [
        {
          tokenId: "1",
          contract: "0x...collection1",
          contractName: "Bored Ape Yacht Club",
          standard: "ERC-721",
          owner,
          name: "BAYC #1",
          description: "A bored ape",
          imageUrl: "https://example.com/nft1.png",
          chainId,
          chainName: this.getChainName(chainId),
          attributes: [
            { trait_type: "Background", value: "Blue", rarity: 15 },
            { trait_type: "Eyes", value: "Laser", rarity: 5 },
          ],
        },
      ];

      return mockNFTs;
    });
  }

  getCollection(
    contract: string,
    chainId: number
  ): Effect.Effect<NFTCollection, NFTServiceError> {
    return Effect.gen(this, function* () {
      const info = yield* Effect.tryPromise({
        try: () => this.fetchCollectionInfo(contract, chainId),
        catch: (error) => ({
          _tag: "NetworkError" as const,
          message: error instanceof Error ? error.message : "Failed to fetch collection",
        }),
      });

      return info;
    });
  }

  getMetadata(
    tokenUri: string
  ): Effect.Effect<NFTMetadata, NFTServiceError> {
    return Effect.gen(this, function* () {
      const url = this.resolveIpfsUrl(tokenUri);

      const metadata = yield* Effect.tryPromise({
        try: async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.statusText}`);
          }
          return await response.json();
        },
        catch: (error) => ({
          _tag: "MetadataError" as const,
          message: error instanceof Error ? error.message : "Failed to fetch metadata",
          uri: tokenUri,
        }),
      });

      return metadata;
    });
  }

  getActivity(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<NFTActivity[], NFTServiceError> {
    return Effect.gen(this, function* () {
      // Mock activity data
      const activities: NFTActivity[] = [
        {
          type: "mint",
          tokenId,
          contract,
          to: "0x...",
          transactionHash: "0x...",
          timestamp: Date.now() - 86400000,
        },
        {
          type: "sale",
          tokenId,
          contract,
          from: "0x...seller",
          to: "0x...buyer",
          price: "1.5",
          priceUsd: 3000,
          currency: "ETH",
          marketplace: "OpenSea",
          transactionHash: "0x...",
          timestamp: Date.now() - 3600000,
        },
      ];

      return activities;
    });
  }

  calculateRarity(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<RarityScore, NFTServiceError> {
    return Effect.gen(this, function* () {
      const nft = yield* this.getNFT(contract, tokenId, chainId);

      if (!nft.attributes) {
        return {
          tokenId,
          score: 0,
          rank: 0,
          attributes: [],
        };
      }

      // Calculate rarity score based on trait occurrence
      const traitScores = nft.attributes.map((attr) => ({
        trait_type: attr.trait_type,
        value: attr.value,
        rarity: attr.rarity || 50, // Mock rarity percentage
        occurrence: 100, // Mock occurrence
        total: 1000, // Mock total supply
      }));

      const totalScore = traitScores.reduce((sum, t) => sum + (100 - t.rarity), 0);

      return {
        tokenId,
        score: totalScore,
        rank: 1, // Would calculate from collection
        attributes: traitScores,
      };
    });
  }

  transferNFT(
    contract: string,
    tokenId: string,
    from: string,
    to: string,
    chainId: number,
    amount?: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      const standard = yield* this.detectStandard(contract, chainId);

      // In production, this would use wagmi/viem to send transaction
      // For now, return mock transaction hash
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      return txHash;
    });
  }

  mintNFT(
    request: NFTMintRequest,
    chainId: number
  ): Effect.Effect<{ tokenId: string; transactionHash: string }, NFTServiceError> {
    return Effect.gen(this, function* () {
      // In production, this would:
      // 1. Upload metadata to IPFS
      // 2. Call mint function on contract
      // 3. Wait for confirmation
      // 4. Return token ID and tx hash

      const tokenId = Math.floor(Math.random() * 10000).toString();
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      return { tokenId, transactionHash: txHash };
    });
  }

  burnNFT(
    contract: string,
    tokenId: string,
    owner: string,
    chainId: number,
    amount?: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      // Verify ownership
      const currentOwner = yield* this.getOwner(contract, tokenId, chainId);

      if (currentOwner.toLowerCase() !== owner.toLowerCase()) {
        return yield* Effect.fail({
          _tag: "BurnError" as const,
          message: "Not the owner of this NFT",
        });
      }

      // Mock burn transaction
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      return txHash;
    });
  }

  listNFT(
    contract: string,
    tokenId: string,
    price: string,
    currency: string,
    marketplace: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      // In production, this would interact with marketplace contracts
      const listingId = `listing-${Math.random().toString(36).slice(2, 11)}`;

      return listingId;
    });
  }

  buyNFT(
    listingId: string,
    marketplace: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      // Mock purchase transaction
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      return txHash;
    });
  }

  makeOffer(
    contract: string,
    tokenId: string,
    price: string,
    currency: string,
    expiresAt: number,
    chainId: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      const offerId = `offer-${Math.random().toString(36).slice(2, 11)}`;

      return offerId;
    });
  }

  acceptOffer(
    offerId: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      return txHash;
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getTokenURI(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      const uri = yield* Effect.tryPromise({
        try: () =>
          this.rpcCall<string>(chainId, "eth_call", [
            {
              to: contract,
              data: this.encodeTokenURI(tokenId),
            },
            "latest",
          ]),
        catch: (error) => ({
          _tag: "RpcError" as const,
          message: error instanceof Error ? error.message : "RPC call failed",
        }),
      });

      // Decode hex string to URI
      return this.decodeHexString(uri);
    });
  }

  private getOwner(
    contract: string,
    tokenId: string,
    chainId: number
  ): Effect.Effect<string, NFTServiceError> {
    return Effect.gen(this, function* () {
      const owner = yield* Effect.tryPromise({
        try: () =>
          this.rpcCall<string>(chainId, "eth_call", [
            {
              to: contract,
              data: this.encodeOwnerOf(tokenId),
            },
            "latest",
          ]),
        catch: (error) => ({
          _tag: "RpcError" as const,
          message: error instanceof Error ? error.message : "RPC call failed",
        }),
      });

      // Extract address from hex
      return `0x${owner.slice(-40)}`;
    });
  }

  private detectStandard(
    contract: string,
    chainId: number
  ): Effect.Effect<NFTStandard, NFTServiceError> {
    return Effect.gen(this, function* () {
      // Check if contract supports ERC-1155 interface
      const is1155 = yield* Effect.tryPromise({
        try: () => this.supportsInterface(contract, "0xd9b67a26", chainId), // ERC-1155 interface ID
        catch: () => false,
      });

      return is1155 ? "ERC-1155" : "ERC-721";
    });
  }

  private async supportsInterface(
    contract: string,
    interfaceId: string,
    chainId: number
  ): Promise<boolean> {
    try {
      const result = await this.rpcCall<string>(chainId, "eth_call", [
        {
          to: contract,
          data: `0x01ffc9a7${interfaceId.slice(2).padStart(64, "0")}`,
        },
        "latest",
      ]);
      return result !== "0x0000000000000000000000000000000000000000000000000000000000000000";
    } catch {
      return false;
    }
  }

  private async fetchCollectionInfo(
    contract: string,
    chainId: number
  ): Promise<NFTCollection> {
    // Mock collection data
    return {
      contract,
      name: "Mock Collection",
      symbol: "MOCK",
      description: "A mock NFT collection",
      totalSupply: 10000,
      ownedCount: 5,
      floorPrice: "1.5",
      floorPriceUsd: 3000,
      volume24h: "150",
      volume24hUsd: 300000,
      standard: "ERC-721",
      chainId,
    };
  }

  private resolveIpfsUrl(uri?: string): string {
    if (!uri) return "";

    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", this.ipfsGateway);
    }

    if (uri.startsWith("ipfs/")) {
      return this.ipfsGateway + uri.slice(5);
    }

    return uri;
  }

  private getChainName(chainId: number): string {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      8453: "Base",
      42161: "Arbitrum",
      10: "Optimism",
    };
    return chains[chainId] || `Chain ${chainId}`;
  }

  private encodeTokenURI(tokenId: string): string {
    // tokenURI(uint256) = 0xc87b56dd
    const functionSig = "0xc87b56dd";
    const paddedTokenId = BigInt(tokenId).toString(16).padStart(64, "0");
    return functionSig + paddedTokenId;
  }

  private encodeOwnerOf(tokenId: string): string {
    // ownerOf(uint256) = 0x6352211e
    const functionSig = "0x6352211e";
    const paddedTokenId = BigInt(tokenId).toString(16).padStart(64, "0");
    return functionSig + paddedTokenId;
  }

  private decodeHexString(hex: string): string {
    if (!hex || hex === "0x") return "";

    // Remove 0x prefix
    hex = hex.slice(2);

    // Skip first 64 chars (offset) and next 64 chars (length)
    const dataStart = 128;
    const lengthHex = hex.slice(64, 128);
    const length = parseInt(lengthHex, 16) * 2;

    const data = hex.slice(dataStart, dataStart + length);

    // Convert hex to string
    let str = "";
    for (let i = 0; i < data.length; i += 2) {
      str += String.fromCharCode(parseInt(data.slice(i, i + 2), 16));
    }

    return str;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function formatTokenId(tokenId: string, maxLength: number = 10): string {
  if (tokenId.length <= maxLength) return `#${tokenId}`;
  return `#${tokenId.slice(0, maxLength / 2)}...${tokenId.slice(-maxLength / 2)}`;
}

export function getNFTExplorerUrl(
  contract: string,
  tokenId: string,
  chainId: number
): string {
  const explorers: Record<number, string> = {
    1: "https://opensea.io/assets/ethereum",
    137: "https://opensea.io/assets/matic",
    8453: "https://opensea.io/assets/base",
  };

  const baseUrl = explorers[chainId] || "https://opensea.io/assets/ethereum";
  return `${baseUrl}/${contract}/${tokenId}`;
}

export function calculateRarityPercentile(rank: number, total: number): number {
  return ((total - rank + 1) / total) * 100;
}

export function formatRarityScore(score: number): string {
  return score.toFixed(2);
}

export function getRarityTier(percentile: number): {
  tier: string;
  color: string;
} {
  if (percentile >= 95)
    return { tier: "Legendary", color: "text-yellow-600 dark:text-yellow-400" };
  if (percentile >= 80)
    return { tier: "Epic", color: "text-purple-600 dark:text-purple-400" };
  if (percentile >= 60)
    return { tier: "Rare", color: "text-blue-600 dark:text-blue-400" };
  if (percentile >= 40)
    return { tier: "Uncommon", color: "text-green-600 dark:text-green-400" };
  return { tier: "Common", color: "text-gray-600 dark:text-gray-400" };
}
