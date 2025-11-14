/**
 * TokenContract - Contract verification display
 *
 * Features:
 * - Contract address with link
 * - Verified checkmark
 * - Source code viewer
 * - ABI viewer
 * - Compiler version
 * - Constructor arguments
 */

import { useEffect, useState } from 'react';
import { Effect } from 'effect';
import {
  getContractInfo,
  type ContractInfo,
  type EtherscanError,
} from '@/lib/services/crypto/EtherscanService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// ============================================================================
// Types
// ============================================================================

interface TokenContractProps {
  contractAddress: string;
  showSourceCode?: boolean;
  showABI?: boolean;
  className?: string;
}

type TabValue = 'overview' | 'source' | 'abi' | 'constructor';

// ============================================================================
// Component
// ============================================================================

export function TokenContract({
  contractAddress,
  showSourceCode = true,
  showABI = true,
  className = '',
}: TokenContractProps) {
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  useEffect(() => {
    const loadContract = async () => {
      setLoading(true);
      setError(null);

      const program = getContractInfo(contractAddress);

      const result = await Effect.runPromise(
        Effect.catchAll(program, (error: EtherscanError) => {
          setError(error._tag);
          return Effect.succeed(null);
        })
      );

      setContract(result);
      setLoading(false);
    };

    loadContract();
  }, [contractAddress]);

  if (loading) {
    return <TokenContractSkeleton />;
  }

  if (error || !contract) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load contract information: {error || 'Contract not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contract Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle>{contract.contractName || 'Smart Contract'}</CardTitle>
                {contract.verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CardDescription className="font-mono text-sm">
                  {contractAddress}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contractAddress)}
                >
                  📋
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://etherscan.io/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Compiler Version</p>
              <p className="font-mono font-medium">{contract.compiler}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Verification Status</p>
              <p className="font-medium">
                {contract.verified ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-red-600">✗ Not Verified</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details Tabs */}
      {contract.verified && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {showSourceCode && <TabsTrigger value="source">Source Code</TabsTrigger>}
            {showABI && <TabsTrigger value="abi">ABI</TabsTrigger>}
            <TabsTrigger value="constructor">Constructor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Contract Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContractOverview contract={contract} />
              </CardContent>
            </Card>
          </TabsContent>

          {showSourceCode && contract.sourceCode && (
            <TabsContent value="source">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Source Code</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(contract.sourceCode || '')}
                    >
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <SourceCodeViewer code={contract.sourceCode} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {showABI && contract.abi && (
            <TabsContent value="abi">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Contract ABI</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(contract.abi || '')}
                    >
                      Copy ABI
                    </Button>
                  </div>
                  <CardDescription>Application Binary Interface</CardDescription>
                </CardHeader>
                <CardContent>
                  <ABIViewer abi={contract.abi} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="constructor">
            <Card>
              <CardHeader>
                <CardTitle>Constructor Arguments</CardTitle>
                <CardDescription>
                  Arguments used when deploying the contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConstructorArgs args={contract.constructorArgs} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!contract.verified && (
        <Alert>
          <AlertDescription>
            This contract is not verified. The source code, ABI, and constructor arguments are
            not publicly available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ContractOverview({ contract }: { contract: ContractInfo }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Contract Name" value={contract.contractName || 'N/A'} />
        <InfoCard label="Compiler Version" value={contract.compiler} mono />
        <InfoCard
          label="Verification"
          value={contract.verified ? 'Verified ✓' : 'Not Verified ✗'}
        />
        <InfoCard
          label="Source Available"
          value={contract.sourceCode ? 'Yes' : 'No'}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Contract Address</h4>
        <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm break-all">
          {contract.address}
        </div>
      </div>

      {contract.verified && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Verification Details</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Source code matches deployed bytecode</li>
              <li>✓ Compilation settings verified</li>
              <li>✓ Constructor arguments validated</li>
              <li>✓ Contract is publicly auditable</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 border rounded-lg">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`font-medium ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  );
}

function SourceCodeViewer({ code }: { code: string }) {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <pre className="bg-muted/50 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
          <code className="language-solidity">{code}</code>
        </pre>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {lineNumbers.length} lines • Solidity
      </div>
    </div>
  );
}

function ABIViewer({ abi }: { abi: string }) {
  const [formatted, setFormatted] = useState<string>('');
  const [view, setView] = useState<'formatted' | 'raw'>('formatted');

  useEffect(() => {
    try {
      const parsed = JSON.parse(abi);
      setFormatted(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setFormatted('Invalid ABI format');
    }
  }, [abi]);

  const functions = (() => {
    try {
      const parsed = JSON.parse(abi);
      return parsed.filter((item: any) => item.type === 'function');
    } catch {
      return [];
    }
  })();

  const events = (() => {
    try {
      const parsed = JSON.parse(abi);
      return parsed.filter((item: any) => item.type === 'event');
    } catch {
      return [];
    }
  })();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={view === 'formatted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('formatted')}
        >
          Formatted
        </Button>
        <Button
          variant={view === 'raw' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('raw')}
        >
          Raw JSON
        </Button>
      </div>

      {view === 'formatted' ? (
        <div className="space-y-4">
          {functions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Functions ({functions.length})</h4>
              <div className="space-y-2">
                {functions.slice(0, 10).map((fn: any, i: number) => (
                  <div key={i} className="p-2 border rounded text-sm font-mono">
                    <span className="text-blue-600">{fn.name}</span>(
                    {fn.inputs?.map((input: any) => input.type).join(', ') || ''}
                    )
                  </div>
                ))}
                {functions.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {functions.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Events ({events.length})</h4>
              <div className="space-y-2">
                {events.slice(0, 5).map((evt: any, i: number) => (
                  <div key={i} className="p-2 border rounded text-sm font-mono">
                    <span className="text-purple-600">{evt.name}</span>(
                    {evt.inputs?.map((input: any) => input.type).join(', ') || ''}
                    )
                  </div>
                ))}
                {events.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {events.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <pre className="bg-muted/50 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
          {formatted}
        </pre>
      )}
    </div>
  );
}

function ConstructorArgs({ args }: { args?: string }) {
  if (!args) {
    return (
      <Alert>
        <AlertDescription>No constructor arguments found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Raw Arguments (ABI-encoded)</p>
        <pre className="font-mono text-xs break-all whitespace-pre-wrap">{args}</pre>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Constructor arguments are ABI-encoded and passed during contract deployment.</p>
        <p className="mt-2">
          To decode these arguments, you need the contract's constructor signature from the source
          code.
        </p>
      </div>
    </div>
  );
}

function TokenContractSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-96" />
    </div>
  );
}
