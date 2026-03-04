/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Generates englishBeginner500.ts from CSV frequency data.
 * Run from repo root: node ts-shared-core/scripts/generate-dictionaries.js
 *
 * Requires: word-freq-top5000.csv in ts-shared-core/scripts/
 * Download: https://github.com/filiph/english_words/raw/master/data/word-freq-top5000.csv
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const SCRIPTS_DIR = path.join(__dirname, '');
const CSV_PATH = path.join(SCRIPTS_DIR, 'word-freq-top5000.csv');

function mapPOS(code) {
  const m = {
    n: 'noun',
    v: 'verb',
    j: 'adjective',
    r: 'adverb',
    p: 'pronoun',
    i: 'preposition',
    c: 'conjunction',
    u: 'interjection',
    a: 'article',
    d: 'other',
    t: 'other',
    e: 'other',
    x: 'other',
    m: 'other',
  };
  return m[code] || 'other';
}

function escape(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

if (!fs.existsSync(CSV_PATH)) {
  console.error('Missing word-freq-top5000.csv. Download from:');
  console.error('https://github.com/filiph/english_words/raw/master/data/word-freq-top5000.csv');
  console.error('Save to:', CSV_PATH);
  process.exit(1);
}

const csv = fs.readFileSync(CSV_PATH, 'utf8');
const lines = csv.split('\n').slice(1, 501);
const entries = [];
const seen = new Set();
for (const line of lines) {
  const parts = line.split(',');
  if (parts.length < 3) continue;
  const rank = parseInt(parts[0], 10);
  const word = parts[1].trim().toLowerCase();
  if (!word || word === "n't" || word === "'s" || word === "''" || seen.has(word)) continue;
  seen.add(word);
  const posCode = (parts[2] || 'n').trim().toLowerCase();
  entries.push({rank: entries.length + 1, source: word, pos: mapPOS(posCode)});
}
let idx = 501;
while (entries.length < 500) {
  const allLines = csv.split('\n');
  const line = allLines[idx];
  idx++;
  if (!line) break;
  const parts = line.split(',');
  const word = (parts[1] || 'word').trim().toLowerCase();
  if (seen.has(word)) continue;
  seen.add(word);
  const posCode = (parts[2] || 'n').trim().toLowerCase();
  entries.push({rank: entries.length + 1, source: word, pos: mapPOS(posCode)});
}

const enLines = [
  `/**`,
  ` * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.`,
  ` * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.`,
  ` * Canonical list of 500 most frequent English words (rank 1-500).`,
  ` */`,
  ``,
  `import type { PartOfSpeech } from '../types';`,
  ``,
  `export interface EnglishWordEntry { source: string; rank: number; pos: PartOfSpeech; variants?: string[]; }`,
  ``,
  `export const ENGLISH_BEGINNER_500: EnglishWordEntry[] = [`,
  ...entries.map(e => `  { source: '${escape(e.source)}', rank: ${e.rank}, pos: '${e.pos}' },`),
  `];`,
];
fs.writeFileSync(path.join(DATA_DIR, 'englishBeginner500.ts'), enLines.join('\n') + '\n');
console.log('Wrote englishBeginner500.ts with', entries.length, 'words');
