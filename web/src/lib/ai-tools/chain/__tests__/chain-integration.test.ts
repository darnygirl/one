/**
 * Chain System Integration Tests
 * Tests the complete chain execution system including AI selection and monitoring
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChainExecutor } from '../executor';
import {
  presetChains,
  getPresetChain,
  getPresetChainsByCategory,
  getPresetChainsByDifficulty,
  getChainStatistics,
  validateChainParameters,
} from '../presets';
import { suggestChains, recordChainSuccess, initializeAISelector } from '../ai-selector';
import type { Chain } from '../types';

describe('Chain System Integration', () => {
  beforeEach(() => {
    initializeAISelector();
  });

  describe('Chain Presets', () => {
    it('should have 18 preset chains', () => {
      expect(presetChains).toHaveLength(18);
    });

    it('should have all chains with required fields', () => {
      presetChains.forEach((chain) => {
        expect(chain.id).toBeDefined();
        expect(chain.name).toBeDefined();
        expect(chain.description).toBeDefined();
        expect(chain.category).toBeDefined();
        expect(chain.difficulty).toBeDefined();
        expect(chain.version).toBeDefined();
        expect(chain.nodes.length).toBeGreaterThan(0);
      });
    });

    it('should retrieve chain by ID', () => {
      const chain = getPresetChain('weather-research');
      expect(chain).toBeDefined();
      expect(chain?.name).toBe('Weather Research');
    });

    it('should filter chains by category', () => {
      const securityChains = getPresetChainsByCategory('security');
      expect(securityChains.length).toBeGreaterThan(0);
      securityChains.forEach((chain) => {
        expect(chain.category).toBe('security');
      });
    });

    it('should filter chains by difficulty', () => {
      const beginnerChains = getPresetChainsByDifficulty('beginner');
      expect(beginnerChains.length).toBeGreaterThan(0);
      beginnerChains.forEach((chain) => {
        expect(chain.difficulty).toBe('beginner');
      });
    });

    it('should calculate chain statistics', () => {
      const stats = getChainStatistics();
      expect(stats.total).toBe(18);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byDifficulty).toBeDefined();
      expect(stats.averageNodesPerChain).toBeGreaterThan(0);
    });
  });

  describe('Chain Parameter Validation', () => {
    it('should validate required parameters', () => {
      const chain = getPresetChain('weather-research');
      expect(chain).toBeDefined();

      if (!chain) return;

      const result = validateChainParameters(chain, {
        query: 'Paris France',
        units: 'metric',
        forecast_days: 7,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required parameters', () => {
      const chain = getPresetChain('weather-research');
      expect(chain).toBeDefined();

      if (!chain) return;

      const result = validateChainParameters(chain, {
        units: 'metric',
        // missing required 'query'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate number ranges', () => {
      const chain = getPresetChain('weather-research');
      expect(chain).toBeDefined();

      if (!chain) return;

      const result = validateChainParameters(chain, {
        query: 'Paris',
        units: 'metric',
        forecast_days: 20, // exceeds max of 14
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('between 1 and 14'))).toBe(true);
    });

    it('should validate pattern matching', () => {
      const chain = getPresetChain('url-qr');
      expect(chain).toBeDefined();

      if (!chain) return;

      const result = validateChainParameters(chain, {
        url: 'not-a-valid-url',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('valid URL'))).toBe(true);
    });
  });

  describe('AI Chain Selection', () => {
    it('should suggest chains for weather-related tasks', async () => {
      const result = await suggestChains('I need to check the weather in Paris');

      expect(result.primary).toBeDefined();
      expect(result.primary.confidence).toBeGreaterThan(0);
      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.taskAnalysis.category).toBe('productivity');
    });

    it('should suggest chains for security tasks', async () => {
      const result = await suggestChains('Generate a secure password and hash it');

      expect(result.primary).toBeDefined();
      expect(result.primary.chain.category).toBe('security');
      expect(result.suggestedTools).toContain('password_generator');
    });

    it('should suggest chains for translation tasks', async () => {
      const result = await suggestChains('Translate this text to Spanish');

      expect(result.primary).toBeDefined();
      expect(result.taskAnalysis.category).toBe('international');
      expect(result.suggestedTools).toContain('translate');
    });

    it('should detect complexity levels', async () => {
      const simpleResult = await suggestChains('Simple weather lookup');
      expect(simpleResult.taskAnalysis.complexity).toBe('beginner');

      const advancedResult = await suggestChains(
        'Complex multi-step data processing pipeline'
      );
      expect(advancedResult.taskAnalysis.complexity).toBe('advanced');
    });

    it('should learn from usage patterns', async () => {
      // Record successful usage
      recordChainSuccess('weather-research', 'check weather in london');
      recordChainSuccess('weather-research', 'weather forecast for tokyo');

      const result = await suggestChains('weather in new york');

      // Weather research chain should have higher confidence due to usage
      expect(result.primary.chain.id).toBe('weather-research');
    });
  });

  describe('Chain Execution', () => {
    it('should validate chains before execution', async () => {
      const executor = new ChainExecutor();
      const chain = getPresetChain('weather-research');

      expect(chain).toBeDefined();
      if (!chain) return;

      const validation = executor.validateChain(chain);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect circular dependencies', () => {
      const executor = new ChainExecutor();

      const circularChain: Chain = {
        id: 'circular',
        name: 'Circular Chain',
        description: 'Test circular dependency',
        category: 'development',
        difficulty: 'intermediate',
        version: '1.0.0',
        nodes: [
          {
            id: 'node1',
            toolName: 'calculator',
            parameters: { expression: '1+1' },
            position: { x: 0, y: 0 },
          },
          {
            id: 'node2',
            toolName: 'calculator',
            parameters: { expression: '2+2' },
            position: { x: 100, y: 0 },
          },
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
            sourceOutputKey: 'result',
            targetInputKey: 'expression',
          },
          {
            id: 'edge2',
            sourceNodeId: 'node2',
            targetNodeId: 'node1',
            sourceOutputKey: 'result',
            targetInputKey: 'expression',
          },
        ],
      };

      const validation = executor.validateChain(circularChain);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Circular'))).toBe(true);
    });

    it('should detect invalid tool references', () => {
      const executor = new ChainExecutor();

      const invalidChain: Chain = {
        id: 'invalid',
        name: 'Invalid Chain',
        description: 'Test invalid tool',
        category: 'development',
        difficulty: 'beginner',
        version: '1.0.0',
        nodes: [
          {
            id: 'node1',
            toolName: 'nonexistent_tool',
            parameters: {},
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
      };

      const validation = executor.validateChain(invalidChain);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('unknown tool'))).toBe(true);
    });
  });

  describe('Chain Categories Distribution', () => {
    it('should have chains in all categories', () => {
      const stats = getChainStatistics();
      const categories = [
        'productivity',
        'development',
        'design',
        'data',
        'security',
        'international',
        'finance',
        'marketing',
      ];

      categories.forEach((category) => {
        expect(stats.byCategory[category]).toBeGreaterThan(0);
      });
    });

    it('should have chains at all difficulty levels', () => {
      const stats = getChainStatistics();

      expect(stats.byDifficulty.beginner).toBeGreaterThan(0);
      expect(stats.byDifficulty.intermediate).toBeGreaterThan(0);
      expect(stats.byDifficulty.advanced).toBeGreaterThan(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should load all chains quickly', () => {
      const start = performance.now();
      const chains = presetChains;
      const end = performance.now();

      expect(chains.length).toBe(18);
      expect(end - start).toBeLessThan(10); // Should load in <10ms
    });

    it('should suggest chains quickly', async () => {
      const start = performance.now();
      await suggestChains('translate text to spanish');
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should suggest in <100ms
    });

    it('should validate chains quickly', () => {
      const chain = getPresetChain('weather-research');
      expect(chain).toBeDefined();

      if (!chain) return;

      const start = performance.now();
      validateChainParameters(chain, {
        query: 'Paris',
        units: 'metric',
        forecast_days: 7,
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(5); // Should validate in <5ms
    });
  });
});
