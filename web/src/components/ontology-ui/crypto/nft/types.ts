/**
 * NFT Component Types
 * Types for NFT components
 */

import type { CardProps } from "../../types";
import type {
  NFT,
  NFTCollection,
  NFTAttribute,
  NFTActivity,
  NFTMarketplaceListing,
  NFTOffer,
  NFTMetadata,
  NFTFilter,
  NFTStandard,
} from "@/lib/services/crypto/NFTService";

// ============================================================================
// Component Props
// ============================================================================

export interface NFTGalleryProps extends CardProps {
  nfts?: NFT[];
  owner?: string;
  chainId?: number;
  view?: "grid" | "list";
  filter?: NFTFilter;
  sortBy?: "recent" | "rarity" | "price" | "name";
  pageSize?: number;
  onNFTSelect?: (nft: NFT) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface NFTCardProps extends CardProps {
  nft: NFT;
  showRarity?: boolean;
  showPrice?: boolean;
  showOwner?: boolean;
  onSelect?: (nft: NFT) => void;
  onTransfer?: (nft: NFT) => void;
  onList?: (nft: NFT) => void;
}

export interface NFTDetailProps extends CardProps {
  nft?: NFT;
  tokenId?: string;
  contract?: string;
  chainId?: number;
  showActivity?: boolean;
  showOffers?: boolean;
  onClose?: () => void;
  onTransfer?: () => void;
  onList?: () => void;
  onBurn?: () => void;
}

export interface NFTTransferProps extends CardProps {
  nfts?: NFT[];
  selectedNFT?: NFT;
  onTransferComplete?: (txHash: string) => void;
  onCancel?: () => void;
}

export interface NFTMarketplaceProps extends CardProps {
  nft?: NFT;
  mode?: "list" | "buy" | "offer" | "accept";
  listings?: NFTMarketplaceListing[];
  offers?: NFTOffer[];
  onList?: (price: string, currency: string) => void;
  onBuy?: (listingId: string) => void;
  onMakeOffer?: (price: string, expiresAt: number) => void;
  onAcceptOffer?: (offerId: string) => void;
}

export interface NFTMintProps extends CardProps {
  collection?: string;
  chainId?: number;
  standard?: NFTStandard;
  onMintComplete?: (tokenId: string, txHash: string) => void;
  onCancel?: () => void;
}

export interface NFTBurnProps extends CardProps {
  nfts?: NFT[];
  selectedNFT?: NFT;
  onBurnComplete?: (txHash: string) => void;
  onCancel?: () => void;
  requireConfirmation?: boolean;
}

// ============================================================================
// Extended Types
// ============================================================================

export interface NFTGalleryFilter extends NFTFilter {
  searchQuery?: string;
  collections?: string[];
  minRarity?: number;
  maxRarity?: number;
}

export interface NFTSortOption {
  value: string;
  label: string;
  field: keyof NFT;
  direction: "asc" | "desc";
}

export interface NFTMarketplaceData {
  listing?: NFTMarketplaceListing;
  offers: NFTOffer[];
  floorPrice?: string;
  lastSale?: {
    price: string;
    priceUsd?: number;
    timestamp: number;
  };
  royaltyInfo?: {
    recipient: string;
    percentage: number;
  };
}

export interface NFTMintForm {
  name: string;
  description: string;
  image: File | null;
  animationUrl?: File | null;
  externalUrl?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  collection?: string;
  royaltyRecipient?: string;
  royaltyPercentage?: number;
  amount?: number; // For ERC-1155
}

export interface NFTBurnReason {
  value: string;
  label: string;
  description?: string;
}

export interface NFTTransferForm {
  nft: NFT;
  recipient: string;
  amount?: number; // For ERC-1155
  ensName?: string;
  gasLimit?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface NFTViewOptions {
  view: "grid" | "list";
  columns: number;
  compact: boolean;
}

export interface NFTPriceHistory {
  timestamp: number;
  price: string;
  priceUsd?: number;
  marketplace: string;
  type: "sale" | "offer" | "listing";
}

export { NFT, NFTCollection, NFTAttribute, NFTActivity, NFTMetadata };
