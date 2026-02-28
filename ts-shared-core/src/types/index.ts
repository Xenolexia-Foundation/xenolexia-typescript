/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Central type definitions for Xenolexia (platform-agnostic)
 */

// ============================================================================
// Language & Proficiency Types
// ============================================================================

export type Language =
  | 'en' | 'el' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'zh' | 'ko' | 'ar'
  | 'nl' | 'pl' | 'tr' | 'sv' | 'da' | 'fi' | 'no' | 'cs' | 'hu' | 'ro' | 'uk' | 'he' | 'hi' | 'th' | 'vi' | 'id';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LanguagePair {
  sourceLanguage: Language;
  targetLanguage: Language;
}

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag?: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇵🇸', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export function getLanguageInfo(code: Language): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageName(code: Language): string {
  return getLanguageInfo(code)?.name || code.toUpperCase();
}

// ============================================================================
// Book Types
// ============================================================================

export type BookFormat = 'epub' | 'fb2' | 'mobi' | 'txt';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverPath: string | null;
  filePath: string;
  format: BookFormat;
  fileSize: number;
  addedAt: Date;
  lastReadAt: Date | null;
  languagePair: LanguagePair;
  proficiencyLevel: ProficiencyLevel;
  wordDensity: number;
  progress: number;
  currentLocation: string | null;
  currentChapter: number;
  totalChapters: number;
  currentPage: number;
  totalPages: number;
  readingTimeMinutes: number;
  sourceUrl?: string;
  isDownloaded: boolean;
}

export interface BookMetadata {
  title: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  language?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  subjects?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  index: number;
  content: string;
  wordCount: number;
  href?: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  href: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface ParsedBook {
  metadata: BookMetadata;
  chapters: Chapter[];
  tableOfContents: TableOfContentsItem[];
  totalWordCount: number;
}

// ============================================================================
// Word & Vocabulary Types
// ============================================================================

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition'
  | 'conjunction' | 'interjection' | 'article' | 'other';

export interface WordEntry {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  proficiencyLevel: ProficiencyLevel;
  frequencyRank: number;
  partOfSpeech: PartOfSpeech;
  variants: string[];
  pronunciation?: string;
}

export interface VocabularyItem {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  contextSentence: string | null;
  bookId: string | null;
  bookTitle: string | null;
  addedAt: Date;
  lastReviewedAt: Date | null;
  reviewCount: number;
  easeFactor: number;
  interval: number;
  status: VocabularyStatus;
}

export type VocabularyStatus = 'new' | 'learning' | 'review' | 'learned';

// ============================================================================
// Reader Types
// ============================================================================

export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  marginHorizontal: number;
  marginVertical: number;
  textAlign: 'left' | 'justify';
  brightness: number;
}

export interface ForeignWordData {
  originalWord: string;
  foreignWord: string;
  startIndex: number;
  endIndex: number;
  wordEntry: WordEntry;
}

export interface ProcessedChapter extends Chapter {
  foreignWords: ForeignWordData[];
  processedContent: string;
}

// ============================================================================
// Reading Session & Statistics
// ============================================================================

export interface ReadingSession {
  id: string;
  bookId: string;
  startedAt: Date;
  endedAt: Date | null;
  pagesRead: number;
  wordsRevealed: number;
  wordsSaved: number;
  duration: number;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalReadingTime: number;
  totalWordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionDuration: number;
  wordsRevealedToday: number;
  wordsSavedToday: number;
}

// ============================================================================
// App State Types (no navigation)
// ============================================================================

export interface UserPreferences {
  defaultSourceLanguage: Language;
  defaultTargetLanguage: Language;
  defaultProficiencyLevel: ProficiencyLevel;
  defaultWordDensity: number;
  readerSettings: ReaderSettings;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  dailyGoal: number;
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  currentBook: Book | null;
  preferences: UserPreferences;
}
