/**
 * Markdown Preview Tool
 * Live markdown rendering with GitHub-flavored markdown, code highlighting, and export
 */

import type { ToolDefinition } from '../types';

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countCharacters(text: string): number {
  return text.length;
}

function extractCodeBlocks(markdown: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }

  return blocks;
}

function extractLinks(markdown: string): Array<{ text: string; url: string; valid: boolean }> {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{ text: string; url: string; valid: boolean }> = [];
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    const url = match[2];
    const valid = /^https?:\/\//.test(url) || /^\//.test(url) || /^#/.test(url);
    links.push({
      text: match[1],
      url: url,
      valid,
    });
  }

  return links;
}

function extractHeadings(markdown: string): Array<{ level: number; text: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
    });
  }

  return headings;
}

function convertToHTML(markdown: string): string {
  let html = markdown;

  // Code blocks (must be first)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'text';
    return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');
  html = html.replace(/^\*\*\*$/gm, '<hr />');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Tables (basic support)
  const tableRegex = /(\|.+\|\n)+/g;
  html = html.replace(tableRegex, (table) => {
    const rows = table.trim().split('\n');
    if (rows.length < 2) return table;

    const headers = rows[0].split('|').filter(Boolean).map(h => h.trim());
    const separator = rows[1];
    const dataRows = rows.slice(2);

    let tableHTML = '<table><thead><tr>';
    headers.forEach(h => {
      tableHTML += `<th>${h}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    dataRows.forEach(row => {
      const cells = row.split('|').filter(Boolean).map(c => c.trim());
      tableHTML += '<tr>';
      cells.forEach(cell => {
        tableHTML += `<td>${cell}</td>`;
      });
      tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
  });

  // Paragraphs (wrap non-tagged content)
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      if (block.includes('<li>')) return block;
      return `<p>${block}</p>`;
    })
    .join('\n');

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export const markdownTool: ToolDefinition = {
  name: 'preview_markdown',
  description: 'Render markdown to HTML with GitHub-flavored support, code highlighting, table support, and link validation',
  category: 'utilities',
  parameters: [
    {
      name: 'markdown',
      type: 'string',
      description: 'Markdown text to render',
      required: true,
    },
    {
      name: 'validate_links',
      type: 'boolean',
      description: 'Validate links in the markdown',
      required: false,
    },
    {
      name: 'extract_metadata',
      type: 'boolean',
      description: 'Extract metadata (headings, code blocks, links)',
      required: false,
    },
  ],
  async execute({
    markdown,
    validate_links = true,
    extract_metadata = true,
  }) {
    try {
      const html = convertToHTML(markdown);
      const wordCount = countWords(markdown);
      const characterCount = countCharacters(markdown);

      const result: any = {
        html,
        markdown,
        statistics: {
          words: wordCount,
          characters: characterCount,
          lines: markdown.split('\n').length,
        },
        timestamp: new Date().toISOString(),
      };

      if (extract_metadata) {
        const headings = extractHeadings(markdown);
        const codeBlocks = extractCodeBlocks(markdown);
        const links = extractLinks(markdown);

        result.metadata = {
          headings,
          code_blocks: codeBlocks,
          links: validate_links ? links : links.map(l => ({ text: l.text, url: l.url })),
          has_tables: /\|.+\|/.test(markdown),
          has_images: /!\[/.test(markdown),
          has_lists: /^[-*\d+.]\s/.test(markdown),
        };

        result.outline = headings;
      }

      if (validate_links) {
        const links = extractLinks(markdown);
        const invalidLinks = links.filter(l => !l.valid);

        if (invalidLinks.length > 0) {
          result.link_validation = {
            total: links.length,
            valid: links.length - invalidLinks.length,
            invalid: invalidLinks.length,
            invalid_links: invalidLinks,
          };
        } else {
          result.link_validation = {
            total: links.length,
            valid: links.length,
            invalid: 0,
          };
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to render markdown: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
