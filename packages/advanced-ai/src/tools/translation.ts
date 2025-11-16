/**
 * Translation Tool
 * Translate text between languages with multiple engines and pronunciation
 */

import type { ToolDefinition } from '../types';

// IPA phonetics mapping (basic approximations)
const ipaPhonetics: Record<string, Record<string, string>> = {
  en: {
    hello: 'həˈləʊ',
    world: 'wɜːld',
    thank: 'θæŋk',
    you: 'juː',
  },
  es: {
    hola: 'ˈola',
    mundo: 'ˈmundo',
    gracias: 'ˈɡɾaθjas',
  },
  fr: {
    bonjour: 'bɔ̃ʒuʁ',
    monde: 'mɔ̃d',
    merci: 'mɛʁsi',
  },
};

// Language names mapping
const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  ko: 'Korean',
};

// Context examples for common phrases
const contextExamples: Record<string, string[]> = {
  hello: [
    'Hello, how are you?',
    'Hello everyone!',
    'Say hello to your family',
  ],
  thank: [
    'Thank you very much',
    'Thanks for your help',
    'I want to thank you',
  ],
  goodbye: [
    'Goodbye, see you later',
    'Say goodbye to everyone',
    'It\'s time to say goodbye',
  ],
};

async function translateWithLibreTranslate(text: string, from: string, to: string) {
  const response = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error('LibreTranslate failed');
  }

  const data = await response.json();
  return {
    text: data.translatedText,
    detectedLanguage: data.detectedLanguage?.language,
    confidence: data.detectedLanguage?.confidence || 0,
  };
}

async function detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
  try {
    // Try LibreTranslate's detect endpoint
    const response = await fetch('https://libretranslate.de/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      throw new Error('Detection failed');
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        language: data[0].language,
        confidence: data[0].confidence,
      };
    }
  } catch (error) {
    // Fallback: simple heuristic detection
    if (/[\u4e00-\u9fa5]/.test(text)) return { language: 'zh', confidence: 0.8 };
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return { language: 'ja', confidence: 0.8 };
    if (/[\u0400-\u04ff]/.test(text)) return { language: 'ru', confidence: 0.8 };
    if (/[\u0600-\u06ff]/.test(text)) return { language: 'ar', confidence: 0.8 };
  }

  return { language: 'en', confidence: 0.5 };
}

function getPhonetics(text: string, lang: string): string | null {
  const words = text.toLowerCase().split(/\s+/);
  const langPhonetics = ipaPhonetics[lang];

  if (!langPhonetics) return null;

  const phonetic = words
    .map(word => langPhonetics[word] || word)
    .join(' ');

  return phonetic !== text ? phonetic : null;
}

function getContextExamples(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (contextExamples[word]) {
      return contextExamples[word];
    }
  }
  return [];
}

export const translationTool: ToolDefinition = {
  name: 'translate',
  description: 'Translate text between languages with auto-detection, pronunciation, and context examples',
  category: 'utility',
  parameters: [
    {
      name: 'text',
      type: 'string',
      description: 'The text to translate',
      required: true,
    },
    {
      name: 'from',
      type: 'string',
      description: 'Source language code (e.g., "en", "es", "fr", "auto" for auto-detect)',
      required: false,
    },
    {
      name: 'to',
      type: 'string',
      description: 'Target language code (e.g., "en", "es", "fr", "de", "ja", "zh")',
      required: true,
    },
    {
      name: 'include_phonetics',
      type: 'boolean',
      description: 'Include IPA pronunciation guide',
      required: false,
    },
    {
      name: 'include_examples',
      type: 'boolean',
      description: 'Include context usage examples',
      required: false,
    },
  ],
  async execute({ text, from = 'auto', to, include_phonetics = false, include_examples = false }) {
    try {
      let detectedLang = from;
      let confidence = 1.0;

      // Auto-detect source language if needed
      if (from === 'auto') {
        const detection = await detectLanguage(text);
        detectedLang = detection.language;
        confidence = detection.confidence;
      }

      // Try primary translation engine (LibreTranslate)
      let result;
      try {
        result = await translateWithLibreTranslate(text, detectedLang, to);
      } catch (primaryError) {
        // Fallback: could add more engines here (Google Translate API, DeepL, etc.)
        throw new Error(`Translation failed: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`);
      }

      const response: any = {
        original: text,
        translated: result.text,
        from: detectedLang,
        fromName: languageNames[detectedLang] || detectedLang,
        to,
        toName: languageNames[to] || to,
        confidence: confidence * 100,
        engine: 'LibreTranslate',
      };

      // Add pronunciation if requested
      if (include_phonetics) {
        response.phonetics = {
          original: getPhonetics(text, detectedLang),
          translated: getPhonetics(result.text, to),
        };
      }

      // Add context examples if requested
      if (include_examples) {
        response.examples = getContextExamples(text);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to translate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
