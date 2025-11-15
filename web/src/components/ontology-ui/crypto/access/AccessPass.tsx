/**
 * Access Pass Component (Cycle 93)
 *
 * Generate and manage access passes for token holders
 * - Time-limited passes
 * - QR code generation
 * - Pass verification
 * - Revocation support
 * - Pass history
 * - Transferable/non-transferable option
 */

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertCircle,
  Download,
} from "lucide-react";
import { Effect } from "effect";
import {
  generateAccessPass,
  verifyAccessPass,
  type AccessPass as Pass,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface AccessPassProps {
  /** Issuer address */
  issuer?: string;
  /** Show pass history */
  showHistory?: boolean;
  /** Callback when pass is created */
  onPassCreated?: (pass: Pass) => void;
  /** Callback when pass is verified */
  onPassVerified?: (pass: Pass, valid: boolean) => void;
}

export function AccessPass({
  issuer,
  showHistory = true,
  onPassCreated,
  onPassVerified,
}: AccessPassProps) {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [currentPass, setCurrentPass] = useState<Pass | null>(null);
  const [passHistory, setPassHistory] = useState<Pass[]>([]);
  const [error, setError] = useState<AccessControlError | null>(null);

  // Form state
  const [duration, setDuration] = useState("1h");
  const [transferable, setTransferable] = useState(false);
  const [verifyPassId, setVerifyPassId] = useState("");

  const handleGeneratePass = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const durationMs = parseDuration(duration);
      const pass = await Effect.runPromise(
        generateAccessPass(
          address,
          issuer || address,
          durationMs,
          transferable,
          { createdAt: Date.now() }
        )
      );

      setCurrentPass(pass);
      setPassHistory([pass, ...passHistory]);
      onPassCreated?.(pass);
    } catch (err) {
      setError(err as AccessControlError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPass = async () => {
    if (!currentPass && !verifyPassId) return;

    setLoading(true);
    setError(null);

    try {
      const passToVerify = currentPass || passHistory.find((p) => p.id === verifyPassId);
      if (!passToVerify) {
        throw new Error("Pass not found");
      }

      const isValid = await Effect.runPromise(verifyAccessPass(passToVerify));
      onPassVerified?.(passToVerify, isValid);
    } catch (err) {
      setError(err as AccessControlError);
      onPassVerified?.(currentPass!, false);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePass = () => {
    if (currentPass) {
      const revokedPass = { ...currentPass, revoked: true };
      setCurrentPass(revokedPass);
      setPassHistory(
        passHistory.map((p) => (p.id === currentPass.id ? revokedPass : p))
      );
    }
  };

  const parseDuration = (duration: string): number => {
    const units: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    return units[duration] || units["1h"];
  };

  const formatTimeRemaining = (expiresAt: number): string => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return "Expired";

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 24) {
      return `${Math.floor(hours / 24)} days`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Pass</CardTitle>
          <CardDescription>
            Connect your wallet to generate access passes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Generate Pass */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Generate Access Pass</CardTitle>
          </div>
          <CardDescription>
            Create a time-limited access pass for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Pass Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="transferable">Transferable</Label>
              <p className="text-xs text-muted-foreground">
                Allow pass to be transferred to others
              </p>
            </div>
            <Switch
              id="transferable"
              checked={transferable}
              onCheckedChange={setTransferable}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error._tag === "PassExpired" && "This pass has expired"}
                {error._tag === "PassRevoked" && "This pass has been revoked"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGeneratePass}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Pass"}
          </Button>
        </CardFooter>
      </Card>

      {/* Current Pass */}
      {currentPass && (
        <Card className={currentPass.revoked ? "border-red-200" : "border-green-200"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                <CardTitle>Your Access Pass</CardTitle>
              </div>
              {currentPass.revoked ? (
                <Badge variant="destructive">Revoked</Badge>
              ) : Date.now() > currentPass.expiresAt ? (
                <Badge variant="secondary">Expired</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Placeholder */}
            <div className="aspect-square w-full max-w-xs mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <QrCode className="h-24 w-24 text-gray-400" />
            </div>

            {/* Pass Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pass ID:</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {currentPass.id.slice(0, 16)}...
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Holder:</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {currentPass.holder.slice(0, 6)}...{currentPass.holder.slice(-4)}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(currentPass.expiresAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transferable:</span>
                <span>{currentPass.transferable ? "Yes" : "No"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleVerifyPass}
              disabled={loading}
              className="flex-1"
            >
              Verify Pass
            </Button>
            {!currentPass.revoked && (
              <Button
                variant="destructive"
                onClick={handleRevokePass}
                className="flex-1"
              >
                Revoke Pass
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Pass History */}
      {showHistory && passHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pass History</CardTitle>
            <CardDescription>
              Your previously generated access passes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {passHistory.map((pass) => (
                <div
                  key={pass.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {pass.id.slice(0, 16)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {formatTimeRemaining(pass.expiresAt)}
                    </p>
                  </div>
                  {pass.revoked ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : Date.now() > pass.expiresAt ? (
                    <Clock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
