/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Storage Service - Re-export from xenolexia-typescript core.
 * Electron IDataStore implementation (LowDB) lives in DatabaseService.electron.ts.
 */

export {
  StorageService,
  createStorageService,
  BookRepository,
  VocabularyRepository,
  SessionRepository,
  DatabaseSchema,
} from 'xenolexia-typescript';
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
} from 'xenolexia-typescript';

export { databaseService, DatabaseService } from './DatabaseService.electron';
