/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Electron IFileSystem adapter - uses IPC (window.electronAPI) in renderer.
 * Window.electronAPI is typed in app/src/types/electron.d.ts when building the app.
 */

import type {IFileSystem} from 'xenolexia-typescript';

/** Minimal API used by this adapter; full API is in app. */
function getAPI(): NonNullable<typeof window.electronAPI> {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('window.electronAPI not available (Electron preload only)');
  }
  return window.electronAPI;
}

export const electronFileSystem: IFileSystem = {
  async readFile(filePath: string): Promise<ArrayBuffer> {
    const buf = await getAPI().readFile!(filePath);
    return buf;
  },

  async readFileAsText(filePath: string): Promise<string> {
    return getAPI().readFileText!(filePath);
  },

  async readFileAsBase64(filePath: string): Promise<string> {
    const buf = await getAPI().readFile!(filePath);
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  },

  async writeFile(
    filePath: string,
    content: string | ArrayBuffer,
    _encoding?: 'utf8' | 'base64'
  ): Promise<void> {
    await getAPI().writeFile(filePath, content);
  },

  async fileExists(filePath: string): Promise<boolean> {
    try {
      return (await getAPI().fileExists?.(filePath)) ?? false;
    } catch {
      return false;
    }
  },

  async unlink(filePath: string): Promise<void> {
    await getAPI().unlink!(filePath);
  },

  async getAppDataPath(): Promise<string> {
    return getAPI().getAppDataPath?.() ?? '/tmp/xenolexia';
  },
};
