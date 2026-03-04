/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Shared Package - Xenolexia
 *
 * Uses xenolexia-typescript core when setElectronAdapters() has been called (Electron).
 * Stores and services use getCore() for storage, translation, and book parsing.
 */

export {setElectronAdapters, getCore} from './electronCore';
export {electronFileSystem} from './adapters/electronFileSystem';
export {createElectronKeyValueStore} from './adapters/electronKeyValueStore';

import {getCore} from './electronCore';

import type {TranslationOptions} from 'xenolexia-typescript';

export function createTranslationEngine(opts: TranslationOptions) {
  return getCore().createTranslationEngine(opts);
}

let _wordDatabase: ReturnType<ReturnType<typeof getCore>['createDynamicWordDatabase']> | null =
  null;
export function getWordDatabase() {
  if (!_wordDatabase) _wordDatabase = getCore().createDynamicWordDatabase();
  return _wordDatabase;
}

/** @deprecated Use getWordDatabase() instead. Kept for backward compatibility. */
export const wordDatabase = new Proxy({} as any, {
  get(_, prop) {
    return (getWordDatabase() as any)[prop];
  },
});

// Stores (use getCore() internally)
export * from './stores';

// Services (ImportService, BookDownloadService, ReaderStyleService, etc.)
export * from './services';

// Types
export * from './types';

// Utils
export * from './utils';

// Hooks
export * from './hooks';

// Constants
export * from './constants';

// Data
export * from './data';
