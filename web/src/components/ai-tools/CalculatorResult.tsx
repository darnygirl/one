/**
 * Calculator Result Component
 * Displays calculation results
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface CalculatorData {
  expression: string;
  result: number;
  formatted: string;
}

export function CalculatorResult({ data }: { data: CalculatorData }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculation Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Expression:</div>
          <div className="font-mono text-lg p-3 bg-muted rounded-lg">
            {data.expression}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Result:</div>
          <div className="font-mono text-3xl font-bold p-4 bg-primary/10 rounded-lg text-center">
            {data.formatted}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
