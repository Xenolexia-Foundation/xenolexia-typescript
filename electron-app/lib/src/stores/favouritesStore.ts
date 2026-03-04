/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Favourites Store - Starred words from the reader popup (persisted via DB preferences)
 */

import {create} from 'zustand';

import {getCore} from '../electronCore';

import type {FavouriteWord, ForeignWordData} from 'xenolexia-typescript';

const FAVOURITES_KEY = 'xenolexia_favourite_words';

interface FavouritesState {
  favourites: FavouriteWord[];
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  addFavourite: (word: ForeignWordData) => Promise<FavouriteWord>;
  removeFavourite: (id: string) => Promise<void>;
  isFavourite: (originalWord: string, targetLanguage: string) => boolean;
  getFavouriteId: (originalWord: string, targetLanguage: string) => string | undefined;
  refreshFavourites: () => Promise<void>;
}

function generateId(): string {
  return `fav_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useFavouritesStore = create<FavouritesState>((set, get) => ({
  favourites: [],
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({isLoading: true});
    try {
      const core = getCore();
      const raw = await core.storageService.getPreference(FAVOURITES_KEY);
      const list: FavouriteWord[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) {
        set({favourites: [], isLoading: false, isInitialized: true});
        return;
      }
      set({favourites: list, isLoading: false, isInitialized: true});
    } catch (error) {
      console.error('Failed to load favourites:', error);
      set({favourites: [], isLoading: false, isInitialized: true});
    }
  },

  addFavourite: async (word: ForeignWordData) => {
    const {originalWord, foreignWord, wordEntry, alternatives} = word;
    const existing = get().getFavouriteId(originalWord, wordEntry.targetLanguage);
    if (existing) {
      const fav = get().favourites.find(f => f.id === existing);
      if (fav) return fav;
    }
    const entry: FavouriteWord = {
      id: generateId(),
      originalWord,
      foreignWord,
      sourceLanguage: wordEntry.sourceLanguage,
      targetLanguage: wordEntry.targetLanguage,
      pronunciation: wordEntry.pronunciation,
      alternatives: alternatives?.length ? alternatives : undefined,
      addedAt: Date.now(),
    };
    const next = [entry, ...get().favourites];
    await getCore().storageService.setPreference(FAVOURITES_KEY, JSON.stringify(next));
    set({favourites: next});
    return entry;
  },

  removeFavourite: async (id: string) => {
    const next = get().favourites.filter(f => f.id !== id);
    await getCore().storageService.setPreference(FAVOURITES_KEY, JSON.stringify(next));
    set({favourites: next});
  },

  isFavourite: (originalWord: string, targetLanguage: string) => {
    return get().favourites.some(
      f =>
        f.originalWord.toLowerCase() === originalWord.toLowerCase() &&
        f.targetLanguage === targetLanguage
    );
  },

  getFavouriteId: (originalWord: string, targetLanguage: string) => {
    const f = get().favourites.find(
      x =>
        x.originalWord.toLowerCase() === originalWord.toLowerCase() &&
        x.targetLanguage === targetLanguage
    );
    return f?.id;
  },

  refreshFavourites: async () => {
    set({isLoading: true});
    try {
      const raw = await getCore().storageService.getPreference(FAVOURITES_KEY);
      const list: FavouriteWord[] = raw ? JSON.parse(raw) : [];
      set({favourites: Array.isArray(list) ? list : [], isLoading: false});
    } catch {
      set({isLoading: false});
    }
  },
}));
