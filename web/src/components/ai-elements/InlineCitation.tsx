/**
 * Inline Citation Component
 *
 * Small citation markers within text
 * Click to see source details
 */

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InlineCitationProps {
  number: number;
  title: string;
  url?: string;
  snippet?: string;
}

export function InlineCitation({
  number,
  title,
  url,
  snippet,
}: InlineCitationProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <sup className="cursor-pointer inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full hover:scale-110 transition-transform mx-0.5">
          {number}
        </sup>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {number}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{title}</h4>
                  {snippet && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                      {snippet}
                    </p>
                  )}
                  {url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-0 mt-2"
                      onClick={() => window.open(url, '_blank')}
                    >
                      Visit source →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
