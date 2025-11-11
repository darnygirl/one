/**
 * Export Menu Component
 *
 * Dropdown menu for exporting chat in different formats
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Message } from '@ai-sdk/react';
import {
  downloadMarkdown,
  downloadHTML,
  downloadJSON,
  copyMarkdownToClipboard,
} from '@/lib/ai/export';
import { useState } from 'react';

interface ExportMenuProps {
  messages: Message[];
  title?: string;
}

export function ExportMenu({ messages, title }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    const success = await copyMarkdownToClipboard(messages, title);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <span className="mr-2">💾</span>
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => downloadMarkdown(messages, title)}>
          <span className="mr-2">📝</span>
          Markdown (.md)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => downloadHTML(messages, title)}>
          <span className="mr-2">🌐</span>
          HTML (.html)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => downloadJSON(messages)}>
          <span className="mr-2">📊</span>
          JSON (.json)
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyMarkdown}>
          <span className="mr-2">{copied ? '✓' : '📋'}</span>
          {copied ? 'Copied!' : 'Copy as Markdown'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
