/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Data exports - Bundled word lists and dictionary registry
 */

export {ENGLISH_BEGINNER_500} from './englishBeginner500';
export type {EnglishWordEntry} from './englishBeginner500';

export {
  ALL_WORDS_EN_EL,
  BEGINNER_WORDS,
  INTERMEDIATE_WORDS,
  ADVANCED_WORDS,
  getWordsByLevel,
  getTotalWordCount,
} from './words_en_el';

export type {WordData} from '../types';

export {
  getBundledWords,
  hasBundledWords,
  getBundledWordsVerified,
  getVerificationReport,
} from './bundledDictionaries';
export type {VerificationEntry, VerificationReport} from './bundledDictionaries';
