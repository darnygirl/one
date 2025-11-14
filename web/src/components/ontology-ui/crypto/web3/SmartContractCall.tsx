/**
 * Smart Contract Call Component (Cycle 97)
 *
 * Call any smart contract with:
 * - Contract address input with verification
 * - ABI upload or fetch from explorer
 * - Function selector dropdown
 * - Dynamic input fields based on ABI
 * - Read vs write function distinction
 * - Gas estimation for write functions
 * - Transaction simulation
 * - Call result display
 */

import { useState } from "react";
import { Effect } from "effect";
import {
  parseABI,
  validateFunctionArgs,
  readContract,
  writeContract,
  simulateContractCall,
  estimateGas,
  verifyContractAddress,
  type ParsedABI,
  type ABIFunction,
  type CallResult,
  type GasEstimate,
} from "@/lib/services/crypto/Web3Service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SmartContractCallProps {
  defaultAddress?: string;
  onCallComplete?: (result: CallResult) => void;
}

export function SmartContractCall({
  defaultAddress = "",
  onCallComplete,
}: SmartContractCallProps) {
  // Contract details
  const [address, setAddress] = useState(defaultAddress);
  const [abiInput, setAbiInput] = useState("");
  const [parsedABI, setParsedABI] = useState<ParsedABI | null>(null);
  const [isValidAddress, setIsValidAddress] = useState(false);

  // Function selection
  const [selectedFunction, setSelectedFunction] = useState<ABIFunction | null>(
    null
  );
  const [functionArgs, setFunctionArgs] = useState<string[]>([]);

  // Transaction details
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Verify contract address
  const handleVerifyAddress = async () => {
    setError("");
    setIsValidAddress(false);

    try {
      await Effect.runPromise(verifyContractAddress(address));
      setIsValidAddress(true);
    } catch (err) {
      setError(`Invalid address: ${(err as Error).message}`);
    }
  };

  // Parse ABI
  const handleParseABI = async () => {
    setError("");
    setParsedABI(null);
    setSelectedFunction(null);

    try {
      const parsed = await Effect.runPromise(parseABI(abiInput));
      setParsedABI(parsed);

      if (parsed.functions.length === 0) {
        setError("No functions found in ABI");
      }
    } catch (err) {
      setError(`Failed to parse ABI: ${(err as Error).message}`);
    }
  };

  // Fetch ABI from explorer (mock)
  const handleFetchABI = async () => {
    setError("");

    try {
      // Mock ABI fetch (in production, fetch from Etherscan/BlockScout)
      const mockABI = JSON.stringify([
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "balance", type: "uint256" }],
        },
        {
          name: "transfer",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "success", type: "bool" }],
        },
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "success", type: "bool" }],
        },
      ]);

      setAbiInput(mockABI);
      const parsed = await Effect.runPromise(parseABI(mockABI));
      setParsedABI(parsed);
    } catch (err) {
      setError(`Failed to fetch ABI: ${(err as Error).message}`);
    }
  };

  // Select function
  const handleSelectFunction = (functionName: string) => {
    const func = parsedABI?.functions.find((f) => f.name === functionName);
    if (func) {
      setSelectedFunction(func);
      setFunctionArgs(new Array(func.inputs.length).fill(""));
      setGasEstimate(null);
      setCallResult(null);
    }
  };

  // Update function argument
  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...functionArgs];
    newArgs[index] = value;
    setFunctionArgs(newArgs);
  };

  // Estimate gas
  const handleEstimateGas = async () => {
    if (!selectedFunction || !parsedABI) return;

    setError("");
    setLoading(true);

    try {
      const args = functionArgs.map((arg, i) => {
        const param = selectedFunction.inputs[i];
        if (param.type.startsWith("uint")) {
          return BigInt(arg || "0");
        }
        return arg;
      });

      await Effect.runPromise(
        validateFunctionArgs(selectedFunction, args)
      );

      const estimate = await Effect.runPromise(
        estimateGas(
          {
            address,
            functionName: selectedFunction.name,
            args,
          },
          parsedABI
        )
      );

      setGasEstimate(estimate);
    } catch (err) {
      setError(`Gas estimation failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Execute contract call
  const handleExecuteCall = async () => {
    if (!selectedFunction || !parsedABI) return;

    setError("");
    setLoading(true);
    setCallResult(null);

    try {
      const args = functionArgs.map((arg, i) => {
        const param = selectedFunction.inputs[i];
        if (param.type.startsWith("uint")) {
          return BigInt(arg || "0");
        }
        return arg;
      });

      await Effect.runPromise(
        validateFunctionArgs(selectedFunction, args)
      );

      const isReadFunction =
        selectedFunction.stateMutability === "view" ||
        selectedFunction.stateMutability === "pure";

      const result = await Effect.runPromise(
        isReadFunction
          ? readContract(
              {
                address,
                functionName: selectedFunction.name,
                args,
              },
              parsedABI
            )
          : writeContract(
              {
                address,
                functionName: selectedFunction.name,
                args,
              },
              parsedABI
            )
      );

      setCallResult(result);
      onCallComplete?.(result);
    } catch (err) {
      setError(`Call failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const isReadFunction =
    selectedFunction?.stateMutability === "view" ||
    selectedFunction?.stateMutability === "pure";

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
      {/* Contract Address */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Contract Address</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1"
              />
              <Button onClick={handleVerifyAddress} variant="outline">
                Verify
              </Button>
            </div>
            {isValidAddress && (
              <div className="text-sm text-green-600 mt-2">
                ✓ Valid contract address
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label>Contract ABI</Label>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleFetchABI} variant="outline" size="sm">
                Fetch from Explorer
              </Button>
              <Button
                onClick={() => document.getElementById("abi-file")?.click()}
                variant="outline"
                size="sm"
              >
                Upload ABI
              </Button>
              <input
                id="abi-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    file.text().then((text) => setAbiInput(text));
                  }
                }}
              />
            </div>
            <Textarea
              value={abiInput}
              onChange={(e) => setAbiInput(e.target.value)}
              placeholder="Paste ABI JSON here..."
              rows={6}
              className="mt-2 font-mono text-xs"
            />
            <Button
              onClick={handleParseABI}
              disabled={!abiInput}
              className="mt-2"
              size="sm"
            >
              Parse ABI
            </Button>
          </div>

          {parsedABI && (
            <div className="text-sm text-muted-foreground">
              Found {parsedABI.functions.length} functions,{" "}
              {parsedABI.events.length} events
            </div>
          )}
        </CardContent>
      </Card>

      {/* Function Selection */}
      {parsedABI && parsedABI.functions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Function</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Function</Label>
              <Select
                value={selectedFunction?.name}
                onValueChange={handleSelectFunction}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select function..." />
                </SelectTrigger>
                <SelectContent>
                  {parsedABI.functions.map((func) => (
                    <SelectItem key={func.name} value={func.name}>
                      <div className="flex items-center gap-2">
                        <span>{func.name}</span>
                        <Badge
                          className={getStateMutabilityColor(
                            func.stateMutability
                          )}
                        >
                          {func.stateMutability}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFunction && (
              <>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {selectedFunction.name}
                    </span>
                    <Badge
                      className={getStateMutabilityColor(
                        selectedFunction.stateMutability
                      )}
                    >
                      {selectedFunction.stateMutability}
                    </Badge>
                    {isReadFunction && (
                      <Badge variant="outline">READ ONLY</Badge>
                    )}
                  </div>

                  {selectedFunction.inputs.length > 0 ? (
                    <div className="space-y-3">
                      <Label>Function Arguments</Label>
                      {selectedFunction.inputs.map((input, index) => (
                        <div key={index}>
                          <Label className="text-sm">
                            {input.name || `arg${index}`} ({input.type})
                          </Label>
                          <Input
                            value={functionArgs[index] || ""}
                            onChange={(e) =>
                              handleArgChange(index, e.target.value)
                            }
                            placeholder={`Enter ${input.type}...`}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No arguments required
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gas Estimation & Execution */}
      {selectedFunction && (
        <Card>
          <CardHeader>
            <CardTitle>Execute Call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isReadFunction && (
              <>
                <Button
                  onClick={handleEstimateGas}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Estimate Gas
                </Button>

                {gasEstimate && (
                  <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Limit:</span>
                      <span className="font-semibold">
                        {gasEstimate.gasLimit.toString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Price:</span>
                      <span className="font-semibold">
                        {(Number(gasEstimate.gasPrice) / 1e9).toFixed(2)} gwei
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold">
                        {(Number(gasEstimate.totalCost) / 1e18).toFixed(6)} ETH
                      </span>
                    </div>
                  </div>
                )}

                <Separator />
              </>
            )}

            <Button
              onClick={handleExecuteCall}
              disabled={loading || !selectedFunction}
              className="w-full"
              size="lg"
            >
              {loading
                ? "Executing..."
                : isReadFunction
                  ? "Read Contract"
                  : "Send Transaction"}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            {callResult && (
              <div className="space-y-3">
                <Separator />

                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Call Result</span>
                    {callResult.success ? (
                      <Badge variant="default">SUCCESS</Badge>
                    ) : (
                      <Badge variant="destructive">FAILED</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {callResult.success && (
                      <>
                        <div>
                          <div className="text-muted-foreground">
                            Return Data:
                          </div>
                          <div className="font-mono text-xs break-all">
                            {String(callResult.data)}
                          </div>
                        </div>

                        {callResult.gasUsed && (
                          <div>
                            <div className="text-muted-foreground">
                              Gas Used:
                            </div>
                            <div className="font-semibold">
                              {callResult.gasUsed.toString()}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {callResult.error && (
                      <div>
                        <div className="text-muted-foreground">Error:</div>
                        <div className="text-red-600">{callResult.error}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
