/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Reader Screen - React DOM version
 */

import React, {useState, useCallback, useEffect, useRef} from 'react';

import {useBookmarksStore} from '@xenolexia/shared/stores/bookmarksStore';
import {useExcludeReplacementStore} from '@xenolexia/shared/stores/excludeReplacementStore';
import {useFavouritesStore} from '@xenolexia/shared/stores/favouritesStore';
import {useLibraryStore} from '@xenolexia/shared/stores/libraryStore';
import {useReaderStore} from '@xenolexia/shared/stores/readerStore';
import {useStatisticsStore} from '@xenolexia/shared/stores/statisticsStore';
import {useParams} from 'react-router-dom';

import {EpubJsReader, type EpubJsReaderHandle} from '../components/EpubJsReader';
import {useBack} from '../hooks/useBack';

import {ReaderContent} from './ReaderContent';

import type {Bookmark} from '@xenolexia/shared/stores/bookmarksStore';
import type {ForeignWordData, ReaderTheme, Book} from '@xenolexia/shared/types';
import './ReaderScreen.css';

export function ReaderScreen(): React.JSX.Element {
  const {bookId} = useParams<{bookId: string}>();
  const goBack = useBack('/');
  const {getBook, updateProgress: updateBookProgress} = useLibraryStore();
  const {
    currentBook,
    currentChapter,
    chapters,
    processedHtml,
    settings,
    isLoading,
    isLoadingChapter,
    error,
    loadBook,
    goToChapter,
    goToNextChapter,
    goToPreviousChapter,
    updateProgress,
    updateSettings,
    closeBook,
  } = useReaderStore();

  const {
    initialize: initFavourites,
    addFavourite,
    removeFavourite,
    isFavourite: isWordFavourite,
    getFavouriteId,
  } = useFavouritesStore();
  const {addExcludedWord, initialize: initExcludeReplacement} = useExcludeReplacementStore();
  const {
    initialize: initBookmarks,
    getBookmarksForBook,
    addBookmark,
    removeBookmark,
  } = useBookmarksStore();
  const book = bookId ? getBook(bookId) : null;
  const [selectedWord, setSelectedWord] = useState<ForeignWordData | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const loadingBookIdRef = useRef<string | null>(null);
  const epubReaderRef = useRef<EpubJsReaderHandle>(null);
  const [epubLocation, setEpubLocation] = useState<{current: number; total: number} | null>(null);
  const popupOpenedByHoverRef = useRef(false);
  const hoverDismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readingSessionStartedRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [searchMatchesCount, setSearchMatchesCount] = useState(0);

  // Start/end reading session for gamification (streaks, XP, achievements)
  useEffect(() => {
    if (!bookId || !book) return;
    if (readingSessionStartedRef.current === bookId) return;
    readingSessionStartedRef.current = bookId;
    useStatisticsStore.getState().startSession(bookId);
    return () => {
      useStatisticsStore.getState().endSession();
      readingSessionStartedRef.current = null;
    };
  }, [bookId, book]);

  // Only re-run when bookId changes; ref guard prevents double load (e.g. React Strict Mode)
  // For EPUB we use epub.js (open-source library) and skip the custom parser
  useEffect(() => {
    if (!bookId) return;
    if (loadingBookIdRef.current === bookId) return;
    loadingBookIdRef.current = bookId;
    const bookToLoad = getBook(bookId);
    if (bookToLoad) {
      if (bookToLoad.format === 'epub') {
        setEpubLocation(null);
        return;
      }
      loadBook(bookToLoad);
    }
    return () => {
      loadingBookIdRef.current = null;
      setEpubLocation(null);
      closeBook();
    };
  }, [bookId, getBook, loadBook, closeBook]);

  // Keyboard shortcuts: next/prev chapter, toggle controls
  const isEpub = book?.format === 'epub';
  useEffect(() => {
    if (!book || selectedWord || showReaderSettings) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          if (isEpub) epubReaderRef.current?.goNext();
          else goToNextChapter();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          if (isEpub) epubReaderRef.current?.goPrev();
          else goToPreviousChapter();
          break;
        case 'c':
        case 'C':
        case 'Escape':
          e.preventDefault();
          setShowControls(prev => !prev);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, selectedWord, showReaderSettings, isEpub, goToNextChapter, goToPreviousChapter]);

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleWordClick = useCallback((word: ForeignWordData) => {
    popupOpenedByHoverRef.current = false;
    setSelectedWord(word);
    setShowControls(false);
    useStatisticsStore.getState().recordWordRevealed();
  }, []);

  const handleWordHover = useCallback((word: ForeignWordData) => {
    popupOpenedByHoverRef.current = true;
    setSelectedWord(word);
    useReaderStore.getState().recordWordRevealed();
    useStatisticsStore.getState().recordWordRevealed();
  }, []);

  const handleWordHoverEnd = useCallback(() => {
    if (!popupOpenedByHoverRef.current) return;
    if (hoverDismissTimeoutRef.current) clearTimeout(hoverDismissTimeoutRef.current);
    hoverDismissTimeoutRef.current = setTimeout(() => {
      hoverDismissTimeoutRef.current = null;
      setSelectedWord(null);
    }, 200);
  }, []);

  const cancelHoverDismiss = useCallback(() => {
    if (hoverDismissTimeoutRef.current) {
      clearTimeout(hoverDismissTimeoutRef.current);
      hoverDismissTimeoutRef.current = null;
    }
  }, []);

  const dismissPopupFromLeave = useCallback(() => {
    if (popupOpenedByHoverRef.current) setSelectedWord(null);
  }, []);

  useEffect(() => {
    initFavourites();
    initExcludeReplacement();
    initBookmarks();
  }, [initFavourites, initExcludeReplacement, initBookmarks]);

  // When hover popup is shown, cancel any pending dismiss after a short delay (word mouseleave may have fired because overlay covered the cursor)
  useEffect(() => {
    if (!selectedWord) return;
    const id = setTimeout(() => cancelHoverDismiss(), 80);
    return () => clearTimeout(id);
  }, [selectedWord, cancelHoverDismiss]);

  const handleProgressChange = useCallback(
    (progress: number) => {
      updateProgress(progress);
    },
    [updateProgress]
  );

  const dismissPopup = useCallback(() => {
    if (hoverDismissTimeoutRef.current) {
      clearTimeout(hoverDismissTimeoutRef.current);
      hoverDismissTimeoutRef.current = null;
    }
    setSelectedWord(null);
    setShowControls(true);
  }, []);

  const handleEpubLocationChange = useCallback((current: number, total: number) => {
    setEpubLocation({current, total});
  }, []);

  const handleEpubProgressSave = useCallback(
    (progress: number, locationCfi: string | null, sectionIndex: number) => {
      if (book?.id) {
        updateBookProgress(book.id, progress, locationCfi, sectionIndex);
      }
    },
    [book?.id, updateBookProgress]
  );

  if (error) {
    return (
      <div className="reader-screen">
        <div className="reader-error">
          <p>{error}</p>
          <button onClick={() => book && loadBook(book)}>Retry</button>
        </div>
      </div>
    );
  }

  const isEpubReader = book?.format === 'epub';
  if (!book) {
    return (
      <div className="reader-screen">
        <div className="reader-loading">Loading book...</div>
      </div>
    );
  }
  if (!isEpubReader && (isLoading || !currentBook)) {
    return (
      <div className="reader-screen">
        <div className="reader-loading">Loading book...</div>
      </div>
    );
  }

  const themeClass = `reader-theme-${settings.theme}`;

  return (
    <div className={`reader-screen ${themeClass}`}>
      {showControls && (
        <div className="reader-header">
          <button onClick={handleBack} className="reader-back-button">
            ← Back
          </button>
          <div className="reader-header-center">
            <h2>
              {isEpubReader
                ? epubLocation
                  ? `Section ${epubLocation.current + 1} of ${epubLocation.total}`
                  : book.title
                : currentChapter?.title || book.title}
            </h2>
          </div>
          {!isEpubReader && (
            <div className="reader-search-bar">
              <input
                type="search"
                placeholder="Search in chapter..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchMatchIndex(0);
                }}
                className="reader-search-input"
                aria-label="Search in chapter"
              />
              {searchQuery.trim() && (
                <span className="reader-search-matches">
                  {searchMatchesCount > 0
                    ? `${searchMatchIndex + 1} / ${searchMatchesCount}`
                    : 'No matches'}
                </span>
              )}
              {searchQuery.trim() && searchMatchesCount > 0 && (
                <>
                  <button
                    type="button"
                    className="reader-search-nav"
                    onClick={() =>
                      setSearchMatchIndex(i => (i <= 0 ? searchMatchesCount - 1 : i - 1))
                    }
                    aria-label="Previous match"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="reader-search-nav"
                    onClick={() =>
                      setSearchMatchIndex(i => (i >= searchMatchesCount - 1 ? 0 : i + 1))
                    }
                    aria-label="Next match"
                  >
                    ↓
                  </button>
                </>
              )}
            </div>
          )}
          <button onClick={() => setShowReaderSettings(true)} className="reader-settings-button">
            ⚙️
          </button>
          {book && (
            <button
              type="button"
              className="reader-bookmark-button"
              onClick={async () => {
                if (isEpubReader && epubReaderRef.current) {
                  const {cfi} = epubReaderRef.current.getCurrentLocation();
                  if (cfi) await addBookmark(book.id, cfi);
                  else alert('Unable to get current position.');
                } else if (!isEpubReader && currentChapter != null) {
                  await addBookmark(book.id, `chapter:${currentChapter.index}`);
                }
              }}
              title="Add bookmark"
              aria-label="Add bookmark"
            >
              🔖
            </button>
          )}
        </div>
      )}

      <div
        className="reader-content"
        onClick={() => setShowControls(!showControls)}
        style={
          isEpubReader
            ? {flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}
            : {
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                lineHeight: settings.lineHeight,
                padding: `0 ${settings.marginHorizontal}px`,
              }
        }
      >
        {isEpubReader ? (
          <EpubJsReader
            ref={epubReaderRef}
            book={book}
            onLocationChange={handleEpubLocationChange}
            onProgressSave={handleEpubProgressSave}
            onWordClick={handleWordClick}
            onWordHover={handleWordHover}
            onWordHoverEnd={handleWordHoverEnd}
          />
        ) : isLoadingChapter ? (
          <div className="reader-loading-chapter">Loading chapter...</div>
        ) : processedHtml ? (
          <ReaderContent
            html={processedHtml}
            book={book}
            onWordClick={handleWordClick}
            onWordHover={handleWordHover}
            onWordHoverEnd={handleWordHoverEnd}
            onProgressChange={handleProgressChange}
            searchQuery={searchQuery}
            searchMatchIndex={searchMatchIndex}
            onSearchMatchesCount={setSearchMatchesCount}
          />
        ) : (
          <div className="reader-empty">No content available</div>
        )}
      </div>

      {showControls && (
        <div className="reader-footer">
          <button
            onClick={() => (isEpubReader ? epubReaderRef.current?.goPrev() : goToPreviousChapter())}
            disabled={
              isEpubReader
                ? (epubLocation?.current ?? 0) <= 0
                : !currentChapter || currentChapter.index === 0
            }
          >
            ← Previous
          </button>
          <div className="reader-progress">
            {isEpubReader && epubLocation
              ? epubLocation.total > 0
                ? Math.round(((epubLocation.current + 1) / epubLocation.total) * 100)
                : 0
              : chapters.length > 0
                ? Math.round((((currentChapter?.index || 0) + 1) / chapters.length) * 100)
                : 0}
            %
          </div>
          <button
            onClick={() => (isEpubReader ? epubReaderRef.current?.goNext() : goToNextChapter())}
            disabled={
              isEpubReader
                ? (epubLocation?.current ?? 0) >= Math.max(0, (epubLocation?.total ?? 1) - 1)
                : !currentChapter || currentChapter.index >= chapters.length - 1
            }
          >
            Next →
          </button>
        </div>
      )}

      {showReaderSettings && (
        <ReaderSettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowReaderSettings(false)}
          book={book}
          isEpub={isEpubReader}
          bookmarks={book ? getBookmarksForBook(book.id) : []}
          onGoToBookmark={location => {
            if (isEpubReader && epubReaderRef.current) {
              epubReaderRef.current.goToLocation(location);
            } else {
              const match = location.match(/^chapter:(\d+)$/);
              if (match) goToChapter(parseInt(match[1], 10));
            }
            setShowReaderSettings(false);
          }}
          onRemoveBookmark={removeBookmark}
        />
      )}
      {selectedWord && (
        <TranslationPopup
          word={selectedWord}
          isFavourite={isWordFavourite(
            selectedWord.originalWord,
            selectedWord.wordEntry.targetLanguage
          )}
          favouriteId={getFavouriteId(
            selectedWord.originalWord,
            selectedWord.wordEntry.targetLanguage
          )}
          onDismiss={dismissPopup}
          onMouseEnter={cancelHoverDismiss}
          onMouseLeave={dismissPopupFromLeave}
          onToggleFavourite={async () => {
            if (isWordFavourite(selectedWord.originalWord, selectedWord.wordEntry.targetLanguage)) {
              const id = getFavouriteId(
                selectedWord.originalWord,
                selectedWord.wordEntry.targetLanguage
              );
              if (id) await removeFavourite(id);
            } else {
              await addFavourite(selectedWord);
              useStatisticsStore.getState().recordWordSaved();
            }
          }}
          onStopReplacing={async () => {
            await addExcludedWord(selectedWord.originalWord);
            dismissPopup();
          }}
          onKnewIt={() => dismissPopup()}
        />
      )}
    </div>
  );
}

interface ReaderSettingsPanelProps {
  settings: {
    theme: ReaderTheme;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
  onUpdate: (updates: Partial<ReaderSettingsPanelProps['settings']>) => void;
  onClose: () => void;
  book?: Book | null;
  isEpub?: boolean;
  bookmarks?: Bookmark[];
  onGoToBookmark?: (location: string) => void;
  onRemoveBookmark?: (id: string) => void;
}

function ReaderSettingsPanel({
  settings,
  onUpdate,
  onClose,
  book,
  bookmarks = [],
  onGoToBookmark,
  onRemoveBookmark,
}: ReaderSettingsPanelProps): React.JSX.Element {
  return (
    <div className="reader-settings-overlay" onClick={onClose}>
      <div className="reader-settings-panel" onClick={e => e.stopPropagation()}>
        <div className="reader-settings-header">
          <h3>Reader settings</h3>
          <button type="button" onClick={onClose} className="reader-settings-close">
            ✕
          </button>
        </div>
        <div className="reader-settings-body">
          <label>
            Theme
            <select
              value={settings.theme}
              onChange={e => onUpdate({theme: e.target.value as ReaderTheme})}
              className="reader-settings-select"
            >
              <option value="light">Light</option>
              <option value="sepia">Sepia</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Font size
            <input
              type="number"
              min={12}
              max={32}
              value={settings.fontSize}
              onChange={e => onUpdate({fontSize: Number(e.target.value) || 18})}
              className="reader-settings-input"
            />
          </label>
          <label>
            Font family
            <select
              value={settings.fontFamily}
              onChange={e => onUpdate({fontFamily: e.target.value})}
              className="reader-settings-select"
            >
              <option value="Georgia">Georgia</option>
              <option value="serif">Serif</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="system-ui, sans-serif">System</option>
              <option value="'Atkinson Hyperlegible', 'Segoe UI', sans-serif">
                Dyslexic-friendly
              </option>
            </select>
          </label>
          <label>
            Line spacing
            <input
              type="number"
              min={1}
              max={3}
              step={0.1}
              value={settings.lineHeight}
              onChange={e => onUpdate({lineHeight: Number(e.target.value) || 1.6})}
              className="reader-settings-input"
            />
          </label>
          {book && (
            <>
              <div className="reader-settings-divider" />
              <div className="reader-settings-bookmarks">
                <h4 className="reader-settings-bookmarks-title">Bookmarks</h4>
                {bookmarks.length === 0 ? (
                  <p className="reader-settings-bookmarks-empty">
                    No bookmarks yet. Use the bookmark button in the header to add one.
                  </p>
                ) : (
                  <ul className="reader-settings-bookmarks-list">
                    {bookmarks.map(bm => (
                      <li key={bm.id} className="reader-settings-bookmark-item">
                        <button
                          type="button"
                          className="reader-settings-bookmark-goto"
                          onClick={() => onGoToBookmark?.(bm.location)}
                        >
                          {bm.label}
                        </button>
                        <button
                          type="button"
                          className="reader-settings-bookmark-remove"
                          onClick={() => onRemoveBookmark?.(bm.id)}
                          aria-label="Remove bookmark"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TranslationPopupProps {
  word: ForeignWordData;
  isFavourite?: boolean;
  favouriteId?: string;
  onDismiss: () => void;
  onToggleFavourite?: () => void;
  /** Stop replacing this word in future reading (add to excluded list) */
  onStopReplacing?: () => void;
  onKnewIt?: () => void;
  /** Cancel any pending hover-dismiss when pointer enters popup (stops flicker) */
  onMouseEnter?: () => void;
  /** Dismiss when pointer leaves popup (for hover-opened popup) */
  onMouseLeave?: () => void;
}

function TranslationPopup({
  word,
  isFavourite,
  onDismiss,
  onToggleFavourite,
  onStopReplacing,
  onKnewIt,
  onMouseEnter,
  onMouseLeave,
}: TranslationPopupProps): React.JSX.Element {
  return (
    <div
      className="translation-popup-overlay"
      onClick={onDismiss}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="translation-popup" onClick={e => e.stopPropagation()}>
        <div className="translation-popup-header">
          <h3>{word.foreignWord}</h3>
          <div className="translation-popup-header-actions">
            {onToggleFavourite && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onToggleFavourite();
                }}
                className={`translation-popup-star ${isFavourite ? 'translation-popup-star-filled' : ''}`}
                title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              >
                {isFavourite ? '★' : '☆'}
              </button>
            )}
            <button onClick={onDismiss} className="translation-popup-close">
              ✕
            </button>
          </div>
        </div>
        <div className="translation-popup-content">
          <p className="translation-original">{word.originalWord}</p>
          {word.wordEntry.pronunciation && (
            <p className="translation-pronunciation">[{word.wordEntry.pronunciation}]</p>
          )}
          {word.alternatives && word.alternatives.length > 0 && (
            <p className="translation-alternatives">Also: {word.alternatives.join(', ')}</p>
          )}
        </div>
        {(onKnewIt || onStopReplacing) && (
          <div className="translation-popup-actions">
            <button type="button" onClick={onKnewIt} className="translation-popup-knew-it">
              I Knew This
            </button>
            {onStopReplacing && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onStopReplacing();
                }}
                className="translation-popup-stop-replacing"
                title="Don’t replace this word in future reading"
              >
                Don’t replace this word
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
