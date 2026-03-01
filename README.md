# Xenolexia

> Learn languages through the stories you love.

**Xenolexia** is an e-book reader that helps you learn languages by reading. Words matching your proficiency level appear in your target language; tap or hover to reveal the original. Build vocabulary with spaced repetition—on **desktop** (Electron) or **mobile** (React Native).

**Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.** Licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html) (AGPL-3.0). See [LICENSE](LICENSE).

---

## Monorepo structure

| Package | Description |
|---------|-------------|
| **ts-shared-core** | Platform-agnostic core: types, translation engine, book parsing (EPUB, TXT, MOBI), storage interfaces, export. No React/Electron deps; host apps provide IFileSystem, IDataStore, IKeyValueStore. |
| **electron-app** | Desktop app for Windows, macOS, and Linux (Electron + React). |
| **react-native-app** | Mobile app for iOS and Android (React Native). |

---

## Prerequisites

- **Node.js 18+**
- **npm** (or yarn)

For **electron-app**: nothing else.  
For **react-native-app**: Xcode 15+ (iOS), Android Studio with SDK 34+ (Android), CocoaPods (iOS).

---

## Install and run

From the repository root:

```bash
npm install
```

### Build the core (required before running either app)

```bash
npm run build:core
```

### Desktop (Electron)

```bash
npm run electron:dev -w xenolexia-electron
# or from electron-app: npm run electron:dev
```

Build for a specific OS (from repo root or electron-app):

```bash
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

### Mobile (React Native)

```bash
cd react-native-app
npm start
# In another terminal:
npm run ios     # or  npm run android
```

iOS: run `cd ios && pod install && cd ..` once after clone.

---

## Tests

```bash
npm test
```

Runs tests in ts-shared-core and electron-app (and react-native-app when configured).

---

## Dictionary data and scripts

The core ships with bundled word lists (500 beginner words per language, English as bridge). Scripts live in **ts-shared-core/scripts/**:

- **Fetch translations**: `node fetch-translations.js <lang>` (e.g. `es`) → writes `src/data/translations/<lang>.json`.
- **Build word list**: `node build-words-from-translations.js [<lang>]` → updates `words_en_<lang>.ts`.
- **Reset all to placeholder**: `node generate-all-500.js`.
- **Verify translation map** (round-trip S→T→S): from ts-shared-core, `npm run build && node scripts/verify-translation-map.js` → writes `scripts/verification-report.json`.

The canonical English list is built from [word-freq-top5000.csv](https://github.com/filiph/english_words/blob/master/data/word-freq-top5000.csv); run `node generate-dictionaries.js` with that CSV in the scripts directory to regenerate `englishBeginner500.ts`.

---

## Supported languages

27+ languages: English, Spanish, French, German, Italian, Portuguese, Russian, Greek, Dutch, Polish, Turkish, Swedish, Danish, Finnish, Norwegian, Czech, Hungarian, Romanian, Ukrainian, Hindi, Thai, Vietnamese, Indonesian, Japanese, Chinese, Korean, Arabic.

Any source→target pair is supported via the shared core (English used as bridge when both are non-English).

---

## License

AGPL-3.0. See [LICENSE](LICENSE).
