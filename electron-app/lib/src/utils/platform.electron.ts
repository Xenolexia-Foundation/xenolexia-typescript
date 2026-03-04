/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Platform Detection - Electron version
 * Electron platform detection
 */

export const Platform = {
  OS: process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux',
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux',
  Version: process.platform,
  select: <T>(obj: {[key: string]: T}): T | undefined => {
    const os =
      process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux';
    return obj[os] || obj.default;
  },
};
