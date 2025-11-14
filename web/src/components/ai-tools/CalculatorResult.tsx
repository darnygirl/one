/**
 * Calculator Result Component
 * Interactive calculator with scientific mode, unit converter, and history
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, History, Settings } from 'lucide-react';

interface CalculatorData {
  expression: string;
  result: number | { real: number; imaginary: number };
  formatted: string;
  mode?: string;
  steps?: string[];
  history?: Array<{ expression: string; result: number; timestamp: number }>;
  magnitude?: string;
  angle?: string;
  category?: string;
}

export function CalculatorResult({ data }: { data: CalculatorData }) {
  const [expression, setExpression] = useState(data.expression || '');
  const [mode, setMode] = useState<'standard' | 'scientific' | 'unit_conversion' | 'complex'>(
    (data.mode as any) || 'standard'
  );
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');
  const [showHistory, setShowHistory] = useState(false);

  const buttons = [
    ['7', '8', '9', '/', 'sin'],
    ['4', '5', '6', '*', 'cos'],
    ['1', '2', '3', '-', 'tan'],
    ['0', '.', '=', '+', 'sqrt'],
    ['(', ')', '^', 'C', 'log'],
  ];

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      // In real implementation, would call calculator tool
      return;
    }
    if (value === 'C') {
      setExpression('');
      return;
    }
    setExpression(prev => prev + value);
  };

  const unitCategories = {
    length: ['m', 'ft', 'km', 'mi', 'cm', 'in'],
    weight: ['kg', 'lb', 'g', 'oz'],
    volume: ['L', 'gal', 'ml', 'cup', 'qt'],
    temperature: ['C', 'F', 'K'],
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Advanced Calculator
          <Badge variant="outline" className="ml-auto">
            {mode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="scientific">Scientific</TabsTrigger>
            <TabsTrigger value="unit_conversion">Units</TabsTrigger>
            <TabsTrigger value="complex">Complex</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4">
            <div>
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter expression..."
                className="font-mono text-lg p-3"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {buttons.map((row, i) =>
                row.map((btn) => (
                  <Button
                    key={btn}
                    variant={['=', 'C'].includes(btn) ? 'default' : 'outline'}
                    onClick={() => handleButtonClick(btn)}
                    className="h-12"
                  >
                    {btn}
                  </Button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="scientific" className="space-y-4">
            <div>
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter scientific expression (e.g., sin(45), log(100))..."
                className="font-mono text-lg p-3"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {buttons.map((row, i) =>
                row.map((btn) => (
                  <Button
                    key={btn}
                    variant={['=', 'C'].includes(btn) ? 'default' : 'outline'}
                    onClick={() => handleButtonClick(btn)}
                    className="h-12 text-sm"
                  >
                    {btn}
                  </Button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="unit_conversion" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">From:</label>
                <Input
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="Value"
                  type="number"
                  className="mb-2"
                />
                <Select value={unitFrom} onValueChange={setUnitFrom}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(unitCategories).map(([cat, units]) => (
                      <React.Fragment key={cat}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {cat}
                        </div>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">To:</label>
                <div className="h-10 mb-2 flex items-center justify-center bg-muted rounded-md">
                  <span className="font-mono text-lg font-bold">{data.formatted || '—'}</span>
                </div>
                <Select value={unitTo} onValueChange={setUnitTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(unitCategories).map(([cat, units]) => (
                      <React.Fragment key={cat}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {cat}
                        </div>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full">Convert</Button>
          </TabsContent>

          <TabsContent value="complex" className="space-y-4">
            <div>
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter complex number (e.g., 3+4i)..."
                className="font-mono text-lg p-3"
              />
            </div>
            {data.magnitude && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Magnitude</div>
                  <div className="font-mono text-xl font-bold">{data.magnitude}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Angle</div>
                  <div className="font-mono text-xl font-bold">{data.angle}</div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Result Display */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Result:</div>
          <div className="font-mono text-3xl font-bold text-center">
            {data.formatted || '0'}
          </div>
        </div>

        {/* Calculation Steps */}
        {data.steps && data.steps.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Calculation Steps
            </div>
            <div className="space-y-1 text-sm font-mono">
              {data.steps.map((step, i) => (
                <div key={i} className="text-muted-foreground">
                  {i + 1}. {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {data.history && data.history.length > 0 && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="mb-2"
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History ({data.history.length})
            </Button>
            {showHistory && (
              <div className="p-3 bg-muted rounded-lg space-y-2 max-h-48 overflow-y-auto">
                {data.history.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm font-mono p-2 bg-background rounded"
                  >
                    <span>{item.expression}</span>
                    <span className="font-bold">= {item.result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
