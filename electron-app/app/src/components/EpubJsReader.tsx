/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * EPUB reader using epub.js (BSD-2-Clause, GPL-compatible).
 * Uses the open-source epub.js library instead of custom parsing for EPUB.
 * Post-processes rendered content with TranslationEngine for language learning
 * (word replacement, hover-to-reveal, save to vocabulary).
 */

import {useEffect, useRef, useImperativeHandle, forwardRef, useCallback} from 'react';

import {createTranslationEngine} from '@xenolexia/shared';
import {generateForeignWordStyles} from '@xenolexia/shared/services/TranslationEngine';
import {useExcludeReplacementStore} from '@xenolexia/shared/stores/excludeReplacementStore';

import type {Language, Book, ForeignWordData} from '@xenolexia/shared/types';

// epub.js (BSD-2-Clause, GPL-compatible) - open-source EPUB renderer
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ePub = require('epubjs').default;

export interface EpubJsReaderHandle {
  goPrev: () => void;
  goNext: () => void;
  canGoPrev: () => boolean;
  canGoNext: () => boolean;
  /** Get current position for bookmarks. Returns last known CFI from relocated event. */
  getCurrentLocation: () => {cfi: string | null; sectionIndex: number};
  /** Navigate to a bookmarked position (CFI string). */
  goToLocation: (cfi: string) => void;
}

interface EpubJsReaderProps {
  book: Book;
  onLocationChange?: (current: number, total: number) => void;
  onProgressSave?: (progress: number, locationCfi: string | null, sectionIndex: number) => void;
  onWordClick?: (word: ForeignWordData) => void;
  onWordHover?: (word: ForeignWordData) => void;
  onWordHoverEnd?: () => void;
}

function buildForeignWordData(
  el: HTMLElement,
  sourceLanguage: Language,
  targetLanguage: Language
): ForeignWordData {
  const alternativesRaw = el.dataset.alternatives;
  const alternatives = alternativesRaw
    ? alternativesRaw
        .split('|')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined;
  return {
    originalWord: el.dataset.original ?? '',
    foreignWord: el.textContent ?? '',
    startIndex: 0,
    endIndex: 0,
    wordEntry: {
      id: el.dataset.wordId ?? '',
      sourceWord: el.dataset.original ?? '',
      targetWord: el.textContent ?? '',
      sourceLanguage,
      targetLanguage,
      proficiencyLevel: 'beginner',
      frequencyRank: 0,
      partOfSpeech: (el.dataset.pos as any) ?? 'other',
      variants: [],
      pronunciation: el.dataset.pronunciation ?? undefined,
    },
    ...(alternatives && alternatives.length > 0 && {alternatives}),
  };
}

export const EpubJsReader = forwardRef<EpubJsReaderHandle, EpubJsReaderProps>(function EpubJsReader(
  {book, onLocationChange, onProgressSave, onWordClick, onWordHover, onWordHoverEnd},
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<{destroy: () => void} | null>(null);
  const bookPropsRef = useRef(book);
  bookPropsRef.current = book;
  const renditionRef = useRef<{
    destroy: () => void;
    prev: () => Promise<unknown>;
    next: () => Promise<unknown>;
    display: (key?: string) => Promise<unknown>;
  } | null>(null);
  const lastLocationRef = useRef<{cfi: string | null; sectionIndex: number}>({
    cfi: null,
    sectionIndex: 0,
  });
  const blobUrlRef = useRef<string | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const onProgressSaveRef = useRef(onProgressSave);
  const onWordClickRef = useRef(onWordClick);
  const onWordHoverRef = useRef(onWordHover);
  const onWordHoverEndRef = useRef(onWordHoverEnd);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredElementRef = useRef<HTMLElement | null>(null);
  onLocationChangeRef.current = onLocationChange;
  onProgressSaveRef.current = onProgressSave;
  onWordClickRef.current = onWordClick;
  onWordHoverRef.current = onWordHover;
  onWordHoverEndRef.current = onWordHoverEnd;

  const canGoPrev = useCallback(() => {
    const r = renditionRef.current;
    if (!r) return false;
    try {
      return (r as any).location?.start?.index > 0;
    } catch {
      return false;
    }
  }, []);

  const canGoNext = useCallback(() => {
    const r = renditionRef.current;
    if (!r) return false;
    try {
      const loc = (r as any).location;
      const total = (r as any).book?.spine?.length;
      if (total == null) return true;
      return (loc?.start?.index ?? 0) < total - 1;
    } catch {
      return true;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      goPrev: () => {
        const r = renditionRef.current;
        if (r && typeof r.prev === 'function') r.prev();
      },
      goNext: () => {
        const r = renditionRef.current;
        if (r && typeof r.next === 'function') r.next();
      },
      canGoPrev,
      canGoNext,
      getCurrentLocation: () => lastLocationRef.current,
      goToLocation: (cfi: string) => {
        const r = renditionRef.current;
        if (r && typeof r.display === 'function') r.display(cfi);
      },
    }),
    [canGoPrev, canGoNext]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !book?.filePath) return;

    function attachListeners(root: HTMLElement, sourceLang: string, targetLang: string) {
      const handleMouseEnter = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target?.classList?.contains('foreign-word')) return;
        hoveredElementRef.current = target;
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          if (hoveredElementRef.current === target) {
            onWordHoverRef.current?.(
              buildForeignWordData(target, sourceLang as Language, targetLang as Language)
            );
          }
        }, 300);
      };
      const handleMouseLeave = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target?.classList?.contains('foreign-word')) return;
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        hoveredElementRef.current = null;
        onWordHoverEndRef.current?.();
      };
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target?.classList?.contains('foreign-word')) return;
        e.preventDefault();
        e.stopPropagation();
        onWordClickRef.current?.(
          buildForeignWordData(target, sourceLang as Language, targetLang as Language)
        );
      };
      root.addEventListener('mouseenter', handleMouseEnter, true);
      root.addEventListener('mouseleave', handleMouseLeave, true);
      root.addEventListener('click', handleClick, true);
    }

    let mounted = true;

    async function openBook() {
      if (!window.electronAPI?.readFile) {
        console.error('EpubJsReader: Electron API not available');
        return;
      }
      try {
        const arrayBuffer = await window.electronAPI.readFile(book.filePath!);
        const blob = new Blob([arrayBuffer], {type: 'application/epub+zip'});
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;

        if (!mounted) {
          URL.revokeObjectURL(url);
          return;
        }

        const epubBook = ePub(url, {openAs: 'epub'});
        bookRef.current = epubBook;

        if (!mounted || !containerRef.current) {
          epubBook.destroy();
          URL.revokeObjectURL(url);
          return;
        }

        const rendition = epubBook.renderTo(container, {
          width: '100%',
          height: '100%',
          flow: 'scrolled-doc',
          allowScriptedContent: true, // avoids "Blocked script execution in about:srcdoc" (iframe sandbox); needed for some EPUBs/epub.js
        });
        renditionRef.current = rendition;

        // Restore saved position if available (CFI string from previous session)
        const initialLocation = book.currentLocation || undefined;
        if (initialLocation) {
          rendition.display(initialLocation);
        } else {
          rendition.display();
        }

        rendition.on(
          'relocated',
          (location: {start?: {index?: number; cfi?: string}; end?: {index?: number}}) => {
            if (epubBook.spine) {
              const total = epubBook.spine.length;
              const current = location?.start?.index ?? 0;
              const cfi = location?.start?.cfi ?? null;
              lastLocationRef.current = {cfi, sectionIndex: current};
              onLocationChangeRef.current?.(current, total);
              // Persist progress for restore on reopen
              if (total > 0 && book.id) {
                const progressPct = Math.round(((current + 1) / total) * 100);
                onProgressSaveRef.current?.(progressPct, cfi ?? null, current);
              }
            }
          }
        );

        // Post-process rendered content for language learning: word replacement + hover/click
        // Always use the displayed document's body and replace its innerHTML (original working approach).
        rendition.on(
          'rendered',
          async (
            _section: {document?: Document; idref?: string; index?: number},
            view: {contents?: {document?: Document}}
          ) => {
            // Use the document that is actually displayed (view's iframe). Fallback to getContents()[0] then section.document.
            let doc: Document | null = view?.contents?.document ?? null;
            if (!doc?.body && typeof rendition.getContents === 'function') {
              const contentsList = rendition.getContents();
              const first = Array.isArray(contentsList) ? contentsList[0] : contentsList;
              doc = first?.document ?? null;
            }
            if (!doc?.body) doc = (_section as {document?: Document})?.document ?? null;
            const root = doc?.body ?? null;

            if (!mounted || !root || !book?.languagePair) return;

            const currentBook = bookPropsRef.current;
            const sourceLang =
              currentBook?.languagePair?.sourceLanguage ?? book.languagePair.sourceLanguage;
            const targetLang =
              currentBook?.languagePair?.targetLanguage ?? book.languagePair.targetLanguage;
            const density =
              typeof (currentBook ?? book).wordDensity === 'number'
                ? (currentBook ?? book).wordDensity!
                : 0.3;
            const proficiency = (currentBook ?? book).proficiencyLevel ?? 'beginner';

            try {
              const rawHtml = root.innerHTML;
              await useExcludeReplacementStore.getState().initialize();
              const excludeWords = useExcludeReplacementStore.getState().getExcludedWords();
              const engine = createTranslationEngine({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
                proficiencyLevel: proficiency,
                density,
                excludeWords: excludeWords.length > 0 ? excludeWords : undefined,
              });
              // Use offline dictionary only; 5-10 words per paragraph, max 35%
              const processed = await engine.processContentOffline(rawHtml);

              // Always update the body with processed content (replaced or not) so styling/listeners apply
              root.innerHTML = processed.content;

              const docForStyles = root.ownerDocument;
              let styleEl = docForStyles.getElementById('xenolexia-epub-foreign-word-styles');
              if (!styleEl) {
                styleEl = docForStyles.createElement('style');
                styleEl.id = 'xenolexia-epub-foreign-word-styles';
                styleEl.textContent = generateForeignWordStyles();
                (docForStyles.head || docForStyles.body).appendChild(styleEl);
              }

              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              hoveredElementRef.current = null;

              attachListeners(root, sourceLang, targetLang);
            } catch (err) {
              console.warn('EpubJsReader: word replacement failed', err);
            }
          }
        );
      } catch (error) {
        console.error('EpubJsReader: Failed to open book', error);
      }
    }

    openBook();

    return () => {
      mounted = false;
      try {
        renditionRef.current?.destroy();
        renditionRef.current = null;
        bookRef.current?.destroy();
        bookRef.current = null;
      } catch (e) {
        console.warn('EpubJsReader cleanup:', e);
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [book?.filePath, book?.id]);

  return (
    <div
      ref={containerRef}
      className="epubjs-reader"
      style={{width: '100%', flex: 1, minHeight: 0}}
    />
  );
});
