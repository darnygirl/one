/**
 * Prompt Templates System
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'coding' | 'writing' | 'analysis' | 'creative' | 'productivity';
  prompt: string;
  variables?: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code for bugs and improvements',
    category: 'coding',
    prompt: 'Please review the following code:\n\n{{code}}\n\nProvide feedback on bugs, performance, and best practices.',
    variables: ['code'],
  },
  {
    id: 'explain-code',
    name: 'Explain Code',
    description: 'Get detailed code explanation',
    category: 'coding',
    prompt: 'Please explain what this code does:\n\n{{code}}',
    variables: ['code'],
  },
  {
    id: 'improve-writing',
    name: 'Improve Writing',
    description: 'Improve grammar and clarity',
    category: 'writing',
    prompt: 'Please improve this text:\n\n{{text}}',
    variables: ['text'],
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create concise summary',
    category: 'writing',
    prompt: 'Please summarize:\n\n{{text}}',
    variables: ['text'],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Generate creative ideas',
    category: 'creative',
    prompt: 'Help me brainstorm ideas for:\n\n{{topic}}',
    variables: ['topic'],
  },
];

export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id);
}

export function fillTemplate(template: PromptTemplate, variables: Record<string, string>): string {
  let filled = template.prompt;
  for (const [key, value] of Object.entries(variables)) {
    filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return filled;
}
