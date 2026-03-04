# Bundled word lists (en → target)

Each `words_en_XX.ts` file provides the 500 most frequent English words and their translations for word replacement in the reader. **If a file still has placeholders** (target = source), word replacement for that language will show the same word or rely on the app database.

## Apply the fix to any target language

To fill or refresh real translations for a language:

```bash
# From ts-shared-core/
npm run fetch:translations -- <lang>
npm run build:translations -- <lang>
```

Example for Greek:

```bash
npm run fetch:translations -- el
npm run build:translations -- el
```

Example for all languages that already have `src/data/translations/<lang>.json`:

```bash
npm run build:translations
```

**Supported `<lang>` codes** (same as in `scripts/fetch-translations.js`):  
`es`, `fr`, `de`, `it`, `pt`, `ru`, `ja`, `zh`, `ko`, `ar`, `nl`, `pl`, `tr`, `sv`, `da`, `fi`, `no`, `cs`, `hu`, `ro`, `uk`, `hi`, `th`, `vi`, `id`, `el`, `arm`, `am`, `fa`.

- **fetch:translations** – Fetches 500 translations via MyMemory API into `translations/<lang>.json` (rate-limited; ~2–3 min per language).
- **build:translations** – Generates `words_en_<lang>.ts` from `ENGLISH_BEGINNER_500` + `translations/<lang>.json`. Run with no args to build every language that has a JSON file.

After building, run `npm run build` and use the app; word replacement will use the new bundled data for that language.

## MyMemory rate-limit warning

If the API returns a message like *"mymemory warning: you used all available free translations for today..."*, that text must not be stored as a translation. The **build** step replaces any such text with the source (English) word, so the app never shows the warning. To get real translations for affected languages:

1. **See which languages still have the warning** in their `translations/*.json`:
   ```bash
   npm run find:mymemory-warning
   ```
2. **Run once: re-fetch and rebuild one language** (respects rate limit by fixing one per run):
   ```bash
   npm run ensure:translations-resolved
   ```
3. **Run every 4 hours until all are resolved** (background loop; one language per 4 hours):
   ```bash
   npm run run:every-4h-until-resolved
   ```
   Or with cron (e.g. at 00:00, 04:00, 08:00…):
   ```cron
   0 */4 * * * cd /path/to/ts-shared-core && node scripts/ensure-translations-resolved.js
   ```
