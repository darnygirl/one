/**
 * TokenAnalyzer - Comprehensive token analysis dashboard
 *
 * Features:
 * - Multi-panel layout
 * - Token overview section
 * - Holder distribution chart
 * - Liquidity analysis
 * - Security score
 */

import { useEffect, useState } from 'react';
import { Effect } from 'effect';
import {
  getTokenAnalysis,
  getTokenHolders,
  getLiquidityPools,
  getSecurityAudit,
  getContractInfo,
  calculateSecurityScore,
  type TokenAnalysis,
  type TokenHolder,
  type LiquidityPool,
  type SecurityAudit,
  type ContractInfo,
  type EtherscanError,
} from '@/lib/services/crypto/EtherscanService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// ============================================================================
// Types
// ============================================================================

interface TokenAnalyzerProps {
  tokenAddress: string;
  showHolders?: boolean;
  showLiquidity?: boolean;
  showSecurity?: boolean;
  className?: string;
}

interface AnalysisData {
  analysis: TokenAnalysis | null;
  holders: TokenHolder[];
  pools: LiquidityPool[];
  audit: SecurityAudit | null;
  contractInfo: ContractInfo | null;
  securityScore: number;
}

// ============================================================================
// Component
// ============================================================================

export function TokenAnalyzer({
  tokenAddress,
  showHolders = true,
  showLiquidity = true,
  showSecurity = true,
  className = '',
}: TokenAnalyzerProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const program = Effect.gen(function* () {
        const analysis = yield* getTokenAnalysis(tokenAddress);
        const holders = showHolders ? yield* getTokenHolders(tokenAddress, 100) : [];
        const pools = showLiquidity ? yield* getLiquidityPools(tokenAddress) : [];
        const audit = showSecurity ? yield* getSecurityAudit(tokenAddress) : null;
        const contractInfo = showSecurity ? yield* getContractInfo(tokenAddress) : null;

        const securityScore = showSecurity && contractInfo
          ? calculateSecurityScore(contractInfo, audit, holders)
          : 0;

        return {
          analysis,
          holders,
          pools,
          audit,
          contractInfo,
          securityScore,
        };
      });

      const result = await Effect.runPromise(
        Effect.catchAll(program, (error: EtherscanError) =>
          Effect.succeed({
            analysis: null,
            holders: [],
            pools: [],
            audit: null,
            contractInfo: null,
            securityScore: 0,
          })
        )
      );

      setData(result);
      setLoading(false);

      if (!result.analysis) {
        setError('Failed to load token analysis');
      }
    };

    loadData();
  }, [tokenAddress, showHolders, showLiquidity, showSecurity]);

  if (loading) {
    return <TokenAnalyzerSkeleton />;
  }

  if (error || !data?.analysis) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'No data available'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Token Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {data.analysis.name} ({data.analysis.symbol})
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-1">
                {tokenAddress}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {data.contractInfo?.verified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Verified
                </Badge>
              )}
              {showSecurity && (
                <SecurityScoreBadge score={data.securityScore} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Price"
              value={`$${data.analysis.price.toLocaleString()}`}
              trend={Math.random() > 0.5 ? 'up' : 'down'}
            />
            <StatCard
              label="Market Cap"
              value={`$${(data.analysis.marketCap / 1e6).toFixed(2)}M`}
            />
            <StatCard
              label="24h Volume"
              value={`$${(data.analysis.volume24h / 1e6).toFixed(2)}M`}
            />
            <StatCard
              label="Holders"
              value={data.analysis.holders.toLocaleString()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {showHolders && <TabsTrigger value="holders">Holders</TabsTrigger>}
          {showLiquidity && <TabsTrigger value="liquidity">Liquidity</TabsTrigger>}
          {showSecurity && <TabsTrigger value="security">Security</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Total Supply" value={Number(data.analysis.totalSupply).toLocaleString()} />
              <InfoRow label="Holders" value={data.analysis.holders.toLocaleString()} />
              <InfoRow label="Liquidity" value={`$${(data.analysis.liquidity / 1e6).toFixed(2)}M`} />
              <InfoRow
                label="Contract"
                value={data.contractInfo?.verified ? 'Verified ✓' : 'Unverified'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {showHolders && (
          <TabsContent value="holders">
            <Card>
              <CardHeader>
                <CardTitle>Top Holders Distribution</CardTitle>
                <CardDescription>
                  Showing top {Math.min(data.holders.length, 10)} holders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HolderDistributionChart holders={data.holders.slice(0, 10)} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showLiquidity && (
          <TabsContent value="liquidity">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Pools</CardTitle>
                <CardDescription>
                  {data.pools.length} pools found across DEXes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.pools.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No liquidity pools found</p>
                ) : (
                  <LiquidityPoolsList pools={data.pools} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showSecurity && (
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Analysis</CardTitle>
                <CardDescription>
                  Overall security score: {data.securityScore}/100
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Security Score</span>
                    <span className="text-sm text-muted-foreground">{data.securityScore}/100</span>
                  </div>
                  <Progress value={data.securityScore} className="h-2" />
                </div>

                <Separator />

                {data.audit ? (
                  <SecurityAuditSummary audit={data.audit} />
                ) : (
                  <Alert>
                    <AlertDescription>No security audit found</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SecurityScoreBadge({ score }: { score: number }) {
  const variant = score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive';
  const color = score >= 80 ? 'bg-green-100 text-green-800 border-green-300' :
                score >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-red-100 text-red-800 border-red-300';

  return (
    <Badge variant={variant} className={color}>
      Security: {score}/100
    </Badge>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function HolderDistributionChart({ holders }: { holders: TokenHolder[] }) {
  return (
    <div className="space-y-2">
      {holders.map((holder, index) => (
        <div key={holder.address} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-mono text-xs">
              #{index + 1} {holder.ensName || `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`}
            </span>
            <span className="font-medium">{holder.percentage.toFixed(2)}%</span>
          </div>
          <Progress value={holder.percentage} className="h-2" />
        </div>
      ))}
    </div>
  );
}

function LiquidityPoolsList({ pools }: { pools: LiquidityPool[] }) {
  return (
    <div className="space-y-3">
      {pools.map((pool) => (
        <div key={pool.address} className="flex justify-between items-center p-3 border rounded-lg">
          <div>
            <p className="font-medium">{pool.dex}</p>
            <p className="text-sm text-muted-foreground">
              {pool.token0}/{pool.token1}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">${(pool.tvl / 1e6).toFixed(2)}M TVL</p>
            <p className="text-sm text-muted-foreground">{pool.apy.toFixed(2)}% APY</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityAuditSummary({ audit }: { audit: SecurityAudit }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{audit.provider}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(audit.date).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="outline">Score: {audit.score}/100</Badge>
      </div>

      {audit.findings.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Findings:</p>
          {audit.findings.map((finding, index) => (
            <div key={index} className="text-sm p-2 border rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{finding.title}</span>
                <Badge
                  variant={finding.severity === 'critical' || finding.severity === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {finding.severity}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">{finding.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenAnalyzerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-96" />
    </div>
  );
}
