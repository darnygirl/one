/**
 * Chat Application Constants
 */

// Storage keys
export const STORAGE_KEYS = {
  API_KEY: 'openrouter-api-key',
  MODEL: 'openrouter-model',
  THEME: 'chat-theme',
  HISTORY: 'chat-history',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  GENUI: '/api/genui',
} as const;

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  UI: 'ui',
  REASONING: 'reasoning',
  TOOL_CALL: 'tool_call',
  ERROR: 'error',
  ACTION: 'action',
} as const;

// UI component types
export const UI_COMPONENTS = {
  CHART: 'chart',
  TABLE: 'table',
  FORM: 'form',
  BUTTON: 'button',
  CARD: 'card',
  TIMELINE: 'timeline',
} as const;

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
} as const;

// Timing constants
export const TIMING = {
  TYPING_DELAY: 30,
  COPY_FEEDBACK_DURATION: 2000,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
} as const;

// Limits
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  MAX_HISTORY_ITEMS: 100,
} as const;

// Feature flags
export const FEATURES = {
  VOICE_INPUT: true,
  WEB_SEARCH: true,
  FILE_UPLOAD: true,
  CODE_EXECUTION: false,
  COLLABORATION: false,
} as const;
