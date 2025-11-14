/**
 * Password Card Component
 * Displays generated passwords with strength meter and copy functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Key, Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StrengthAnalysis {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  message: string;
}

interface CharacterSets {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface PassphraseOptions {
  word_count: number;
  separator: string;
  capitalize: boolean;
  include_number: boolean;
}

interface PasswordAnalysis {
  password: string;
  entropy: number;
  strength: StrengthAnalysis;
}

interface PasswordData {
  password: string;
  type: 'password' | 'passphrase';
  length: number;
  entropy: number;
  strength: StrengthAnalysis;
  character_sets?: CharacterSets;
  passphrase_options?: PassphraseOptions;
  passwords?: string[];
  all_analyses?: PasswordAnalysis[];
  count: number;
  timestamp?: string;
}

export function PasswordCard({ data }: { data: PasswordData }) {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number = 0) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStrengthColor = (level: string): string => {
    switch (level) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very-strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStrengthIcon = (level: string) => {
    switch (level) {
      case 'weak':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'strong':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'very-strong':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const renderPasswordItem = (password: string, analysis: PasswordAnalysis | undefined, index: number) => (
    <div key={index} className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted rounded-lg p-3 font-mono text-sm break-all">
          {password}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCopy(password, index)}
        >
          <Copy className="w-4 h-4" />
          {copied === index ? 'Copied!' : ''}
        </Button>
      </div>

      {analysis && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {getStrengthIcon(analysis.strength.level)}
          <span>Entropy: {analysis.entropy.toFixed(1)} bits</span>
          <span>•</span>
          <span className="capitalize">{analysis.strength.level.replace('-', ' ')}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Primary Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Password Generator
            </div>
            <Badge variant="secondary" className="capitalize">
              {data.type}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Password Display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg p-4 font-mono text-lg break-all">
              {data.password}
            </div>
            <Button onClick={() => handleCopy(data.password)}>
              <Copy className="w-4 h-4 mr-2" />
              {copied === 0 ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {/* Strength Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStrengthIcon(data.strength.level)}
                <span className="font-medium capitalize">
                  {data.strength.level.replace('-', ' ')} Password
                </span>
              </div>
              <span className="text-muted-foreground">
                {data.strength.score}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getStrengthColor(data.strength.level)} transition-all duration-300`}
                style={{ width: `${data.strength.score}%` }}
              />
            </div>

            <p className="text-sm text-muted-foreground">{data.strength.message}</p>
          </div>

          {/* Entropy Display */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Entropy</span>
            </div>
            <span className="text-lg font-bold">{data.entropy} bits</span>
          </div>

          {/* Character Sets */}
          {data.character_sets && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Character Sets:</div>
              <div className="flex flex-wrap gap-2">
                {data.character_sets.uppercase && (
                  <Badge variant="secondary">Uppercase (A-Z)</Badge>
                )}
                {data.character_sets.lowercase && (
                  <Badge variant="secondary">Lowercase (a-z)</Badge>
                )}
                {data.character_sets.numbers && (
                  <Badge variant="secondary">Numbers (0-9)</Badge>
                )}
                {data.character_sets.symbols && (
                  <Badge variant="secondary">Symbols (!@#$...)</Badge>
                )}
              </div>
            </div>
          )}

          {/* Passphrase Options */}
          {data.passphrase_options && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Passphrase Options:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Words:</span>{' '}
                  <span className="font-medium">{data.passphrase_options.word_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Separator:</span>{' '}
                  <span className="font-medium">{data.passphrase_options.separator || '(none)'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Capitalized:</span>{' '}
                  <span className="font-medium">{data.passphrase_options.capitalize ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Include Number:</span>{' '}
                  <span className="font-medium">{data.passphrase_options.include_number ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Password Info */}
          <div className="text-sm text-muted-foreground">
            Length: <span className="font-medium">{data.length} characters</span>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Passwords List */}
      {data.passwords && data.passwords.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Generated Passwords ({data.passwords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.passwords.map((pwd, index) => {
              const analysis = data.all_analyses?.[index];
              return renderPasswordItem(pwd, analysis, index);
            })}
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Password Security Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use unique passwords for each account</li>
              <li>Store passwords in a secure password manager</li>
              <li>Enable two-factor authentication when available</li>
              <li>Change passwords if you suspect a breach</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Generated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
