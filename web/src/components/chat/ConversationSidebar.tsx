/**
 * Conversation History Sidebar
 * Shows list of past conversations
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Plus,
  Trash2,
  Download,
  FileJson,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/chat/history';
import {
  loadAllConversations,
  deleteConversation,
  exportToJSON,
  exportToMarkdown,
  downloadFile,
} from '@/lib/chat/history';

interface ConversationSidebarProps {
  currentId?: string;
  onSelect: (conversation: Conversation) => void;
  onNew: () => void;
}

export function ConversationSidebar({
  currentId,
  onSelect,
  onNew,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    setConversations(loadAllConversations());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
      loadConversations();
    }
  };

  const handleExportJSON = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const json = exportToJSON(conversation);
    downloadFile(
      json,
      `conversation-${conversation.id}.json`,
      'application/json'
    );
  };

  const handleExportMarkdown = (
    conversation: Conversation,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const markdown = exportToMarkdown(conversation);
    downloadFile(markdown, `conversation-${conversation.id}.md`, 'text/markdown');
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="p-4 border-b">
        <Button onClick={onNew} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                'group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent',
                currentId === conv.id && 'bg-accent'
              )}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(conv.updated).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={e => handleExportJSON(conv, e)}
                  title="Export as JSON"
                >
                  <FileJson className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={e => handleExportMarkdown(conv, e)}
                  title="Export as Markdown"
                >
                  <FileText className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={e => handleDelete(conv.id, e)}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t text-xs text-muted-foreground text-center">
        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
