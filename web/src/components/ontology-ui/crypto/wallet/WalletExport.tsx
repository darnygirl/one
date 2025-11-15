/**
 * WalletExport Component
 *
 * Export wallet credentials (SECURE)
 * Warning dialog, password protection, export private key/seed phrase
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "../../utils";
import type { WalletExportProps } from "./types";

export function WalletExport({
  onExportPrivateKey,
  onExportSeedPhrase,
  requirePassword = true,
  variant = "default",
  size = "md",
  className,
}: WalletExportProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyPassword = () => {
    if (requirePassword && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Mock password verification
    if (password === "password123") {
      setIsVerified(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleExportPrivateKey = () => {
    setShowPrivateKey(true);
    onExportPrivateKey?.();
  };

  const handleExportSeedPhrase = () => {
    setShowSeedPhrase(true);
    onExportSeedPhrase?.();
  };

  return (
    <Card
      className={cn(
        "border-destructive/50 transition-all duration-200",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <span className="text-2xl">⚠️</span>
          <span>Export Wallet</span>
        </CardTitle>
        <CardDescription>
          Securely export your wallet credentials
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Security Warning */}
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            <span>🔒</span>
            <span>Security Warning</span>
          </AlertTitle>
          <AlertDescription className="text-xs mt-2">
            Never share your private key or seed phrase with anyone. Anyone with
            access to these can steal all your funds. Store them securely offline.
          </AlertDescription>
        </Alert>

        {/* Password Verification */}
        {requirePassword && !isVerified && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="password">Verify Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleVerifyPassword}
            >
              Verify Password
            </Button>
          </div>
        )}

        {/* Export Options (shown after verification) */}
        {(!requirePassword || isVerified) && (
          <div className="space-y-3">
            {/* Private Key Export */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Private Key</Label>
                <Badge variant="destructive" className="text-xs">
                  Highly Sensitive
                </Badge>
              </div>
              {!showPrivateKey ? (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleExportPrivateKey}
                >
                  <span>🔑</span>
                  <span>Reveal Private Key</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <code className="text-xs font-mono bg-destructive/10 px-3 py-2 rounded block break-all border border-destructive/30">
                    0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                      )
                    }
                  >
                    Copy Private Key
                  </Button>
                </div>
              )}
            </div>

            {/* Seed Phrase Export */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seed Phrase</Label>
                <Badge variant="destructive" className="text-xs">
                  Highly Sensitive
                </Badge>
              </div>
              {!showSeedPhrase ? (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleExportSeedPhrase}
                >
                  <span>📝</span>
                  <span>Reveal Seed Phrase</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 p-3 bg-destructive/10 rounded border border-destructive/30">
                    {[
                      "abandon",
                      "ability",
                      "able",
                      "about",
                      "above",
                      "absent",
                      "absorb",
                      "abstract",
                      "absurd",
                      "abuse",
                      "access",
                      "accident",
                    ].map((word, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono bg-background px-2 py-1 rounded"
                      >
                        {i + 1}. {word}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        "abandon ability able about above absent absorb abstract absurd abuse access accident"
                      )
                    }
                  >
                    Copy Seed Phrase
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Best Practices:</strong> Write down your seed phrase on
              paper and store it in a secure location. Never store it digitally
              or take screenshots.
            </AlertDescription>
          </Alert>
        </div>
      </CardFooter>
    </Card>
  );
}
