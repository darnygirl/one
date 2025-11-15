/**
 * Access Control Service
 *
 * Handles token gating, NFT gating, and access control with Effect.ts:
 * - Token ownership verification
 * - NFT ownership and trait checking
 * - Merkle tree generation and verification
 * - Whitelist management
 * - Access pass generation
 * - Airdrop claim eligibility
 */

import { Effect } from "effect";
import { keccak256, encodePacked } from "viem";

// ============================================================================
// Error Types
// ============================================================================

export type AccessControlError =
  | { _tag: "InsufficientBalance"; token: string; required: string; actual: string }
  | { _tag: "NFTNotOwned"; collection: string; tokenId?: string }
  | { _tag: "TraitMismatch"; required: Record<string, string>; actual: Record<string, string> }
  | { _tag: "NotWhitelisted"; address: string }
  | { _tag: "InvalidProof"; address: string }
  | { _tag: "PassExpired"; passId: string; expiresAt: number }
  | { _tag: "PassRevoked"; passId: string }
  | { _tag: "AlreadyClaimed"; address: string; airdropId: string }
  | { _tag: "NotEligible"; address: string; reason: string }
  | { _tag: "InvalidMerkleTree"; reason: string }
  | { _tag: "WalletNotConnected" };

// ============================================================================
// Types
// ============================================================================

export interface TokenRequirement {
  address: string;
  symbol: string;
  minBalance: string;
  chain: string;
}

export interface NFTRequirement {
  collection: string;
  tokenId?: string;
  traits?: Record<string, string>;
  chain: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  badge: string;
  requirements: {
    tokens?: TokenRequirement[];
    nfts?: NFTRequirement[];
    logic?: "AND" | "OR";
  };
  benefits: string[];
}

export interface AccessPass {
  id: string;
  holder: string;
  issuer: string;
  expiresAt: number;
  transferable: boolean;
  revoked: boolean;
  metadata: Record<string, unknown>;
  signature: string;
}

export interface AirdropCampaign {
  id: string;
  token: string;
  totalAmount: string;
  merkleRoot: string;
  startTime: number;
  endTime: number;
  claimed: Record<string, boolean>;
}

export interface AirdropClaim {
  address: string;
  amount: string;
  proof: string[];
}

export interface WhitelistEntry {
  address: string;
  allocation: string;
  tier?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Merkle Tree Implementation
// ============================================================================

export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(elements: string[]) {
    this.leaves = elements.map((el) => this.hashLeaf(el));
    this.layers = this.createTree(this.leaves);
  }

  private hashLeaf(data: string): string {
    return keccak256(encodePacked(["address"], [data as `0x${string}`]));
  }

  private hashPair(a: string, b: string): string {
    const sorted = [a, b].sort();
    return keccak256(
      encodePacked(["bytes32", "bytes32"], [sorted[0] as `0x${string}`, sorted[1] as `0x${string}`])
    );
  }

  private createTree(leaves: string[]): string[][] {
    if (leaves.length === 0) return [];
    if (leaves.length === 1) return [leaves];

    const layers: string[][] = [leaves];
    let currentLayer = leaves;

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }

      layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    return layers;
  }

  getRoot(): string {
    if (this.layers.length === 0) return "";
    return this.layers[this.layers.length - 1][0];
  }

  getProof(address: string): string[] {
    const leafHash = this.hashLeaf(address);
    let index = this.leaves.indexOf(leafHash);

    if (index === -1) return [];

    const proof: string[] = [];

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const pairIndex = isRightNode ? index - 1 : index + 1;

      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex]);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  verify(address: string, proof: string[], root: string): boolean {
    let hash = this.hashLeaf(address);

    for (const proofElement of proof) {
      hash = this.hashPair(hash, proofElement);
    }

    return hash === root;
  }
}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Check if address has sufficient token balance
 */
export const checkTokenBalance = (
  address: string,
  requirement: TokenRequirement,
  actualBalance: string
): Effect.Effect<boolean, AccessControlError> =>
  Effect.gen(function* () {
    const required = BigInt(requirement.minBalance);
    const actual = BigInt(actualBalance);

    if (actual < required) {
      return yield* Effect.fail({
        _tag: "InsufficientBalance",
        token: requirement.symbol,
        required: requirement.minBalance,
        actual: actualBalance,
      });
    }

    return true;
  });

/**
 * Check if address owns NFT
 */
export const checkNFTOwnership = (
  address: string,
  requirement: NFTRequirement,
  ownedTokens: string[]
): Effect.Effect<boolean, AccessControlError> =>
  Effect.gen(function* () {
    if (requirement.tokenId) {
      if (!ownedTokens.includes(requirement.tokenId)) {
        return yield* Effect.fail({
          _tag: "NFTNotOwned",
          collection: requirement.collection,
          tokenId: requirement.tokenId,
        });
      }
    } else {
      if (ownedTokens.length === 0) {
        return yield* Effect.fail({
          _tag: "NFTNotOwned",
          collection: requirement.collection,
        });
      }
    }

    return true;
  });

/**
 * Check NFT traits
 */
export const checkNFTTraits = (
  tokenTraits: Record<string, string>,
  requiredTraits: Record<string, string>
): Effect.Effect<boolean, AccessControlError> =>
  Effect.gen(function* () {
    for (const [trait, value] of Object.entries(requiredTraits)) {
      if (tokenTraits[trait] !== value) {
        return yield* Effect.fail({
          _tag: "TraitMismatch",
          required: requiredTraits,
          actual: tokenTraits,
        });
      }
    }

    return true;
  });

/**
 * Determine membership tier based on holdings
 */
export const calculateMembershipTier = (
  address: string,
  tiers: MembershipTier[],
  holdings: {
    tokens: Record<string, string>;
    nfts: Record<string, string[]>;
  }
): Effect.Effect<MembershipTier | null, AccessControlError> =>
  Effect.gen(function* () {
    // Sort tiers by requirements (most to least)
    const sortedTiers = [...tiers].reverse();

    for (const tier of sortedTiers) {
      let qualifies = true;

      // Check token requirements
      if (tier.requirements.tokens) {
        for (const tokenReq of tier.requirements.tokens) {
          const balance = holdings.tokens[tokenReq.address] || "0";
          const hasBalance = BigInt(balance) >= BigInt(tokenReq.minBalance);

          if (tier.requirements.logic === "OR") {
            if (hasBalance) return tier;
          } else {
            if (!hasBalance) {
              qualifies = false;
              break;
            }
          }
        }
      }

      // Check NFT requirements
      if (tier.requirements.nfts && qualifies) {
        for (const nftReq of tier.requirements.nfts) {
          const owned = holdings.nfts[nftReq.collection] || [];
          const hasNFT = owned.length > 0;

          if (tier.requirements.logic === "OR") {
            if (hasNFT) return tier;
          } else {
            if (!hasNFT) {
              qualifies = false;
              break;
            }
          }
        }
      }

      if (qualifies && tier.requirements.logic !== "OR") {
        return tier;
      }
    }

    return null;
  });

/**
 * Generate access pass
 */
export const generateAccessPass = (
  holder: string,
  issuer: string,
  duration: number,
  transferable: boolean = false,
  metadata: Record<string, unknown> = {}
): Effect.Effect<AccessPass, AccessControlError> =>
  Effect.gen(function* () {
    const passId = `pass-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + duration;

    // In production, this would be signed with a private key
    const signature = keccak256(
      encodePacked(
        ["string", "address", "address", "uint256"],
        [passId, holder as `0x${string}`, issuer as `0x${string}`, BigInt(expiresAt)]
      )
    );

    return {
      id: passId,
      holder,
      issuer,
      expiresAt,
      transferable,
      revoked: false,
      metadata,
      signature,
    };
  });

/**
 * Verify access pass
 */
export const verifyAccessPass = (
  pass: AccessPass
): Effect.Effect<boolean, AccessControlError> =>
  Effect.gen(function* () {
    if (pass.revoked) {
      return yield* Effect.fail({
        _tag: "PassRevoked",
        passId: pass.id,
      });
    }

    if (Date.now() > pass.expiresAt) {
      return yield* Effect.fail({
        _tag: "PassExpired",
        passId: pass.id,
        expiresAt: pass.expiresAt,
      });
    }

    return true;
  });

/**
 * Create merkle tree from whitelist
 */
export const createMerkleTree = (
  addresses: string[]
): Effect.Effect<{ root: string; tree: MerkleTree }, AccessControlError> =>
  Effect.gen(function* () {
    if (addresses.length === 0) {
      return yield* Effect.fail({
        _tag: "InvalidMerkleTree",
        reason: "Empty address list",
      });
    }

    const tree = new MerkleTree(addresses);
    const root = tree.getRoot();

    return { root, tree };
  });

/**
 * Generate merkle proof for address
 */
export const generateMerkleProof = (
  tree: MerkleTree,
  address: string
): Effect.Effect<string[], AccessControlError> =>
  Effect.gen(function* () {
    const proof = tree.getProof(address);

    if (proof.length === 0) {
      return yield* Effect.fail({
        _tag: "NotWhitelisted",
        address,
      });
    }

    return proof;
  });

/**
 * Verify merkle proof
 */
export const verifyMerkleProof = (
  address: string,
  proof: string[],
  root: string
): Effect.Effect<boolean, AccessControlError> =>
  Effect.gen(function* () {
    const tree = new MerkleTree([address]);
    const isValid = tree.verify(address, proof, root);

    if (!isValid) {
      return yield* Effect.fail({
        _tag: "InvalidProof",
        address,
      });
    }

    return true;
  });

/**
 * Check airdrop eligibility
 */
export const checkAirdropEligibility = (
  address: string,
  campaign: AirdropCampaign,
  proof: string[]
): Effect.Effect<AirdropClaim, AccessControlError> =>
  Effect.gen(function* () {
    // Check if already claimed
    if (campaign.claimed[address]) {
      return yield* Effect.fail({
        _tag: "AlreadyClaimed",
        address,
        airdropId: campaign.id,
      });
    }

    // Check time window
    const now = Date.now();
    if (now < campaign.startTime || now > campaign.endTime) {
      return yield* Effect.fail({
        _tag: "NotEligible",
        address,
        reason: "Outside claim window",
      });
    }

    // Verify merkle proof
    yield* verifyMerkleProof(address, proof, campaign.merkleRoot);

    // In production, amount would come from the merkle tree leaf data
    const amount = "1000000000000000000"; // 1 token

    return {
      address,
      amount,
      proof,
    };
  });

/**
 * Manage whitelist
 */
export const addToWhitelist = (
  whitelist: WhitelistEntry[],
  entry: WhitelistEntry
): Effect.Effect<WhitelistEntry[], AccessControlError> =>
  Effect.gen(function* () {
    const exists = whitelist.find((e) => e.address === entry.address);
    if (exists) {
      return whitelist.map((e) => (e.address === entry.address ? entry : e));
    }
    return [...whitelist, entry];
  });

export const removeFromWhitelist = (
  whitelist: WhitelistEntry[],
  address: string
): Effect.Effect<WhitelistEntry[], AccessControlError> =>
  Effect.gen(function* () {
    return whitelist.filter((e) => e.address !== address);
  });

export const verifyWhitelist = (
  address: string,
  whitelist: WhitelistEntry[]
): Effect.Effect<WhitelistEntry, AccessControlError> =>
  Effect.gen(function* () {
    const entry = whitelist.find((e) => e.address === address);

    if (!entry) {
      return yield* Effect.fail({
        _tag: "NotWhitelisted",
        address,
      });
    }

    return entry;
  });

/**
 * Batch verify addresses
 */
export const batchVerifyWhitelist = (
  addresses: string[],
  whitelist: WhitelistEntry[]
): Effect.Effect<Record<string, boolean>, AccessControlError> =>
  Effect.gen(function* () {
    const results: Record<string, boolean> = {};

    for (const address of addresses) {
      results[address] = whitelist.some((e) => e.address === address);
    }

    return results;
  });
