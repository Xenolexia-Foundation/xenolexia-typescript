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
