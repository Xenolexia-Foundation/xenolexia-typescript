/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Web mock for @bam.tech/react-native-image-resizer
 * On web we do not resize; return the source path/uri as-is for thumbnails.
 */

export interface ImageResizerResult {
  path: string;
  uri: string;
  width: number;
  height: number;
  size?: number;
}

export function createResizedImage(
  path: string,
  width: number,
  height: number,
  format: string,
  quality: number,
  rotation?: number,
  outputPath?: string,
  keepMeta?: boolean,
  options?: {mode?: string}
): Promise<ImageResizerResult> {
  return Promise.resolve({
    path: path,
    uri:
      path.startsWith('file://') || path.startsWith('http') || path.startsWith('data:')
        ? path
        : path,
    width,
    height,
  });
}

export default {
  createResizedImage,
};
