/**
 * Keyboard Shortcuts Help Dialog
 *
 * Shows all available keyboard shortcuts
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['/'], description: 'Focus input field' },
        { keys: ['Cmd', 'K'], description: 'Open model selector' },
        { keys: ['Esc'], description: 'Close modal/dialog' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Cmd', 'N'], description: 'Start new chat' },
        { keys: ['Cmd', 'S'], description: 'Export chat' },
        { keys: ['Enter'], description: 'Send message' },
        { keys: ['Shift', 'Enter'], description: 'New line in message' },
      ],
    },
    {
      category: 'Message Actions',
      items: [
        { keys: ['↑', '↓'], description: 'Navigate messages' },
      ],
    },
  ];

  const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');

  const formatKey = (key: string) => {
    if (key === 'Cmd') return isMac ? '⌘' : 'Ctrl';
    if (key === 'Enter') return '↵';
    if (key === 'Esc') return 'Esc';
    if (key === 'Shift') return '⇧';
    return key;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center gap-2">
            <span>⌨️</span>
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm">{item.description}</span>
                      <div className="flex gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            variant="outline"
                            className="font-mono font-semibold px-2 py-1"
                          >
                            {formatKey(key)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-xs text-muted-foreground">
            Press <Badge variant="outline" className="mx-1 text-xs">?</Badge> anytime to see this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
