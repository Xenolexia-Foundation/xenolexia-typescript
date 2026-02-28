/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Image Service - Image operations, caching, and thumbnails
 */

// Main service
export {ImageService} from './ImageService';

// Cache
export {ImageCache} from './ImageCache';

// Thumbnails
export {ThumbnailGenerator} from './ThumbnailGenerator';

// Types
export type {
  ImageDimensions,
  ResizeOptions,
  ThumbnailOptions,
  ThumbnailSize,
  CacheEntry,
  CacheStats,
  CacheOptions,
  ImageLoadStatus,
  ImageLoadResult,
  ImageSource,
  PlaceholderType,
  PlaceholderOptions,
} from './types';

export {THUMBNAIL_SIZES} from './types';
