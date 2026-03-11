/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Unit tests for electron-app/lib utils.
 */

import {
  formatDuration,
  formatReadingTime,
  calculateProgress,
  truncateText,
  stripHtml,
  titleCase,
  formatFileSize,
  getFileExtension,
  getFileName,
  arraysEqual,
  deepClone,
} from '../utils';

describe('utils', () => {
  describe('formatDuration', () => {
    it('formats seconds only when < 60', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(45)).toBe('45s');
    });

    it('formats minutes and seconds when < 1 hour', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('formats hours and minutes when >= 1 hour', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3661)).toBe('1h 1m');
    });
  });

  describe('formatReadingTime', () => {
    it('returns minutes for short content', () => {
      expect(formatReadingTime(200)).toBe('1 min read');
      expect(formatReadingTime(400)).toBe('2 min read');
    });

    it('returns hours and minutes for long content', () => {
      expect(formatReadingTime(12000)).toBe('1h 0m read'); // 60 min
      expect(formatReadingTime(15000)).toBe('1h 15m read');
    });

    it('uses custom wordsPerMinute', () => {
      expect(formatReadingTime(100, 100)).toBe('1 min read');
    });
  });

  describe('calculateProgress', () => {
    it('returns 0 when total is 0', () => {
      expect(calculateProgress(50, 0)).toBe(0);
    });

    it('returns 0 for 0 position', () => {
      expect(calculateProgress(0, 100)).toBe(0);
    });

    it('returns 100 when current equals total', () => {
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it('rounds percentage', () => {
      expect(calculateProgress(1, 3)).toBe(33);
    });
  });

  describe('truncateText', () => {
    it('returns text unchanged when within maxLength', () => {
      expect(truncateText('hello', 10)).toBe('hello');
      expect(truncateText('hello', 5)).toBe('hello');
    });

    it('truncates with ellipsis when over maxLength', () => {
      expect(truncateText('hello world', 8)).toBe('hello...');
    });
  });

  describe('stripHtml', () => {
    it('removes simple tags', () => {
      expect(stripHtml('<p>hello</p>')).toBe('hello');
    });

    it('removes multiple tags', () => {
      expect(stripHtml('<div><span>text</span></div>')).toBe('text');
    });

    it('leaves plain text unchanged', () => {
      expect(stripHtml('no tags')).toBe('no tags');
    });
  });

  describe('titleCase', () => {
    it('capitalizes first letter of each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });

    it('handles single word', () => {
      expect(titleCase('hello')).toBe('Hello');
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 as 0 Bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('formats KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('formats MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });
  });

  describe('getFileExtension', () => {
    it('returns extension in lowercase', () => {
      expect(getFileExtension('book.EPUB')).toBe('epub');
    });

    it('returns last segment after dot', () => {
      expect(getFileExtension('path/to/file.txt')).toBe('txt');
    });
  });

  describe('getFileName', () => {
    it('returns filename from path', () => {
      expect(getFileName('path/to/book.epub')).toBe('book.epub');
    });

    it('returns path as-is when no slash', () => {
      expect(getFileName('book.epub')).toBe('book.epub');
    });
  });

  describe('arraysEqual', () => {
    it('returns true for equal arrays', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for different length', () => {
      expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false for same length different values', () => {
      expect(arraysEqual([1, 2], [1, 3])).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('clones object', () => {
      const obj = {a: 1, b: {c: 2}};
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });
  });
});
