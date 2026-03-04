/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * React Native book parser core - single instances using ts-shared-core with RNFS adapter.
 * All EPUB/MOBI/TXT/FB2 parsing goes through xenolexia-typescript with rnfsFileSystem.
 */

import {createBookParserService, ChapterContentService} from 'xenolexia-typescript';

import {rnfsFileSystem} from './rnfsAdapter';

export const bookParserService = createBookParserService(rnfsFileSystem);
export const chapterContentService = new ChapterContentService(rnfsFileSystem);
