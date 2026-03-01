# Dictionary scripts

## Overview

- **englishBeginner500**: The canonical list of 500 most frequent English words (rank 1–500) is generated from [word-freq-top5000.csv](https://github.com/filiph/english_words/blob/master/data/word-freq-top5000.csv). Run `node generate-dictionaries.js` to regenerate `../src/data/englishBeginner500.ts` (requires `word-freq-top5000.csv` in this directory).

- **Per-language 500-word files**: Each `words_en_XX.ts` uses `ENGLISH_BEGINNER_500` and exports 500 beginner words. By default, the target word is set to the source (English) as a placeholder.

## Getting real translations (500 words per language)

1. **Fetch translations** (one language at a time; free tier is rate-limited):
   ```bash
   node fetch-translations.js <lang>
   ```
   Example: `node fetch-translations.js es`  
   Saves `../src/data/translations/<lang>.json` (e.g. `es.json`).

2. **Generate the word list** from that JSON:
   ```bash
   node build-words-from-translations.js <lang>
   ```
   Example: `node build-words-from-translations.js es`  
   Overwrites `../src/data/words_en_<lang>.ts` with 500 entries using the fetched translations.

3. **All languages**: Run the two steps for each of:  
   `el es fr de it pt ru ja zh ko ar nl pl tr sv da fi no cs hu ro uk he hi th vi id`

## Regenerating all 500-word files (placeholder only)

To reset all language files to the shared English list with 500 entries (target = source):

```bash
node generate-all-500.js
```

This does not call any API; it only rewrites the `words_en_XX.ts` files.

## Verifying translation map (round-trip)

To check accuracy of derived S→T pairs (when both languages are non-English), run round-trip verification after building the core:

```bash
cd .. && npm run build && node scripts/verify-translation-map.js
```

This writes `scripts/verification-report.json` with per-pair and per-entry results (source, target, roundTripBack, ok). The app uses only entries that pass this check for bridge pairs (see `getBundledWordsVerified` in the core).

## Files

| File | Purpose |
|------|--------|
| `word-freq-top5000.csv` | Source for English word list (download from link above). |
| `generate-dictionaries.js` | Builds `englishBeginner500.ts` from the CSV. |
| `generate-all-500.js` | Writes all `words_en_XX.ts` with 500 entries (target = source). |
| `fetch-translations.js` | Fetches 500 translations from MyMemory API into `translations/<lang>.json`. |
| `build-words-from-translations.js` | Builds `words_en_XX.ts` from `translations/<lang>.json`. |
| `verify-translation-map.js` | Round-trip verification for bridge-derived pairs; writes `verification-report.json`. |
