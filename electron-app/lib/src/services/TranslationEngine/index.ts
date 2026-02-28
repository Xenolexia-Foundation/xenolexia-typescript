/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Translation Engine - Re-export from xenolexia-typescript core.
 */

export {
  TranslationEngine,
  createTranslationEngine,
  createDefaultEngine,
  Tokenizer,
  WordReplacer,
  WordMatcher,
  TranslationAPIService,
  translationAPI,
  FrequencyListService,
  frequencyListService,
  DynamicWordDatabase,
  WordDatabaseService,
  PROFICIENCY_THRESHOLDS,
  PROFICIENCY_RANKS,
  getProficiencyFromRank,
  generateInjectedScript,
  generateForeignWordStyles,
  getFullInjectedContent,
  injectedScript,
  foreignWordStyles,
} from 'xenolexia-typescript';
export type {
  TranslationOptions,
  ProcessedText,
  InjectedScriptOptions,
} from 'xenolexia-typescript';
