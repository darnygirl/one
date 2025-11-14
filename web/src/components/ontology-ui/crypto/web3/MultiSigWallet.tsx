/**
 * Multi-Sig Wallet Component (Cycle 99)
 *
 * Multi-signature wallet with:
 * - Create multi-sig wallet (2-of-3, 3-of-5, etc.)
 * - Add/remove signers
 * - Propose transaction
 * - Sign transaction
 * - Execute when threshold met
 * - Pending transactions list
 * - Signature status tracking
 */

import { useState } from "react";
import { Effect } from "effect";
import {
  createMultiSig,
  proposeTransaction,
  signTransaction,
  executeTransaction,
  type MultiSigWallet as MultiSigWalletType,
  type MultiSigTransaction,
} from "@/lib/services/crypto/Web3Service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface MultiSigWalletProps {
  userAddress?: string;
  onWalletCreated?: (wallet: MultiSigWalletType) => void;
  onTransactionExecuted?: (txHash: string) => void;
}

export function MultiSigWallet({
  userAddress = "0x1234567890abcdef1234567890abcdef12345678",
  onWalletCreated,
  onTransactionExecuted,
}: MultiSigWalletProps) {
  // Wallet creation
  const [owners, setOwners] = useState<string[]>([userAddress, "", ""]);
  const [threshold, setThreshold] = useState(2);
  const [wallet, setWallet] = useState<MultiSigWalletType | null>(null);

  // Transaction proposal
  const [proposalTo, setProposalTo] = useState("");
  const [proposalValue, setProposalValue] = useState("");
  const [proposalData, setProposalData] = useState("0x");

  // Transactions
  const [transactions, setTransactions] = useState<MultiSigTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateOwner = (index: number, address: string) => {
    const newOwners = [...owners];
    newOwners[index] = address;
    setOwners(newOwners);
  };

  const handleAddOwner = () => {
    setOwners([...owners, ""]);
  };

  const handleRemoveOwner = (index: number) => {
    if (owners.length > 1) {
      const newOwners = owners.filter((_, i) => i !== index);
      setOwners(newOwners);
      if (threshold > newOwners.length) {
        setThreshold(newOwners.length);
      }
    }
  };

  const handleCreateWallet = async () => {
    setError("");
    setLoading(true);

    try {
      const validOwners = owners.filter((o) => o.length === 42);

      if (validOwners.length === 0) {
        throw new Error("At least one valid owner required");
      }

      const newWallet = await Effect.runPromise(
        createMultiSig(validOwners, threshold)
      );

      setWallet(newWallet);
      onWalletCreated?.(newWallet);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeTransaction = async () => {
    if (!wallet) return;

    setError("");
    setLoading(true);

    try {
      const value = BigInt(parseFloat(proposalValue) * 1e18);
      const transaction = await Effect.runPromise(
        proposeTransaction(wallet, proposalTo, value, proposalData)
      );

      setTransactions([...transactions, transaction]);
      setProposalTo("");
      setProposalValue("");
      setProposalData("0x");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignTransaction = async (transaction: MultiSigTransaction) => {
    if (!wallet) return;

    setError("");
    setLoading(true);

    try {
      const signedTx = await Effect.runPromise(
        signTransaction(transaction, userAddress, wallet)
      );

      setTransactions(
        transactions.map((tx) =>
          tx.id === transaction.id ? signedTx : tx
        )
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTransaction = async (transaction: MultiSigTransaction) => {
    if (!wallet) return;

    setError("");
    setLoading(true);

    try {
      const result = await Effect.runPromise(
        executeTransaction(transaction, wallet)
      );

      if (result.success) {
        setTransactions(
          transactions.map((tx) =>
            tx.id === transaction.id ? { ...tx, executed: true } : tx
          )
        );
        onTransactionExecuted?.(String(result.data));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getSignatureProgress = (transaction: MultiSigTransaction) => {
    if (!wallet) return 0;
    return (transaction.signatures.length / wallet.threshold) * 100;
  };

  const canExecute = (transaction: MultiSigTransaction) => {
    if (!wallet) return false;
    return (
      transaction.signatures.length >= wallet.threshold &&
      !transaction.executed
    );
  };

  const hasUserSigned = (transaction: MultiSigTransaction) => {
    return transaction.signatures.some((sig) => sig.signer === userAddress);
  };

  return (
    <div className="space-y-4">
      {/* Wallet Creation */}
      {!wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Create Multi-Sig Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Wallet Owners</Label>
              <div className="space-y-2 mt-2">
                {owners.map((owner, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={owner}
                      onChange={(e) =>
                        handleUpdateOwner(index, e.target.value)
                      }
                      placeholder={`Owner ${index + 1} address (0x...)`}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleRemoveOwner(index)}
                      variant="ghost"
                      size="sm"
                      disabled={owners.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleAddOwner}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                + Add Owner
              </Button>
            </div>

            <div>
              <Label>Signature Threshold</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) =>
                    setThreshold(Math.min(parseInt(e.target.value) || 1, owners.length))
                  }
                  min={1}
                  max={owners.length}
                  className="w-24"
                />
                <div className="text-sm text-muted-foreground">
                  Require {threshold} of {owners.length} signatures
                </div>
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleCreateWallet}
              disabled={loading || owners.filter((o) => o.length === 42).length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? "Creating..." : "Create Multi-Sig Wallet"}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wallet Dashboard */}
      {wallet && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Multi-Sig Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Wallet Address
                  </div>
                  <div className="font-mono text-sm">{wallet.address}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Owners
                    </div>
                    <div className="text-lg font-bold">{wallet.owners.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Threshold
                    </div>
                    <div className="text-lg font-bold">{wallet.threshold}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Signers
                  </div>
                  <div className="space-y-1">
                    {wallet.owners.map((owner, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono">{owner}</span>
                        {owner === userAddress && (
                          <Badge variant="outline">You</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Propose Transaction */}
          <Card>
            <CardHeader>
              <CardTitle>Propose Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipient Address</Label>
                <Input
                  value={proposalTo}
                  onChange={(e) => setProposalTo(e.target.value)}
                  placeholder="0x..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Amount (ETH)</Label>
                <Input
                  type="number"
                  value={proposalValue}
                  onChange={(e) => setProposalValue(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Data (Optional)</Label>
                <Input
                  value={proposalData}
                  onChange={(e) => setProposalData(e.target.value)}
                  placeholder="0x..."
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleProposeTransaction}
                disabled={loading || !proposalTo || !proposalValue}
                className="w-full"
              >
                {loading ? "Proposing..." : "Propose Transaction"}
              </Button>
            </CardContent>
          </Card>

          {/* Pending Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>
                Transactions ({transactions.filter((tx) => !tx.executed).length}{" "}
                pending)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No transactions proposed
                </div>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-mono">
                            {transaction.id}
                          </div>
                          {transaction.executed ? (
                            <Badge variant="default">EXECUTED</Badge>
                          ) : (
                            <Badge variant="outline">
                              {transaction.signatures.length}/{wallet.threshold}{" "}
                              signatures
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-mono">{transaction.to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Value:
                            </span>
                            <span className="font-semibold">
                              {(Number(transaction.value) / 1e18).toFixed(4)} ETH
                            </span>
                          </div>
                        </div>

                        {!transaction.executed && (
                          <>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">
                                  Signature Progress
                                </span>
                                <span>
                                  {transaction.signatures.length}/
                                  {wallet.threshold}
                                </span>
                              </div>
                              <Progress
                                value={getSignatureProgress(transaction)}
                              />
                            </div>

                            {transaction.signatures.length > 0 && (
                              <div>
                                <div className="text-sm text-muted-foreground mb-2">
                                  Signatures:
                                </div>
                                <div className="space-y-1">
                                  {transaction.signatures.map((sig, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between text-xs"
                                    >
                                      <span className="font-mono">
                                        {sig.signer.slice(0, 10)}...
                                      </span>
                                      <span className="text-muted-foreground">
                                        {sig.timestamp.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {!hasUserSigned(transaction) && (
                                <Button
                                  onClick={() =>
                                    handleSignTransaction(transaction)
                                  }
                                  disabled={loading}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Sign
                                </Button>
                              )}

                              {canExecute(transaction) && (
                                <Button
                                  onClick={() =>
                                    handleExecuteTransaction(transaction)
                                  }
                                  disabled={loading}
                                  className="flex-1"
                                >
                                  Execute
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
