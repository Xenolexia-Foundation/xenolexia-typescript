/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Reader Content - Renders EPUB HTML with word interaction support for desktop
 */

import React, {useEffect, useRef, useCallback} from 'react';

import {
  generateInjectedScript,
  generateForeignWordStyles,
} from '@xenolexia/shared/services/TranslationEngine';

import type {Book, ForeignWordData} from '@xenolexia/shared/types';
import './ReaderContent.css';

interface ReaderContentProps {
  html: string;
  book: Book;
  onWordClick: (word: ForeignWordData) => void;
  onWordHover: (word: ForeignWordData) => void;
  onWordHoverEnd: () => void;
  onProgressChange?: (progress: number) => void;
  /** Search within text: query and current match index (0-based). */
  searchQuery?: string;
  searchMatchIndex?: number;
  onSearchMatchesCount?: (count: number) => void;
}

export function ReaderContent({
  html,
  book,
  onWordClick,
  onWordHover,
  onWordHoverEnd,
  onProgressChange,
  searchQuery,
  searchMatchIndex = 0,
  onSearchMatchesCount,
}: ReaderContentProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoveredElementRef = useRef<HTMLElement | null>(null);

  // Extract body content from full HTML document
  const extractBodyContent = useCallback((fullHtml: string): string => {
    // If HTML contains full document, extract body content
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    // If it's just body content, return as-is
    return fullHtml;
  }, []);

  // Setup word interaction handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a message bridge for desktop (replaces ReactNativeWebView.postMessage)
    (window as any).ReactNativeWebView = {
      postMessage: (messageStr: string) => {
        try {
          const message = JSON.parse(messageStr);
          if (message.type === 'wordTap' || message.type === 'wordLongPress') {
            const wordData: ForeignWordData = {
              originalWord: message.originalWord || '',
              foreignWord: message.foreignWord || '',
              startIndex: 0,
              endIndex: 0,
              wordEntry: {
                id: message.wordId || '',
                sourceWord: message.originalWord || '',
                targetWord: message.foreignWord || '',
                sourceLanguage: book.languagePair.sourceLanguage,
                targetLanguage: book.languagePair.targetLanguage,
                proficiencyLevel: 'beginner',
                frequencyRank: 0,
                partOfSpeech: (message.partOfSpeech as any) || 'other',
                variants: [],
                pronunciation: message.pronunciation || undefined,
              },
            };
            onWordClick(wordData);
          } else if (message.type === 'wordHoverEnd') {
            onWordHoverEnd();
          } else if (message.type === 'progress' && onProgressChange) {
            onProgressChange(message.progress || 0);
          }
        } catch (error) {
          console.warn('Failed to parse message:', error);
        }
      },
    };

    // Setup hover handlers for desktop
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('foreign-word')) {
        hoveredElementRef.current = target;

        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }

        // Show popup after delay
        hoverTimeoutRef.current = setTimeout(() => {
          if (hoveredElementRef.current === target) {
            const wordData: ForeignWordData = {
              originalWord: target.dataset.original || '',
              foreignWord: target.textContent || '',
              startIndex: 0,
              endIndex: 0,
              wordEntry: {
                id: target.dataset.wordId || '',
                sourceWord: target.dataset.original || '',
                targetWord: target.textContent || '',
                sourceLanguage: book.languagePair.sourceLanguage,
                targetLanguage: book.languagePair.targetLanguage,
                proficiencyLevel: 'beginner',
                frequencyRank: 0,
                partOfSpeech: 'other',
                variants: [],
                pronunciation: target.dataset.pronunciation || undefined,
              },
              ...(target.dataset.alternatives && {
                alternatives: target.dataset.alternatives
                  .split('|')
                  .map(s => s.trim())
                  .filter(Boolean),
              }),
            };
            onWordHover(wordData);
          }
        }, 300);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('foreign-word')) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        hoveredElementRef.current = null;
        onWordHoverEnd();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('foreign-word')) {
        e.preventDefault();
        e.stopPropagation();

        const wordData: ForeignWordData = {
          originalWord: target.dataset.original || '',
          foreignWord: target.textContent || '',
          startIndex: 0,
          endIndex: 0,
          wordEntry: {
            id: target.dataset.wordId || '',
            sourceWord: target.dataset.original || '',
            targetWord: target.textContent || '',
            sourceLanguage: book.languagePair.sourceLanguage,
            targetLanguage: book.languagePair.targetLanguage,
            proficiencyLevel: 'beginner',
            frequencyRank: 0,
            partOfSpeech: 'other',
            variants: [],
            pronunciation: target.dataset.pronunciation || undefined,
          },
          ...(target.dataset.alternatives && {
            alternatives: target.dataset.alternatives
              .split('|')
              .map(s => s.trim())
              .filter(Boolean),
          }),
        };
        onWordClick(wordData);
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);
    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      container.removeEventListener('click', handleClick, true);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      delete (window as any).ReactNativeWebView;
    };
  }, [book, onWordClick, onWordHover, onWordHoverEnd, onProgressChange]);

  // Inject scripts and styles into the HTML
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.warn('ReaderContent: container ref is null');
      return;
    }

    if (!html || html.trim().length === 0) {
      console.warn('ReaderContent: HTML is empty');
      container.innerHTML =
        '<div style="padding: 2em; text-align: center;"><p>No content available</p></div>';
      return;
    }

    console.log('ReaderContent: Setting HTML, length:', html.length);

    // Extract body content from full HTML document
    const bodyContent = extractBodyContent(html);
    console.log('ReaderContent: Body content length:', bodyContent.length);

    // If the HTML is a full document, we should render it in an iframe or extract body
    // For now, let's check if it's a full document
    if (html.includes('<!DOCTYPE') || html.includes('<html')) {
      // It's a full document - extract body or render in iframe
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        container.innerHTML = bodyMatch[1];
      } else {
        // Fallback: try to extract content between body tags or just use the HTML
        container.innerHTML = bodyContent;
      }
    } else {
      // It's just body content
      container.innerHTML = bodyContent;
    }

    // Inject foreign word styles if not already present
    if (!document.getElementById('xenolexia-foreign-word-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'xenolexia-foreign-word-styles';
      styleElement.textContent = generateForeignWordStyles();
      document.head.appendChild(styleElement);
    }

    // Inject interaction script
    const scriptElement = document.createElement('script');
    const injectedScript = generateInjectedScript();
    scriptElement.textContent = injectedScript;
    container.appendChild(scriptElement);

    // Execute the script by creating a new script element
    const newScript = document.createElement('script');
    newScript.textContent = scriptElement.textContent;
    scriptElement.parentNode?.replaceChild(newScript, scriptElement);

    console.log('ReaderContent: HTML rendered successfully');
  }, [html, extractBodyContent]);

  // Search highlight: apply/clear highlights and scroll to current match
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const SEARCH_CLASS = 'reader-search-hit';

    const clearHighlights = () => {
      container.querySelectorAll(`.${SEARCH_CLASS}`).forEach(el => {
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      });
    };

    if (!searchQuery || !searchQuery.trim()) {
      clearHighlights();
      onSearchMatchesCount?.(0);
      return;
    }

    clearHighlights();
    const q = searchQuery.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    let count = 0;
    const matches: Element[] = [];

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode()) !== null) {
      const text = (n as Text).textContent;
      if (text && regex.test(text)) textNodes.push(n as Text);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      regex.lastIndex = 0;
      let lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
        const mark = document.createElement('mark');
        mark.className = SEARCH_CLASS;
        mark.appendChild(document.createTextNode(m[0]));
        fragment.appendChild(mark);
        matches.push(mark);
        count++;
        lastIndex = m.index + m[0].length;
      }
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      textNode.parentNode?.replaceChild(fragment, textNode);
    });

    onSearchMatchesCount?.(count);
    const idx = count > 0 ? Math.min(searchMatchIndex, count - 1) : 0;
    const target = matches[idx];
    if (target) target.scrollIntoView({behavior: 'smooth', block: 'center'});
  }, [html, searchQuery, searchMatchIndex, onSearchMatchesCount]);

  return <div ref={containerRef} className="reader-html-content" />;
}
