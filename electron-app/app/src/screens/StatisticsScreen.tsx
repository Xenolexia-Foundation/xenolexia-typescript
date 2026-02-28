/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Statistics Screen - Desktop version
 */

import React, {useMemo, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useStatisticsStore} from '@xenolexia/shared/stores/statisticsStore';
import {Card} from '../components/ui';
import './StatisticsScreen.css';

export function StatisticsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const {stats, isLoading, refreshStats, loadStats} = useStatisticsStore();
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

  // Calculate progress percentage for daily goal
  const dailyProgress = useMemo(() => {
    const goalMinutes = 30; // Default goal: 30 minutes
    const todayMinutes = Math.floor(stats.wordsRevealedToday / 10); // Rough estimate
    return Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));
  }, [stats.wordsRevealedToday]);

  if (isLoading) {
    return (
      <div className="statistics-screen">
        <div className="statistics-header">
          <button onClick={() => navigate(-1)} className="statistics-back-button">
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
        <button onClick={() => navigate(-1)} className="statistics-back-button">
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

        {/* Daily Progress */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Today's Progress</h2>

          <Card variant="outlined" padding="md" className="statistics-progress-card">
            <div className="statistics-progress-header">
              <span className="statistics-progress-label">Daily Goal</span>
              <span className="statistics-progress-percentage">{dailyProgress}%</span>
            </div>
            <div className="statistics-progress-bar">
              <div
                className="statistics-progress-fill"
                style={{width: `${dailyProgress}%`}}
              />
            </div>
          </Card>

          <div className="statistics-stats-grid">
            <StatCard
              icon="📖"
              value={stats.wordsRevealedToday.toString()}
              label="Words Seen"
            />
            <StatCard
              icon="💾"
              value={stats.wordsSavedToday.toString()}
              label="Words Saved"
            />
          </div>
        </div>

        {/* Reading over time (last 7 days) */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Reading over time</h2>
          <Card variant="outlined" padding="md" className="statistics-chart-card">
            <div className="statistics-chart-bars">
              {[6, 5, 4, 3, 2, 1, 0].map(dayOffset => {
                const d = new Date();
                d.setDate(d.getDate() - dayOffset);
                const isToday = dayOffset === 0;
                const value = isToday ? stats.wordsRevealedToday : 0;
                const maxVal = Math.max(stats.wordsRevealedToday, 1);
                const heightPct = maxVal > 0 ? (value / maxVal) * 100 : 0;
                const dayLabel = d.toLocaleDateString('en-US', {weekday: 'short'});
                return (
                  <div key={dayOffset} className="statistics-chart-bar-wrap">
                    <div
                      className="statistics-chart-bar"
                      style={{height: `${heightPct}%`}}
                      title={`${dayLabel}: ${value} words`}
                    />
                    <span className="statistics-chart-label">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
            <p className="statistics-chart-caption">Words revealed per day (today has real data)</p>
          </Card>
        </div>

        {/* All-time Stats */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">All Time</h2>
          <div className="statistics-stats-grid">
            <StatCard
              icon="📚"
              value={stats.totalBooksRead.toString()}
              label="Books Read"
            />
            <StatCard
              icon="⏱️"
              value={formatTime(stats.totalReadingTime)}
              label="Reading Time"
            />
            <StatCard
              icon="🧠"
              value={stats.totalWordsLearned.toString()}
              label="Words Learned"
            />
            <StatCard
              icon="📊"
              value={formatTime(stats.averageSessionDuration)}
              label="Avg. Session"
            />
          </div>
        </div>

        {/* Learning Insights */}
        <div className="statistics-section">
          <h2 className="statistics-section-title">Insights</h2>
          <Card variant="outlined" padding="md">
            <div className="statistics-insight-row">
              <span>Most active day</span>
              <span className="statistics-insight-value">Monday</span>
            </div>
            <div className="statistics-insight-divider" />
            <div className="statistics-insight-row">
              <span>Favorite reading time</span>
              <span className="statistics-insight-value">Evening</span>
            </div>
            <div className="statistics-insight-divider" />
            <div className="statistics-insight-row">
              <span>Words learned this week</span>
              <span className="statistics-insight-value statistics-insight-success">+42</span>
            </div>
          </Card>
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
