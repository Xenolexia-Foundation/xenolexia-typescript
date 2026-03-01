#!/usr/bin/env node
/**
 * Run fetch-translations.js once per language that doesn't have translations/<lang>.json yet.
 * Sleeps SLEEP_MINUTES between each fetch to respect rate limits.
 * Usage: node scripts/fetch-all-translations.js [--sleep=3]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TRANSLATIONS_DIR = path.join(__dirname, '../src/data/translations');
const FETCH_SCRIPT = path.join(__dirname, 'fetch-translations.js');

const LANG_CODES = [
  'es', 'fr', 'de', 'it', 'pt', 'ru', 'el', 'ja', 'zh', 'ko', 'ar',
  'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'hu', 'ro', 'uk',
  'hi', 'th', 'vi', 'id', 'arm', 'am', 'fa',
];

const args = process.argv.slice(2);
let sleepMinutes = 3;
for (const a of args) {
  if (a.startsWith('--sleep=')) {
    sleepMinutes = parseInt(a.replace('--sleep=', ''), 10) || 3;
    break;
  }
}

const sleepMs = sleepMinutes * 60 * 1000;

function hasJson(lang) {
  try {
    const p = path.join(TRANSLATIONS_DIR, `${lang}.json`);
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function fetchOne(lang) {
  console.log(`\n[${new Date().toISOString()}] Fetching ${lang}...`);
  execSync(`node "${FETCH_SCRIPT}" ${lang}`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log(`Done ${lang}.`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
  }

  const missing = LANG_CODES.filter((lang) => !hasJson(lang));
  if (missing.length === 0) {
    console.log('All languages already have translations. Nothing to do.');
    process.exit(0);
  }

  console.log(`Languages missing translations (${missing.length}): ${missing.join(', ')}`);
  console.log(`Will sleep ${sleepMinutes} minute(s) between each fetch.\n`);

  for (let i = 0; i < missing.length; i++) {
    const lang = missing[i];
    fetchOne(lang);
    if (i < missing.length - 1) {
      console.log(`Sleeping ${sleepMinutes} minute(s) before next...`);
      await sleep(sleepMs);
    }
  }

  console.log('\nAll requested languages fetched.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
