/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Unit tests for gamification: XP, levels, and achievements.
 */

import {
  getLevelFromXp,
  getXpForLevel,
  getXpToNextLevel,
  getLevelProgress,
  getAchievementProgress,
  getAllAchievementsWithProgress,
  ACHIEVEMENT_DEFINITIONS,
} from '../gamification';
import type {ReadingStats} from '../types';

describe('gamification', () => {
  describe('getLevelFromXp', () => {
    it('returns 1 for zero or negative XP', () => {
      expect(getLevelFromXp(0)).toBe(1);
      expect(getLevelFromXp(-100)).toBe(1);
    });

    it('returns level 2 at 100 XP', () => {
      expect(getLevelFromXp(100)).toBe(2);
    });

    it('returns level 3 at 200 XP', () => {
      expect(getLevelFromXp(200)).toBe(3);
    });

    it('returns correct level for arbitrary XP', () => {
      expect(getLevelFromXp(99)).toBe(1);
      expect(getLevelFromXp(100)).toBe(2);
      expect(getLevelFromXp(199)).toBe(2);
      expect(getLevelFromXp(500)).toBe(6);
    });
  });

  describe('getXpForLevel', () => {
    it('returns 0 for level 1', () => {
      expect(getXpForLevel(1)).toBe(0);
    });

    it('returns 100 for level 2', () => {
      expect(getXpForLevel(2)).toBe(100);
    });

    it('returns (level-1) * XP_PER_LEVEL', () => {
      expect(getXpForLevel(3)).toBe(200);
      expect(getXpForLevel(10)).toBe(900);
    });

    it('returns 0 for level <= 1', () => {
      expect(getXpForLevel(0)).toBe(0);
    });
  });

  describe('getXpToNextLevel', () => {
    it('returns 100 when at 0 XP', () => {
      expect(getXpToNextLevel(0)).toBe(100);
    });

    it('returns 1 when at 99 XP', () => {
      expect(getXpToNextLevel(99)).toBe(1);
    });

    it('returns 100 when at 100 XP (start of level 2)', () => {
      expect(getXpToNextLevel(100)).toBe(100);
    });

    it('returns correct XP to next level for mid-level', () => {
      expect(getXpToNextLevel(250)).toBe(50); // level 3, need 300 for level 4
    });
  });

  describe('getLevelProgress', () => {
    it('returns 0 at start of level 1', () => {
      expect(getLevelProgress(0)).toBe(0);
    });

    it('returns 50 at 50 XP (halfway to level 2)', () => {
      expect(getLevelProgress(50)).toBe(50);
    });

    it('returns 99 or 100 near level boundary', () => {
      const p = getLevelProgress(99);
      expect(p).toBeGreaterThanOrEqual(99);
      expect(p).toBeLessThanOrEqual(100);
    });

    it('caps at 100', () => {
      expect(getLevelProgress(100)).toBeLessThanOrEqual(100);
    });
  });

  describe('getAchievementProgress', () => {
    const emptyStats: ReadingStats = {
      totalBooksRead: 0,
      totalReadingTime: 0,
      totalWordsLearned: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageSessionDuration: 0,
      wordsRevealedToday: 0,
      wordsSavedToday: 0,
    };

    it('returns unlocked false and progress 0 for empty stats', () => {
      const firstBook = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'first_book')!;
      const result = getAchievementProgress(firstBook, emptyStats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(0);
      expect(result.definition).toBe(firstBook);
    });

    it('unlocks first_book when totalBooksRead >= 1', () => {
      const firstBook = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'first_book')!;
      const stats: ReadingStats = {...emptyStats, totalBooksRead: 1};
      const result = getAchievementProgress(firstBook, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('returns progress 50 when halfway to threshold (words_learned)', () => {
      const words10 = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'words_10')!;
      const stats: ReadingStats = {...emptyStats, totalWordsLearned: 5};
      const result = getAchievementProgress(words10, stats);
      expect(result.unlocked).toBe(false);
      expect(result.progress).toBe(50);
    });

    it('unlocks streak achievement when currentStreak >= threshold', () => {
      const streak3 = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'streak_3')!;
      const stats: ReadingStats = {...emptyStats, currentStreak: 3};
      const result = getAchievementProgress(streak3, stats);
      expect(result.unlocked).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('unlocks reading_time when totalReadingTime >= threshold', () => {
      const reading60 = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'reading_60')!;
      const stats: ReadingStats = {...emptyStats, totalReadingTime: 3600};
      const result = getAchievementProgress(reading60, stats);
      expect(result.unlocked).toBe(true);
    });

    it('unlocks words_today when wordsRevealedToday + wordsSavedToday >= threshold', () => {
      const wordsToday10 = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'words_today_10')!;
      const stats: ReadingStats = {...emptyStats, wordsRevealedToday: 6, wordsSavedToday: 4};
      const result = getAchievementProgress(wordsToday10, stats);
      expect(result.unlocked).toBe(true);
    });
  });

  describe('getAllAchievementsWithProgress', () => {
    it('returns one entry per achievement definition', () => {
      const stats: ReadingStats = {
        totalBooksRead: 0,
        totalReadingTime: 0,
        totalWordsLearned: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionDuration: 0,
        wordsRevealedToday: 0,
        wordsSavedToday: 0,
      };
      const results = getAllAchievementsWithProgress(stats);
      expect(results).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
      results.forEach((r, i) => {
        expect(r.definition).toBe(ACHIEVEMENT_DEFINITIONS[i]);
        expect(typeof r.progress).toBe('number');
        expect(r.progress).toBeGreaterThanOrEqual(0);
        expect(r.progress).toBeLessThanOrEqual(100);
        expect(typeof r.unlocked).toBe('boolean');
      });
    });
  });
});
