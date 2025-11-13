/**
 * Theme Manager
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'chat-theme';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved as Theme;
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
  return 'system';
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export function initTheme(): void {
  if (typeof window === 'undefined') return;
  const theme = getTheme();
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
