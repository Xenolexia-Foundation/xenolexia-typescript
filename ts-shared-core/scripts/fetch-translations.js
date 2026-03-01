/**
 * Fetches 500 English word translations via MyMemory API.
 * Usage: node fetch-translations.js [langCode]
 * Saves to ts-shared-core/src/data/translations/<lang>.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../src/data');
const TRANSLATIONS_DIR = path.join(DATA_DIR, 'translations');
const CSV_PATH = path.join(__dirname, 'word-freq-top5000.csv');

const LANG_MAP = {
  es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'pt', ru: 'ru', ja: 'ja', zh: 'zh-CN', ko: 'ko',
  ar: 'ar', nl: 'nl', pl: 'pl', tr: 'tr', sv: 'sv', da: 'da', fi: 'fi', no: 'nb', cs: 'cs',
  hu: 'hu', ro: 'ro', uk: 'uk', hi: 'hi', th: 'th', vi: 'vi', id: 'id', el: 'el',
};

function getEnglishWords() {
  const csv = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csv.split('\n').slice(1);
  const words = [];
  const seen = new Set();
  for (const line of lines) {
    const parts = line.split(',');
    const w = (parts[1] || '').trim().toLowerCase();
    if (!w || w === "n't" || w === "'s" || seen.has(w)) continue;
    seen.add(w);
    words.push(w);
    if (words.length >= 500) break;
  }
  return words;
}

function fetchTranslation(word, langCode) {
  const target = LANG_MAP[langCode] || langCode;
  return new Promise((resolve, reject) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${target}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (ch) => data += ch);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const translated = j.responseData?.translatedText || word;
          resolve(translated.trim());
        } catch (e) {
          resolve(word);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const langCode = process.argv[2] || 'es';
  if (!fs.existsSync(TRANSLATIONS_DIR)) fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
  const words = getEnglishWords();
  console.log(`Translating ${words.length} words to ${langCode}...`);
  const results = [];
  for (let i = 0; i < words.length; i++) {
    const t = await fetchTranslation(words[i], langCode);
    results.push(t);
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${words.length}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  const outPath = path.join(TRANSLATIONS_DIR, `${langCode}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 0));
  console.log(`Saved ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
