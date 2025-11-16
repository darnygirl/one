/**
 * AI-Powered Chain Selection
 * Analyzes user input and suggests optimal tool chains
 */

import type { Chain, ChainCategory, ChainDifficulty } from './types';
import { presetChains } from './presets';
import { toolRegistry } from '../registry';

export interface ChainSuggestion {
  chain: Chain;
  confidence: number; // 0-1
  reasoning: string;
  matchedKeywords: string[];
}

export interface ChainSelectionResult {
  primary: ChainSuggestion;
  alternatives: ChainSuggestion[];
  suggestedTools: string[];
  taskAnalysis: {
    category: ChainCategory | null;
    complexity: ChainDifficulty;
    keywords: string[];
    intents: string[];
  };
}

/**
 * Usage pattern tracking for learning
 */
interface UsagePattern {
  chainId: string;
  taskDescription: string;
  success: boolean;
  timestamp: number;
}

class ChainAISelector {
  private usageHistory: UsagePattern[] = [];
  private categoryKeywords: Record<ChainCategory, string[]> = {
    productivity: ['weather', 'research', 'organize', 'plan', 'schedule', 'manage'],
    development: ['code', 'format', 'parse', 'api', 'debug', 'test', 'build'],
    design: ['color', 'palette', 'brand', 'ui', 'visual', 'asset', 'style'],
    data: ['validate', 'transform', 'process', 'analyze', 'json', 'csv'],
    security: ['hash', 'encrypt', 'password', 'secure', 'audit', 'protect'],
    international: ['translate', 'language', 'locale', 'i18n', 'multilingual'],
    finance: ['currency', 'calculate', 'price', 'money', 'payment', 'invoice'],
    marketing: ['url', 'qr', 'campaign', 'content', 'share', 'promote'],
  };

  private intentPatterns = {
    'generate-and-share': ['create', 'generate', 'share', 'send'],
    'validate-and-process': ['validate', 'check', 'verify', 'process'],
    'convert-and-transform': ['convert', 'transform', 'change', 'format'],
    'calculate-and-report': ['calculate', 'compute', 'report', 'analyze'],
    'secure-and-protect': ['secure', 'protect', 'encrypt', 'hash'],
    'translate-and-localize': ['translate', 'localize', 'internationalize'],
  };

  /**
   * Analyze user input and suggest optimal chains
   */
  async selectChain(userInput: string): Promise<ChainSelectionResult> {
    const normalizedInput = userInput.toLowerCase();
    const keywords = this.extractKeywords(normalizedInput);
    const category = this.detectCategory(keywords);
    const complexity = this.detectComplexity(normalizedInput);
    const intents = this.detectIntents(normalizedInput);

    // Score all chains
    const scoredChains = presetChains.map((chain) => ({
      chain,
      score: this.scoreChain(chain, keywords, category, complexity, intents),
    }));

    // Sort by score
    scoredChains.sort((a, b) => b.score.total - a.score.total);

    // Get top suggestion
    const topChain = scoredChains[0];
    const primary: ChainSuggestion = {
      chain: topChain.chain,
      confidence: topChain.score.total,
      reasoning: this.generateReasoning(topChain.chain, topChain.score),
      matchedKeywords: topChain.score.matchedKeywords,
    };

    // Get alternatives (top 3-5)
    const alternatives: ChainSuggestion[] = scoredChains
      .slice(1, 5)
      .filter((scored) => scored.score.total > 0.2) // Only suggest if confidence > 20%
      .map((scored) => ({
        chain: scored.chain,
        confidence: scored.score.total,
        reasoning: this.generateReasoning(scored.chain, scored.score),
        matchedKeywords: scored.score.matchedKeywords,
      }));

    // Suggest individual tools that might be useful
    const suggestedTools = this.suggestTools(keywords, intents);

    return {
      primary,
      alternatives,
      suggestedTools,
      taskAnalysis: {
        category,
        complexity,
        keywords,
        intents,
      },
    };
  }

  /**
   * Score a chain against user input
   */
  private scoreChain(
    chain: Chain,
    keywords: string[],
    category: ChainCategory | null,
    complexity: ChainDifficulty,
    intents: string[]
  ): {
    total: number;
    breakdown: Record<string, number>;
    matchedKeywords: string[];
  } {
    const scores = {
      category: 0,
      tags: 0,
      description: 0,
      tools: 0,
      complexity: 0,
      intent: 0,
      usage: 0,
    };

    const matchedKeywords: string[] = [];

    // Category match (30% weight)
    if (category && chain.category === category) {
      scores.category = 0.3;
    }

    // Tag matching (20% weight)
    const chainTags = chain.metadata?.tags || [];
    const tagMatches = keywords.filter((kw) =>
      chainTags.some((tag) => tag.includes(kw) || kw.includes(tag))
    );
    scores.tags = (tagMatches.length / Math.max(keywords.length, 1)) * 0.2;
    matchedKeywords.push(...tagMatches);

    // Description matching (15% weight)
    const descriptionWords = chain.description.toLowerCase().split(/\s+/);
    const descMatches = keywords.filter((kw) =>
      descriptionWords.some((word) => word.includes(kw) || kw.includes(word))
    );
    scores.description = (descMatches.length / Math.max(keywords.length, 1)) * 0.15;
    matchedKeywords.push(...descMatches);

    // Tool matching (15% weight)
    const chainTools = chain.nodes.map((node) => node.toolName);
    const toolMatches = keywords.filter((kw) =>
      chainTools.some((tool) => tool.includes(kw) || kw.includes(tool))
    );
    scores.tools = (toolMatches.length / Math.max(keywords.length, 1)) * 0.15;
    matchedKeywords.push(...toolMatches);

    // Complexity match (10% weight)
    if (chain.difficulty === complexity) {
      scores.complexity = 0.1;
    } else if (complexity === 'intermediate') {
      // Intermediate users can handle beginner or advanced chains
      scores.complexity = 0.05;
    }

    // Intent matching (5% weight)
    const intentMatches = intents.filter((intent) => {
      const chainName = chain.name.toLowerCase();
      const chainDesc = chain.description.toLowerCase();
      return chainName.includes(intent) || chainDesc.includes(intent);
    });
    scores.intent = (intentMatches.length / Math.max(intents.length, 1)) * 0.05;

    // Usage pattern learning (5% weight)
    const usageScore = this.getUsageScore(chain.id, keywords);
    scores.usage = usageScore * 0.05;

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      total: Math.min(total, 1.0), // Cap at 1.0
      breakdown: scores,
      matchedKeywords: Array.from(new Set(matchedKeywords)),
    };
  }

  /**
   * Extract keywords from user input
   */
  private extractKeywords(input: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'must',
      'can',
      'i',
      'want',
      'need',
      'to',
    ]);

    const words = input
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    return Array.from(new Set(words));
  }

  /**
   * Detect category from keywords
   */
  private detectCategory(keywords: string[]): ChainCategory | null {
    const categoryScores: Record<ChainCategory, number> = {
      productivity: 0,
      development: 0,
      design: 0,
      data: 0,
      security: 0,
      international: 0,
      finance: 0,
      marketing: 0,
    };

    for (const keyword of keywords) {
      for (const [category, categoryKeywords] of Object.entries(
        this.categoryKeywords
      )) {
        if (categoryKeywords.some((ck) => ck.includes(keyword) || keyword.includes(ck))) {
          categoryScores[category as ChainCategory]++;
        }
      }
    }

    const maxScore = Math.max(...Object.values(categoryScores));
    if (maxScore === 0) return null;

    const topCategory = (Object.keys(categoryScores) as ChainCategory[]).find(
      (cat) => categoryScores[cat] === maxScore
    );

    return topCategory || null;
  }

  /**
   * Detect complexity from input
   */
  private detectComplexity(input: string): ChainDifficulty {
    const advancedKeywords = [
      'advanced',
      'complex',
      'comprehensive',
      'multi-step',
      'pipeline',
      'workflow',
    ];
    const beginnerKeywords = ['simple', 'basic', 'quick', 'easy', 'beginner'];

    const lowerInput = input.toLowerCase();

    if (advancedKeywords.some((kw) => lowerInput.includes(kw))) {
      return 'advanced';
    }

    if (beginnerKeywords.some((kw) => lowerInput.includes(kw))) {
      return 'beginner';
    }

    // Default to intermediate
    return 'intermediate';
  }

  /**
   * Detect user intents
   */
  private detectIntents(input: string): string[] {
    const detectedIntents: string[] = [];

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      const matchCount = patterns.filter((pattern) =>
        input.toLowerCase().includes(pattern)
      ).length;

      if (matchCount >= 2) {
        detectedIntents.push(intent);
      }
    }

    return detectedIntents;
  }

  /**
   * Generate reasoning for why a chain was suggested
   */
  private generateReasoning(
    chain: Chain,
    score: { breakdown: Record<string, number>; matchedKeywords: string[] }
  ): string {
    const reasons: string[] = [];

    if (score.breakdown.category > 0) {
      reasons.push(`Matches ${chain.category} category`);
    }

    if (score.matchedKeywords.length > 0) {
      reasons.push(`Contains relevant tools: ${score.matchedKeywords.slice(0, 3).join(', ')}`);
    }

    if (score.breakdown.complexity > 0) {
      reasons.push(`Appropriate ${chain.difficulty} difficulty level`);
    }

    if (score.breakdown.usage > 0) {
      reasons.push('Frequently used for similar tasks');
    }

    if (reasons.length === 0) {
      reasons.push('General purpose chain for your task');
    }

    return reasons.join('. ');
  }

  /**
   * Suggest individual tools based on keywords
   */
  private suggestTools(keywords: string[], intents: string[]): string[] {
    const suggested = new Set<string>();

    // Map keywords to tools
    const keywordToolMap: Record<string, string[]> = {
      translate: ['translate'],
      weather: ['get_weather'],
      qr: ['generate_qr_code'],
      url: ['url_shortener'],
      color: ['color_tools'],
      hash: ['hash'],
      password: ['password_generator'],
      json: ['json_tools'],
      code: ['code_formatter'],
      calculate: ['calculator'],
      currency: ['currency_convert'],
      time: ['time_tools'],
      regex: ['regex'],
      markdown: ['markdown_tools'],
      uuid: ['uuid_generator'],
      encode: ['encoding'],
      search: ['websearch'],
      lorem: ['lorem_generator'],
    };

    for (const keyword of keywords) {
      const tools = keywordToolMap[keyword];
      if (tools) {
        tools.forEach((tool) => suggested.add(tool));
      }
    }

    // Add tools based on intents
    if (intents.includes('generate-and-share')) {
      suggested.add('generate_qr_code');
      suggested.add('url_shortener');
    }

    if (intents.includes('validate-and-process')) {
      suggested.add('json_tools');
      suggested.add('regex');
    }

    if (intents.includes('secure-and-protect')) {
      suggested.add('hash');
      suggested.add('password_generator');
      suggested.add('encoding');
    }

    return Array.from(suggested).slice(0, 5); // Limit to top 5 tools
  }

  /**
   * Get usage score for a chain based on past success
   */
  private getUsageScore(chainId: string, keywords: string[]): number {
    const relevantUsage = this.usageHistory.filter((usage) => {
      if (usage.chainId !== chainId) return false;

      const usageKeywords = this.extractKeywords(usage.taskDescription);
      const overlap = keywords.filter((kw) => usageKeywords.includes(kw));

      return overlap.length > 0;
    });

    if (relevantUsage.length === 0) return 0;

    const successRate =
      relevantUsage.filter((u) => u.success).length / relevantUsage.length;
    const recencyBonus = Math.min(relevantUsage.length / 10, 0.3); // Up to 30% bonus

    return Math.min(successRate + recencyBonus, 1.0);
  }

  /**
   * Record usage pattern for learning
   */
  recordUsage(chainId: string, taskDescription: string, success: boolean): void {
    this.usageHistory.push({
      chainId,
      taskDescription,
      success,
      timestamp: Date.now(),
    });

    // Keep only last 100 patterns
    if (this.usageHistory.length > 100) {
      this.usageHistory = this.usageHistory.slice(-100);
    }

    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          'ai-chain-usage-history',
          JSON.stringify(this.usageHistory)
        );
      } catch (error) {
        console.warn('Failed to persist usage history:', error);
      }
    }
  }

  /**
   * Load usage history from localStorage
   */
  loadUsageHistory(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('ai-chain-usage-history');
        if (stored) {
          this.usageHistory = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load usage history:', error);
      }
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStatistics(): {
    totalUsage: number;
    successRate: number;
    mostUsedChains: Array<{ chainId: string; count: number }>;
  } {
    const chainCounts: Record<string, number> = {};

    for (const usage of this.usageHistory) {
      chainCounts[usage.chainId] = (chainCounts[usage.chainId] || 0) + 1;
    }

    const mostUsedChains = Object.entries(chainCounts)
      .map(([chainId, count]) => ({ chainId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const successCount = this.usageHistory.filter((u) => u.success).length;
    const successRate =
      this.usageHistory.length > 0 ? successCount / this.usageHistory.length : 0;

    return {
      totalUsage: this.usageHistory.length,
      successRate,
      mostUsedChains,
    };
  }
}

// Singleton instance
export const chainAISelector = new ChainAISelector();

/**
 * Convenience function for selecting chains
 */
export async function suggestChains(
  userInput: string
): Promise<ChainSelectionResult> {
  return chainAISelector.selectChain(userInput);
}

/**
 * Record successful chain execution
 */
export function recordChainSuccess(chainId: string, taskDescription: string): void {
  chainAISelector.recordUsage(chainId, taskDescription, true);
}

/**
 * Record failed chain execution
 */
export function recordChainFailure(chainId: string, taskDescription: string): void {
  chainAISelector.recordUsage(chainId, taskDescription, false);
}

/**
 * Initialize AI selector (load history)
 */
export function initializeAISelector(): void {
  chainAISelector.loadUsageHistory();
}
