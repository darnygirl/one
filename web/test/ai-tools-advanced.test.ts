/**
 * Advanced AI Tools Tests (Phase 5)
 * Tests for file processing, image generation, code execution, and voice tools
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { toolRegistry } from '../src/lib/ai-tools/registry';
import { registerAllTools } from '../src/lib/ai-tools/registerAllTools';

beforeAll(() => {
  registerAllTools();
});

describe('File Processor Tool', () => {
  it('should be registered', () => {
    const tool = toolRegistry.get('process_file');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('process_file');
    expect(tool?.category).toBe('utility');
  });

  it('should have correct metadata', () => {
    const tool = toolRegistry.get('process_file');
    expect(tool?.metadata.version).toBe('1.0.0');
    expect(tool?.metadata.tags).toContain('file');
    expect(tool?.metadata.tags).toContain('upload');
    expect(tool?.metadata.tags).toContain('ocr');
  });

  it('should have required parameters', () => {
    const tool = toolRegistry.get('process_file');
    expect(tool?.parameters).toBeDefined();

    const fileParam = tool?.parameters.find(p => p.name === 'file');
    expect(fileParam?.required).toBe(true);

    const tierParam = tool?.parameters.find(p => p.name === 'tier');
    expect(tierParam?.enum).toEqual(['free', 'premium']);
  });

  it('should reject invalid file object', async () => {
    await expect(
      toolRegistry.execute('process_file', { file: 'not a file' })
    ).rejects.toThrow('Invalid file object');
  });

  it('should detect file size limit violation', async () => {
    // Create a mock large file
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', {
      type: 'text/plain',
    });

    const result = await toolRegistry.execute('process_file', {
      file: largeFile,
      tier: 'free',
    });

    expect(result.file.metadata.exceeded_limit).toBe(true);
    expect(result.file.errors.length).toBeGreaterThan(0);
  });

  it('should process text file successfully', async () => {
    const textFile = new File(['Hello, World!'], 'test.txt', {
      type: 'text/plain',
    });

    const result = await toolRegistry.execute('process_file', {
      file: textFile,
      tier: 'free',
      extract_text: true,
    });

    expect(result.success).toBe(true);
    expect(result.file.metadata.name).toBe('test.txt');
    expect(result.file.extracted_data?.text).toContain('Hello, World!');
  });

  it('should parse CSV file', async () => {
    const csvContent = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
    const csvFile = new File([csvContent], 'data.csv', {
      type: 'text/csv',
    });

    const result = await toolRegistry.execute('process_file', {
      file: csvFile,
      tier: 'free',
    });

    expect(result.success).toBe(true);
    expect(result.file.extracted_data?.csv_rows).toBeDefined();
    expect(result.file.extracted_data?.csv_rows?.length).toBe(2);
    expect(result.file.extracted_data?.csv_rows?.[0].name).toBe('John');
  });
});

describe('Image Generation Tool', () => {
  it('should be registered', () => {
    const tool = toolRegistry.get('generate_image');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('generate_image');
    expect(tool?.category).toBe('creative');
  });

  it('should have correct metadata', () => {
    const tool = toolRegistry.get('generate_image');
    expect(tool?.metadata.version).toBe('1.0.0');
    expect(tool?.metadata.tags).toContain('image');
    expect(tool?.metadata.tags).toContain('ai');
    expect(tool?.metadata.tags).toContain('dalle');
    expect(tool?.metadata.tags).toContain('stable-diffusion');
  });

  it('should have required parameters', () => {
    const tool = toolRegistry.get('generate_image');
    expect(tool?.parameters).toBeDefined();

    const promptParam = tool?.parameters.find(p => p.name === 'prompt');
    expect(promptParam?.required).toBe(true);

    const providerParam = tool?.parameters.find(p => p.name === 'provider');
    expect(providerParam?.enum).toEqual(['dalle', 'stable-diffusion']);

    const styleParam = tool?.parameters.find(p => p.name === 'style');
    expect(styleParam?.enum).toContain('vivid');
    expect(styleParam?.enum).toContain('natural');
    expect(styleParam?.enum).toContain('photorealistic');
  });

  it('should require prompt', async () => {
    await expect(
      toolRegistry.execute('generate_image', { prompt: '' })
    ).rejects.toThrow('Prompt is required');
  });

  it('should use Stable Diffusion as default provider', async () => {
    // Mock fetch for Stable Diffusion
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const result = await toolRegistry.execute('generate_image', {
      prompt: 'A test image',
      provider: 'stable-diffusion',
      size: '512x512',
    });

    expect(result.success).toBe(true);
    expect(result.metadata.provider).toBe('stable-diffusion');
    expect(result.images).toBeDefined();
    expect(result.images.length).toBeGreaterThan(0);
    expect(result.prompt_suggestions).toBeDefined();
  });

  it('should provide prompt suggestions', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const result = await toolRegistry.execute('generate_image', {
      prompt: 'sunset',
      provider: 'stable-diffusion',
    });

    expect(result.prompt_suggestions).toBeDefined();
    expect(result.prompt_suggestions.length).toBeGreaterThan(0);
    expect(result.prompt_suggestions[0]).toContain('sunset');
  });
});

describe('Code Executor Tool', () => {
  it('should be registered', () => {
    const tool = toolRegistry.get('execute_code');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('execute_code');
    expect(tool?.category).toBe('dev');
  });

  it('should have correct metadata', () => {
    const tool = toolRegistry.get('execute_code');
    expect(tool?.metadata.version).toBe('1.0.0');
    expect(tool?.metadata.tags).toContain('code');
    expect(tool?.metadata.tags).toContain('execution');
    expect(tool?.metadata.tags).toContain('sandbox');
    expect(tool?.metadata.tags).toContain('javascript');
    expect(tool?.metadata.tags).toContain('python');
  });

  it('should have required parameters', () => {
    const tool = toolRegistry.get('execute_code');
    expect(tool?.parameters).toBeDefined();

    const codeParam = tool?.parameters.find(p => p.name === 'code');
    expect(codeParam?.required).toBe(true);

    const langParam = tool?.parameters.find(p => p.name === 'language');
    expect(langParam?.required).toBe(true);
    expect(langParam?.enum).toEqual(['javascript', 'python']);
  });

  it('should require code and language', async () => {
    await expect(
      toolRegistry.execute('execute_code', { code: '', language: 'javascript' })
    ).rejects.toThrow('Code is required');

    await expect(
      toolRegistry.execute('execute_code', { code: 'test', language: 'ruby' })
    ).rejects.toThrow('Language must be "javascript" or "python"');
  });

  it('should execute JavaScript code', async () => {
    const result = await toolRegistry.execute('execute_code', {
      code: 'const x = 2 + 2;\nconsole.log(x);\nreturn x;',
      language: 'javascript',
    });

    expect(result.success).toBe(true);
    expect(result.language).toBe('javascript');
    expect(result.result.console_logs).toContain('4');
    expect(result.result.return_value).toBe(4);
    expect(result.result.errors.length).toBe(0);
  });

  it('should capture console output', async () => {
    const result = await toolRegistry.execute('execute_code', {
      code: 'console.log("Hello"); console.log("World");',
      language: 'javascript',
    });

    expect(result.result.console_logs).toHaveLength(2);
    expect(result.result.console_logs[0]).toBe('Hello');
    expect(result.result.console_logs[1]).toBe('World');
  });

  it('should handle JavaScript errors', async () => {
    const result = await toolRegistry.execute('execute_code', {
      code: 'throw new Error("Test error");',
      language: 'javascript',
    });

    expect(result.success).toBe(false);
    expect(result.result.errors.length).toBeGreaterThan(0);
    expect(result.result.errors[0]).toContain('Test error');
  });

  it('should respect execution timeout', async () => {
    const result = await toolRegistry.execute('execute_code', {
      code: 'while(true) {}',
      language: 'javascript',
      timeout: 100,
    });

    expect(result.success).toBe(false);
    expect(result.result.errors.some(e => e.includes('timeout'))).toBe(true);
  });

  it('should include security info', async () => {
    const result = await toolRegistry.execute('execute_code', {
      code: 'return 42;',
      language: 'javascript',
    });

    expect(result.security_info).toBeDefined();
    expect(result.security_info.sandboxed).toBe(true);
    expect(result.security_info.restrictions).toBeDefined();
    expect(result.security_info.restrictions.length).toBeGreaterThan(0);
  });
});

describe('Voice Tools', () => {
  it('should be registered', () => {
    const tool = toolRegistry.get('voice_tools');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('voice_tools');
    expect(tool?.category).toBe('utility');
  });

  it('should have correct metadata', () => {
    const tool = toolRegistry.get('voice_tools');
    expect(tool?.metadata.version).toBe('1.0.0');
    expect(tool?.metadata.tags).toContain('voice');
    expect(tool?.metadata.tags).toContain('tts');
    expect(tool?.metadata.tags).toContain('speech');
    expect(tool?.metadata.tags).toContain('accessibility');
  });

  it('should have required parameters', () => {
    const tool = toolRegistry.get('voice_tools');
    expect(tool?.parameters).toBeDefined();

    const actionParam = tool?.parameters.find(p => p.name === 'action');
    expect(actionParam?.required).toBe(true);
    expect(actionParam?.enum).toContain('speak');
    expect(actionParam?.enum).toContain('recognize');
    expect(actionParam?.enum).toContain('list_voices');
  });

  it('should require browser environment', async () => {
    await expect(
      toolRegistry.execute('voice_tools', { action: 'speak', text: 'test' })
    ).rejects.toThrow('Voice tools require browser environment');
  });

  it('should list voice actions', () => {
    const tool = toolRegistry.get('voice_tools');
    const actionParam = tool?.parameters.find(p => p.name === 'action');

    expect(actionParam?.enum).toEqual([
      'speak',
      'recognize',
      'list_voices',
      'stop',
      'pause',
      'resume',
      'get_recommendations',
    ]);
  });

  it('should have use case recommendations', () => {
    const tool = toolRegistry.get('voice_tools');
    const useCaseParam = tool?.parameters.find(p => p.name === 'use_case');

    expect(useCaseParam?.enum).toContain('narration');
    expect(useCaseParam?.enum).toContain('assistant');
    expect(useCaseParam?.enum).toContain('announcement');
    expect(useCaseParam?.enum).toContain('reading');
  });
});

describe('Advanced Tools Integration', () => {
  it('should register all advanced tools', () => {
    const advancedTools = [
      'process_file',
      'generate_image',
      'execute_code',
      'voice_tools',
    ];

    advancedTools.forEach(toolName => {
      const tool = toolRegistry.get(toolName);
      expect(tool).toBeDefined();
      expect(tool?.metadata).toBeDefined();
      expect(tool?.metadata.version).toBe('1.0.0');
    });
  });

  it('should have proper tool categories', () => {
    expect(toolRegistry.get('process_file')?.category).toBe('utility');
    expect(toolRegistry.get('generate_image')?.category).toBe('creative');
    expect(toolRegistry.get('execute_code')?.category).toBe('dev');
    expect(toolRegistry.get('voice_tools')?.category).toBe('utility');
  });

  it('should track usage for advanced tools', async () => {
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    await toolRegistry.execute('process_file', {
      file: textFile,
      tier: 'free',
    });

    const stats = toolRegistry.getUsageStats('process_file');
    expect(stats).toBeDefined();
    expect(stats?.count).toBeGreaterThan(0);
  });

  it('should support caching for advanced tools', () => {
    const fileTool = toolRegistry.get('process_file');
    const imageTool = toolRegistry.get('generate_image');
    const codeTool = toolRegistry.get('execute_code');
    const voiceTool = toolRegistry.get('voice_tools');

    // These tools should be cacheable by default
    expect(fileTool?.cacheable).not.toBe(false);
    expect(imageTool?.cacheable).not.toBe(false);
    expect(codeTool?.cacheable).not.toBe(false);
    expect(voiceTool?.cacheable).not.toBe(false);
  });
});
