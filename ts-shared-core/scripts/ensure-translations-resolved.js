#!/usr/bin/env node
/**
 * One run: find languages that still have the MyMemory warning in their data,
 * then re-fetch and rebuild ONE language (to respect rate limits). Run this
 * every 4 hours until all are resolved.
 *
 * Usage:
 *   node scripts/ensure-translations-resolved.js
 *
 * Schedule (every 4 hours until resolved):
 *   node scripts/run-every-4h-until-resolved.js
 *
 * Or add to crontab (run at 00:00, 04:00, 08:00, ...):
 *   0 *\/4 * * * cd /path/to/ts-shared-core && node scripts/ensure-translations-resolved.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TRANSLATIONS_DIR = path.join(__dirname, '../src/data/translations');
const FETCH_SCRIPT = path.join(__dirname, 'fetch-translations.js');
const BUILD_SCRIPT = path.join(__dirname, 'build-words-from-translations.js');

const MYMEMORY_PATTERNS = [
  'mymemory',
  'used all available free',
  'next available in',
  'usagelimits',
];

function isMyMemoryWarning(text) {
  if (typeof text !== 'string' || !text.trim()) return false;
  const u = text.trim().toUpperCase();
  return MYMEMORY_PATTERNS.some((p) => u.includes(p.toUpperCase()));
}

function getLanguagesWithWarning() {
  if (!fs.existsSync(TRANSLATIONS_DIR)) return [];
  const jsonFiles = fs.readdirSync(TRANSLATIONS_DIR).filter((f) => f.endsWith('.json'));
  const langCodes = jsonFiles.map((f) => f.replace('.json', ''));
  const withWarning = langCodes.filter((lang) => {
    const jsonPath = path.join(TRANSLATIONS_DIR, `${lang}.json`);
    try {
      const arr = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return Array.isArray(arr) && arr.some((t) => isMyMemoryWarning(String(t)));
    } catch {
      return false;
    }
  });
  return withWarning.sort();
}

function fetchOne(langCode) {
  console.log(`[${new Date().toISOString()}] Fetching translations for ${langCode}...`);
  try {
    execSync(`node "${FETCH_SCRIPT}" ${langCode}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (e) {
    console.error(`[ensure-translations-resolved] Fetch failed for ${langCode} (likely rate limit).`);
    throw e;
  }
}

function buildOne(langCode) {
  console.log(`[${new Date().toISOString()}] Building words_en_${langCode}.ts...`);
  execSync(`node "${BUILD_SCRIPT}" ${langCode}`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
}

function main() {
  const needsFix = getLanguagesWithWarning();
  if (needsFix.length === 0) {
    console.log('[ensure-translations-resolved] All languages resolved. No action.');
    process.exit(0);
  }
  console.log(`[ensure-translations-resolved] Languages with MyMemory warning: ${needsFix.join(', ')}`);
  const lang = needsFix[0];
  try {
    fetchOne(lang);
    buildOne(lang);
  } catch (e) {
    console.error('[ensure-translations-resolved] Run failed (translation service may have returned rate-limit warning). Exit 1.');
    process.exit(1);
  }
  const remaining = getLanguagesWithWarning();
  if (remaining.length > 0) {
    console.log(`[ensure-translations-resolved] Remaining: ${remaining.join(', ')}. Run again in 4 hours.`);
  } else {
    console.log('[ensure-translations-resolved] This language is now resolved.');
  }
  process.exit(0);
}

main();
