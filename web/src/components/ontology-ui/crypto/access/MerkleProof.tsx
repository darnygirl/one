/**
 * Merkle Proof Component (Cycle 95)
 *
 * Verify merkle proof for claims and whitelist
 * - Address verification
 * - Proof generation
 * - Tree visualization
 * - Verification status
 * - Export proof data
 * - Batch verification
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  GitBranch,
  Download,
  Upload,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Effect } from "effect";
import {
  createMerkleTree,
  generateMerkleProof,
  verifyMerkleProof,
  MerkleTree,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface MerkleProofProps {
  /** Initial addresses for tree */
  addresses?: string[];
  /** Merkle root (if verifying existing tree) */
  merkleRoot?: string;
  /** Callback when proof is generated */
  onProofGenerated?: (proof: string[], address: string) => void;
  /** Callback when proof is verified */
  onProofVerified?: (valid: boolean, address: string) => void;
}

export function MerkleProof({
  addresses: initialAddresses = [],
  merkleRoot: initialRoot,
  onProofGenerated,
  onProofVerified,
}: MerkleProofProps) {
  const [addresses, setAddresses] = useState<string[]>(initialAddresses);
  const [merkleRoot, setMerkleRoot] = useState<string>(initialRoot || "");
  const [tree, setTree] = useState<MerkleTree | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AccessControlError | null>(null);

  // Generate proof state
  const [addressToProve, setAddressToProve] = useState("");
  const [generatedProof, setGeneratedProof] = useState<string[]>([]);

  // Verify proof state
  const [verifyAddress, setVerifyAddress] = useState("");
  const [verifyProofInput, setVerifyProofInput] = useState("");
  const [verifyRootInput, setVerifyRootInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  // Batch verify state
  const [batchAddresses, setBatchAddresses] = useState("");
  const [batchResults, setBatchResults] = useState<Record<string, boolean>>({});

  const handleCreateTree = async () => {
    if (addresses.length === 0) {
      setError({ _tag: "InvalidMerkleTree", reason: "No addresses provided" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Effect.runPromise(createMerkleTree(addresses));
      setTree(result.tree);
      setMerkleRoot(result.root);
    } catch (err) {
      setError(err as AccessControlError);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!tree || !addressToProve) return;

    setLoading(true);
    setError(null);

    try {
      const proof = await Effect.runPromise(generateMerkleProof(tree, addressToProve));
      setGeneratedProof(proof);
      onProofGenerated?.(proof, addressToProve);
    } catch (err) {
      setError(err as AccessControlError);
      setGeneratedProof([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!verifyAddress || !verifyProofInput || !verifyRootInput) return;

    setLoading(true);
    setError(null);

    try {
      const proof = JSON.parse(verifyProofInput);
      const isValid = await Effect.runPromise(
        verifyMerkleProof(verifyAddress, proof, verifyRootInput)
      );
      setVerificationResult(isValid);
      onProofVerified?.(isValid, verifyAddress);
    } catch (err) {
      setError(err as AccessControlError);
      setVerificationResult(false);
      onProofVerified?.(false, verifyAddress);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerify = async () => {
    if (!tree || !batchAddresses) return;

    setLoading(true);
    setError(null);

    try {
      const addressList = batchAddresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter(Boolean);

      const results: Record<string, boolean> = {};

      for (const address of addressList) {
        try {
          const proof = tree.getProof(address);
          const isValid = tree.verify(address, proof, merkleRoot);
          results[address] = isValid;
        } catch {
          results[address] = false;
        }
      }

      setBatchResults(results);
    } catch (err) {
      setError(err as AccessControlError);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = (address: string) => {
    if (address && !addresses.includes(address)) {
      setAddresses([...addresses, address]);
    }
  };

  const handleCopyProof = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedProof, null, 2));
  };

  const handleExportTree = () => {
    const data = {
      root: merkleRoot,
      addresses,
      timestamp: Date.now(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merkle-tree-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Tree</TabsTrigger>
          <TabsTrigger value="generate">Generate Proof</TabsTrigger>
          <TabsTrigger value="verify">Verify Proof</TabsTrigger>
        </TabsList>

        {/* Create Tree Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                <CardTitle>Create Merkle Tree</CardTitle>
              </div>
              <CardDescription>
                Build a merkle tree from a list of addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addresses">Addresses</Label>
                <Textarea
                  id="addresses"
                  placeholder="0x123...&#10;0x456...&#10;0x789..."
                  rows={6}
                  value={addresses.join("\n")}
                  onChange={(e) =>
                    setAddresses(
                      e.target.value
                        .split("\n")
                        .map((addr) => addr.trim())
                        .filter(Boolean)
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  One address per line ({addresses.length} addresses)
                </p>
              </div>

              {merkleRoot && (
                <div className="space-y-2">
                  <Label>Merkle Root</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded break-all">
                      {merkleRoot}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(merkleRoot)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error._tag === "InvalidMerkleTree" && error.reason}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleCreateTree} disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Tree"}
              </Button>
              {merkleRoot && (
                <Button variant="outline" onClick={handleExportTree}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Generate Proof Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Merkle Proof</CardTitle>
              <CardDescription>
                Generate proof for a specific address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!tree && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Create a merkle tree first to generate proofs
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="proveAddress">Address</Label>
                <Input
                  id="proveAddress"
                  placeholder="0x..."
                  value={addressToProve}
                  onChange={(e) => setAddressToProve(e.target.value)}
                  disabled={!tree}
                />
              </div>

              {generatedProof.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Proof</Label>
                    <Button variant="ghost" size="sm" onClick={handleCopyProof}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(generatedProof, null, 2)}
                  </pre>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {generatedProof.length} proof elements
                  </Badge>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error._tag === "NotWhitelisted" &&
                      `Address ${error.address} not found in tree`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateProof}
                disabled={loading || !tree || !addressToProve}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate Proof"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Verify Proof Tab */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verify Merkle Proof</CardTitle>
              <CardDescription>
                Verify a proof against a merkle root
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verifyAddress">Address</Label>
                <Input
                  id="verifyAddress"
                  placeholder="0x..."
                  value={verifyAddress}
                  onChange={(e) => setVerifyAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyProof">Proof (JSON array)</Label>
                <Textarea
                  id="verifyProof"
                  placeholder='["0x123...", "0x456..."]'
                  rows={4}
                  value={verifyProofInput}
                  onChange={(e) => setVerifyProofInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyRoot">Merkle Root</Label>
                <Input
                  id="verifyRoot"
                  placeholder="0x..."
                  value={verifyRootInput}
                  onChange={(e) => setVerifyRootInput(e.target.value)}
                />
              </div>

              {verificationResult !== null && (
                <Alert
                  className={
                    verificationResult
                      ? "border-green-300 bg-green-100 dark:bg-green-950/40"
                      : "border-red-300"
                  }
                >
                  {verificationResult ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      verificationResult
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    }
                  >
                    {verificationResult
                      ? "Proof is valid! Address is in the merkle tree."
                      : "Proof is invalid! Address is not in the merkle tree."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleVerifyProof}
                disabled={
                  loading || !verifyAddress || !verifyProofInput || !verifyRootInput
                }
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Proof"}
              </Button>
            </CardFooter>
          </Card>

          {/* Batch Verify */}
          {tree && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Verification</CardTitle>
                <CardDescription>
                  Verify multiple addresses at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchAddresses">Addresses</Label>
                  <Textarea
                    id="batchAddresses"
                    placeholder="0x123...&#10;0x456..."
                    rows={6}
                    value={batchAddresses}
                    onChange={(e) => setBatchAddresses(e.target.value)}
                  />
                </div>

                {Object.keys(batchResults).length > 0 && (
                  <div className="space-y-2">
                    <Label>Results</Label>
                    <div className="space-y-1 max-h-64 overflow-auto">
                      {Object.entries(batchResults).map(([address, valid]) => (
                        <div
                          key={address}
                          className="flex items-center justify-between p-2 border rounded text-sm"
                        >
                          <code className="text-xs">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </code>
                          {valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleBatchVerify}
                  disabled={loading || !batchAddresses}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Batch Verify"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
