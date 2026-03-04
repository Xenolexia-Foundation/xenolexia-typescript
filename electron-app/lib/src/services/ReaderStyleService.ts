/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Reader Style Service - Re-export from xenolexia-typescript core.
 */
export {
  ReaderStyleService,
  setReaderStyleStorage,
  READER_FONTS,
  generateStylesheet,
  getThemeCSSVariables,
  getFontCSS,
  saveSettings,
  loadSettings,
  saveBookSettings,
  loadBookSettings,
  getMergedSettings,
  resetSettings,
  resetBookSettings,
} from 'xenolexia-typescript';
export type {ReaderStyleConfig, ThemeColors} from 'xenolexia-typescript';
