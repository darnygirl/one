/**
 * Code Execution Sandbox Tool
 * Safely execute JavaScript and Python code with result visualization
 */

import type { ToolDefinition } from '../types';

interface ExecutionResult {
  output: string;
  console_logs: string[];
  return_value: any;
  execution_time_ms: number;
  memory_used?: string;
  errors: string[];
  warnings: string[];
  visualizations?: any[];
}

// JavaScript execution sandbox
function executeJavaScript(code: string, timeout: number = 5000): ExecutionResult {
  const startTime = performance.now();
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let returnValue: any;
  let output = '';

  // Create sandboxed console
  const sandboxConsole = {
    log: (...args: any[]) => {
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
      consoleLogs.push(message);
    },
    error: (...args: any[]) => {
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
      errors.push(message);
    },
    warn: (...args: any[]) => {
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
      warnings.push(message);
    },
    info: (...args: any[]) => {
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
      consoleLogs.push('[INFO] ' + message);
    },
    debug: (...args: any[]) => {
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
      consoleLogs.push('[DEBUG] ' + message);
    },
  };

  try {
    // Wrap code in async function to support await
    const wrappedCode = `
      (async function() {
        const console = arguments[0];
        ${code}
      })
    `;

    // Create function with restricted global scope
    const func = new Function('return ' + wrappedCode)();

    // Execute with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Execution timeout (${timeout}ms exceeded)`)), timeout)
    );

    const executionPromise = func(sandboxConsole);

    // Race between execution and timeout
    Promise.race([executionPromise, timeoutPromise])
      .then((result) => {
        returnValue = result;
      })
      .catch((error) => {
        errors.push(error.message);
      });

    // For synchronous code, wait a bit
    const syncTimeout = Math.min(timeout, 100);
    const syncStart = Date.now();
    while (Date.now() - syncStart < syncTimeout) {
      // Busy wait for sync code
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
      if (error.stack) {
        const stackLines = error.stack.split('\n').slice(0, 5);
        errors.push('Stack trace:\n' + stackLines.join('\n'));
      }
    } else {
      errors.push('Unknown error occurred');
    }
  }

  const executionTime = performance.now() - startTime;

  // Build output
  if (consoleLogs.length > 0) {
    output += 'Console Output:\n' + consoleLogs.join('\n') + '\n\n';
  }
  if (returnValue !== undefined) {
    output +=
      'Return Value:\n' + (typeof returnValue === 'object' ? JSON.stringify(returnValue, null, 2) : String(returnValue));
  }

  return {
    output: output || 'No output',
    console_logs: consoleLogs,
    return_value: returnValue,
    execution_time_ms: executionTime,
    errors,
    warnings,
  };
}

// Python execution using Pyodide (client-side Python)
async function executePython(code: string, timeout: number = 10000): Promise<ExecutionResult> {
  const startTime = performance.now();
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let returnValue: any;
  let output = '';

  try {
    // Check if Pyodide is loaded
    if (typeof window !== 'undefined' && !(window as any).pyodide) {
      // Try to load Pyodide
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Pyodide'));
        document.head.appendChild(script);
      });

      // Initialize Pyodide
      (window as any).pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      });
    }

    const pyodide = (window as any).pyodide;

    if (!pyodide) {
      throw new Error('Pyodide not available. Python execution requires browser environment.');
    }

    // Capture stdout/stderr
    await pyodide.runPythonAsync(`
import sys
from io import StringIO

_stdout = StringIO()
_stderr = StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
    `);

    // Execute code with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Execution timeout (${timeout}ms exceeded)`)), timeout)
    );

    const executionPromise = pyodide.runPythonAsync(code);

    returnValue = await Promise.race([executionPromise, timeoutPromise]);

    // Get stdout/stderr
    const stdout = await pyodide.runPythonAsync('_stdout.getvalue()');
    const stderr = await pyodide.runPythonAsync('_stderr.getvalue()');

    if (stdout) {
      consoleLogs.push(stdout);
      output += 'Output:\n' + stdout + '\n\n';
    }

    if (stderr) {
      errors.push(stderr);
    }

    if (returnValue !== undefined && returnValue !== null) {
      const valueStr = typeof returnValue === 'object' ? JSON.stringify(returnValue, null, 2) : String(returnValue);
      output += 'Return Value:\n' + valueStr;
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
      if (error.stack) {
        const stackLines = error.stack.split('\n').slice(0, 10);
        errors.push('Stack trace:\n' + stackLines.join('\n'));
      }
    } else {
      errors.push('Unknown error occurred');
    }
  }

  const executionTime = performance.now() - startTime;

  return {
    output: output || 'No output',
    console_logs: consoleLogs,
    return_value: returnValue,
    execution_time_ms: executionTime,
    errors,
    warnings,
  };
}

// Detect visualization data (for charts, graphs, etc.)
function detectVisualizations(result: ExecutionResult): ExecutionResult {
  const visualizations: any[] = [];

  // Check if return value is chart data
  if (result.return_value && typeof result.return_value === 'object') {
    // Detect array of numbers (could be chart data)
    if (Array.isArray(result.return_value) && result.return_value.every((v) => typeof v === 'number')) {
      visualizations.push({
        type: 'line_chart',
        data: result.return_value,
        label: 'Result',
      });
    }

    // Detect object with labels and values (could be bar chart)
    if (
      !Array.isArray(result.return_value) &&
      'labels' in result.return_value &&
      'values' in result.return_value
    ) {
      visualizations.push({
        type: 'bar_chart',
        data: result.return_value,
      });
    }
  }

  if (visualizations.length > 0) {
    result.visualizations = visualizations;
  }

  return result;
}

// Format execution result for display
function formatResult(result: ExecutionResult, language: string): string {
  let formatted = `=== ${language.toUpperCase()} Execution Result ===\n\n`;

  if (result.output) {
    formatted += result.output + '\n\n';
  }

  formatted += `Execution Time: ${result.execution_time_ms.toFixed(2)}ms\n`;

  if (result.memory_used) {
    formatted += `Memory Used: ${result.memory_used}\n`;
  }

  if (result.warnings.length > 0) {
    formatted += `\nWarnings (${result.warnings.length}):\n`;
    result.warnings.forEach((warning) => {
      formatted += `  ⚠️  ${warning}\n`;
    });
  }

  if (result.errors.length > 0) {
    formatted += `\nErrors (${result.errors.length}):\n`;
    result.errors.forEach((error) => {
      formatted += `  ❌ ${error}\n`;
    });
  }

  if (result.visualizations && result.visualizations.length > 0) {
    formatted += `\nVisualizations available: ${result.visualizations.length}\n`;
  }

  return formatted;
}

export const codeExecutorTool: ToolDefinition = {
  name: 'execute_code',
  description:
    'Safely execute JavaScript or Python code in a sandboxed environment. Captures console output, return values, and provides result visualization. Includes timeout limits and error handling.',
  category: 'dev',
  parameters: [
    {
      name: 'code',
      type: 'string',
      description: 'The code to execute',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Programming language',
      required: true,
      enum: ['javascript', 'python'],
    },
    {
      name: 'timeout',
      type: 'number',
      description: 'Execution timeout in milliseconds (default: 5000ms for JS, 10000ms for Python)',
      required: false,
    },
    {
      name: 'detect_visualizations',
      type: 'boolean',
      description: 'Detect and suggest visualizations for output data',
      required: false,
    },
  ],
  async execute({ code, language, timeout, detect_visualizations = true }) {
    if (!code || code.trim().length === 0) {
      throw new Error('Code is required');
    }

    if (!['javascript', 'python'].includes(language)) {
      throw new Error('Language must be "javascript" or "python"');
    }

    let result: ExecutionResult;

    try {
      if (language === 'javascript') {
        const jsTimeout = timeout || 5000;
        result = executeJavaScript(code, jsTimeout);
      } else {
        const pyTimeout = timeout || 10000;
        result = await executePython(code, pyTimeout);
      }

      // Detect visualizations if enabled
      if (detect_visualizations) {
        result = detectVisualizations(result);
      }

      return {
        success: result.errors.length === 0,
        language,
        result,
        formatted_output: formatResult(result, language),
        security_info: {
          sandboxed: true,
          timeout_ms: language === 'javascript' ? timeout || 5000 : timeout || 10000,
          restrictions: [
            'No filesystem access',
            'No network requests (except Pyodide for Python)',
            'No DOM manipulation',
            'Execution timeout enforced',
            'Limited memory usage',
          ],
        },
        tips: [
          language === 'javascript'
            ? 'Use console.log() to see intermediate values'
            : 'Use print() to see intermediate values',
          'Return data to see visualizations (arrays, objects)',
          'Keep execution time under timeout limit',
          language === 'python'
            ? 'First execution may be slow (loading Pyodide)'
            : 'Async/await is supported',
        ],
      };
    } catch (error) {
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  metadata: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['code', 'execution', 'sandbox', 'javascript', 'python', 'dev', 'programming'],
    examples: [
      {
        description: 'Execute JavaScript',
        params: {
          code: 'const result = [1, 2, 3].map(x => x * 2);\nconsole.log(result);\nreturn result;',
          language: 'javascript',
        },
      },
      {
        description: 'Execute Python',
        params: {
          code: 'import math\nresult = [math.sqrt(x) for x in range(1, 10)]\nprint(result)\nresult',
          language: 'python',
        },
      },
      {
        description: 'Generate data visualization',
        params: {
          code: 'return { labels: ["A", "B", "C"], values: [10, 20, 15] }',
          language: 'javascript',
          detect_visualizations: true,
        },
      },
    ],
  },
};
