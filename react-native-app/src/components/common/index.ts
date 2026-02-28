/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Common Components - Shared across screens
 */

// Tab Bar Icons
export {
  TabBarIcon,
  BookOpenIcon,
  SettingsIcon,
  SearchIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from './TabBarIcon';
export type {TabIconName} from './TabBarIcon';

// Screen Header
export {ScreenHeader} from './ScreenHeader';
export type {ScreenHeaderProps} from './ScreenHeader';

// Loading States
export {
  LoadingSpinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonBookCard,
  SkeletonListItem,
  SkeletonStatCard,
  LoadingBookGrid,
  LoadingList,
  LoadingStats,
} from './LoadingState';
export type {LoadingSpinnerProps, SkeletonProps} from './LoadingState';

// Empty States
export {EmptyState, EmptySearchResults, ErrorState, NoConnectionState} from './EmptyState';
export type {EmptyStateProps} from './EmptyState';

// Error Boundary
export {ErrorBoundary, ScreenErrorBoundary} from './ErrorBoundary';
