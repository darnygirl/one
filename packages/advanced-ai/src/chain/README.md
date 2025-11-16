# AI Tool Chain System

Complete guide to the AI Tool Chain System with templates, AI-powered selection, and real-time monitoring.

## Overview

The Chain System allows you to compose multiple AI tools into powerful workflows. With 18 pre-built chains across 8 categories, AI-powered chain selection, and real-time monitoring, you can create complex automation pipelines with ease.

## Features

- **18 Pre-built Chains** - Production-ready chains for common workflows
- **8 Categories** - Organized by use case (productivity, development, design, data, security, international, finance, marketing)
- **3 Difficulty Levels** - Beginner, intermediate, and advanced chains
- **AI-Powered Selection** - Automatically suggests optimal chains based on your task description
- **Parameter Templates** - Type-safe parameter validation with helpful error messages
- **Real-Time Monitoring** - Visual execution timeline with performance metrics
- **Usage Learning** - Improves suggestions based on your usage patterns
- **Export Logs** - Download execution logs for debugging and auditing

## Quick Start

### Using a Pre-built Chain

```typescript
import { getPresetChain } from '@/lib/ai-tools/chain/presets';
import { executeChain } from '@/lib/ai-tools/chain/executor';

// Get a chain
const chain = getPresetChain('weather-research');

// Execute it
const result = await executeChain(chain, {
  query: 'Paris France',
  units: 'metric',
  forecast_days: 7,
});

console.log(result.finalOutput);
```

### AI-Powered Chain Selection

```typescript
import { suggestChains } from '@/lib/ai-tools/chain/ai-selector';

// Describe your task in natural language
const suggestions = await suggestChains('I need to translate text to Spanish and create a QR code');

// Get the best match
const bestChain = suggestions.primary.chain;
console.log(`Suggested: ${bestChain.name} (${suggestions.primary.confidence * 100}% confidence)`);
console.log(`Reasoning: ${suggestions.primary.reasoning}`);

// See alternatives
suggestions.alternatives.forEach(alt => {
  console.log(`- ${alt.chain.name} (${alt.confidence * 100}% confidence)`);
});
```

### Real-Time Monitoring

```tsx
import { ChainMonitor } from '@/components/ai-tools/ChainMonitor';

function MyPage() {
  const chain = getPresetChain('weather-research');

  return (
    <ChainMonitor
      chain={chain}
      onExecutionComplete={(result) => {
        console.log('Chain completed:', result);
      }}
      onError={(error) => {
        console.error('Chain failed:', error);
      }}
    />
  );
}
```

## Available Chains

### Productivity (3 chains)

1. **Weather Research** (Beginner)
   - Search for location → Get weather forecast
   - Use case: Travel planning, event scheduling
   - Tools: websearch, get_weather

2. **E-commerce Product Setup** (Advanced)
   - Calculate pricing → Convert currencies → Generate QR codes
   - Use case: Product launches, multi-currency stores
   - Tools: calculator, currency_convert, uuid_generator, generate_qr_code

### Development (4 chains)

3. **Code Analysis** (Intermediate)
   - Format code → Generate integrity hash
   - Use case: Code review, version control
   - Tools: code_formatter, hash

4. **API Response Parser** (Intermediate)
   - Search API docs → Parse JSON responses
   - Use case: API integration, data extraction
   - Tools: websearch, json_tools

5. **Multi-language Documentation** (Advanced)
   - Format code → Generate markdown docs
   - Use case: Code documentation, API reference
   - Tools: code_formatter, markdown_tools

### Design (2 chains)

6. **Color Palette Accessibility** (Intermediate)
   - Convert color → Generate palette → Check WCAG compliance
   - Use case: UI design, branding
   - Tools: color_tools (3 nodes)

7. **Design Asset Generator** (Intermediate)
   - Generate UUIDs → Create color palettes
   - Use case: Asset creation, brand consistency
   - Tools: uuid_generator, color_tools

### Data (3 chains)

8. **Data Validation Pipeline** (Advanced)
   - Validate JSON → Extract with regex → Hash result
   - Use case: Data processing, ETL pipelines
   - Tools: json_tools, regex, hash

9. **Data Processing Pipeline** (Advanced)
   - Validate → Transform → Encode
   - Use case: Data transformation, API integration
   - Tools: json_tools, regex, encoding

### Security (3 chains)

10. **Secure Data** (Intermediate)
    - Hash data → Encode to Base64
    - Use case: Data protection, secure storage
    - Tools: hash, encoding

11. **Secure Password Generation** (Intermediate)
    - Generate password → Hash for storage → Create QR code
    - Use case: User onboarding, credential management
    - Tools: password_generator, hash, generate_qr_code

12. **Security Audit Pipeline** (Advanced)
    - Hash sensitive data → Validate structure → Encode for transmission
    - Use case: Security audits, compliance
    - Tools: hash, json_tools, encoding

### International (2 chains)

13. **Translation QR Code** (Beginner)
    - Translate text → Generate QR code
    - Use case: International signage, multilingual content
    - Tools: translate, generate_qr_code

14. **Content Localization** (Intermediate)
    - Translate → Format time for locale
    - Use case: International apps, global content
    - Tools: translate, time_tools

### Finance (2 chains)

15. **Currency Calculator** (Beginner)
    - Calculate amount → Convert currency
    - Use case: International payments, pricing
    - Tools: calculator, currency_convert

16. **Financial Report Generator** (Advanced)
    - Calculate totals → Convert currencies → Format report
    - Use case: Financial reporting, multi-currency accounting
    - Tools: calculator, currency_convert, json_tools

### Marketing (2 chains)

17. **URL to QR Code** (Beginner)
    - Shorten URL → Generate QR code
    - Use case: Campaign tracking, offline-to-online conversion
    - Tools: url_shortener, generate_qr_code

18. **Marketing Content Pipeline** (Advanced)
    - Generate placeholder content → Translate
    - Use case: Content creation, A/B testing
    - Tools: lorem_generator, translate

## AI Chain Selection

The AI selector analyzes your task description using multiple signals:

### Confidence Scoring (0-100%)

- **Category Match (30%)** - Matches task category
- **Tag Matching (20%)** - Keywords in chain tags
- **Description Match (15%)** - Keywords in chain description
- **Tool Matching (15%)** - Relevant tools used
- **Complexity Match (10%)** - Appropriate difficulty level
- **Intent Detection (5%)** - Task intent patterns
- **Usage Patterns (5%)** - Learning from your history

### Example Suggestions

```typescript
// Security task
await suggestChains('hash my password securely');
// Suggests: Secure Password Generation (85% confidence)

// Translation task
await suggestChains('translate menu to japanese');
// Suggests: Translation QR Code (78% confidence)

// Complex workflow
await suggestChains('validate json data and transform it securely');
// Suggests: Data Validation Pipeline (92% confidence)
```

## Parameter Templates

All chains include type-safe parameter templates:

```typescript
import { validateChainParameters } from '@/lib/ai-tools/chain/presets';

const chain = getPresetChain('weather-research');
const params = {
  query: 'London UK',
  units: 'metric',
  forecast_days: 7,
};

const validation = validateChainParameters(chain, params);

if (!validation.valid) {
  console.error('Invalid parameters:', validation.errors);
}
```

### Validation Types

- **Required Fields** - Must be provided
- **Type Checking** - String, number, boolean, select
- **Range Validation** - Min/max for numbers
- **Pattern Matching** - Regex validation for strings
- **Custom Messages** - Helpful error messages

## Chain Monitor Component

The ChainMonitor provides real-time visualization:

### Features

- **Progress Bar** - Visual progress indicator
- **Node Timeline** - Step-by-step execution view
- **Status Indicators** - Pending, running, completed, error
- **Performance Metrics** - Duration per node
- **Error Highlighting** - Clear error messages
- **Pause/Resume** - Control execution flow
- **Export Logs** - Download execution logs

### Usage

```tsx
import { ChainMonitor } from '@/components/ai-tools/ChainMonitor';
import { getPresetChain } from '@/lib/ai-tools/chain/presets';

function ChainExecutionPage() {
  const chain = getPresetChain('data-validation');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Data Validation</h1>
      <ChainMonitor
        chain={chain}
        onExecutionComplete={(result) => {
          if (result.status === 'success') {
            toast.success('Chain completed successfully!');
          }
        }}
        onError={(error) => {
          toast.error(`Execution failed: ${error.message}`);
        }}
      />
    </div>
  );
}
```

## Usage Pattern Learning

The AI selector learns from your usage:

```typescript
import { recordChainSuccess, recordChainFailure } from '@/lib/ai-tools/chain/ai-selector';

// Record successful execution
recordChainSuccess('weather-research', 'check weather in paris');

// Record failed execution
recordChainFailure('data-validation', 'validate complex nested json');

// Future suggestions will factor in these patterns
const suggestions = await suggestChains('weather forecast for tokyo');
// Weather Research chain will have higher confidence
```

## Custom Chains

Create your own chains:

```typescript
import type { Chain } from '@/lib/ai-tools/chain/types';

const myChain: Chain = {
  id: 'my-custom-chain',
  name: 'My Custom Workflow',
  description: 'Custom automation workflow',
  category: 'productivity',
  difficulty: 'intermediate',
  version: '1.0.0',
  nodes: [
    {
      id: 'node1',
      toolName: 'calculator',
      label: 'Calculate Total',
      parameters: {
        expression: '100 * 1.2',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'node2',
      toolName: 'currency_convert',
      label: 'Convert to EUR',
      parameters: {
        amount: 0, // Will be filled from node1
        from: 'USD',
        to: 'EUR',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'edge1',
      sourceNodeId: 'node1',
      targetNodeId: 'node2',
      sourceOutputKey: 'result',
      targetInputKey: 'amount',
    },
  ],
  parameterTemplates: [
    {
      key: 'expression',
      label: 'Calculation',
      type: 'string',
      required: true,
      defaultValue: '100 * 1.2',
    },
  ],
};

// Execute your custom chain
const result = await executeChain(myChain);
```

## Statistics

Get insights into available chains:

```typescript
import { getChainStatistics } from '@/lib/ai-tools/chain/presets';

const stats = getChainStatistics();

console.log(`Total chains: ${stats.total}`);
console.log(`Average nodes per chain: ${stats.averageNodesPerChain.toFixed(1)}`);
console.log('Chains by category:', stats.byCategory);
console.log('Chains by difficulty:', stats.byDifficulty);
```

## Performance

All operations are optimized for speed:

- **Chain Loading**: <10ms for all 18 chains
- **AI Suggestions**: <100ms average
- **Parameter Validation**: <5ms per chain
- **Execution**: Depends on tools used

## Best Practices

1. **Start with Presets** - Use pre-built chains before creating custom ones
2. **Use AI Suggestions** - Let the AI recommend chains based on your task
3. **Validate Parameters** - Always validate before execution
4. **Monitor Execution** - Use ChainMonitor for complex workflows
5. **Record Usage** - Help improve AI suggestions by recording successes/failures
6. **Export Logs** - Keep logs for debugging and auditing

## Troubleshooting

### Chain validation fails
- Check that all tools exist in the registry
- Verify node IDs are unique
- Ensure no circular dependencies in edges

### AI suggestions seem wrong
- Record actual usage to improve learning
- Be more specific in your task description
- Check that relevant keywords are included

### Execution errors
- Validate parameters before execution
- Check tool-specific error messages
- Use ChainMonitor to identify failing nodes
- Export logs for detailed debugging

## Video Tutorial Concepts

1. **Introduction to Chains** (5 min)
   - What are chains and why use them
   - Tour of 18 pre-built chains
   - Basic execution example

2. **AI-Powered Selection** (7 min)
   - How the AI selector works
   - Natural language task descriptions
   - Understanding confidence scores
   - Recording usage for learning

3. **Building Custom Chains** (10 min)
   - Chain structure and components
   - Connecting nodes with edges
   - Parameter templates and validation
   - Testing and debugging

4. **Advanced Monitoring** (8 min)
   - Using ChainMonitor component
   - Reading performance metrics
   - Handling errors gracefully
   - Exporting and analyzing logs

## API Reference

### Core Functions

- `getPresetChain(id: string): Chain | undefined` - Get chain by ID
- `getPresetChainsByCategory(category: ChainCategory): Chain[]` - Filter by category
- `getPresetChainsByDifficulty(difficulty: ChainDifficulty): Chain[]` - Filter by difficulty
- `getChainStatistics()` - Get chain statistics
- `validateChainParameters(chain, params)` - Validate parameters
- `executeChain(chain, inputs?, options?)` - Execute chain
- `suggestChains(userInput: string)` - AI-powered chain selection
- `recordChainSuccess(chainId, description)` - Record successful usage
- `recordChainFailure(chainId, description)` - Record failed usage

### React Components

- `<ChainMonitor chain={chain} />` - Real-time execution monitor

## License

Part of the ONE Platform AI Tools suite.
