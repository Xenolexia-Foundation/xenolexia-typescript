/**
 * Paragraph Word Replacer - Offline dictionary only, paragraph-aware rules
 *
 * - Parses words in the ebook (reuses Tokenizer)
 * - 5–10 words per paragraph, no more than 25–35% of words in the paragraph
 * - Replaces only words found in the offline dictionary (lookup returns WordEntry)
 * - Produces the same foreign-word markers for hover/click
 */

import type { WordEntry, ForeignWordData } from '../../types';
import type { Token } from './Tokenizer';
import { Tokenizer } from './Tokenizer';

// ============================================================================
// Types
// ============================================================================

export interface ParagraphWordReplacerOptions {
  /** Min words to replace per paragraph (when dictionary has enough) */
  wordsPerParagraphMin: number;
  /** Max words to replace per paragraph */
  wordsPerParagraphMax: number;
  /** Max fraction of paragraph words to replace (e.g. 0.35 = 35%) */
  maxFractionPerParagraph: number;
  /** Proficiency level filter */
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  /** Words to never replace */
  excludeWords?: Set<string>;
}

const DEFAULT_OPTIONS: Required<ParagraphWordReplacerOptions> = {
  wordsPerParagraphMin: 5,
  wordsPerParagraphMax: 10,
  maxFractionPerParagraph: 0.35,
  proficiencyLevel: 'beginner',
  excludeWords: new Set(),
};

export interface ParagraphWordReplacerResult {
  content: string;
  foreignWords: ForeignWordData[];
  stats: { totalWords: number; eligibleWords: number; replacedWords: number; paragraphsProcessed: number };
}

/** Offline lookup: only returns entries from the in-app dictionary (no API) */
export type OfflineLookup = (
  words: string[],
  sourceLanguage: string,
  targetLanguage: string
) => Promise<Map<string, WordEntry | null>>;

// ============================================================================
// Paragraph boundaries (block tags)
// ============================================================================

const BLOCK_BOUNDARY_REGEX = /<\s*\/?(?:p|div|h[1-6])(?:\s[^>]*)?\s*>/gi;

function getParagraphRanges(html: string): Array<{ start: number; end: number }> {
  const boundaries: number[] = [0];
  let m: RegExpExecArray | null;
  BLOCK_BOUNDARY_REGEX.lastIndex = 0;
  while ((m = BLOCK_BOUNDARY_REGEX.exec(html)) !== null) {
    boundaries.push(m.index + m[0].length);
  }
  boundaries.push(html.length);

  const ranges: Array<{ start: number; end: number }> = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (end > start) ranges.push({ start, end });
  }
  return ranges;
}

// ============================================================================
// Paragraph Word Replacer
// ============================================================================

export class ParagraphWordReplacer {
  private tokenizer: Tokenizer;
  private options: Required<ParagraphWordReplacerOptions>;

  constructor(options: Partial<ParagraphWordReplacerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.tokenizer = new Tokenizer({
      skipQuotes: true,
      skipNames: true,
      skipCode: true,
      minWordLength: 2,
      maxWordLength: 25,
      skipWords: this.options.excludeWords,
    });
  }

  /**
   * Process HTML: replace words per paragraph using only offline lookup.
   * 5–10 words per paragraph, cap at 25–35% of paragraph word count.
   */
  async process(
    html: string,
    sourceLanguage: string,
    targetLanguage: string,
    lookup: OfflineLookup
  ): Promise<ParagraphWordReplacerResult> {
    const tokens = this.tokenizer.tokenize(html);
    const ranges = getParagraphRanges(html);

    // Build token index by paragraph
    const tokensByParagraph: Token[][] = [];
    for (const range of ranges) {
      const inRange = tokens.filter(
        (t) => t.startIndex >= range.start && t.endIndex <= range.end
      );
      tokensByParagraph.push(inRange);
    }

    const proficiencyOrder = ['beginner', 'intermediate', 'advanced'];
    const maxLevelIndex = proficiencyOrder.indexOf(this.options.proficiencyLevel);

    const allCandidates: Array<{ token: Token; entry: WordEntry }> = [];
    let totalWords = 0;
    let eligibleWords = 0;

    for (const paraTokens of tokensByParagraph) {
      if (paraTokens.length === 0) continue;
      totalWords += paraTokens.length;

      const uniqueWords = [...new Set(paraTokens.filter((t) => !t.isProtected).map((t) => t.word))];
      if (uniqueWords.length === 0) continue;

      const wordEntries = await lookup(uniqueWords, sourceLanguage, targetLanguage);
      const paraCandidates: Array<{ token: Token; entry: WordEntry }> = [];

      for (const token of paraTokens) {
        if (token.isProtected || this.options.excludeWords.has(token.word)) continue;
        const entry = wordEntries.get(token.word);
        if (!entry) continue;
        const levelIndex = proficiencyOrder.indexOf(entry.proficiencyLevel);
        if (levelIndex > maxLevelIndex) continue;
        paraCandidates.push({ token, entry });
      }

      eligibleWords += paraCandidates.length;

      const cap = Math.min(
        this.options.wordsPerParagraphMax,
        Math.max(this.options.wordsPerParagraphMin, Math.floor(paraTokens.length * this.options.maxFractionPerParagraph))
      );
      const toTake = Math.min(cap, paraCandidates.length);
      if (toTake === 0) continue;

      // Distributed selection within paragraph
      const step = paraCandidates.length / toTake;
      const selected = new Set<number>();
      for (let i = 0; i < toTake; i++) {
        const idx = Math.min(Math.floor(i * step + (step * 0.3)), paraCandidates.length - 1);
        selected.add(idx);
      }
      selected.forEach((idx) => allCandidates.push(paraCandidates[idx]));
    }

    const sortedCandidates = [...allCandidates].sort(
      (a, b) => b.token.startIndex - a.token.startIndex
    );

    let modifiedHtml = html;
    const foreignWords: ForeignWordData[] = [];

    for (const { token, entry } of sortedCandidates) {
      const foreignWord = this.preserveCase(token.original, entry.targetWord);
      const marker = this.createMarker(foreignWord, entry, token);
      modifiedHtml =
        modifiedHtml.substring(0, token.startIndex) +
        marker +
        modifiedHtml.substring(token.endIndex);
      foreignWords.push({
        originalWord: token.original,
        foreignWord,
        startIndex: token.startIndex,
        endIndex: token.startIndex + marker.length,
        wordEntry: entry,
      });
    }
    foreignWords.reverse();

    return {
      content: modifiedHtml,
      foreignWords,
      stats: {
        totalWords,
        eligibleWords,
        replacedWords: sortedCandidates.length,
        paragraphsProcessed: tokensByParagraph.length,
      },
    };
  }

  private preserveCase(original: string, replacement: string): string {
    if (!original || !replacement) return replacement;
    if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
    if (original[0] === original[0].toUpperCase() && original.slice(1) === original.slice(1).toLowerCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1).toLowerCase();
    }
    return replacement.toLowerCase();
  }

  private createMarker(foreignWord: string, entry: WordEntry, token: Token): string {
    const escape = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    const attrs = [
      `class="foreign-word"`,
      `data-original="${escape(entry.sourceWord)}"`,
      `data-word-id="${escape(entry.id)}"`,
      `data-pos="${escape(entry.partOfSpeech)}"`,
    ];
    if (entry.pronunciation) attrs.push(`data-pronunciation="${escape(entry.pronunciation)}"`);
    return `<span ${attrs.join(' ')}>${escape(foreignWord)}</span>`;
  }
}

export function createParagraphWordReplacer(
  options?: Partial<ParagraphWordReplacerOptions>
): ParagraphWordReplacer {
  return new ParagraphWordReplacer(options);
}
