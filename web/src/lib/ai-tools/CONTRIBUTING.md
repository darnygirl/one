# Contributing to AI Tools

Thank you for your interest in contributing to the AI Tools library! This guide will help you add new tools quickly and correctly.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tool Structure](#tool-structure)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Best Practices](#best-practices)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Submission](#submission)

## Quick Start

**Time to add a new tool:** 15-30 minutes

**Basic steps:**
1. Create tool file in `/web/src/lib/ai-tools/tools/`
2. Define tool structure with metadata
3. Implement execute function
4. Register tool in `registerAllTools.ts`
5. Add tests
6. Update documentation

## Tool Structure

Every tool follows this standardized structure:

```typescript
import type { ToolDefinition } from '../types';

export const myTool: ToolDefinition = {
  name: 'my_tool',
  description: 'Brief description of what the tool does',
  category: 'utility', // data | search | utility | encoding | dev | creative

  parameters: [
    {
      name: 'param1',
      type: 'string',
      description: 'Description of parameter',
      required: true,
      enum: ['option1', 'option2'] // Optional: for select inputs
    },
    // ... more parameters
  ],

  async execute(params: any) {
    // Your tool logic here
    const { param1 } = params;

    // Validate parameters
    if (!param1) {
      throw new Error('param1 is required');
    }

    // Perform operation
    const result = await performOperation(param1);

    // Return result
    return {
      result,
      // ... other fields
    };
  },

  metadata: {
    version: '1.0.0',
    author: 'Your Name',
    tags: ['tag1', 'tag2', 'tag3'],
    examples: [
      {
        description: 'Basic usage example',
        params: {
          param1: 'example value'
        }
      }
    ]
  },

  // Optional: Enable caching
  cacheable: true,
  cacheTTL: 60 * 60 * 1000, // 1 hour in milliseconds

  // Optional: Custom render function for UI
  render: (result) => {
    return <CustomResultDisplay result={result} />;
  }
};
```

## Step-by-Step Guide

### Step 1: Create Tool File

Create a new file in `/web/src/lib/ai-tools/tools/`:

```bash
touch web/src/lib/ai-tools/tools/my-tool.ts
```

### Step 2: Define Tool Structure

```typescript
// web/src/lib/ai-tools/tools/my-tool.ts
import type { ToolDefinition } from '../types';

export const myTool: ToolDefinition = {
  name: 'my_tool',
  description: 'Does something useful',
  category: 'utility',

  parameters: [
    {
      name: 'input',
      type: 'string',
      description: 'Input value to process',
      required: true
    },
    {
      name: 'format',
      type: 'string',
      description: 'Output format',
      required: false,
      enum: ['json', 'text', 'html']
    }
  ],

  async execute(params) {
    // Implementation here
  },

  metadata: {
    version: '1.0.0',
    author: 'Your Name',
    tags: ['utility', 'processing'],
    examples: [
      {
        description: 'Basic example',
        params: {
          input: 'test',
          format: 'json'
        }
      }
    ]
  }
};
```

### Step 3: Implement Execute Function

```typescript
async execute(params: any) {
  // 1. Extract and validate parameters
  const { input, format = 'json' } = params;

  if (!input) {
    throw new Error('input parameter is required');
  }

  // 2. Perform the operation
  try {
    const processed = await processInput(input);

    // 3. Format the result
    let result;
    if (format === 'json') {
      result = JSON.stringify(processed, null, 2);
    } else if (format === 'text') {
      result = processed.toString();
    } else if (format === 'html') {
      result = `<pre>${processed}</pre>`;
    }

    // 4. Return standardized result
    return {
      input,
      format,
      result,
      success: true,
      timestamp: Date.now()
    };
  } catch (error) {
    // 5. Handle errors gracefully
    throw new Error(`Failed to process input: ${error.message}`);
  }
}
```

### Step 4: Export Tool

Add your tool to `/web/src/lib/ai-tools/tools/index.ts`:

```typescript
export { myTool } from './my-tool';
```

### Step 5: Register Tool

Add your tool to `/web/src/lib/ai-tools/registerAllTools.ts`:

```typescript
import { myTool } from './tools/my-tool';

// Add metadata
const toolMetadata: Record<string, ToolMetadata> = {
  // ... existing tools
  my_tool: {
    version: '1.0.0',
    author: 'Your Name',
    tags: ['utility', 'processing'],
    examples: [
      {
        description: 'Basic usage',
        params: { input: 'test', format: 'json' }
      }
    ]
  }
};

// Register in registerAllTools function
export function registerAllTools() {
  registerTools(
    // ... existing tools
    withMetadata(myTool, 'my_tool')
  );
}
```

### Step 6: Add Tests

Create test file `/web/test/ai-tools/my-tool.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { toolRegistry } from '@/lib/ai-tools/registry';
import { registerAllTools } from '@/lib/ai-tools/registerAllTools';

describe('My Tool', () => {
  beforeEach(() => {
    registerAllTools();
  });

  it('should execute successfully with valid parameters', async () => {
    const result = await toolRegistry.execute('my_tool', {
      input: 'test',
      format: 'json'
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });

  it('should throw error with missing required parameter', async () => {
    await expect(
      toolRegistry.execute('my_tool', {})
    ).rejects.toThrow('input parameter is required');
  });

  it('should handle different formats', async () => {
    const formats = ['json', 'text', 'html'];

    for (const format of formats) {
      const result = await toolRegistry.execute('my_tool', {
        input: 'test',
        format
      });

      expect(result.format).toBe(format);
    }
  });

  it('should be cacheable', async () => {
    const params = { input: 'test', format: 'json' };

    // First call
    await toolRegistry.execute('my_tool', params);

    // Second call (should be cached)
    const result = await toolRegistry.execute('my_tool', params);

    expect(result).toBeDefined();
  });
});
```

### Step 7: Update Documentation

Add your tool to `EXAMPLES.md` with comprehensive examples.

## Best Practices

### 1. Parameter Validation

Always validate input parameters:

```typescript
async execute(params: any) {
  const { required_param, optional_param = 'default' } = params;

  // Validate required parameters
  if (!required_param) {
    throw new Error('required_param is required');
  }

  // Validate parameter types
  if (typeof required_param !== 'string') {
    throw new Error('required_param must be a string');
  }

  // Validate parameter values
  if (required_param.length < 1 || required_param.length > 1000) {
    throw new Error('required_param must be between 1 and 1000 characters');
  }

  // Validate enums
  const validFormats = ['json', 'text', 'html'];
  if (optional_param && !validFormats.includes(optional_param)) {
    throw new Error(`format must be one of: ${validFormats.join(', ')}`);
  }
}
```

### 2. Error Handling

Provide clear, actionable error messages:

```typescript
try {
  const result = await externalApi.call(params);
  return result;
} catch (error) {
  // Check for specific error types
  if (error.code === 'RATE_LIMIT') {
    throw new Error('Rate limit exceeded. Please try again in a few minutes.');
  } else if (error.code === 'INVALID_API_KEY') {
    throw new Error('Invalid API key. Please check your configuration.');
  } else if (error.code === 'NETWORK_ERROR') {
    throw new Error('Network error. Please check your internet connection.');
  } else {
    throw new Error(`Failed to execute tool: ${error.message}`);
  }
}
```

### 3. Caching Strategy

Enable caching for expensive operations:

```typescript
export const myTool: ToolDefinition = {
  // ... other fields

  // Enable caching
  cacheable: true,

  // Set appropriate TTL based on data freshness requirements
  cacheTTL: 60 * 60 * 1000, // 1 hour for semi-static data
  // cacheTTL: 5 * 60 * 1000,     // 5 minutes for dynamic data
  // cacheTTL: 24 * 60 * 60 * 1000, // 24 hours for static data
};
```

**When to cache:**
- ✅ External API calls
- ✅ Expensive computations
- ✅ Static or semi-static data
- ❌ User-specific data
- ❌ Real-time data
- ❌ Sensitive information

### 4. Return Structure

Return consistent, well-structured data:

```typescript
return {
  // Original input (for debugging)
  input: params.input,

  // Primary result
  result: processedData,

  // Success flag
  success: true,

  // Metadata
  timestamp: Date.now(),
  executionTime: Date.now() - startTime,

  // Additional context
  metadata: {
    source: 'API Name',
    version: '1.0'
  }
};
```

### 5. Category Selection

Choose the appropriate category:

- **data** - Real-time data sources (weather, news, stocks)
- **search** - Search and information retrieval
- **utility** - General-purpose utilities (calculator, time, currency)
- **encoding** - Encoding, hashing, encryption
- **dev** - Developer tools (code formatting, UUID, regex)
- **creative** - Creative tools (QR codes, colors, lorem ipsum)

### 6. Tags

Add relevant, searchable tags:

```typescript
tags: [
  'primary-purpose',  // e.g., 'conversion', 'generation', 'validation'
  'domain',          // e.g., 'crypto', 'finance', 'text'
  'use-case'         // e.g., 'security', 'formatting', 'analysis'
]
```

**Good tags:** `['hash', 'crypto', 'security', 'checksum']`
**Bad tags:** `['tool', 'utility', 'helper']` (too generic)

### 7. Examples

Provide comprehensive examples:

```typescript
examples: [
  {
    description: 'Basic usage',
    params: {
      input: 'simple value'
    }
  },
  {
    description: 'Advanced usage with all options',
    params: {
      input: 'complex value',
      option1: true,
      option2: 'custom',
      format: 'json'
    }
  },
  {
    description: 'Edge case example',
    params: {
      input: 'edge-case-value'
    }
  }
]
```

### 8. Type Safety

Use TypeScript for type safety:

```typescript
// Define parameter types
interface MyToolParams {
  input: string;
  format?: 'json' | 'text' | 'html';
  options?: {
    uppercase?: boolean;
    trim?: boolean;
  };
}

// Define result type
interface MyToolResult {
  input: string;
  format: string;
  result: string;
  success: boolean;
  timestamp: number;
}

// Use types in execute function
async execute(params: MyToolParams): Promise<MyToolResult> {
  // Implementation with full type safety
}
```

## Testing

### Unit Tests

Test individual tool functionality:

```typescript
describe('My Tool', () => {
  it('should process input correctly', async () => {
    const result = await toolRegistry.execute('my_tool', {
      input: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });
});
```

### Integration Tests

Test tool with caching and rate limiting:

```typescript
describe('My Tool Integration', () => {
  it('should cache results', async () => {
    const params = { input: 'test' };

    // First call
    await toolRegistry.execute('my_tool', params);

    // Second call (cached)
    const result = await toolRegistry.execute('my_tool', params);

    const stats = await cacheManager.getStats();
    expect(stats.hits).toBeGreaterThan(0);
  });

  it('should respect rate limits', async () => {
    // Test rate limiting behavior
  });
});
```

### Error Tests

Test error handling:

```typescript
describe('My Tool Errors', () => {
  it('should throw on missing required parameter', async () => {
    await expect(
      toolRegistry.execute('my_tool', {})
    ).rejects.toThrow('input parameter is required');
  });

  it('should handle API errors gracefully', async () => {
    // Mock API failure
    // Test error handling
  });
});
```

### Performance Tests

Test execution time:

```typescript
describe('My Tool Performance', () => {
  it('should execute within acceptable time', async () => {
    const start = Date.now();

    await toolRegistry.execute('my_tool', { input: 'test' });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // < 1 second
  });
});
```

## Documentation

### 1. Update README.md

Add your tool to the main README with examples.

### 2. Update EXAMPLES.md

Add comprehensive examples showing all features.

### 3. Add JSDoc Comments

Document your code:

```typescript
/**
 * My Tool
 *
 * Does something useful with input data.
 *
 * @param params - Tool parameters
 * @param params.input - The input to process
 * @param params.format - Output format (json, text, or html)
 * @returns Processed result with metadata
 *
 * @example
 * ```typescript
 * const result = await toolRegistry.execute('my_tool', {
 *   input: 'test',
 *   format: 'json'
 * });
 * ```
 */
```

### 4. Update CONTRIBUTING.md

If your tool introduces new patterns, update this guide.

## Submission

### Checklist

Before submitting your tool:

- [ ] Tool file created in `/tools/`
- [ ] Tool exported in `/tools/index.ts`
- [ ] Tool registered in `registerAllTools.ts`
- [ ] Metadata added with version, author, tags, examples
- [ ] Parameters documented with types and descriptions
- [ ] Execute function implemented with validation
- [ ] Error handling added
- [ ] Caching configured (if applicable)
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Error tests added
- [ ] Performance tests added
- [ ] README.md updated
- [ ] EXAMPLES.md updated
- [ ] JSDoc comments added
- [ ] All tests passing (`bun test`)
- [ ] Type checking passing (`bunx astro check`)
- [ ] Linting passing (`bun run lint`)

### Pull Request

1. Create a branch: `git checkout -b feature/my-tool`
2. Commit changes: `git commit -m "feat: Add my-tool"`
3. Push branch: `git push origin feature/my-tool`
4. Open pull request with description:

```markdown
## Description
Brief description of the tool and what it does.

## Changes
- Added my-tool in /tools/my-tool.ts
- Added tests in /test/ai-tools/my-tool.test.ts
- Updated documentation

## Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots of the tool in action]
```

## Examples of Good Tools

Study these examples for reference:

1. **Weather Tool** - Complex API integration with caching
2. **Calculator Tool** - Multiple modes and extensive validation
3. **Translation Tool** - Optional parameters and error handling
4. **UUID Tool** - Simple, focused functionality
5. **Hash Tool** - Security best practices

## Need Help?

- **Documentation:** [README.md](./README.md)
- **Examples:** [EXAMPLES.md](./EXAMPLES.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/one/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/one/discussions)

---

**Happy coding! We look forward to your contribution!** 🎉
