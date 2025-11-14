/**
 * TokenSocials - Social and info links for tokens
 *
 * Features:
 * - Website and whitepaper links
 * - Social media (Twitter, Discord, Telegram)
 * - Code repositories (GitHub, GitLab)
 * - Block explorers (Etherscan, etc.)
 * - Community stats (followers, subscribers)
 */

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Globe,
  FileText,
  Twitter,
  MessageCircle,
  Users,
  Github,
  Search,
  TrendingUp,
} from "lucide-react";
import type { TokenSocials as TokenSocialsType } from "@/lib/services/CryptoService";
import { formatLargeNumber } from "@/lib/services/CryptoService";

export interface TokenSocialsProps {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  initialSocials?: TokenSocialsType & {
    community_data?: {
      twitter_followers: number;
      telegram_channel_user_count: number;
      reddit_subscribers: number;
    };
    developer_data?: {
      forks: number;
      stars: number;
      subscribers: number;
    };
  };
}

export function TokenSocials({
  tokenId,
  tokenName,
  tokenSymbol,
  initialSocials,
}: TokenSocialsProps) {
  const [socials, setSocials] = useState<typeof initialSocials | null>(
    initialSocials || null
  );
  const [loading, setLoading] = useState(!initialSocials);
  const [error, setError] = useState<string | null>(null);

  // Fetch token socials
  const fetchSocials = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch token socials");
      }

      const data = await response.json();

      setSocials({
        homepage: data.links.homepage.filter((url: string) => url),
        whitepaper: data.links.whitepaper,
        blockchain_site: data.links.blockchain_site.filter((url: string) => url),
        official_forum_url: data.links.official_forum_url.filter(
          (url: string) => url
        ),
        chat_url: data.links.chat_url.filter((url: string) => url),
        announcement_url: data.links.announcement_url.filter((url: string) => url),
        twitter_screen_name: data.links.twitter_screen_name,
        facebook_username: data.links.facebook_username,
        telegram_channel_identifier: data.links.telegram_channel_identifier,
        subreddit_url: data.links.subreddit_url,
        repos_url: data.links.repos_url,
        community_data: data.community_data,
        developer_data: data.developer_data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSocials) {
      fetchSocials();
    }
  }, [tokenId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !socials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Socials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error || "No socials available"}</p>
        </CardContent>
      </Card>
    );
  }

  const LinkButton = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => (
    <Button
      variant="outline"
      className="w-full justify-start"
      asChild
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
        <span className="ml-2">{label}</span>
        <ExternalLink className="ml-auto h-4 w-4" />
      </a>
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Links & Community
        </CardTitle>
        <CardDescription>
          {tokenName} ({tokenSymbol.toUpperCase()})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Official Links */}
        {(socials.homepage.length > 0 || socials.whitepaper) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Official</h4>
            </div>

            {socials.homepage[0] && (
              <LinkButton
                href={socials.homepage[0]}
                icon={<Globe className="h-4 w-4" />}
                label="Website"
              />
            )}

            {socials.whitepaper && (
              <LinkButton
                href={socials.whitepaper}
                icon={<FileText className="h-4 w-4" />}
                label="Whitepaper"
              />
            )}
          </div>
        )}

        {/* Social Media */}
        {(socials.twitter_screen_name ||
          socials.telegram_channel_identifier ||
          socials.subreddit_url) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Social Media</h4>
              </div>

              {socials.twitter_screen_name && (
                <LinkButton
                  href={`https://twitter.com/${socials.twitter_screen_name}`}
                  icon={<Twitter className="h-4 w-4" />}
                  label={`Twitter ${
                    socials.community_data?.twitter_followers
                      ? `(${formatLargeNumber(
                          socials.community_data.twitter_followers
                        )} followers)`
                      : ""
                  }`}
                />
              )}

              {socials.telegram_channel_identifier && (
                <LinkButton
                  href={`https://t.me/${socials.telegram_channel_identifier}`}
                  icon={<MessageCircle className="h-4 w-4" />}
                  label={`Telegram ${
                    socials.community_data?.telegram_channel_user_count
                      ? `(${formatLargeNumber(
                          socials.community_data.telegram_channel_user_count
                        )} members)`
                      : ""
                  }`}
                />
              )}

              {socials.subreddit_url && (
                <LinkButton
                  href={socials.subreddit_url}
                  icon={<MessageCircle className="h-4 w-4" />}
                  label={`Reddit ${
                    socials.community_data?.reddit_subscribers
                      ? `(${formatLargeNumber(
                          socials.community_data.reddit_subscribers
                        )} subscribers)`
                      : ""
                  }`}
                />
              )}

              {socials.chat_url.length > 0 && (
                <LinkButton
                  href={socials.chat_url[0]}
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Discord"
                />
              )}
            </div>
          </>
        )}

        {/* Development */}
        {socials.repos_url.github.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Github className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Development</h4>
              </div>

              {socials.repos_url.github[0] && (
                <LinkButton
                  href={socials.repos_url.github[0]}
                  icon={<Github className="h-4 w-4" />}
                  label={`GitHub ${
                    socials.developer_data?.stars
                      ? `(${formatLargeNumber(socials.developer_data.stars)} ⭐)`
                      : ""
                  }`}
                />
              )}
            </div>
          </>
        )}

        {/* Block Explorers */}
        {socials.blockchain_site.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Block Explorers</h4>
              </div>

              {socials.blockchain_site.slice(0, 3).map((url, index) => {
                const domain = new URL(url).hostname.replace("www.", "");
                return (
                  <LinkButton
                    key={index}
                    href={url}
                    icon={<Search className="h-4 w-4" />}
                    label={domain}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Community Stats */}
        {socials.community_data && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Community Stats</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {socials.community_data.twitter_followers > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Twitter Followers
                    </p>
                    <p className="text-lg font-bold">
                      {formatLargeNumber(socials.community_data.twitter_followers)}
                    </p>
                  </div>
                )}

                {socials.community_data.telegram_channel_user_count > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Telegram Members
                    </p>
                    <p className="text-lg font-bold">
                      {formatLargeNumber(
                        socials.community_data.telegram_channel_user_count
                      )}
                    </p>
                  </div>
                )}

                {socials.community_data.reddit_subscribers > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Reddit Subscribers
                    </p>
                    <p className="text-lg font-bold">
                      {formatLargeNumber(socials.community_data.reddit_subscribers)}
                    </p>
                  </div>
                )}

                {socials.developer_data?.stars && socials.developer_data.stars > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      GitHub Stars
                    </p>
                    <p className="text-lg font-bold">
                      {formatLargeNumber(socials.developer_data.stars)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
