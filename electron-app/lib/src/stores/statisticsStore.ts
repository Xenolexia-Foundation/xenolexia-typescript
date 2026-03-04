/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Statistics Store - Manages reading and learning statistics
 */

import {XP_PER_MINUTE_READING, XP_PER_WORD_SAVED} from 'xenolexia-typescript';
import {create} from 'zustand';

import {getCore} from '../electronCore';

import type {ReadingStats, ReadingSession} from 'xenolexia-typescript';

const defaultStats: ReadingStats = {
  totalBooksRead: 0,
  totalReadingTime: 0,
  totalWordsLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageSessionDuration: 0,
  wordsRevealedToday: 0,
  wordsSavedToday: 0,
  totalXp: 0,
};

interface ReviewSessionData {
  cardsReviewed: number;
  correctCount: number;
  timeSpentSeconds: number;
}

interface StatisticsState {
  stats: ReadingStats;
  currentSession: ReadingSession | null;
  sessions: ReadingSession[];
  /** Last 7 days reading time in minutes (for charts) */
  dailyReadingTime: Array<{date: string; minutes: number}>;
  isLoading: boolean;

  // Review stats
  reviewStats: {
    totalReviews: number;
    totalCorrect: number;
    totalTimeSpent: number;
    reviewsToday: number;
  };

  // Actions
  startSession: (bookId: string) => void;
  endSession: () => void;
  recordWordRevealed: () => void;
  recordWordSaved: () => void;
  recordReviewSession: (data: ReviewSessionData) => void;
  updateStats: (updates: Partial<ReadingStats>) => void;
  loadStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
  resetDailyStats: () => void;
}

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  stats: defaultStats,
  currentSession: null,
  sessions: [],
  dailyReadingTime: [],
  isLoading: false,
  reviewStats: {
    totalReviews: 0,
    totalCorrect: 0,
    totalTimeSpent: 0,
    reviewsToday: 0,
  },

  startSession: async (bookId: string) => {
    try {
      const sessionId = await getCore().storageService.startSession(bookId);
      const session: ReadingSession = {
        id: sessionId,
        bookId,
        startedAt: new Date(),
        endedAt: null,
        pagesRead: 0,
        wordsRevealed: 0,
        wordsSaved: 0,
        duration: 0,
      };
      set({currentSession: session});
    } catch (error) {
      console.error('Failed to start session:', error);
      // Fallback to local session
      const session: ReadingSession = {
        id: Date.now().toString(),
        bookId,
        startedAt: new Date(),
        endedAt: null,
        pagesRead: 0,
        wordsRevealed: 0,
        wordsSaved: 0,
        duration: 0,
      };
      set({currentSession: session});
    }
  },

  endSession: async () => {
    const {currentSession, stats, sessions} = get();
    if (!currentSession) return;

    const endedAt = new Date();
    const duration = Math.floor((endedAt.getTime() - currentSession.startedAt.getTime()) / 1000);

    const completedSession: ReadingSession = {
      ...currentSession,
      endedAt,
      duration,
    };

    // Persist to database first
    try {
      await getCore().storageService.endSession(completedSession.id, {
        pagesRead: completedSession.pagesRead,
        wordsRevealed: completedSession.wordsRevealed,
        wordsSaved: completedSession.wordsSaved,
      });
    } catch (error) {
      console.error('Failed to persist session:', error);
    }

    // Update local stats and XP
    const newTotalTime = stats.totalReadingTime + duration;
    const newSessionCount = sessions.length + 1;
    const newAverageSession = Math.floor(newTotalTime / newSessionCount);
    const xpFromSession = Math.floor(duration / 60) * XP_PER_MINUTE_READING;
    const totalXp = (stats.totalXp ?? 0) + xpFromSession;

    set({
      currentSession: null,
      sessions: [...sessions, completedSession],
      stats: {
        ...stats,
        totalReadingTime: newTotalTime,
        averageSessionDuration: newAverageSession,
        totalXp,
      },
    });
  },

  recordWordRevealed: () => {
    set(state => ({
      stats: {
        ...state.stats,
        wordsRevealedToday: state.stats.wordsRevealedToday + 1,
      },
      currentSession: state.currentSession
        ? {...state.currentSession, wordsRevealed: state.currentSession.wordsRevealed + 1}
        : null,
    }));
  },

  recordWordSaved: () => {
    set(state => {
      const totalXp = (state.stats.totalXp ?? 0) + XP_PER_WORD_SAVED;
      return {
        stats: {
          ...state.stats,
          wordsSavedToday: state.stats.wordsSavedToday + 1,
          totalWordsLearned: state.stats.totalWordsLearned + 1,
          totalXp,
        },
        currentSession: state.currentSession
          ? {...state.currentSession, wordsSaved: state.currentSession.wordsSaved + 1}
          : null,
      };
    });
  },

  recordReviewSession: (data: ReviewSessionData) => {
    set(state => ({
      reviewStats: {
        totalReviews: state.reviewStats.totalReviews + data.cardsReviewed,
        totalCorrect: state.reviewStats.totalCorrect + data.correctCount,
        totalTimeSpent: state.reviewStats.totalTimeSpent + data.timeSpentSeconds,
        reviewsToday: state.reviewStats.reviewsToday + data.cardsReviewed,
      },
    }));
    // Review stats are stored in memory for now
    // Could be persisted to preferences if needed
  },

  updateStats: (updates: Partial<ReadingStats>) => {
    set(state => ({
      stats: {...state.stats, ...updates},
    }));
  },

  loadStats: async () => {
    set({isLoading: true});
    try {
      const [stats, recentSessions, dailyReadingTime] = await Promise.all([
        getCore().storageService.getReadingStats(),
        getCore().storageService.getSessionRepository().getRecent(50),
        getCore().storageService.getDailyReadingTime(7),
      ]);
      const state = get();
      const currentStats = state.stats;
      // Merge in-memory session counts so stats are correct even before endSession persists
      const session = state.currentSession;
      const wordsRevealedToday = session
        ? stats.wordsRevealedToday + session.wordsRevealed
        : stats.wordsRevealedToday;
      const wordsSavedToday = session
        ? stats.wordsSavedToday + session.wordsSaved
        : stats.wordsSavedToday;
      const totalXp = stats.totalXp ?? currentStats.totalXp ?? 0;
      const mergedTotalXp =
        session && (currentStats.totalXp ?? 0) > totalXp ? currentStats.totalXp ?? 0 : totalXp;
      set({
        stats: {
          ...stats,
          totalXp: mergedTotalXp,
          wordsRevealedToday,
          wordsSavedToday,
        },
        sessions: recentSessions,
        dailyReadingTime: dailyReadingTime ?? [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      set({isLoading: false});
    }
  },

  refreshStats: async () => {
    // Alias for loadStats - used for pull-to-refresh
    await get().loadStats();
  },

  resetDailyStats: () => {
    set(state => ({
      stats: {
        ...state.stats,
        wordsRevealedToday: 0,
        wordsSavedToday: 0,
      },
    }));
  },
}));
