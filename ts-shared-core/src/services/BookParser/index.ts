/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Book Parser Service - Parses various e-book formats
 */

// Main service and parser
export {BookParserService} from './BookParserService';
export {EPUBParser} from './EPUBParser';
export {FB2Parser} from './FB2Parser';
export {TXTParser} from './TXTParser';
export {MOBIParser} from './MOBIParser';

// Chapter content service
export {ChapterContentService} from './ChapterContentService';
export type {ChapterStyles, ProcessedChapterContent} from './ChapterContentService';

// Text processing service (tokenization, word replacement)
export {TextProcessingService} from './TextProcessingService';
export type {
  ProcessingOptions,
  ProcessedContent,
  ProcessingStats,
  ExtractedContent,
} from './TextProcessingService';

// Low-level utilities
export {EPUBExtractor} from './EPUBExtractor';
export type {
  EPUBContainer,
  EPUBManifestItem,
  EPUBSpineItem,
  EPUBPackage,
  EPUBRawMetadata,
} from './EPUBExtractor';

// TOC parsing
export {parseNCX, parseNAV, flattenTOC, countTOCItems, findTOCItemByHref} from './TOCParser';
export type {TOCParseResult, PageListItem} from './TOCParser';

// Metadata extraction
export {
  MetadataExtractor,
  extractEPUBMetadata,
  extractEPUBInfo,
  extractEPUBCover,
} from './MetadataExtractor';
export type {ExtractedMetadata, CoverExtractionResult} from './MetadataExtractor';

// Types
export type {IBookParser, SearchResult, ParserOptions} from './types';
