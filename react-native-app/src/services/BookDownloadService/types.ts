/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Book Download Service Types
 */

import type {BookFormat} from '@types/index';

/**
 * Supported ebook source types
 */
export type EbookSourceType = 'url' | 'local' | 'gutenberg' | 'openlibrary' | 'standardebooks';

/**
 * Ebook source configuration
 */
export interface EbookSource {
  type: EbookSourceType;
  name: string;
  baseUrl?: string;
  searchEnabled: boolean;
  downloadEnabled: boolean;
}

/**
 * Download progress information
 */
export interface DownloadProgress {
  bookId: string;
  bytesDownloaded: number;
  totalBytes: number;
  percentage: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

/**
 * Download result
 */
export interface DownloadResult {
  success: boolean;
  filePath?: string;
  format?: BookFormat;
  error?: string;
  metadata?: {
    title: string;
    author: string;
    coverUrl?: string;
    fileSize: number;
  };
}

/**
 * Search result from ebook sources
 */
export interface EbookSearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  downloadUrl: string;
  format: BookFormat;
  source: EbookSourceType;
  language?: string;
  description?: string;
  publishYear?: number;
}

/**
 * Local ebook file info
 */
export interface LocalEbookFile {
  path: string;
  name: string;
  size: number;
  format: BookFormat;
  lastModified: Date;
}
