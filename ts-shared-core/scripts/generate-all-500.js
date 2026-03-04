/**
 * Generates words_en_XX.ts for all target languages with 500 beginner words each.
 * Uses ENGLISH_BEGINNER_500 with target = source (placeholder). Run fetch-translations.js
 * and build-words-from-translations.js to replace with real translations.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const LANGS = [
  'el',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'ja',
  'zh',
  'ko',
  'ar',
  'nl',
  'pl',
  'tr',
  'sv',
  'da',
  'fi',
  'no',
  'cs',
  'hu',
  'ro',
  'uk',
  'hi',
  'th',
  'vi',
  'id',
  'arm',
  'am',
  'fa',
];

const template = langCode => `/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 * English-${langCode.toUpperCase()} dictionary: 500 beginner words (frequency-ranked).
 * Run scripts/fetch-translations.js ${langCode} && scripts/build-words-from-translations.js ${langCode} for real translations.
 */

import type { WordData } from '../types';
import { ENGLISH_BEGINNER_500 } from './englishBeginner500';

export const BEGINNER_WORDS: WordData[] = ENGLISH_BEGINNER_500.map((e) => ({ ...e, target: e.source }));
export const INTERMEDIATE_WORDS: WordData[] = [];
export const ADVANCED_WORDS: WordData[] = [];
export const ALL_WORDS_EN_${langCode.toUpperCase()}: WordData[] = [...BEGINNER_WORDS];

export function getWordsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): WordData[] {
  switch (level) {
    case 'beginner': return BEGINNER_WORDS;
    case 'intermediate': case 'advanced': return [];
    default: return [];
  }
}
export function getTotalWordCount(): number {
  return ALL_WORDS_EN_${langCode.toUpperCase()}.length;
}
`;

LANGS.forEach(lang => {
  fs.writeFileSync(path.join(DATA_DIR, `words_en_${lang}.ts`), template(lang) + '\n');
  console.log('Wrote words_en_' + lang + '.ts');
});
console.log(
  'Done. Run fetch-translations.js <lang> then build-words-from-translations.js <lang> for real translations.'
);
