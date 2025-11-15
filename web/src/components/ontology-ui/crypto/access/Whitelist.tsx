/**
 * Whitelist Component (Cycle 96)
 *
 * Manage whitelist for token sales and access control
 * - Add/remove addresses manually
 * - CSV import/export
 * - Whitelist verification
 * - Allocation per address
 * - Snapshot creation
 * - Batch operations
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Plus,
  Trash2,
  Search,
  Camera,
} from "lucide-react";
import { Effect } from "effect";
import {
  addToWhitelist,
  removeFromWhitelist,
  verifyWhitelist,
  batchVerifyWhitelist,
  type WhitelistEntry,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface WhitelistProps {
  /** Initial whitelist entries */
  initialWhitelist?: WhitelistEntry[];
  /** Allow CSV import */
  allowImport?: boolean;
  /** Allow CSV export */
  allowExport?: boolean;
  /** Show allocation column */
  showAllocation?: boolean;
  /** Callback when whitelist changes */
  onChange?: (whitelist: WhitelistEntry[]) => void;
}

export function Whitelist({
  initialWhitelist = [],
  allowImport = true,
  allowExport = true,
  showAllocation = true,
  onChange,
}: WhitelistProps) {
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>(initialWhitelist);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AccessControlError | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add form state
  const [newAddress, setNewAddress] = useState("");
  const [newAllocation, setNewAllocation] = useState("1000");
  const [newTier, setNewTier] = useState("standard");

  // Verify state
  const [verifyAddress, setVerifyAddress] = useState("");
  const [verifyResult, setVerifyResult] = useState<WhitelistEntry | null>(null);

  const handleAdd = async () => {
    if (!newAddress) return;

    setLoading(true);
    setError(null);

    try {
      const entry: WhitelistEntry = {
        address: newAddress,
        allocation: newAllocation,
        tier: newTier,
        metadata: { addedAt: Date.now() },
      };

      const updatedWhitelist = await Effect.runPromise(
        addToWhitelist(whitelist, entry)
      );

      setWhitelist(updatedWhitelist);
      onChange?.(updatedWhitelist);

      // Reset form
      setNewAddress("");
      setNewAllocation("1000");
      setNewTier("standard");
    } catch (err) {
      setError(err as AccessControlError);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedWhitelist = await Effect.runPromise(
        removeFromWhitelist(whitelist, address)
      );

      setWhitelist(updatedWhitelist);
      onChange?.(updatedWhitelist);
    } catch (err) {
      setError(err as AccessControlError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyAddress) return;

    setLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const entry = await Effect.runPromise(
        verifyWhitelist(verifyAddress, whitelist)
      );
      setVerifyResult(entry);
    } catch (err) {
      setError(err as AccessControlError);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header
      const entries: WhitelistEntry[] = [];

      for (const line of lines) {
        const [address, allocation, tier] = line.split(",").map((s) => s.trim());
        if (address) {
          entries.push({
            address,
            allocation: allocation || "1000",
            tier: tier || "standard",
            metadata: { imported: true },
          });
        }
      }

      setWhitelist([...whitelist, ...entries]);
      onChange?.([...whitelist, ...entries]);
    };

    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const csv = [
      ["Address", "Allocation", "Tier"],
      ...whitelist.map((entry) => [
        entry.address,
        entry.allocation,
        entry.tier || "standard",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whitelist-${Date.now()}.csv`;
    a.click();
  };

  const handleSnapshot = () => {
    const snapshot = {
      timestamp: Date.now(),
      totalAddresses: whitelist.length,
      totalAllocation: whitelist.reduce(
        (sum, entry) => sum + BigInt(entry.allocation),
        BigInt(0)
      ).toString(),
      entries: whitelist,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whitelist-snapshot-${Date.now()}.json`;
    a.click();
  };

  const filteredWhitelist = whitelist.filter(
    (entry) =>
      entry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Add Address Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <CardTitle>Add to Whitelist</CardTitle>
          </div>
          <CardDescription>
            Add addresses manually or import from CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>

            {showAllocation && (
              <div className="space-y-2">
                <Label htmlFor="allocation">Allocation</Label>
                <Input
                  id="allocation"
                  type="number"
                  placeholder="1000"
                  value={newAllocation}
                  onChange={(e) => setNewAllocation(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <Select value={newTier} onValueChange={setNewTier}>
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error._tag === "NotWhitelisted" &&
                  `Address ${error.address} not found`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleAdd} disabled={loading || !newAddress} className="flex-1">
            {loading ? "Adding..." : "Add Address"}
          </Button>
          {allowImport && (
            <Button variant="outline" asChild>
              <label>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Whitelist Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Whitelist</CardTitle>
              <CardDescription>
                {whitelist.length} address{whitelist.length !== 1 ? "es" : ""} whitelisted
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {allowExport && whitelist.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSnapshot}>
                    <Camera className="h-4 w-4 mr-2" />
                    Snapshot
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {whitelist.length > 0 && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search addresses or tiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      {showAllocation && <TableHead>Allocation</TableHead>}
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWhitelist.map((entry) => (
                      <TableRow key={entry.address}>
                        <TableCell>
                          <code className="text-xs">
                            {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                          </code>
                        </TableCell>
                        {showAllocation && (
                          <TableCell>
                            <Badge variant="secondary">{entry.allocation}</Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge
                            variant={
                              entry.tier === "vip"
                                ? "default"
                                : entry.tier === "priority"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {entry.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(entry.address)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredWhitelist.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No addresses match your search
                </p>
              )}
            </div>
          )}

          {whitelist.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No addresses in whitelist yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verify Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <CardTitle>Verify Address</CardTitle>
          </div>
          <CardDescription>
            Check if an address is whitelisted
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

          {verifyResult && (
            <Alert className="border-green-300 bg-green-100 dark:bg-green-950/40">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <p className="font-medium">Address is whitelisted!</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Allocation: {verifyResult.allocation}</p>
                  <p>Tier: {verifyResult.tier}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && error._tag === "NotWhitelisted" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Address {error.address} is not whitelisted
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleVerify}
            disabled={loading || !verifyAddress}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify Address"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
