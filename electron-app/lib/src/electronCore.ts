/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Electron core bridge - inject adapters and get Xenolexia core from xenolexia-typescript.
 */

import {
  createXenolexiaCore,
  type XenolexiaCoreAdapters,
  type XenolexiaCore,
} from 'xenolexia-typescript';

let adapters: XenolexiaCoreAdapters | null = null;
let core: XenolexiaCore | null = null;

export function setElectronAdapters(a: XenolexiaCoreAdapters): void {
  adapters = a;
  core = null;
}

export function getCore(): XenolexiaCore {
  if (!core) {
    if (!adapters) {
      throw new Error('setElectronAdapters() must be called before getCore()');
    }
    core = createXenolexiaCore(adapters);
  }
  return core;
}
