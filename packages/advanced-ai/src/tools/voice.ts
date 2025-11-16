/**
 * Voice Tools
 * Text-to-speech, voice commands, and multi-language voice support
 */

import type { ToolDefinition } from '../types';

interface VoiceSettings {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voice?: string; // Voice name or language code
  lang?: string; // Language code (e.g., 'en-US', 'es-ES')
}

interface SpeechResult {
  text: string;
  duration_estimate_ms: number;
  voice_used: string;
  language: string;
  settings: VoiceSettings;
  playback_controls?: {
    playing: boolean;
    paused: boolean;
    stopped: boolean;
  };
}

// Get available voices
function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

// Find best voice for language
function findVoiceForLanguage(lang: string, voiceName?: string): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();

  if (voices.length === 0) {
    return null;
  }

  // If specific voice requested, try to find it
  if (voiceName) {
    const voice = voices.find((v) => v.name.toLowerCase().includes(voiceName.toLowerCase()));
    if (voice) return voice;
  }

  // Find voice matching language
  const langVoice = voices.find((v) => v.lang.startsWith(lang));
  if (langVoice) return langVoice;

  // Fallback to default voice
  const defaultVoice = voices.find((v) => v.default);
  return defaultVoice || voices[0];
}

// Estimate speech duration (rough)
function estimateDuration(text: string, rate: number = 1): number {
  // Average speaking rate: ~150 words per minute at rate 1
  const words = text.split(/\s+/).length;
  const baseMinutes = words / 150;
  const adjustedMinutes = baseMinutes / rate;
  return adjustedMinutes * 60 * 1000; // Convert to milliseconds
}

// Text-to-speech
async function textToSpeech(text: string, settings: VoiceSettings = {}): Promise<SpeechResult> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    throw new Error('Text-to-speech not available in this environment');
  }

  const { rate = 1, pitch = 1, volume = 1, voice: voiceName, lang = 'en-US' } = settings;

  // Wait for voices to load
  if (getAvailableVoices().length === 0) {
    await new Promise((resolve) => {
      window.speechSynthesis.onvoiceschanged = resolve;
      // Timeout after 1 second
      setTimeout(resolve, 1000);
    });
  }

  const voice = findVoiceForLanguage(lang, voiceName);

  if (!voice) {
    throw new Error(`No voice available for language: ${lang}`);
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = Math.max(0.1, Math.min(10, rate));
  utterance.pitch = Math.max(0, Math.min(2, pitch));
  utterance.volume = Math.max(0, Math.min(1, volume));
  utterance.lang = lang;

  return new Promise((resolve, reject) => {
    utterance.onend = () => {
      resolve({
        text,
        duration_estimate_ms: estimateDuration(text, rate),
        voice_used: voice.name,
        language: voice.lang,
        settings: {
          rate,
          pitch,
          volume,
          voice: voice.name,
          lang,
        },
        playback_controls: {
          playing: false,
          paused: false,
          stopped: true,
        },
      });
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis failed: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
}

// Voice command recognition
async function startVoiceRecognition(options: {
  language?: string;
  continuous?: boolean;
  interim_results?: boolean;
}): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Voice recognition not available in this environment');
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error('Speech recognition not supported in this browser');
  }

  const { language = 'en-US', continuous = false, interim_results = false } = options;

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interim_results;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (!continuous && finalTranscript) {
        recognition.stop();
      }
    };

    recognition.onend = () => {
      if (finalTranscript) {
        resolve(finalTranscript.trim());
      } else {
        reject(new Error('No speech detected'));
      }
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();

    // Timeout after 10 seconds
    setTimeout(() => {
      recognition.stop();
      if (!finalTranscript) {
        reject(new Error('Speech recognition timeout'));
      }
    }, 10000);
  });
}

// List available voices with details
function listVoices(): Array<{
  name: string;
  lang: string;
  gender?: string;
  local: boolean;
  default: boolean;
}> {
  const voices = getAvailableVoices();

  return voices.map((voice) => ({
    name: voice.name,
    lang: voice.lang,
    gender: voice.name.toLowerCase().includes('female')
      ? 'female'
      : voice.name.toLowerCase().includes('male')
        ? 'male'
        : undefined,
    local: voice.localService,
    default: voice.default,
  }));
}

// Get voice recommendations based on use case
function getVoiceRecommendations(
  useCase: 'narration' | 'assistant' | 'announcement' | 'reading'
): Array<{ lang: string; settings: VoiceSettings; description: string }> {
  const recommendations = {
    narration: [
      {
        lang: 'en-US',
        settings: { rate: 0.9, pitch: 1, volume: 0.9 },
        description: 'Slower, clear narration voice',
      },
      {
        lang: 'en-GB',
        settings: { rate: 0.85, pitch: 1.1, volume: 0.9 },
        description: 'British accent for storytelling',
      },
    ],
    assistant: [
      {
        lang: 'en-US',
        settings: { rate: 1.1, pitch: 1.2, volume: 1 },
        description: 'Friendly, upbeat assistant voice',
      },
      {
        lang: 'en-US',
        settings: { rate: 1, pitch: 1, volume: 1 },
        description: 'Neutral, professional assistant',
      },
    ],
    announcement: [
      {
        lang: 'en-US',
        settings: { rate: 0.95, pitch: 0.9, volume: 1 },
        description: 'Clear, authoritative announcement',
      },
    ],
    reading: [
      {
        lang: 'en-US',
        settings: { rate: 1, pitch: 1, volume: 0.85 },
        description: 'Comfortable reading voice',
      },
      {
        lang: 'en-US',
        settings: { rate: 1.2, pitch: 1, volume: 0.85 },
        description: 'Faster reading for experienced listeners',
      },
    ],
  };

  return recommendations[useCase] || recommendations.assistant;
}

export const voiceTool: ToolDefinition = {
  name: 'voice_tools',
  description:
    'Text-to-speech, voice commands, and voice settings. Supports multi-language voices, playback controls, and voice recognition.',
  category: 'utility',
  parameters: [
    {
      name: 'action',
      type: 'string',
      description: 'Voice action to perform',
      required: true,
      enum: ['speak', 'recognize', 'list_voices', 'stop', 'pause', 'resume', 'get_recommendations'],
    },
    {
      name: 'text',
      type: 'string',
      description: 'Text to speak (for speak action)',
      required: false,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Language code (e.g., en-US, es-ES, fr-FR, de-DE, ja-JP)',
      required: false,
    },
    {
      name: 'rate',
      type: 'number',
      description: 'Speaking rate (0.1 to 10, default 1)',
      required: false,
    },
    {
      name: 'pitch',
      type: 'number',
      description: 'Voice pitch (0 to 2, default 1)',
      required: false,
    },
    {
      name: 'volume',
      type: 'number',
      description: 'Volume (0 to 1, default 1)',
      required: false,
    },
    {
      name: 'voice',
      type: 'string',
      description: 'Specific voice name (optional)',
      required: false,
    },
    {
      name: 'use_case',
      type: 'string',
      description: 'Get voice recommendations for specific use case',
      required: false,
      enum: ['narration', 'assistant', 'announcement', 'reading'],
    },
  ],
  async execute({ action, text, language = 'en-US', rate = 1, pitch = 1, volume = 1, voice, use_case }) {
    if (typeof window === 'undefined') {
      throw new Error('Voice tools require browser environment');
    }

    switch (action) {
      case 'speak': {
        if (!text) {
          throw new Error('Text is required for speak action');
        }

        const result = await textToSpeech(text, {
          rate,
          pitch,
          volume,
          voice,
          lang: language,
        });

        return {
          success: true,
          action: 'speak',
          result,
          tips: [
            'Adjust rate for faster/slower speech (0.5 = half speed, 2 = double speed)',
            'Use pitch to change voice tone (0.5 = lower, 1.5 = higher)',
            'Try different languages and voices for variety',
          ],
        };
      }

      case 'recognize': {
        try {
          const transcript = await startVoiceRecognition({
            language,
            continuous: false,
            interim_results: true,
          });

          return {
            success: true,
            action: 'recognize',
            transcript,
            language,
            confidence: 1.0, // SpeechRecognition API provides this
            tips: [
              'Speak clearly and close to microphone',
              'Reduce background noise for better accuracy',
              'Supported in Chrome, Edge, and Safari',
            ],
          };
        } catch (error) {
          throw new Error(`Voice recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      case 'list_voices': {
        const voices = listVoices();

        // Group by language
        const byLanguage: Record<string, typeof voices> = {};
        voices.forEach((v) => {
          const lang = v.lang.split('-')[0];
          if (!byLanguage[lang]) byLanguage[lang] = [];
          byLanguage[lang].push(v);
        });

        return {
          success: true,
          action: 'list_voices',
          total_voices: voices.length,
          voices,
          grouped_by_language: byLanguage,
          popular_languages: ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'pt', 'ru'],
        };
      }

      case 'stop': {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        return {
          success: true,
          action: 'stop',
          message: 'All speech stopped',
        };
      }

      case 'pause': {
        if (window.speechSynthesis) {
          window.speechSynthesis.pause();
        }
        return {
          success: true,
          action: 'pause',
          message: 'Speech paused',
        };
      }

      case 'resume': {
        if (window.speechSynthesis) {
          window.speechSynthesis.resume();
        }
        return {
          success: true,
          action: 'resume',
          message: 'Speech resumed',
        };
      }

      case 'get_recommendations': {
        const recommendations = getVoiceRecommendations(
          (use_case as 'narration' | 'assistant' | 'announcement' | 'reading') || 'assistant'
        );

        return {
          success: true,
          action: 'get_recommendations',
          use_case: use_case || 'assistant',
          recommendations,
          tips: [
            'Try different settings to find what works best',
            'Narration works best with slower rate (0.8-0.9)',
            'Assistant voices sound better slightly faster (1.1-1.2)',
            'Announcements need clear, authoritative tone',
          ],
        };
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  },
  metadata: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['voice', 'tts', 'speech', 'audio', 'accessibility', 'multilingual'],
    examples: [
      {
        description: 'Speak text',
        params: {
          action: 'speak',
          text: 'Hello, how can I help you today?',
          language: 'en-US',
          rate: 1,
          pitch: 1,
        },
      },
      {
        description: 'List available voices',
        params: { action: 'list_voices' },
      },
      {
        description: 'Voice recognition',
        params: { action: 'recognize', language: 'en-US' },
      },
      {
        description: 'Get narration recommendations',
        params: { action: 'get_recommendations', use_case: 'narration' },
      },
      {
        description: 'Speak in Spanish',
        params: {
          action: 'speak',
          text: 'Hola, ¿cómo estás?',
          language: 'es-ES',
        },
      },
    ],
  },
};
