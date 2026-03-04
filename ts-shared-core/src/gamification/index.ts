/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Gamification: XP, levels, and achievements for language learning.
 */

import type {AchievementDefinition, ReadingStats} from '../types';

// ============================================================================
// XP & Levels
// ============================================================================

/** XP required to reach level N (cumulative). Level 1 = 0 XP, level 2 = 100, etc. */
const XP_PER_LEVEL = 100;

export function getLevelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

/** XP required at the start of level N (cumulative). */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * XP_PER_LEVEL;
}

/** XP needed from current total to reach next level. */
export function getXpToNextLevel(totalXp: number): number {
  const level = getLevelFromXp(totalXp);
  const xpAtNext = getXpForLevel(level + 1);
  return xpAtNext - totalXp;
}

/** Progress 0-100 within current level. */
export function getLevelProgress(totalXp: number): number {
  const level = getLevelFromXp(totalXp);
  const xpInLevel = totalXp - getXpForLevel(level);
  const xpNeededForLevel = getXpForLevel(level + 1) - getXpForLevel(level);
  return Math.min(100, Math.round((xpInLevel / xpNeededForLevel) * 100));
}

// ============================================================================
// XP rewards (used when recording actions)
// ============================================================================

export const XP_PER_MINUTE_READING = 2;
export const XP_PER_WORD_SAVED = 5;
export const XP_DAILY_STREAK_BONUS = 10; // per day of streak when day is completed

// ============================================================================
// Achievements
// ============================================================================

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_book',
    name: 'First Steps',
    description: 'Complete your first book',
    icon: '📖',
    xpReward: 50,
    type: 'books_read',
    threshold: 1,
  },
  {
    id: 'bookworm_5',
    name: 'Bookworm',
    description: 'Complete 5 books',
    icon: '📚',
    xpReward: 100,
    type: 'books_read',
    threshold: 5,
  },
  {
    id: 'bibliophile_10',
    name: 'Bibliophile',
    description: 'Complete 10 books',
    icon: '🏆',
    xpReward: 200,
    type: 'books_read',
    threshold: 10,
  },
  {
    id: 'words_10',
    name: 'Word Collector',
    description: 'Save 10 words to vocabulary',
    icon: '📝',
    xpReward: 25,
    type: 'words_learned',
    threshold: 10,
  },
  {
    id: 'words_50',
    name: 'Vocabulary Builder',
    description: 'Save 50 words',
    icon: '🧠',
    xpReward: 75,
    type: 'words_learned',
    threshold: 50,
  },
  {
    id: 'words_100',
    name: 'Lexicon',
    description: 'Save 100 words',
    icon: '📕',
    xpReward: 150,
    type: 'words_learned',
    threshold: 100,
  },
  {
    id: 'reading_60',
    name: 'Hour of Reading',
    description: 'Read for 60 minutes total',
    icon: '⏱️',
    xpReward: 50,
    type: 'reading_time',
    threshold: 3600,
  },
  {
    id: 'reading_600',
    name: 'Dedicated Reader',
    description: 'Read for 10 hours total',
    icon: '🌟',
    xpReward: 200,
    type: 'reading_time',
    threshold: 36000,
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: '3-day reading streak',
    icon: '🔥',
    xpReward: 30,
    type: 'streak',
    threshold: 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day reading streak',
    icon: '💪',
    xpReward: 70,
    type: 'streak',
    threshold: 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day reading streak',
    icon: '👑',
    xpReward: 300,
    type: 'streak',
    threshold: 30,
  },
  {
    id: 'longest_5',
    name: 'Consistency',
    description: 'Longest streak of 5 days',
    icon: '📅',
    xpReward: 50,
    type: 'streak_longest',
    threshold: 5,
  },
  {
    id: 'longest_14',
    name: 'Two Weeks Strong',
    description: 'Longest streak of 14 days',
    icon: '🎯',
    xpReward: 150,
    type: 'streak_longest',
    threshold: 14,
  },
  {
    id: 'words_today_10',
    name: 'Daily Learner',
    description: 'Reveal 10 words in one day',
    icon: '☀️',
    xpReward: 20,
    type: 'words_today',
    threshold: 10,
  },
  {
    id: 'words_today_50',
    name: 'Power Reader',
    description: 'Reveal 50 words in one day',
    icon: '⚡',
    xpReward: 50,
    type: 'words_today',
    threshold: 50,
  },
];

function getProgressValue(
  stats: ReadingStats,
  type: AchievementDefinition['type'],
  threshold: number
): number {
  switch (type) {
    case 'books_read':
      return Math.min(100, Math.round((stats.totalBooksRead / threshold) * 100));
    case 'words_learned':
      return Math.min(100, Math.round((stats.totalWordsLearned / threshold) * 100));
    case 'reading_time':
      return Math.min(100, Math.round((stats.totalReadingTime / threshold) * 100));
    case 'streak':
      return Math.min(100, Math.round((stats.currentStreak / threshold) * 100));
    case 'streak_longest':
      return Math.min(100, Math.round((stats.longestStreak / threshold) * 100));
    case 'words_today':
      return Math.min(
        100,
        Math.round(((stats.wordsRevealedToday + stats.wordsSavedToday) / threshold) * 100)
      );
    case 'session_streak':
      return stats.currentStreak >= threshold
        ? 100
        : Math.min(100, Math.round((stats.currentStreak / threshold) * 100));
    default:
      return 0;
  }
}

function isUnlocked(
  stats: ReadingStats,
  type: AchievementDefinition['type'],
  threshold: number
): boolean {
  switch (type) {
    case 'books_read':
      return stats.totalBooksRead >= threshold;
    case 'words_learned':
      return stats.totalWordsLearned >= threshold;
    case 'reading_time':
      return stats.totalReadingTime >= threshold;
    case 'streak':
    case 'session_streak':
      return stats.currentStreak >= threshold;
    case 'streak_longest':
      return stats.longestStreak >= threshold;
    case 'words_today':
      return stats.wordsRevealedToday + stats.wordsSavedToday >= threshold;
    default:
      return false;
  }
}

export interface AchievementWithProgress {
  definition: AchievementDefinition;
  progress: number;
  unlocked: boolean;
}

export function getAchievementProgress(
  definition: AchievementDefinition,
  stats: ReadingStats
): AchievementWithProgress {
  const progress = getProgressValue(stats, definition.type, definition.threshold);
  const unlocked = isUnlocked(stats, definition.type, definition.threshold);
  return {definition, progress, unlocked};
}

export function getAllAchievementsWithProgress(stats: ReadingStats): AchievementWithProgress[] {
  return ACHIEVEMENT_DEFINITIONS.map(def => getAchievementProgress(def, stats));
}
