/**
 * Confirmation Component
 *
 * User approval workflow for tool execution
 * Shows tool details and allows approve/reject
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfirmationProps {
  toolName: string;
  description: string;
  parameters: Record<string, any>;
  risks?: string[];
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
}

export function Confirmation({
  toolName,
  description,
  parameters,
  risks = [],
  onApprove,
  onReject,
  isPending = false,
}: ConfirmationProps) {
  return (
    <Card className="my-4 border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">Approval Required</CardTitle>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30">
                Action Needed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              AI wants to execute: <code className="font-mono bg-white dark:bg-gray-950 px-1 rounded">{toolName}</code>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold mb-2">What this does:</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Parameters */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Parameters:</h4>
          <div className="bg-white dark:bg-gray-950 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
            <pre className="text-xs font-mono overflow-x-auto">
              {JSON.stringify(parameters, null, 2)}
            </pre>
          </div>
        </div>

        {/* Risks */}
        {risks.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">Potential Risks:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {risks.map((risk, index) => (
                      <li key={index} className="flex gap-2">
                        <span>•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
          <Button
            variant="outline"
            onClick={onReject}
            disabled={isPending}
            className="flex-1"
          >
            <span className="mr-2">✗</span>
            Reject
          </Button>
          <Button
            onClick={onApprove}
            disabled={isPending}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isPending ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Executing...
              </>
            ) : (
              <>
                <span className="mr-2">✓</span>
                Approve & Execute
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
