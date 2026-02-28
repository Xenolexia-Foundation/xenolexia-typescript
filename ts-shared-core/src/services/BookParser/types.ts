/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Book Parser Types
 */

import type {BookMetadata, Chapter, TableOfContentsItem, ParsedBook} from '../../types';

export interface IBookParser {
  /**
   * Parse a book file and extract its content
   */
  parse(filePath: string): Promise<ParsedBook>;

  /**
   * Get a specific chapter by index
   */
  getChapter(index: number): Promise<Chapter>;

  /**
   * Get the table of contents
   */
  getTableOfContents(): TableOfContentsItem[];

  /**
   * Search for text within the book
   */
  search(query: string): Promise<SearchResult[]>;

  /**
   * Get book metadata
   */
  getMetadata(): BookMetadata;

  /**
   * Clean up resources
   */
  dispose(): void;
}

export interface SearchResult {
  chapterIndex: number;
  chapterTitle: string;
  excerpt: string;
  position: number;
}

export interface ParserOptions {
  /**
   * Whether to extract images
   */
  extractImages?: boolean;

  /**
   * Maximum image size to extract (in bytes)
   */
  maxImageSize?: number;

  /**
   * Custom CSS to inject into content
   */
  customCSS?: string;
}
