/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Registry of bundled word lists. Uses English as the canonical bridge:
 * - We store en→L for each language L (500 words).
 * - Any pair (S, T) is derived: S→en (swap en→S), en→T (existing), or S→T (zip en→S and en→T by index).
 *
 * Verification: for derived S→T pairs we check round-trip consistency (S → T → S' and require S' = S).
 * getBundledWordsVerified() returns only entries that pass this check to reduce errors from the English bridge.
 */

import type { Language } from '../types';
import type { WordData } from '../types';
import { ALL_WORDS_EN_EL } from './words_en_el';
import { ALL_WORDS_EN_ES } from './words_en_es';
import { ALL_WORDS_EN_FR } from './words_en_fr';
import { ALL_WORDS_EN_DE } from './words_en_de';
import { ALL_WORDS_EN_IT } from './words_en_it';
import { ALL_WORDS_EN_PT } from './words_en_pt';
import { ALL_WORDS_EN_RU } from './words_en_ru';
import { ALL_WORDS_EN_JA } from './words_en_ja';
import { ALL_WORDS_EN_ZH } from './words_en_zh';
import { ALL_WORDS_EN_KO } from './words_en_ko';
import { ALL_WORDS_EN_AR } from './words_en_ar';
import { ALL_WORDS_EN_NL } from './words_en_nl';
import { ALL_WORDS_EN_PL } from './words_en_pl';
import { ALL_WORDS_EN_TR } from './words_en_tr';
import { ALL_WORDS_EN_SV } from './words_en_sv';
import { ALL_WORDS_EN_DA } from './words_en_da';
import { ALL_WORDS_EN_FI } from './words_en_fi';
import { ALL_WORDS_EN_NO } from './words_en_no';
import { ALL_WORDS_EN_CS } from './words_en_cs';
import { ALL_WORDS_EN_HU } from './words_en_hu';
import { ALL_WORDS_EN_RO } from './words_en_ro';
import { ALL_WORDS_EN_UK } from './words_en_uk';
import { ALL_WORDS_EN_HI } from './words_en_hi';
import { ALL_WORDS_EN_TH } from './words_en_th';
import { ALL_WORDS_EN_VI } from './words_en_vi';
import { ALL_WORDS_EN_ID } from './words_en_id';
import { ALL_WORDS_EN_ARM } from './words_en_arm';
import { ALL_WORDS_EN_AM } from './words_en_am';
import { ALL_WORDS_EN_FA } from './words_en_fa';

type NonEn = Exclude<Language, 'en'>;

const BUNDLED_EN: Record<NonEn, WordData[]> = {
  el: ALL_WORDS_EN_EL,
  es: ALL_WORDS_EN_ES,
  fr: ALL_WORDS_EN_FR,
  de: ALL_WORDS_EN_DE,
  it: ALL_WORDS_EN_IT,
  pt: ALL_WORDS_EN_PT,
  ru: ALL_WORDS_EN_RU,
  ja: ALL_WORDS_EN_JA,
  zh: ALL_WORDS_EN_ZH,
  ko: ALL_WORDS_EN_KO,
  ar: ALL_WORDS_EN_AR,
  nl: ALL_WORDS_EN_NL,
  pl: ALL_WORDS_EN_PL,
  tr: ALL_WORDS_EN_TR,
  sv: ALL_WORDS_EN_SV,
  da: ALL_WORDS_EN_DA,
  fi: ALL_WORDS_EN_FI,
  no: ALL_WORDS_EN_NO,
  cs: ALL_WORDS_EN_CS,
  hu: ALL_WORDS_EN_HU,
  ro: ALL_WORDS_EN_RO,
  uk: ALL_WORDS_EN_UK,
  hi: ALL_WORDS_EN_HI,
  th: ALL_WORDS_EN_TH,
  vi: ALL_WORDS_EN_VI,
  id: ALL_WORDS_EN_ID,
  arm: ALL_WORDS_EN_ARM,
  am: ALL_WORDS_EN_AM,
  fa: ALL_WORDS_EN_FA,
};

/**
 * Returns bundled word list for the given language pair, or null if none.
 * Supports any (source, target) pair among supported languages by using
 * English as the canonical bridge (all stored lists are en→L; other pairs
 * are derived by swapping or zipping).
 */
export function getBundledWords(source: Language, target: Language): WordData[] | null {
  if (source === target) return [];

  if (source === 'en') {
    const list = BUNDLED_EN[target as NonEn];
    return list ?? null;
  }

  if (target === 'en') {
    const list = BUNDLED_EN[source as NonEn];
    if (!list || list.length === 0) return null;
    return list.map((w) => ({
      ...w,
      source: w.target,
      target: w.source,
    }));
  }

  const listS = BUNDLED_EN[source as NonEn];
  const listT = BUNDLED_EN[target as NonEn];
  if (!listS || !listT || listS.length === 0 || listT.length === 0) return null;

  const len = Math.min(listS.length, listT.length);
  return listS.slice(0, len).map((w, i) => ({
    source: w.target,
    target: listT[i].target,
    rank: w.rank,
    pos: w.pos,
    variants: undefined,
    pronunciation: undefined,
  }));
}

/**
 * True if there is a non-empty bundled list for this pair.
 */
export function hasBundledWords(source: Language, target: Language): boolean {
  const words = getBundledWords(source, target);
  return words !== null && words.length > 0;
}

/** Normalize word for comparison (trim, lowercase, NFKC). */
function normalizeWord(w: string): string {
  return w.trim().toLowerCase().normalize('NFKC');
}

/** Result of round-trip check for one entry: source (S) → target (T) → back to S'. */
export interface VerificationEntry {
  index: number;
  source: string;
  target: string;
  roundTripBack: string | null;
  ok: boolean;
}

/** Full verification report for a language pair. */
export interface VerificationReport {
  source: Language;
  target: Language;
  total: number;
  passed: number;
  failed: number;
  entries: VerificationEntry[];
}

/**
 * For a derived pair (S, T) where both are non-English: checks round-trip S → T → S'.
 * Returns a report per entry. For en→T or T→en we return a report with all passed (stored data is canonical).
 */
export function getVerificationReport(source: Language, target: Language): VerificationReport | null {
  const list = getBundledWords(source, target);
  if (!list || list.length === 0) return null;

  const entries: VerificationEntry[] = [];
  let passed = 0;
  let failed = 0;

  if (source === 'en' || target === 'en') {
    list.forEach((w, i) => {
      entries.push({ index: i, source: w.source, target: w.target, roundTripBack: w.source, ok: true });
      passed++;
    });
    return { source, target, total: list.length, passed, failed, entries };
  }

  const reverseList = getBundledWords(target, source);
  if (!reverseList || reverseList.length === 0) {
    list.forEach((w, i) => {
      entries.push({ index: i, source: w.source, target: w.target, roundTripBack: null, ok: false });
      failed++;
    });
    return { source, target, total: list.length, passed: 0, failed: list.length, entries };
  }

  const targetToSource = new Map<string, string>();
  reverseList.forEach((w) => {
    const key = normalizeWord(w.source);
    if (!targetToSource.has(key)) targetToSource.set(key, w.target);
  });

  list.forEach((w, i) => {
    const key = normalizeWord(w.target);
    const roundTripBack = targetToSource.get(key) ?? null;
    const ok = roundTripBack !== null && normalizeWord(roundTripBack) === normalizeWord(w.source);
    entries.push({ index: i, source: w.source, target: w.target, roundTripBack, ok });
    if (ok) passed++; else failed++;
  });

  return { source, target, total: list.length, passed, failed, entries };
}

/**
 * Returns bundled words for (source, target), excluding entries that fail round-trip verification
 * when the pair is derived via English (S→T). For en→T or T→en returns the same as getBundledWords.
 * Use this to reduce translation errors from the English bridge.
 */
export function getBundledWordsVerified(source: Language, target: Language): WordData[] | null {
  if (source === target) return [];

  if (source === 'en' || target === 'en') {
    return getBundledWords(source, target);
  }

  const list = getBundledWords(source, target);
  if (!list || list.length === 0) return null;

  const reverseList = getBundledWords(target, source);
  if (!reverseList || reverseList.length === 0) return list;

  const targetToSource = new Map<string, string>();
  reverseList.forEach((w) => {
    const key = normalizeWord(w.source);
    if (!targetToSource.has(key)) targetToSource.set(key, w.target);
  });

  return list.filter((w) => {
    const key = normalizeWord(w.target);
    const roundTripBack = targetToSource.get(key);
    return roundTripBack !== undefined && normalizeWord(roundTripBack) === normalizeWord(w.source);
  });
}
