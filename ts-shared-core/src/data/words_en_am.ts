/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 * English-Amharic dictionary: 500 beginner words (frequency-ranked).
 * Run scripts/fetch-translations.js am && scripts/build-words-from-translations.js am for real translations.
 */

import type { WordData } from '../types';
import { ENGLISH_BEGINNER_500 } from './englishBeginner500';

export const BEGINNER_WORDS: WordData[] = ENGLISH_BEGINNER_500.map((e) => ({ ...e, target: e.source }));
export const INTERMEDIATE_WORDS: WordData[] = [];
export const ADVANCED_WORDS: WordData[] = [];
export const ALL_WORDS_EN_AM: WordData[] = [...BEGINNER_WORDS];

export function getWordsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): WordData[] {
  switch (level) {
    case 'beginner': return BEGINNER_WORDS;
    case 'intermediate': case 'advanced': return [];
    default: return [];
  }
}
export function getTotalWordCount(): number {
  return ALL_WORDS_EN_AM.length;
}
