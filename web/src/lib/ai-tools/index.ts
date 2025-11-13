/**
 * AI Tools System
 * Complete tools infrastructure for AI agents
 */

export * from './types';
export * from './registry';
export * from './tools';

// Initialize tools registry
import { toolRegistry, registerTools } from './registry';
import {
  weatherTool,
  websearchTool,
  calculatorTool,
  translationTool,
  timeTool,
  currencyTool,
  codeFormatterTool,
  uuidTool,
} from './tools';

// Register all available tools
registerTools(
  weatherTool,
  websearchTool,
  calculatorTool,
  translationTool,
  timeTool,
  currencyTool,
  codeFormatterTool,
  uuidTool
);

export { toolRegistry };
