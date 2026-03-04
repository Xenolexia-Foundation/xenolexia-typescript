/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Exclude Replacement Store - Words the user chose to stop replacing (persisted in preferences)
 */

import {create} from 'zustand';

import {getCore} from '../electronCore';

const PREF_KEY = 'xenolexia_exclude_replacement_words';

interface ExcludeReplacementState {
  /** Lowercase words that should not be replaced */
  words: Set<string>;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  getExcludedWords: () => string[];
  addExcludedWord: (word: string) => Promise<void>;
  removeExcludedWord: (word: string) => Promise<void>;
  isExcluded: (word: string) => boolean;
}

async function loadWords(): Promise<Set<string>> {
  const raw = await getCore().storageService.getPreference(PREF_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw) as string[];
    return new Set(
      Array.isArray(arr) ? arr.map(w => String(w).toLowerCase().trim()).filter(Boolean) : []
    );
  } catch {
    return new Set();
  }
}

async function saveWords(words: Set<string>): Promise<void> {
  const arr = Array.from(words);
  await getCore().storageService.setPreference(PREF_KEY, JSON.stringify(arr));
}

export const useExcludeReplacementStore = create<ExcludeReplacementState>((set, get) => ({
  words: new Set(),
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    const words = await loadWords();
    set({words, isInitialized: true});
  },

  getExcludedWords: () => Array.from(get().words),

  addExcludedWord: async (word: string) => {
    const normalized = word.toLowerCase().trim();
    if (!normalized) return;
    const next = new Set(get().words);
    next.add(normalized);
    await saveWords(next);
    set({words: next});
  },

  removeExcludedWord: async (word: string) => {
    const normalized = word.toLowerCase().trim();
    const next = new Set(get().words);
    next.delete(normalized);
    await saveWords(next);
    set({words: next});
  },

  isExcluded: (word: string) => get().words.has(word.toLowerCase().trim()),
}));
