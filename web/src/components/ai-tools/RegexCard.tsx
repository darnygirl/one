/**
 * Regex Card Component
 * Display regex test results with match highlighting
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, CheckCircle, XCircle, Info, BookOpen } from 'lucide-react';

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
  named_groups: Record<string, string>;
}

interface CommonPattern {
  name: string;
  pattern: string;
  description: string;
}

interface RegexResult {
  pattern: string;
  flags: string;
  text: string;
  is_match: boolean;
  match_count: number;
  matches: RegexMatch[];
  explanation: string[];
  common_patterns: CommonPattern[];
}

export function RegexCard({ data }: { data: RegexResult }) {
  const [highlightedText, setHighlightedText] = useState<string>('');

  React.useEffect(() => {
    // Highlight matches in text
    if (data.matches.length === 0) {
      setHighlightedText(data.text);
      return;
    }

    let highlighted = data.text;
    const matches = [...data.matches].sort((a, b) => b.index - a.index);

    matches.forEach((match) => {
      const before = highlighted.slice(0, match.index);
      const matchText = match.match;
      const after = highlighted.slice(match.index + matchText.length);
      highlighted = `${before}<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">${matchText}</mark>${after}`;
    });

    setHighlightedText(highlighted);
  }, [data.matches, data.text]);

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Match Status */}
      <Alert variant={data.is_match ? 'default' : 'destructive'}>
        {data.is_match ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <AlertDescription>
          <div className="font-medium">
            {data.is_match
              ? `Pattern matched! Found ${data.match_count} match${data.match_count !== 1 ? 'es' : ''}`
              : 'Pattern did not match'}
          </div>
        </AlertDescription>
      </Alert>

      {/* Pattern Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Pattern Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pattern</Label>
              <code className="block p-3 bg-muted rounded-md font-mono text-sm">
                /{data.pattern}/{data.flags}
              </code>
            </div>
            <div className="space-y-2">
              <Label>Flags</Label>
              <div className="flex gap-2">
                {data.flags.split('').map((flag) => (
                  <Badge key={flag} variant="secondary">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Pattern Explanation */}
          {data.explanation.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Pattern Breakdown
              </Label>
              <div className="space-y-1">
                {data.explanation.map((exp, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground font-mono">
                    {exp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Text with Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Test Text ({data.text.length} chars)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </CardContent>
      </Card>

      {/* Matches */}
      {data.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Matches ({data.match_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.matches.map((match, idx) => (
                <div key={idx} className="p-3 border rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge>Match {idx + 1}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Position: {match.index}
                    </span>
                  </div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {match.match}
                  </div>
                  {match.groups.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Groups:</span>{' '}
                      {match.groups.map((g, i) => (
                        <Badge key={i} variant="outline" className="ml-1">
                          {i + 1}: {g || '(empty)'}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {Object.keys(match.named_groups).length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Named Groups:</span>{' '}
                      {Object.entries(match.named_groups).map(([name, value]) => (
                        <Badge key={name} variant="outline" className="ml-1">
                          {name}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Patterns Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Common Patterns Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {data.common_patterns.map((pattern, idx) => (
              <AccordionItem key={idx} value={`pattern-${idx}`}>
                <AccordionTrigger className="text-sm">
                  {pattern.name}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                    <code className="block p-2 bg-muted rounded-md font-mono text-sm">
                      {pattern.pattern}
                    </code>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
