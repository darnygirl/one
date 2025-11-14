/**
 * Password Generator Tool
 * Generate secure passwords with customizable character sets and strength analysis
 */

import type { ToolDefinition } from '../types';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const WORDLIST = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
  'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
  'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'Xray',
  'Yankee', 'Zulu', 'Phoenix', 'Dragon', 'Thunder', 'Lightning', 'Storm', 'Blaze',
  'Crystal', 'Shadow', 'Frost', 'Ember', 'Nebula', 'Quantum', 'Zenith', 'Apex',
  'Cipher', 'Vortex', 'Prism', 'Spark', 'Comet', 'Solaris', 'Astral', 'Nexus',
];

function generatePassword(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): string {
  let chars = '';
  const required: string[] = [];

  if (useUppercase) {
    chars += UPPERCASE;
    required.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
  }
  if (useLowercase) {
    chars += LOWERCASE;
    required.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
  }
  if (useNumbers) {
    chars += NUMBERS;
    required.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
  }
  if (useSymbols) {
    chars += SYMBOLS;
    required.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  if (chars.length === 0) {
    chars = LOWERCASE + NUMBERS; // Fallback
  }

  // Generate remaining characters
  let password = [...required];
  for (let i = required.length; i < length; i++) {
    password.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  // Shuffle the password
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

function generatePassphrase(
  wordCount: number,
  separator: string,
  capitalize: boolean,
  includeNumber: boolean
): string {
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    let word = WORDLIST[Math.floor(Math.random() * WORDLIST.length)];
    if (!capitalize) {
      word = word.toLowerCase();
    }
    words.push(word);
  }

  if (includeNumber) {
    words.push(String(Math.floor(Math.random() * 9999)));
  }

  return words.join(separator);
}

function calculateEntropy(
  password: string,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): number {
  let poolSize = 0;
  if (useUppercase) poolSize += 26;
  if (useLowercase) poolSize += 26;
  if (useNumbers) poolSize += 10;
  if (useSymbols) poolSize += SYMBOLS.length;

  if (poolSize === 0) poolSize = 36; // Fallback

  return Math.log2(Math.pow(poolSize, password.length));
}

function analyzeStrength(entropy: number): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  message: string;
} {
  if (entropy < 40) {
    return {
      level: 'weak',
      score: 25,
      message: 'Weak - Consider using a longer password with more character types',
    };
  } else if (entropy < 60) {
    return {
      level: 'medium',
      score: 50,
      message: 'Medium - Good for low-security accounts',
    };
  } else if (entropy < 80) {
    return {
      level: 'strong',
      score: 75,
      message: 'Strong - Good for most accounts',
    };
  } else {
    return {
      level: 'very-strong',
      score: 100,
      message: 'Very Strong - Excellent security',
    };
  }
}

export const passwordTool: ToolDefinition = {
  name: 'generate_password',
  description: 'Generate secure passwords with customizable character sets, passphrases, and strength analysis',
  category: 'security',
  parameters: [
    {
      name: 'type',
      type: 'string',
      description: 'Type of password to generate',
      required: true,
      enum: ['password', 'passphrase'],
    },
    {
      name: 'length',
      type: 'number',
      description: 'Password length (8-128 characters, for password type)',
      required: false,
    },
    {
      name: 'uppercase',
      type: 'boolean',
      description: 'Include uppercase letters',
      required: false,
    },
    {
      name: 'lowercase',
      type: 'boolean',
      description: 'Include lowercase letters',
      required: false,
    },
    {
      name: 'numbers',
      type: 'boolean',
      description: 'Include numbers',
      required: false,
    },
    {
      name: 'symbols',
      type: 'boolean',
      description: 'Include symbols',
      required: false,
    },
    {
      name: 'word_count',
      type: 'number',
      description: 'Number of words in passphrase (4-8, for passphrase type)',
      required: false,
    },
    {
      name: 'separator',
      type: 'string',
      description: 'Separator for passphrase words',
      required: false,
    },
    {
      name: 'capitalize',
      type: 'boolean',
      description: 'Capitalize passphrase words',
      required: false,
    },
    {
      name: 'include_number',
      type: 'boolean',
      description: 'Include number in passphrase',
      required: false,
    },
    {
      name: 'count',
      type: 'number',
      description: 'Number of passwords to generate (1-100)',
      required: false,
    },
  ],
  async execute({
    type,
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    word_count = 4,
    separator = '-',
    capitalize = true,
    include_number = true,
    count = 1,
  }) {
    try {
      // Validate inputs
      if (type === 'password') {
        length = Math.max(8, Math.min(128, length));
      } else if (type === 'passphrase') {
        word_count = Math.max(4, Math.min(8, word_count));
      }
      count = Math.max(1, Math.min(100, count));

      const passwords: string[] = [];
      const analyses: Array<{
        password: string;
        entropy: number;
        strength: ReturnType<typeof analyzeStrength>;
      }> = [];

      for (let i = 0; i < count; i++) {
        let password: string;

        if (type === 'password') {
          password = generatePassword(length, uppercase, lowercase, numbers, symbols);
          const entropy = calculateEntropy(password, uppercase, lowercase, numbers, symbols);
          const strength = analyzeStrength(entropy);

          passwords.push(password);
          analyses.push({ password, entropy, strength });
        } else {
          password = generatePassphrase(word_count, separator, capitalize, include_number);
          // Estimate entropy for passphrase
          const entropy = Math.log2(Math.pow(WORDLIST.length, word_count)) + (include_number ? 13.3 : 0);
          const strength = analyzeStrength(entropy);

          passwords.push(password);
          analyses.push({ password, entropy, strength });
        }
      }

      // Return first password's analysis as primary, all passwords in array
      const primary = analyses[0];

      return {
        password: primary.password,
        type,
        length: type === 'password' ? length : primary.password.length,
        entropy: Math.round(primary.entropy * 10) / 10,
        strength: primary.strength,
        character_sets: type === 'password' ? {
          uppercase,
          lowercase,
          numbers,
          symbols,
        } : undefined,
        passphrase_options: type === 'passphrase' ? {
          word_count,
          separator,
          capitalize,
          include_number,
        } : undefined,
        passwords: count > 1 ? passwords : undefined,
        all_analyses: count > 1 ? analyses : undefined,
        count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate password: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
