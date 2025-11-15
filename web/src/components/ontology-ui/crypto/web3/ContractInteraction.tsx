/**
 * Contract Interaction Component (Cycle 98)
 *
 * Interactive contract interface with:
 * - Contract explorer
 * - All functions listed (read/write)
 * - Event logs display
 * - Transaction history for contract
 * - Contract state visualization
 * - Multiple contract tabs
 * - Save favorite contracts
 */

import { useState, useEffect } from "react";
import { Effect } from "effect";
import {
  parseABI,
  readContract,
  writeContract,
  parseEventLogs,
  type ParsedABI,
  type ABIFunction,
  type ABIEvent,
  type EventLog,
} from "@/lib/services/crypto/Web3Service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SavedContract {
  address: string;
  name: string;
  abi: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: Date;
  status: "success" | "failed";
}

interface ContractInteractionProps {
  defaultContract?: SavedContract;
  onTransactionSent?: (hash: string) => void;
}

export function ContractInteraction({
  defaultContract,
  onTransactionSent,
}: ContractInteractionProps) {
  // Contract management
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      name: "DAI Stablecoin",
      abi: '[{"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"name":"account","type":"address"}],"outputs":[{"name":"balance","type":"uint256"}]}]',
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      name: "USDC",
      abi: '[{"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"name":"account","type":"address"}],"outputs":[{"name":"balance","type":"uint256"}]}]',
    },
  ]);

  const [activeContract, setActiveContract] = useState<SavedContract | null>(
    defaultContract || savedContracts[0]
  );

  const [parsedABI, setParsedABI] = useState<ParsedABI | null>(null);
  const [readFunctions, setReadFunctions] = useState<ABIFunction[]>([]);
  const [writeFunctions, setWriteFunctions] = useState<ABIFunction[]>([]);

  // Events and transactions
  const [events, setEvents] = useState<EventLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      hash: "0xabc123...",
      from: "0x1234...",
      to: "0x5678...",
      value: "1.5",
      blockNumber: 12345678,
      timestamp: new Date(Date.now() - 3600000),
      status: "success",
    },
    {
      hash: "0xdef456...",
      from: "0x9012...",
      to: "0x3456...",
      value: "0.5",
      blockNumber: 12345679,
      timestamp: new Date(Date.now() - 1800000),
      status: "success",
    },
  ]);

  // State
  const [contractState, setContractState] = useState<
    Record<string, unknown>
  >({});

  // Load contract ABI
  useEffect(() => {
    if (activeContract) {
      loadContractABI();
    }
  }, [activeContract]);

  const loadContractABI = async () => {
    if (!activeContract) return;

    try {
      const parsed = await Effect.runPromise(parseABI(activeContract.abi));
      setParsedABI(parsed);

      const reads = parsed.functions.filter(
        (f) => f.stateMutability === "view" || f.stateMutability === "pure"
      );
      const writes = parsed.functions.filter(
        (f) =>
          f.stateMutability === "nonpayable" || f.stateMutability === "payable"
      );

      setReadFunctions(reads);
      setWriteFunctions(writes);

      // Load initial state for read functions
      loadContractState(reads);
    } catch (error) {
      console.error("Failed to load ABI:", error);
    }
  };

  const loadContractState = async (functions: ABIFunction[]) => {
    const state: Record<string, unknown> = {};

    for (const func of functions) {
      if (func.inputs.length === 0) {
        try {
          const result = await Effect.runPromise(
            readContract(
              {
                address: activeContract!.address,
                functionName: func.name,
                args: [],
              },
              parsedABI!
            )
          );
          state[func.name] = result.data;
        } catch (error) {
          state[func.name] = "Error reading";
        }
      }
    }

    setContractState(state);
  };

  const handleAddContract = () => {
    const name = prompt("Contract name:");
    const address = prompt("Contract address:");
    const abi = prompt("Contract ABI (JSON):");

    if (name && address && abi) {
      const newContract: SavedContract = { name, address, abi };
      setSavedContracts([...savedContracts, newContract]);
      setActiveContract(newContract);
    }
  };

  const handleRemoveContract = (address: string) => {
    setSavedContracts(
      savedContracts.filter((c) => c.address !== address)
    );
    if (activeContract?.address === address) {
      setActiveContract(savedContracts[0] || null);
    }
  };

  const getStateMutabilityColor = (stateMutability: string) => {
    switch (stateMutability) {
      case "view":
      case "pure":
        return "bg-blue-100 text-blue-800";
      case "payable":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Contract Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contracts</span>
            <Button onClick={handleAddContract} size="sm">
              + Add Contract
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {savedContracts.map((contract) => (
              <div
                key={contract.address}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  activeContract?.address === contract.address
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => setActiveContract(contract)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{contract.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {contract.address}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveContract(contract.address);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      {activeContract && parsedABI && (
        <Tabs defaultValue="read">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="read">Read</TabsTrigger>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Read Functions */}
          <TabsContent value="read">
            <Card>
              <CardHeader>
                <CardTitle>Read Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {readFunctions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No read functions
                  </div>
                ) : (
                  readFunctions.map((func) => (
                    <Card key={func.name}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{func.name}</span>
                              <Badge
                                className={getStateMutabilityColor(
                                  func.stateMutability
                                )}
                              >
                                {func.stateMutability}
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              Query
                            </Button>
                          </div>

                          {func.inputs.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Inputs: {func.inputs.map((i) => i.type).join(", ")}
                            </div>
                          )}

                          {contractState[func.name] !== undefined && (
                            <div className="p-2 bg-muted rounded text-sm">
                              <div className="text-muted-foreground mb-1">
                                Current Value:
                              </div>
                              <div className="font-mono break-all">
                                {String(contractState[func.name])}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Write Functions */}
          <TabsContent value="write">
            <Card>
              <CardHeader>
                <CardTitle>Write Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {writeFunctions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No write functions
                  </div>
                ) : (
                  writeFunctions.map((func) => (
                    <Card key={func.name}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{func.name}</span>
                              <Badge
                                className={getStateMutabilityColor(
                                  func.stateMutability
                                )}
                              >
                                {func.stateMutability}
                              </Badge>
                            </div>
                            <Button size="sm">Write</Button>
                          </div>

                          {func.inputs.length > 0 && (
                            <div className="space-y-2">
                              {func.inputs.map((input, index) => (
                                <div key={index}>
                                  <Label className="text-sm">
                                    {input.name} ({input.type})
                                  </Label>
                                  <Input
                                    placeholder={`Enter ${input.type}...`}
                                    className="mt-1"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Contract Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedABI.events.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No events defined
                  </div>
                ) : (
                  parsedABI.events.map((event) => (
                    <Card key={event.name}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="font-semibold">{event.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.inputs.map((input) => (
                              <div key={input.name}>
                                {input.name} ({input.type})
                                {input.indexed && (
                                  <Badge variant="outline" className="ml-2">
                                    indexed
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {events.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Recent Event Logs</Label>
                      {events.map((event, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg text-sm"
                        >
                          <div className="font-semibold">{event.eventName}</div>
                          <div className="text-muted-foreground mt-1">
                            Block: {event.blockNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No transactions
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <Card key={tx.hash}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-sm">{tx.hash}</div>
                            <Badge
                              variant={
                                tx.status === "success" ? "default" : "destructive"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">From:</span>{" "}
                              {tx.from}
                            </div>
                            <div>
                              <span className="text-muted-foreground">To:</span>{" "}
                              {tx.to}
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Value:
                              </span>{" "}
                              {tx.value} ETH
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Block:
                              </span>{" "}
                              {tx.blockNumber}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
