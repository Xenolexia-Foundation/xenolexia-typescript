/**
 * Builds words_en_XX.ts from ENGLISH_BEGINNER_500 + data/translations/XX.json
 * Run after fetch-translations.js. Usage: node build-words-from-translations.js [langCode]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const TRANSLATIONS_DIR = path.join(DATA_DIR, 'translations');

function getEnglishEntries() {
  const p = path.join(DATA_DIR, 'englishBeginner500.ts');
  const content = fs.readFileSync(p, 'utf8');
  const entries = [];
  const re = /\{\s*source:\s*'([^']*)',\s*rank:\s*(\d+),\s*pos:\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    entries.push({source: m[1], rank: parseInt(m[2], 10), pos: m[3]});
  }
  return entries;
}

function escape(str) {
  if (typeof str !== 'string') str = String(str);
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

/** If the API returned a rate-limit or error message instead of a translation, use the source word. */
function sanitizeTarget(translated, sourceWord) {
  if (typeof translated !== 'string' || !translated.trim()) return sourceWord;
  const t = translated.trim().toUpperCase();
  if (
    t.includes('MYMEMORY') ||
    t.includes('USED ALL AVAILABLE FREE') ||
    t.includes('USAGELIMITS')
  ) {
    return sourceWord;
  }
  return translated.trim();
}

function buildWordsFile(langCode) {
  const jsonPath = path.join(TRANSLATIONS_DIR, `${langCode}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.warn(`Skip ${langCode}: no ${jsonPath}`);
    return;
  }
  const rawTargets = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const english = getEnglishEntries();
  const len = Math.min(rawTargets.length, english.length, 500);
  const targets = rawTargets.slice(0, len).map((t, i) => sanitizeTarget(t, english[i].source));
  const lines = [
    `/**`,
    ` * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.`,
    ` * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.`,
    ` * English-${langCode.toUpperCase()} dictionary: ${len} beginner words (frequency-ranked).`,
    ` */`,
    ``,
    `import type { WordData } from '../types';`,
    `import { ENGLISH_BEGINNER_500 } from './englishBeginner500';`,
    ``,
    `const TARGETS: string[] = [`,
    ...targets.slice(0, len).map((t, i) => `  '${escape(t)}',`),
    `];`,
    ``,
    `const LEN = ${len};`,
    `export const BEGINNER_WORDS: WordData[] = ENGLISH_BEGINNER_500.slice(0, LEN).map((e, i) => ({ ...e, target: TARGETS[i] ?? e.source }));`,
    `export const INTERMEDIATE_WORDS: WordData[] = [];`,
    `export const ADVANCED_WORDS: WordData[] = [];`,
    `export const ALL_WORDS_EN_${langCode.toUpperCase()}: WordData[] = [...BEGINNER_WORDS];`,
    ``,
    `export function getWordsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): WordData[] {`,
    `  switch (level) { case 'beginner': return BEGINNER_WORDS; case 'intermediate': case 'advanced': return []; default: return []; }`,
    `}`,
    `export function getTotalWordCount(): number { return ALL_WORDS_EN_${langCode.toUpperCase()}.length; }`,
  ];
  const outPath = path.join(DATA_DIR, `words_en_${langCode}.ts`);
  fs.writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(`Wrote ${outPath} (${len} words)`);
}

const langCode = process.argv[2];
if (langCode) {
  buildWordsFile(langCode);
} else {
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    console.log('No translations dir. Run fetch-translations.js <lang> first.');
    process.exit(0);
  }
  fs.readdirSync(TRANSLATIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .forEach(f => buildWordsFile(f.replace('.json', '')));
}
