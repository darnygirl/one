/**
 * CryptoService - Effect.ts service for cryptocurrency data
 *
 * Provides token prices, market data, and analytics from CoinGecko API.
 * Uses Effect.ts for error handling, caching, and rate limiting.
 */

import { Context, Effect, Layer, pipe, Cache, Duration } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export type CryptoServiceError =
  | { _tag: "ApiError"; message: string; status?: number }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "RateLimitError"; retryAfter: number }
  | { _tag: "TokenNotFoundError"; tokenId: string }
  | { _tag: "InvalidChainError"; chain: string };

// ============================================================================
// Token Types
// ============================================================================

export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_date: string;
  atl: number;
  atl_date: string;
  last_updated: string;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  valueUsd: number;
  address?: string;
}

export interface TokenPrice {
  usd: number;
  eth?: number;
  btc?: number;
  usd_24h_change: number;
  last_updated_at: number;
}

export interface TokenMarketData {
  current_price: Record<string, number>;
  market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  market_cap_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: Record<string, number>;
  ath_date: Record<string, string>;
  atl: Record<string, number>;
  atl_date: Record<string, string>;
}

export interface TokenChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TokenSocials {
  homepage: string[];
  whitepaper?: string;
  blockchain_site: string[];
  official_forum_url: string[];
  chat_url: string[];
  announcement_url: string[];
  twitter_screen_name: string;
  facebook_username: string;
  telegram_channel_identifier: string;
  subreddit_url: string;
  repos_url: {
    github: string[];
    bitbucket: string[];
  };
}

export interface TokenDetails {
  id: string;
  symbol: string;
  name: string;
  description: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: TokenMarketData;
  links: TokenSocials;
  community_data: {
    twitter_followers: number;
    telegram_channel_user_count: number;
    reddit_subscribers: number;
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
  };
}

export interface MarketStats {
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  holder_count?: number;
  ath: number;
  ath_date: string;
  ath_change_percentage: number;
  atl: number;
  atl_date: string;
  atl_change_percentage: number;
}

// ============================================================================
// Service Interface
// ============================================================================

export interface ICryptoService {
  /**
   * Get token price by ID
   */
  getTokenPrice(
    tokenId: string,
    currencies?: string[]
  ): Effect.Effect<TokenPrice, CryptoServiceError>;

  /**
   * Get multiple token prices
   */
  getTokenPrices(
    tokenIds: string[],
    currencies?: string[]
  ): Effect.Effect<Record<string, TokenPrice>, CryptoServiceError>;

  /**
   * Get token details
   */
  getTokenDetails(
    tokenId: string
  ): Effect.Effect<TokenDetails, CryptoServiceError>;

  /**
   * Get token market chart data
   */
  getTokenChart(
    tokenId: string,
    days: number,
    currency?: string
  ): Effect.Effect<TokenChartData, CryptoServiceError>;

  /**
   * Get token market stats
   */
  getTokenStats(
    tokenId: string
  ): Effect.Effect<MarketStats, CryptoServiceError>;

  /**
   * Search tokens
   */
  searchTokens(query: string): Effect.Effect<Token[], CryptoServiceError>;

  /**
   * Get trending tokens
   */
  getTrendingTokens(): Effect.Effect<Token[], CryptoServiceError>;

  /**
   * Get top tokens by market cap
   */
  getTopTokens(
    limit?: number,
    page?: number
  ): Effect.Effect<Token[], CryptoServiceError>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class CryptoService implements ICryptoService {
  private baseUrl = "https://api.coingecko.com/api/v3";
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheTime = 30000; // 30 seconds

  constructor(private apiKey?: string) {}

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

  private fetch<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Effect.Effect<T, CryptoServiceError> {
    return Effect.gen(this, function* () {
      // Check cache first
      const cacheKey = `${endpoint}?${JSON.stringify(params)}`;
      const cached = this.getCached<T>(cacheKey);
      if (cached) return cached;

      try {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
        }

        const headers: Record<string, string> = {
          Accept: "application/json",
        };

        if (this.apiKey) {
          headers["x-cg-demo-api-key"] = this.apiKey;
        }

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(url.toString(), {
              headers,
            }),
          catch: (error) => ({
            _tag: "NetworkError" as const,
            message: error instanceof Error ? error.message : "Network error",
          }),
        });

        if (response.status === 429) {
          const retryAfter = parseInt(
            response.headers.get("Retry-After") || "60",
            10
          );
          return yield* Effect.fail({
            _tag: "RateLimitError" as const,
            retryAfter,
          });
        }

        if (!response.ok) {
          return yield* Effect.fail({
            _tag: "ApiError" as const,
            message: `API error: ${response.statusText}`,
            status: response.status,
          });
        }

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => ({
            _tag: "ApiError" as const,
            message: "Invalid JSON response",
          }),
        });

        // Cache the result
        this.setCache(cacheKey, data);

        return data as T;
      } catch (error) {
        return yield* Effect.fail({
          _tag: "NetworkError" as const,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  getTokenPrice(
    tokenId: string,
    currencies: string[] = ["usd"]
  ): Effect.Effect<TokenPrice, CryptoServiceError> {
    return pipe(
      this.fetch<Record<string, TokenPrice>>("/simple/price", {
        ids: tokenId,
        vs_currencies: currencies.join(","),
        include_24hr_change: "true",
        include_last_updated_at: "true",
      }),
      Effect.flatMap((data) => {
        const price = data[tokenId];
        if (!price) {
          return Effect.fail({
            _tag: "TokenNotFoundError" as const,
            tokenId,
          });
        }
        return Effect.succeed(price);
      })
    );
  }

  getTokenPrices(
    tokenIds: string[],
    currencies: string[] = ["usd"]
  ): Effect.Effect<Record<string, TokenPrice>, CryptoServiceError> {
    return this.fetch<Record<string, TokenPrice>>("/simple/price", {
      ids: tokenIds.join(","),
      vs_currencies: currencies.join(","),
      include_24hr_change: "true",
      include_last_updated_at: "true",
    });
  }

  getTokenDetails(
    tokenId: string
  ): Effect.Effect<TokenDetails, CryptoServiceError> {
    return this.fetch<TokenDetails>(`/coins/${tokenId}`, {
      localization: "false",
      tickers: "false",
      community_data: "true",
      developer_data: "true",
    });
  }

  getTokenChart(
    tokenId: string,
    days: number,
    currency: string = "usd"
  ): Effect.Effect<TokenChartData, CryptoServiceError> {
    return this.fetch<TokenChartData>(`/coins/${tokenId}/market_chart`, {
      vs_currency: currency,
      days: days.toString(),
      interval: days <= 1 ? "hourly" : "daily",
    });
  }

  getTokenStats(
    tokenId: string
  ): Effect.Effect<MarketStats, CryptoServiceError> {
    return pipe(
      this.getTokenDetails(tokenId),
      Effect.map((details) => ({
        market_cap: details.market_data.market_cap.usd,
        market_cap_rank: details.market_data.market_cap_rank,
        total_volume: details.market_data.total_volume.usd,
        circulating_supply: details.market_data.circulating_supply,
        total_supply: details.market_data.total_supply,
        max_supply: details.market_data.max_supply,
        ath: details.market_data.ath.usd,
        ath_date: details.market_data.ath_date.usd,
        ath_change_percentage:
          details.market_data.price_change_percentage_24h,
        atl: details.market_data.atl.usd,
        atl_date: details.market_data.atl_date.usd,
        atl_change_percentage:
          details.market_data.price_change_percentage_24h,
      }))
    );
  }

  searchTokens(query: string): Effect.Effect<Token[], CryptoServiceError> {
    return pipe(
      this.fetch<{ coins: Token[] }>("/search", { query }),
      Effect.map((result) => result.coins)
    );
  }

  getTrendingTokens(): Effect.Effect<Token[], CryptoServiceError> {
    return pipe(
      this.fetch<{ coins: Array<{ item: Token }> }>("/search/trending"),
      Effect.map((result) => result.coins.map((c) => c.item))
    );
  }

  getTopTokens(
    limit: number = 100,
    page: number = 1
  ): Effect.Effect<Token[], CryptoServiceError> {
    return this.fetch<Token[]>("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: limit.toString(),
      page: page.toString(),
      sparkline: "false",
    });
  }
}

// ============================================================================
// Service Context
// ============================================================================

export class CryptoServiceTag extends Context.Tag("CryptoService")<
  CryptoServiceTag,
  ICryptoService
>() {}

export const CryptoServiceLive = Layer.succeed(
  CryptoServiceTag,
  new CryptoService()
);

// ============================================================================
// Helper Functions
// ============================================================================

export const getCryptoService = Effect.serviceConstants(CryptoServiceTag);

/**
 * Format token balance for display
 */
export function formatTokenBalance(balance: string, decimals: number = 18): string {
  const value = parseFloat(balance) / Math.pow(10, decimals);
  if (value === 0) return "0";
  if (value < 0.00001) return "<0.00001";
  if (value < 1) return value.toFixed(5);
  if (value < 1000) return value.toFixed(2);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format USD value
 */
export function formatUsdValue(value: number): string {
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 1000) return `$${value.toFixed(2)}`;
  if (value < 1000000) return `$${(value / 1000).toFixed(2)}K`;
  if (value < 1000000000) return `$${(value / 1000000).toFixed(2)}M`;
  return `$${(value / 1000000000).toFixed(2)}B`;
}

/**
 * Format price change percentage
 */
export function formatPriceChange(change: number): string {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(2)}%`;
}

/**
 * Get price change color
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return "text-green-600 dark:text-green-400";
  if (change < 0) return "text-red-600 dark:text-red-400";
  return "text-gray-600 dark:text-gray-400";
}

/**
 * Format large number (market cap, volume)
 */
export function formatLargeNumber(value: number): string {
  if (value < 1000) return value.toFixed(0);
  if (value < 1000000) return `${(value / 1000).toFixed(2)}K`;
  if (value < 1000000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value < 1000000000000) return `${(value / 1000000000).toFixed(2)}B`;
  return `${(value / 1000000000000).toFixed(2)}T`;
}

/**
 * Calculate portfolio value
 */
export function calculatePortfolioValue(balances: TokenBalance[]): number {
  return balances.reduce((sum, balance) => sum + balance.valueUsd, 0);
}

/**
 * Sort tokens by value
 */
export function sortTokensByValue(
  balances: TokenBalance[],
  direction: "asc" | "desc" = "desc"
): TokenBalance[] {
  return [...balances].sort((a, b) => {
    return direction === "desc"
      ? b.valueUsd - a.valueUsd
      : a.valueUsd - b.valueUsd;
  });
}

/**
 * Filter tokens by minimum value
 */
export function filterTokensByValue(
  balances: TokenBalance[],
  minValue: number
): TokenBalance[] {
  return balances.filter((balance) => balance.valueUsd >= minValue);
}
