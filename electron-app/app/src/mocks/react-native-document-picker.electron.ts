/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Stub for document picker (Electron uses showOpenDialog instead).
 * Kept so shared ImportService can be bundled without resolving the RN package.
 */

export const types = {
  allFiles: '*/*',
  plainText: 'text/plain',
  epub: 'application/epub+zip',
};

export const pick = async (): Promise<never[]> => {
  return [];
};
