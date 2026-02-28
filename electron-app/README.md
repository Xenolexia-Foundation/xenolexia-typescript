# Xenolexia 📚🌍

> _Learn languages through the stories you love_

**Xenolexia** is an Electron desktop e-book reader that helps you learn languages by reading. Words matching your proficiency level appear in your target language; hover to reveal the original. Build vocabulary and review with spaced repetition—all from your desktop on **Windows**, **macOS**, and **Linux**.

This project is **Electron-only**; there are no iOS, Android, or web targets.

---

## 🎯 The Concept

Read books in your native language while learning Spanish, French, German, Japanese, or any of **28+ supported languages**. As you read, a portion of words (based on your level and density settings) appear in the target language. You infer meaning from context; hovering shows the original word and lets you save it to your vocabulary.

**Example (English → Spanish, beginner):**

> "She walked into the **casa** and set down her keys."

_Hover "casa" → reveals "house"_

---

## ✨ Features

### Core Reading

- **Multi-format**: EPUB, TXT, MOBI (epub.js for EPUB; @lingo-reader/mobi-parser for MOBI; trivial TXT)
- **Customizable reader**: Fonts, themes (light/dark/sepia), margins, line spacing
- **Progress**: Bookmarking and progress tracking
- **Hover-to-reveal**: Translation popup on hover (desktop)

### Language Engine

- **28+ language pairs** via free APIs (LibreTranslate, MyMemory, Lingva)
- **Proficiency levels**: Beginner, Intermediate, Advanced (CEFR)
- **Word density**: Control how many words appear in the target language (e.g. 5%–100%)
- **Frequency-based selection** using open word lists
- **Offline-friendly**: Translations cached in SQLite

### Vocabulary

- **Save words** from the reader with context
- **Spaced repetition** (SM-2) for saved words
- **Vocabulary screen**: Search, filter, edit, delete
- **Review**: Flashcard-style review (Again/Hard/Good/Easy/Already Knew)

### Library

- **Import** from local files
- **Discover** free ebooks (e.g. Gutenberg, Standard Ebooks)
- **Library view**: Grid/list of your collection

---

## 🏗️ Architecture

- **Electron**: Main process (Node) + renderer (Chromium).
- **React + React Router DOM**: UI and navigation in the renderer.
- **@xenolexia/shared**: Business logic (parsers, translation engine, stores, SQLite/electron-store) in a shared package.
- **packages/desktop**: Electron app (main, preload, React app).

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| **Desktop**      | Electron (Windows, macOS, Linux)    |
| **UI**           | React 18, React Router DOM          |
| **Language**     | TypeScript 5.x                      |
| **State**        | Zustand, @tanstack/react-query      |
| **Storage**      | better-sqlite3, electron-store      |
| **Book parsing** | epub.js (EPUB), @lingo-reader/mobi-parser (MOBI), TXT |
| **Styling**      | CSS Modules                         |
| **Testing**      | Jest (unit), Playwright (E2E)       |
| **Build**        | Webpack, electron-builder           |

---

## 📦 Supported Platforms

- **Windows**: Windows 10+ (NSIS installer, portable)
- **macOS**: macOS 10.15+ (.app, DMG)
- **Linux**: AppImage, DEB, RPM, pacman, tarball

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install and run

```bash
# From monorepo root (xenolexia-typescript)
cd electron-app

# Install dependencies
npm install

# Run in development
npm run electron:dev

# Or build then run
npm run electron:build
# Then run the built app from packages/desktop/release (or root release/)
```

### Build per platform

```bash
# Build for current OS
npm run electron:build

# From electron-app directory
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

### Test

```bash
# Unit tests (shared + root)
npm test

# Unit tests in shared package only
cd packages/shared && npm test

# E2E / UI tests (Electron)
npm run test:e2e
```

---

## 📁 Project Structure

```
electron-app/
├── app/                   # Electron renderer app
│   ├── electron/          # main.js, preload.js
│   ├── src/               # React app, screens, components
│   └── assets/            # App icon (icon.png)
├── lib/                   # Shared lib (builds from ts-shared-core)
├── e2e/                   # Playwright E2E tests
├── docs/                  # Docs, SMOKE_TEST_CHECKLIST.md
├── package.json
├── PLAN.md
├── REMAINING_TASKS.md
└── README.md
```

---

## 🗺️ Roadmap

- **Electron v1**: Feature-complete for desktop. ✅
  - MVP: Import books, read with word replacement, hover-to-reveal, save to vocabulary, library and settings.
  - Review screen (flashcards), onboarding, export, reader settings, book detail, keyboard shortcuts, window state persistence, Statistics (“reading over time”) chart, system tray (Show/Hide, Quit), E2E tests.
- **Optional polish**: App icons per platform (.icns, .ico), code signing, auto-updater. See `REQUIRES_MANUAL_INPUT.md` (repo root) for manual steps.
- **Later**: More discovery sources.

**Smoke testing:** Use `docs/SMOKE_TEST_CHECKLIST.md` when testing on Windows, macOS, or Linux.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and open a Pull Request

---

## 📄 License

Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) — see [LICENSE](LICENSE).

---

<p align="center">
  <strong>Xenolexia</strong> — Where stories become your teacher 📖✨
</p>
