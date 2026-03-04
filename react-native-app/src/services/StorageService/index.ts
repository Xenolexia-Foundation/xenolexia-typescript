/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Storage Service - Database operations and repositories
 */

// Legacy service (to be deprecated)
export {StorageService} from './StorageService';
export {DatabaseSchema} from './DatabaseSchema';

// New database service
export {databaseService} from './DatabaseService';
export type {QueryResult, MigrationDefinition} from './DatabaseService';

// Repositories
export {bookRepository, vocabularyRepository, sessionRepository} from './repositories';
export type {BookFilter, BookSort, VocabularyFilter, VocabularySort} from './repositories';
