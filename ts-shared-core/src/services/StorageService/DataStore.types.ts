/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Re-export data store types from adapters (single source of truth).
 */
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
} from '../../adapters';
