/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Bookmarks store - Persisted per-book bookmarks (EPUB CFI or chapter index)
 */

import {create} from 'zustand';

import {getCore} from '../electronCore';

const PREF_KEY = 'xenolexia_bookmarks';

export interface Bookmark {
  id: string;
  bookId: string;
  label: string;
  /** EPUB: CFI string; non-EPUB: "chapter:INDEX" */
  location: string;
  createdAt: number;
}

interface BookmarksState {
  items: Bookmark[];
  isInitialized: boolean;

  initialize: () => Promise<void>;
  getBookmarksForBook: (bookId: string) => Bookmark[];
  addBookmark: (bookId: string, location: string, label?: string) => Promise<Bookmark>;
  removeBookmark: (id: string) => Promise<void>;
}

async function load(): Promise<Bookmark[]> {
  const raw = await getCore().storageService.getPreference(PREF_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Bookmark[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function save(items: Bookmark[]): Promise<void> {
  await getCore().storageService.setPreference(PREF_KEY, JSON.stringify(items));
}

function nextId(): string {
  return `bm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  items: [],
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    const items = await load();
    set({items, isInitialized: true});
  },

  getBookmarksForBook: (bookId: string) =>
    get()
      .items.filter(b => b.bookId === bookId)
      .sort((a, b) => b.createdAt - a.createdAt),

  addBookmark: async (bookId: string, location: string, label?: string) => {
    await get().initialize();
    const items = get().items;
    const bookmark: Bookmark = {
      id: nextId(),
      bookId,
      label: label ?? `Bookmark ${new Date().toLocaleTimeString()}`,
      location,
      createdAt: Date.now(),
    };
    const next = [...items, bookmark];
    await save(next);
    set({items: next});
    return bookmark;
  },

  removeBookmark: async (id: string) => {
    const next = get().items.filter(b => b.id !== id);
    await save(next);
    set({items: next});
  },
}));
