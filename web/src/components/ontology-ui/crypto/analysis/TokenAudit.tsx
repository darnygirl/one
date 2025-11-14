/**
 * TokenAudit - Security audit display
 *
 * Features:
 * - Certik, Slowmist, Hacken audits
 * - Audit score and badges
 * - Findings summary
 * - Download audit PDF
 * - Contract verification status
 */

import { useEffect, useState } from 'react';
import { Effect } from 'effect';
import {
  getSecurityAudit,
  getContractInfo,
  type SecurityAudit,
  type ContractInfo,
  type EtherscanError,
} from '@/lib/services/crypto/EtherscanService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// ============================================================================
// Types
// ============================================================================

interface TokenAuditProps {
  tokenAddress: string;
  showContractInfo?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TokenAudit({
  tokenAddress,
  showContractInfo = true,
  className = '',
}: TokenAuditProps) {
  const [audit, setAudit] = useState<SecurityAudit | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const program = Effect.gen(function* () {
        const auditResult = yield* getSecurityAudit(tokenAddress);
        const contractResult = showContractInfo
          ? yield* getContractInfo(tokenAddress)
          : null;

        return { audit: auditResult, contract: contractResult };
      });

      const result = await Effect.runPromise(
        Effect.catchAll(program, (error: EtherscanError) => {
          setError(error._tag);
          return Effect.succeed({ audit: null, contract: null });
        })
      );

      setAudit(result.audit);
      setContractInfo(result.contract);
      setLoading(false);
    };

    loadData();
  }, [tokenAddress, showContractInfo]);

  if (loading) {
    return <TokenAuditSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load audit data: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contract Verification */}
      {showContractInfo && contractInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Verification</CardTitle>
            <CardDescription>Smart contract verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <ContractVerificationCard contract={contractInfo} />
          </CardContent>
        </Card>
      )}

      {/* Security Audit */}
      {audit ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Security Audit</CardTitle>
                <CardDescription>
                  Audited by {audit.provider} on {new Date(audit.date).toLocaleDateString()}
                </CardDescription>
              </div>
              <AuditScoreBadge score={audit.score} verified={audit.verified} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuditScoreSection score={audit.score} />
            <Separator />
            <AuditFindingsSection findings={audit.findings} />
            {audit.pdfUrl && (
              <>
                <Separator />
                <Button variant="outline" className="w-full" asChild>
                  <a href={audit.pdfUrl} target="_blank" rel="noopener noreferrer">
                    📄 Download Full Audit Report (PDF)
                  </a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertDescription>
            No security audit found for this token. Consider conducting an audit before investing.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityRecommendations
            hasAudit={!!audit}
            isVerified={contractInfo?.verified || false}
            auditScore={audit?.score || 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function AuditScoreBadge({ score, verified }: { score: number; verified: boolean }) {
  const variant =
    score >= 90 ? 'default' :
    score >= 70 ? 'secondary' :
    'destructive';

  const colorClass =
    score >= 90 ? 'bg-green-100 text-green-800 border-green-300' :
    score >= 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
    'bg-red-100 text-red-800 border-red-300';

  return (
    <div className="flex flex-col items-end gap-2">
      <Badge variant={variant} className={`${colorClass} text-lg px-4 py-1`}>
        {score}/100
      </Badge>
      {verified && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          ✓ Verified Audit
        </Badge>
      )}
    </div>
  );
}

function AuditScoreSection({ score }: { score: number }) {
  const scoreLabel =
    score >= 90 ? 'Excellent' :
    score >= 80 ? 'Good' :
    score >= 70 ? 'Fair' :
    score >= 60 ? 'Poor' :
    'Critical';

  const scoreColor =
    score >= 90 ? 'text-green-600' :
    score >= 80 ? 'text-lime-600' :
    score >= 70 ? 'text-yellow-600' :
    score >= 60 ? 'text-orange-600' :
    'text-red-600';

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Overall Security Score</h3>
        <span className={`text-xl font-bold ${scoreColor}`}>
          {scoreLabel}
        </span>
      </div>
      <Progress value={score} className="h-3" />
      <p className="text-sm text-muted-foreground">
        {score >= 90 && 'This token has passed rigorous security standards with flying colors.'}
        {score >= 70 && score < 90 && 'This token has acceptable security but may have minor issues.'}
        {score >= 50 && score < 70 && 'This token has moderate security concerns that should be reviewed.'}
        {score < 50 && 'This token has significant security issues. Exercise extreme caution.'}
      </p>
    </div>
  );
}

function AuditFindingsSection({ findings }: { findings: any[] }) {
  const severityCounts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    informational: findings.filter((f) => f.severity === 'informational').length,
  };

  const openFindings = findings.filter((f) => f.status === 'open').length;
  const resolvedFindings = findings.filter((f) => f.status === 'resolved').length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Findings Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Total Findings</span>
            <span className="font-bold">{findings.length}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Open Issues</span>
            <span className="font-bold text-orange-600">{openFindings}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Resolved</span>
            <span className="font-bold text-green-600">{resolvedFindings}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Critical/High</span>
            <span className="font-bold text-red-600">
              {severityCounts.critical + severityCounts.high}
            </span>
          </div>
        </div>
      </div>

      {findings.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Detailed Findings</h3>
          <div className="space-y-2">
            {findings.map((finding, index) => (
              <FindingCard key={index} finding={finding} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: any }) {
  const severityColor = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    informational: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{finding.title}</h4>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={`text-xs ${severityColor[finding.severity as keyof typeof severityColor]}`}
          >
            {finding.severity}
          </Badge>
          <Badge variant={finding.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
            {finding.status === 'resolved' ? '✓ Resolved' : '⚠️ Open'}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{finding.description}</p>
    </div>
  );
}

function ContractVerificationCard({ contract }: { contract: ContractInfo }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div>
          <p className="font-medium">Verification Status</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
          </p>
        </div>
        <Badge
          variant={contract.verified ? 'default' : 'destructive'}
          className={contract.verified ? 'bg-green-100 text-green-800 border-green-300' : ''}
        >
          {contract.verified ? '✓ Verified' : '✗ Unverified'}
        </Badge>
      </div>

      {contract.verified && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {contract.contractName && (
            <div>
              <p className="text-muted-foreground mb-1">Contract Name</p>
              <p className="font-medium">{contract.contractName}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground mb-1">Compiler Version</p>
            <p className="font-medium font-mono text-xs">{contract.compiler}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityRecommendations({
  hasAudit,
  isVerified,
  auditScore,
}: {
  hasAudit: boolean;
  isVerified: boolean;
  auditScore: number;
}) {
  const recommendations = [];

  if (!hasAudit) {
    recommendations.push({
      icon: '⚠️',
      text: 'No security audit found - Consider waiting for an audit before investing',
      severity: 'high',
    });
  }

  if (!isVerified) {
    recommendations.push({
      icon: '⚠️',
      text: 'Contract is not verified - Source code cannot be reviewed',
      severity: 'high',
    });
  }

  if (hasAudit && auditScore < 70) {
    recommendations.push({
      icon: '⚠️',
      text: 'Low audit score - Review audit findings carefully before investing',
      severity: 'high',
    });
  }

  if (hasAudit && auditScore >= 70 && isVerified) {
    recommendations.push({
      icon: '✓',
      text: 'Contract is verified and audited - Basic security checks passed',
      severity: 'low',
    });
  }

  recommendations.push({
    icon: 'ℹ️',
    text: 'Always do your own research (DYOR) before investing in any token',
    severity: 'info',
  });

  return (
    <div className="space-y-2">
      {recommendations.map((rec, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 p-3 rounded-lg ${
            rec.severity === 'high' ? 'bg-red-50 border border-red-200' :
            rec.severity === 'low' ? 'bg-green-50 border border-green-200' :
            'bg-blue-50 border border-blue-200'
          }`}
        >
          <span className="text-lg">{rec.icon}</span>
          <p className="text-sm flex-1">{rec.text}</p>
        </div>
      ))}
    </div>
  );
}

function TokenAuditSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    </div>
  );
}
