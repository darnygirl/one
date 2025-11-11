/**
 * Keyboard Shortcuts
 *
 * Global keyboard shortcuts for the chat interface
 * Cmd+K, Cmd+N, Cmd+S, etc.
 */

type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  handler: ShortcutHandler;
}

const shortcuts: Shortcut[] = [];

// ============================================================================
// REGISTER SHORTCUTS
// ============================================================================

export function registerShortcut(
  key: string,
  handler: ShortcutHandler,
  options: {
    ctrlOrCmd?: boolean;
    shift?: boolean;
    alt?: boolean;
    description?: string;
  } = {}
): void {
  shortcuts.push({
    key: key.toLowerCase(),
    ctrlOrCmd: options.ctrlOrCmd,
    shift: options.shift,
    alt: options.alt,
    description: options.description || '',
    handler,
  });
}

// ============================================================================
// HANDLE KEYBOARD EVENTS
// ============================================================================

function handleKeyDown(event: KeyboardEvent): void {
  const key = event.key.toLowerCase();
  const ctrlOrCmd = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  const alt = event.altKey;

  // Don't trigger shortcuts when typing in input/textarea (except for specific keys)
  if (
    (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement) &&
    key !== '/' &&
    key !== 'escape'
  ) {
    return;
  }

  for (const shortcut of shortcuts) {
    const keyMatches = shortcut.key === key;
    const ctrlMatches = (shortcut.ctrlOrCmd ?? false) === ctrlOrCmd;
    const shiftMatches = (shortcut.shift ?? false) === shift;
    const altMatches = (shortcut.alt ?? false) === alt;

    if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
      event.preventDefault();
      shortcut.handler();
      break;
    }
  }
}

// ============================================================================
// INITIALIZE
// ============================================================================

let initialized = false;

export function initKeyboardShortcuts(): void {
  if (initialized || typeof window === 'undefined') return;

  window.addEventListener('keydown', handleKeyDown);
  initialized = true;
}

export function cleanupKeyboardShortcuts(): void {
  if (!initialized || typeof window === 'undefined') return;

  window.removeEventListener('keydown', handleKeyDown);
  initialized = false;
}

// ============================================================================
// GET ALL SHORTCUTS (for help display)
// ============================================================================

export function getAllShortcuts(): Shortcut[] {
  return shortcuts;
}

// ============================================================================
// DEFAULT SHORTCUTS
// ============================================================================

export function registerDefaultShortcuts(handlers: {
  focusInput?: () => void;
  openModelSelector?: () => void;
  newChat?: () => void;
  saveExport?: () => void;
  closeModal?: () => void;
}): void {
  // Focus input
  if (handlers.focusInput) {
    registerShortcut('/', handlers.focusInput, {
      description: 'Focus input',
    });
  }

  // Model selector
  if (handlers.openModelSelector) {
    registerShortcut('k', handlers.openModelSelector, {
      ctrlOrCmd: true,
      description: 'Open model selector',
    });
  }

  // New chat
  if (handlers.newChat) {
    registerShortcut('n', handlers.newChat, {
      ctrlOrCmd: true,
      description: 'Start new chat',
    });
  }

  // Save/Export
  if (handlers.saveExport) {
    registerShortcut('s', handlers.saveExport, {
      ctrlOrCmd: true,
      description: 'Save/Export chat',
    });
  }

  // Close modal
  if (handlers.closeModal) {
    registerShortcut('escape', handlers.closeModal, {
      description: 'Close modal',
    });
  }
}

// ============================================================================
// FORMAT SHORTCUT FOR DISPLAY
// ============================================================================

export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlOrCmd) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}
