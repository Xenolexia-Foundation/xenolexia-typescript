/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Statistics Screen - Desktop version with gamification
 */

import React, {useMemo, useState, useCallback} from 'react';

import {useStatisticsStore} from '@xenolexia/shared/stores/statisticsStore';
import {useUserStore} from '@xenolexia/shared/stores/userStore';
import {
  getLevelFromXp,
  getLevelProgress,
  getXpToNextLevel,
  getAllAchievementsWithProgress,
} from 'xenolexia-typescript';

import {Card} from '../components/ui';
import {useBack} from '../hooks/useBack';
import './StatisticsScreen.css';

export function StatisticsScreen(): React.JSX.Element {
  const goBack = useBack();
  const {stats, dailyReadingTime, isLoading, refreshStats, loadStats} = useStatisticsStore();
  const {preferences} = useUserStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load stats on mount
  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshStats();
    setIsRefreshing(false);
  }, [refreshStats]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Daily goal: 30 min reading. Use today's minutes from dailyReadingTime.
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayMinutes = useMemo(
    () => dailyReadingTime.find(d => d.date === todayStr)?.minutes ?? 0,
    [dailyReadingTime, todayStr]
  );
  // Daily goal from user preferences (minutes)
  const dailyGoalMinutes = preferences?.dailyGoal ?? 30;
  const dailyProgress = useMemo(
    () =>
      Math.min(100, dailyGoalMinutes > 0 ? Math.round((todayMinutes / dailyGoalMinutes) * 100) : 0),
    [todayMinutes, dailyGoalMinutes]
  );

  const totalXp = stats.totalXp ?? 0;
  const level = useMemo(() => getLevelFromXp(totalXp), [totalXp]);
  const levelProgress = useMemo(() => getLevelProgress(totalXp), [totalXp]);
  const xpToNext = useMemo(() => getXpToNextLevel(totalXp), [totalXp]);
  const achievements = useMemo(() => getAllAchievementsWithProgress(stats), [stats]);

  if (isLoading) {
    return (
      <div className="statistics-screen">
        <div className="statistics-header">
          <button onClick={goBack} className="statistics-back-button">
            ← Back
          </button>
          <div>
            <h1>Statistics</h1>
            <p className="statistics-subtitle">Track your learning journey</p>
          </div>
          <div style={{width: '80px'}} />
        </div>
        <div className="statistics-loading">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="statistics-screen">
      <div className="statistics-header">
        <button onClick={goBack} className="statistics-back-button">
          ← Back
        </button>
        <div>
          <h1>Statistics</h1>
          <p className="statistics-subtitle">Track your learning journey</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="statistics-refresh-button"
          title="Refresh"
        >
          {isRefreshing ? '⟳' : '↻'}
        </button>
      </div>

      <div className="statistics-content">
        {/* Streak Card */}
        <Card variant="filled" padding="lg" className="statistics-streak-card">
          <div className="statistics-streak-inner">
            <div className="statistics-streak-emoji">🔥</div>
            <div className="statistics-streak-number">{stats.currentStreak}</div>
            <div className="statistics-streak-label">Day Streak</div>
            <div className="statistics-streak-best">Best: {stats.longestStreak} days</div>
          </div>
        </Card>

        {/* Level & XP */}
        <Card variant="outlined" padding="lg" className="statistics-level-card">
          <div className="statistics-level-row">
            <span className="statistics-level-title">Level {level}</span>
            <span className="statistics-level-xp">{totalXp} XP</span>
          </div>
          <div className="statistics-progress-bar">
            <div className="statistics-progress-fill" style={{width: `${levelProgress}%`}} />
          </div>
          <p className="statistics-xp-to-next">{xpToNext} XP to next level</p>
        </Card>

        {/* Daily Progress */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Today&apos;s Progress</h2>

          <Card variant="outlined" padding="md" className="statistics-progress-card">
            <div className="statistics-progress-header">
              <span className="statistics-progress-label">
                Daily goal ({dailyGoalMinutes} min reading)
              </span>
              <span className="statistics-progress-percentage">{dailyProgress}%</span>
            </div>
            <div className="statistics-progress-bar">
              <div className="statistics-progress-fill" style={{width: `${dailyProgress}%`}} />
            </div>
            <p className="statistics-progress-caption">{todayMinutes} min today</p>
          </Card>

          <div className="statistics-stats-grid">
            <StatCard icon="📖" value={stats.wordsRevealedToday.toString()} label="Words Seen" />
            <StatCard icon="💾" value={stats.wordsSavedToday.toString()} label="Words Saved" />
          </div>
        </div>

        {/* Reading over time (last 7 days) - real data */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Reading over time</h2>
          <Card variant="outlined" padding="md" className="statistics-chart-card">
            <div className="statistics-chart-bars">
              {dailyReadingTime.length > 0
                ? dailyReadingTime.map(d => {
                    const maxMin = Math.max(...dailyReadingTime.map(x => x.minutes), 1);
                    const heightPct = maxMin > 0 ? (d.minutes / maxMin) * 100 : 0;
                    const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                    });
                    return (
                      <div key={d.date} className="statistics-chart-bar-wrap">
                        <div
                          className="statistics-chart-bar"
                          style={{height: `${heightPct}%`}}
                          title={`${dayLabel}: ${d.minutes} min`}
                        />
                        <span className="statistics-chart-label">{dayLabel}</span>
                      </div>
                    );
                  })
                : [6, 5, 4, 3, 2, 1, 0].map(dayOffset => {
                    const d = new Date();
                    d.setDate(d.getDate() - dayOffset);
                    const dayLabel = d.toLocaleDateString('en-US', {weekday: 'short'});
                    return (
                      <div key={dayOffset} className="statistics-chart-bar-wrap">
                        <div
                          className="statistics-chart-bar"
                          style={{height: '4px'}}
                          title={`${dayLabel}: 0 min`}
                        />
                        <span className="statistics-chart-label">{dayLabel}</span>
                      </div>
                    );
                  })}
            </div>
            <p className="statistics-chart-caption">Reading time (minutes) per day</p>
          </Card>
        </div>

        {/* All-time Stats */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">All Time</h2>
          <div className="statistics-stats-grid">
            <StatCard icon="📚" value={stats.totalBooksRead.toString()} label="Books Read" />
            <StatCard icon="⏱️" value={formatTime(stats.totalReadingTime)} label="Reading Time" />
            <StatCard icon="🧠" value={stats.totalWordsLearned.toString()} label="Words Learned" />
            <StatCard
              icon="📊"
              value={formatTime(stats.averageSessionDuration)}
              label="Avg. Session"
            />
          </div>
        </div>

        {/* Learning Insights - from real data */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Insights</h2>
          <Card variant="outlined" padding="md">
            <div className="statistics-insight-row">
              <span>Most active day</span>
              <span className="statistics-insight-value">
                {dailyReadingTime.length > 0
                  ? (() => {
                      const best = dailyReadingTime.reduce((a, b) =>
                        a.minutes >= b.minutes ? a : b
                      );
                      return best.minutes > 0
                        ? new Date(best.date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                          })
                        : '—';
                    })()
                  : '—'}
              </span>
            </div>
            <div className="statistics-insight-divider" />
            <div className="statistics-insight-row">
              <span>Words revealed today</span>
              <span className="statistics-insight-value">{stats.wordsRevealedToday}</span>
            </div>
            <div className="statistics-insight-divider" />
            <div className="statistics-insight-row">
              <span>Words saved today</span>
              <span className="statistics-insight-value statistics-insight-success">
                +{stats.wordsSavedToday}
              </span>
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Achievements</h2>
          <div className="statistics-achievement-grid">
            {achievements.map(({definition, progress, unlocked}) => (
              <Card
                key={definition.id}
                variant="outlined"
                padding="md"
                className={`statistics-achievement-card ${unlocked ? 'statistics-achievement-unlocked' : ''}`}
                title={definition.description}
              >
                <div className="statistics-achievement-icon">{definition.icon}</div>
                <div className="statistics-achievement-name">{definition.name}</div>
                <div className="statistics-achievement-desc">{definition.description}</div>
                <div className="statistics-progress-bar statistics-achievement-progress">
                  <div className="statistics-progress-fill" style={{width: `${progress}%`}} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
}

function StatCard({icon, value, label}: StatCardProps): React.JSX.Element {
  return (
    <Card variant="outlined" padding="md" className="statistics-stat-card">
      <div className="statistics-stat-icon">{icon}</div>
      <div className="statistics-stat-value">{value}</div>
      <div className="statistics-stat-label">{label}</div>
    </Card>
  );
}
