/**
 * Lorem Ipsum Generator Tool
 * Generate placeholder text in multiple languages with markdown support
 */

import type { ToolDefinition } from '../types';

const LOREM_LATIN = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
];

const LOREM_ENGLISH = [
  'The quick brown fox jumps over the lazy dog, showcasing every letter in a complete sentence.',
  'In the realm of design and development, placeholder text serves as a crucial tool for visualizing layouts.',
  'Content creation requires careful consideration of structure, flow, and readability for optimal user experience.',
  'Typography and spacing work together to create harmony in written communication and visual design.',
  'Modern web development combines aesthetics with functionality to deliver exceptional digital experiences.',
  'User interface design focuses on creating intuitive and accessible experiences for all users.',
  'Effective communication in digital spaces requires clear hierarchy and thoughtful information architecture.',
  'Design systems establish consistency and efficiency across large-scale projects and teams.',
];

const LOREM_SPANISH = [
  'El zorro marrón rápido salta sobre el perro perezoso, mostrando cada letra del alfabeto.',
  'En el ámbito del diseño y desarrollo, el texto de relleno sirve como una herramienta crucial.',
  'La creación de contenido requiere una cuidadosa consideración de la estructura y la fluidez.',
  'La tipografía y el espaciado trabajan juntos para crear armonía en la comunicación escrita.',
  'El desarrollo web moderno combina estética con funcionalidad para ofrecer experiencias digitales excepcionales.',
  'El diseño de interfaz de usuario se centra en crear experiencias intuitivas y accesibles.',
  'La comunicación efectiva en espacios digitales requiere jerarquía clara y arquitectura de información.',
  'Los sistemas de diseño establecen consistencia y eficiencia en proyectos y equipos a gran escala.',
];

const LOREM_FRENCH = [
  'Le renard brun rapide saute par-dessus le chien paresseux, montrant chaque lettre de l\'alphabet.',
  'Dans le domaine de la conception et du développement, le texte de remplissage sert d\'outil crucial.',
  'La création de contenu nécessite une attention particulière à la structure et à la fluidité.',
  'La typographie et l\'espacement travaillent ensemble pour créer l\'harmonie dans la communication.',
  'Le développement web moderne combine esthétique et fonctionnalité pour offrir des expériences digitales.',
  'La conception d\'interface utilisateur se concentre sur la création d\'expériences intuitives.',
  'La communication efficace dans les espaces numériques nécessite une hiérarchie claire.',
  'Les systèmes de conception établissent cohérence et efficacité dans les projets à grande échelle.',
];

const LANGUAGE_MAP: Record<string, string[]> = {
  latin: LOREM_LATIN,
  english: LOREM_ENGLISH,
  spanish: LOREM_SPANISH,
  french: LOREM_FRENCH,
};

function generateParagraphs(
  count: number,
  sentences: string[],
  sentencesPerParagraph: number
): string[] {
  const paragraphs: string[] = [];

  for (let i = 0; i < count; i++) {
    const paragraph: string[] = [];
    for (let j = 0; j < sentencesPerParagraph; j++) {
      const sentenceIndex = (i * sentencesPerParagraph + j) % sentences.length;
      paragraph.push(sentences[sentenceIndex]);
    }
    paragraphs.push(paragraph.join(' '));
  }

  return paragraphs;
}

function generateWords(count: number, sentences: string[]): string {
  const allWords = sentences.join(' ').split(/\s+/);
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    words.push(allWords[i % allWords.length]);
  }

  return words.join(' ');
}

function formatAsMarkdown(
  paragraphs: string[],
  includeHeadings: boolean,
  includeLists: boolean,
  includeEmphasis: boolean
): string {
  const formatted: string[] = [];

  paragraphs.forEach((paragraph, index) => {
    if (includeHeadings && index % 3 === 0) {
      formatted.push(`## Section ${Math.floor(index / 3) + 1}\n`);
    }

    if (includeLists && index % 4 === 2) {
      const items = paragraph.split('. ').slice(0, 3);
      formatted.push(items.map(item => `- ${item.trim()}`).join('\n'));
      formatted.push('');
    } else {
      let text = paragraph;
      if (includeEmphasis) {
        // Add random emphasis (bold/italic)
        const words = text.split(' ');
        if (words.length > 5) {
          words[Math.floor(words.length / 4)] = `**${words[Math.floor(words.length / 4)]}**`;
          words[Math.floor(words.length / 2)] = `*${words[Math.floor(words.length / 2)]}*`;
        }
        text = words.join(' ');
      }
      formatted.push(text);
      formatted.push('');
    }
  });

  return formatted.join('\n').trim();
}

export const loremTool: ToolDefinition = {
  name: 'generate_lorem',
  description: 'Generate Lorem Ipsum placeholder text in multiple languages with markdown formatting support',
  category: 'utilities',
  parameters: [
    {
      name: 'type',
      type: 'string',
      description: 'Type of content to generate',
      required: true,
      enum: ['paragraphs', 'words', 'characters'],
    },
    {
      name: 'count',
      type: 'number',
      description: 'Number of paragraphs, words, or characters to generate',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Language for generated text',
      required: false,
      enum: ['latin', 'english', 'spanish', 'french'],
    },
    {
      name: 'sentences_per_paragraph',
      type: 'number',
      description: 'Number of sentences per paragraph (for paragraph type)',
      required: false,
    },
    {
      name: 'markdown',
      type: 'boolean',
      description: 'Format output as markdown with headings, lists, and emphasis',
      required: false,
    },
    {
      name: 'include_headings',
      type: 'boolean',
      description: 'Include markdown headings (requires markdown=true)',
      required: false,
    },
    {
      name: 'include_lists',
      type: 'boolean',
      description: 'Include markdown lists (requires markdown=true)',
      required: false,
    },
    {
      name: 'include_emphasis',
      type: 'boolean',
      description: 'Include markdown emphasis (bold/italic) (requires markdown=true)',
      required: false,
    },
  ],
  async execute({
    type,
    count,
    language = 'latin',
    sentences_per_paragraph = 4,
    markdown = false,
    include_headings = true,
    include_lists = true,
    include_emphasis = true,
  }) {
    try {
      const sentences = LANGUAGE_MAP[language] || LOREM_LATIN;
      let text = '';
      let paragraphs: string[] = [];
      let wordCount = 0;
      let characterCount = 0;

      if (type === 'paragraphs') {
        paragraphs = generateParagraphs(count, sentences, sentences_per_paragraph);

        if (markdown) {
          text = formatAsMarkdown(paragraphs, include_headings, include_lists, include_emphasis);
        } else {
          text = paragraphs.join('\n\n');
        }

        wordCount = text.split(/\s+/).length;
        characterCount = text.length;
      } else if (type === 'words') {
        text = generateWords(count, sentences);
        wordCount = count;
        characterCount = text.length;
        paragraphs = [text];
      } else if (type === 'characters') {
        const words = generateWords(Math.ceil(count / 6), sentences); // ~6 chars per word
        text = words.substring(0, count);
        wordCount = text.split(/\s+/).length;
        characterCount = count;
        paragraphs = [text];
      }

      return {
        text,
        type,
        count,
        language,
        format: markdown ? 'markdown' : 'plain',
        statistics: {
          paragraphs: type === 'paragraphs' ? count : paragraphs.length,
          words: wordCount,
          characters: characterCount,
          sentences: paragraphs.reduce((acc, p) => acc + p.split(/[.!?]+/).length - 1, 0),
        },
        markdown_features: markdown
          ? {
              headings: include_headings,
              lists: include_lists,
              emphasis: include_emphasis,
            }
          : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate lorem ipsum: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
