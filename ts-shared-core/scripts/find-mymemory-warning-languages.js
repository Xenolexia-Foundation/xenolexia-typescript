#!/usr/bin/env node
/**
 * Finds languages whose translations/XX.json still contain the MyMemory
 * rate-limit warning. Output: JSON array of language codes to stdout.
 * Usage: node scripts/find-mymemory-warning-languages.js
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '../src/data/translations');
const PATTERNS = ['mymemory', 'used all available free', 'next available in', 'usagelimits'];

function isWarning(text) {
  if (typeof text !== 'string' || !text.trim()) return false;
  const u = text.trim().toUpperCase();
  return PATTERNS.some(p => u.includes(p.toUpperCase()));
}

function main() {
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    console.log(JSON.stringify([]));
    return;
  }
  const files = fs.readdirSync(TRANSLATIONS_DIR).filter(f => f.endsWith('.json'));
  const bad = files
    .map(f => f.replace('.json', ''))
    .filter(lang => {
      try {
        const arr = JSON.parse(
          fs.readFileSync(path.join(TRANSLATIONS_DIR, `${lang}.json`), 'utf8')
        );
        return Array.isArray(arr) && arr.some(t => isWarning(String(t)));
      } catch {
        return false;
      }
    });
  console.log(JSON.stringify(bad.sort()));
}

main();
