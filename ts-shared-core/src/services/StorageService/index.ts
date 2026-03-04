/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Storage Service - Database operations and repositories
 * Host provides IDataStore; use createStorageService(dataStore).
 */

export {StorageService, createStorageService} from './StorageService';
export {DatabaseSchema} from './DatabaseSchema';
export type {
  IDataStore,
  BookRow,
  VocabularyRow,
  SessionRow,
  WordListRow,
  BookSort,
  BookFilter,
  VocabularySort,
  VocabularyFilter,
  QueryResult,
  MigrationDefinition,
} from './DataStore.types';

export {BookRepository, VocabularyRepository, SessionRepository} from './repositories';
export type {
  BookFilter as RepoBookFilter,
  BookSort as RepoBookSort,
  VocabularyFilter as RepoVocabularyFilter,
  VocabularySort as RepoVocabularySort,
} from './repositories';
