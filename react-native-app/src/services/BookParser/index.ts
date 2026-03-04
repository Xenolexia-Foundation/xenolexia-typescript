/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Book Parser - Re-export from xenolexia-typescript core + RN instances (RNFS adapter).
 */

export {
  BookParserService,
  EPUBParser,
  FB2Parser,
  TXTParser,
  MOBIParser,
  ChapterContentService,
  TextProcessingService,
  EPUBExtractor,
  MetadataExtractor,
  extractEPUBMetadata,
  extractEPUBInfo,
  extractEPUBCover,
} from 'xenolexia-typescript';
export type {
  IBookParser,
  ParserOptions,
  SearchResult,
  ChapterStyles,
  ProcessedChapterContent,
} from 'xenolexia-typescript';

export {bookParserService, chapterContentService} from './bookParserCore';
export {rnfsFileSystem} from './rnfsAdapter';
