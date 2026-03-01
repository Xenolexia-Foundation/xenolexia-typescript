/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Unit tests for word replacement across all supported target languages.
 * - getBundledWordsVerified('en', target) is non-empty per language
 * - WordMatcher (no DB) findMatch for high-frequency words per language
 * - processContentOffline with short story fixture: replacedWords >= 1 and foreign-word markers per language
 */

import * as fs from 'fs';
import * as path from 'path';
import { getBundledWordsVerified } from '../data/bundledDictionaries';
import { SUPPORTED_LANGUAGES } from '../types';
import type { Language, LanguageInfo } from '../types';
import { WordMatcher } from '../services/TranslationEngine/WordMatcher';
import { TranslationEngine } from '../services/TranslationEngine/TranslationEngine';
import type { DynamicWordDatabase } from '../services/TranslationEngine/DynamicWordDatabase';
import type { WordLookupResult } from '../services/TranslationEngine/DynamicWordDatabase';

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'shortStory.html');

function loadShortStory(): string {
  return fs.readFileSync(FIXTURE_PATH, 'utf-8');
}

/** Minimal mock DB for offline path: only initialize is required; lookupWords not used by processContentOffline. */
function createEmptyMockDatabase(): DynamicWordDatabase {
  const emptyMap = new Map<string, WordLookupResult>();
  return {
    initialize: jest.fn().mockResolvedValue(undefined),
    lookupWords: jest.fn().mockImplementation(async (_words: string[]) => emptyMap),
  } as unknown as DynamicWordDatabase;
}

const TARGET_LANGUAGES: Language[] = SUPPORTED_LANGUAGES.filter(
  (info: LanguageInfo) => info.code !== 'en'
).map((info: LanguageInfo) => info.code as Language);

describe('Word replacement – bundled data and fallback', () => {
  describe('getBundledWordsVerified(en, target)', () => {
    it.each(TARGET_LANGUAGES)(
      'returns non-empty list for target %s',
      (target: Language) => {
        const words = getBundledWordsVerified('en', target);
        expect(words).not.toBeNull();
        expect(Array.isArray(words)).toBe(true);
        expect((words as unknown[]).length).toBeGreaterThanOrEqual(1);
      }
    );
  });

  describe('WordMatcher (no DB) findMatch', () => {
    it.each(TARGET_LANGUAGES)(
      'finds match for "the" at beginner for %s',
      async (target: Language) => {
        const matcher = new WordMatcher('en', target, null);
        await matcher.initialize();
        const entry = await matcher.findMatch('the', 'beginner');
        expect(entry).not.toBeNull();
        expect(entry!.sourceWord).toBe('the');
        expect(entry!.targetWord).toBeTruthy();
      }
    );

    it.each(TARGET_LANGUAGES)(
      'finds match for "house" at beginner for %s',
      async (target: Language) => {
        const matcher = new WordMatcher('en', target, null);
        await matcher.initialize();
        const entry = await matcher.findMatch('house', 'beginner');
        expect(entry).not.toBeNull();
        expect(entry!.sourceWord).toBe('house');
        expect(entry!.targetWord).toBeTruthy();
      }
    );
  });
});

describe('Word replacement – processContentOffline per language', () => {
  const shortStoryHtml = loadShortStory();

  it.each(TARGET_LANGUAGES)(
    'replaces words and adds foreign-word markers for target %s',
    async (target: Language) => {
      const database = createEmptyMockDatabase();
      const engine = new TranslationEngine(
        {
          sourceLanguage: 'en',
          targetLanguage: target,
          proficiencyLevel: 'beginner',
          density: 0.2,
        },
        database
      );

      const result = await engine.processContentOffline(shortStoryHtml);

      expect(result.stats.replacedWords).toBeGreaterThanOrEqual(1);
      expect(result.content).toContain('class="foreign-word"');
    }
  );
});
