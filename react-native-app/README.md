# Xenolexia 📚🌍

> *Learn languages through the stories you love*

**Xenolexia** is a React Native e-book reader that revolutionizes language learning by seamlessly blending foreign vocabulary into books you read in your native language. Instead of drilling vocabulary in isolation, you encounter new words in rich, familiar contexts; making acquisition natural and memorable.

---

## 🎯 The Concept

Imagine reading your favorite novel in English while learning Spanish, French, German, Japanese, or any of **28+ supported languages**. As you read, words matching your proficiency level appear in your target language instead of English. You understand them from context, and if you need help, a simple tap reveals the original word.

**Example at Beginner Level (English → Spanish):**
> "She walked into the casa and set down her keys."

*Tap "casa" → reveals "house"*

**Example at Intermediate Level (English → German):**
> "The Entscheidung was difficult to make."

*Tap "Entscheidung" → reveals "decision"*

This contextual immersion mimics how we naturally acquire language through meaningful exposure rather than rote memorization.

---

## ✨ Features

### Core Reading Experience
- 📖 **Multi-format Support**: EPUB, FB2, MOBI (DRM-free), and plain text
- 🎨 **Customizable Reader**: Fonts, themes (light/dark/sepia), margins, line spacing
- 📑 **Reading Progress**: Automatic bookmarking and progress sync
- 🔍 **Search**: Full-text search within books

### Language Learning Engine
- 🌐 **28+ Language Pairs**: Any-to-any translation via free APIs (LibreTranslate, MyMemory, Lingva)
  - European: English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Greek, Swedish, Norwegian, Danish, Finnish, Czech, Hungarian, Romanian, Ukrainian, Turkish
  - Asian: Japanese, Chinese, Korean, Thai, Vietnamese, Indonesian, Hindi
  - Middle Eastern: Arabic, Hebrew
- 📊 **Proficiency Levels**: Beginner, Intermediate, Advanced (A1-C2 CEFR mapping)
- 🎚️ **Adjustable Density**: Control how many words appear in the target language (5%-100%)
- 🧠 **Smart Word Selection**: Frequency-based selection using open source word lists:
  - Beginner (A1-A2): Top 500 most common words
  - Intermediate (B1-B2): Words 501-2000
  - Advanced (C1-C2): Words 2001-5000+
- 📶 **Offline Support**: Translations cached locally in SQLite

### Vocabulary Building
- 💡 **Tap-to-Reveal**: Instant translation popup on tap
- ⭐ **Word Saving**: Save words to personal vocabulary lists
- 📈 **Spaced Repetition**: Built-in SRS for saved vocabulary
- 📊 **Progress Analytics**: Track words learned, reading time, improvement over time

### Library Management
- 📂 **Import Books**: From device storage, cloud services, or URLs
- 📚 **Collections**: Organize books by language pair, genre, or custom categories
- ☁️ **Cloud Sync**: Sync library and progress across devices (optional)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         XENOLEXIA APP                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Library    │  │   Reader     │  │   Vocabulary         │  │
│  │   Screen     │  │   Screen     │  │   Screen             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │
│  │                    Navigation Layer                       │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────┴────────────────────────────────┐  │
│  │                    State Management                        │  │
│  │              (Zustand + React Query)                       │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                   │
│  ┌─────────────┬────────────┴───────────┬──────────────────┐   │
│  │  Book       │  Translation           │  Vocabulary       │   │
│  │  Parser     │  Engine                │  Manager          │   │
│  │  Service    │  Service               │  Service          │   │
│  └─────────────┴────────────────────────┴──────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────┴────────────────────────────────┐  │
│  │              Local Storage (SQLite + AsyncStorage)         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.73+ with New Architecture |
| **Language** | TypeScript 5.x |
| **Navigation** | React Navigation 6.x |
| **State** | Zustand + React Query |
| **Storage** | SQLite (react-native-sqlite-storage) + AsyncStorage |
| **Book Parsing** | epub.js, Custom FB2/MOBI parsers |
| **Styling** | NativeWind (TailwindCSS for RN) |
| **Testing** | Jest + React Native Testing Library |
| **CI/CD** | GitHub Actions + Fastlane |

---

## 📱 Supported Platforms

- **iOS**: 13.0+
- **Android**: API 24+ (Android 7.0+)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- React Native CLI
- Xcode 15+ (for iOS)
- Android Studio with SDK 34+ (for Android)
- CocoaPods (iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/xenolexia.git
cd xenolexia

# Install dependencies
npm install

# iOS specific
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Optional: Cloud sync API
API_BASE_URL=https://api.xenolexia.app
API_KEY=your_api_key

# Optional: Analytics
ANALYTICS_ENABLED=false
```

---

## 📁 Project Structure

```
xenolexia-react/
├── src/
│   ├── app/                    # App entry and configuration
│   ├── components/             # Reusable UI components
│   │   ├── common/            # EmptyState, LoadingState, ScreenHeader
│   │   ├── library/           # BookCard, BookCover, ImportBookButton
│   │   ├── reader/            # EPUBRenderer, TranslationPopup, ChapterNavigator
│   │   ├── settings/          # SettingsSlider, SettingsSelect
│   │   ├── ui/                # Text, Button, Card, Input, ThemeSwitcher
│   │   └── vocabulary/        # VocabularyCard, EmptyVocabulary
│   ├── screens/               # Screen components
│   │   ├── Library/           # Book grid/list view
│   │   ├── Reader/            # WebView-based EPUB reader
│   │   ├── Vocabulary/        # Word lists and review
│   │   ├── Statistics/        # Reading analytics
│   │   ├── Settings/          # App configuration
│   │   ├── Profile/           # User settings
│   │   ├── BookDetail/        # Book info and actions
│   │   └── Onboarding/        # First-time setup
│   ├── services/              # Business logic
│   │   ├── BookParser/        # EPUB parsing (EPUBExtractor, TOCParser, MetadataExtractor)
│   │   ├── TranslationEngine/ # Multi-language translation
│   │   │   ├── TranslationAPIService.ts  # LibreTranslate, MyMemory, Lingva
│   │   │   ├── FrequencyListService.ts   # Word frequency rankings
│   │   │   ├── DynamicWordDatabase.ts    # Any language pair support
│   │   │   └── TranslationEngine.ts      # Word replacement algorithm
│   │   ├── ImageService/      # Cover extraction and caching
│   │   ├── ImportService/     # Book file import
│   │   └── StorageService/    # SQLite database
│   │       └── repositories/  # BookRepository, VocabularyRepository, SessionRepository
│   ├── stores/                # Zustand stores (library, reader, vocabulary, statistics)
│   ├── data/                  # Bundled word lists (EN-EL as fallback)
│   ├── hooks/                 # useAsync, useDebounce
│   ├── theme/                 # Light/Dark/Sepia themes, design tokens
│   ├── types/                 # TypeScript definitions (28 languages)
│   └── navigation/            # React Navigation config
├── __tests__/                 # Jest test files
├── PLAN.md                    # Development roadmap
├── WEEK1_PLAN.md             # Week 1 daily breakdown
├── WEEK2_PLAN.md             # Week 2 daily breakdown
└── WEEK3_PLAN.md             # Week 3 daily breakdown
```

---

## 🗺️ Roadmap

### Phase 1: MVP (v0.1) - Core Reading ✅
- [x] EPUB file parsing and rendering
- [x] Basic reader with customization (5 fonts, 3 themes)
- [x] Book import and library management
- [x] Chapter navigation and progress tracking
- [x] Tap-to-reveal translation popup

### Phase 2: Learning Engine (v0.2) ✅
- [x] All proficiency levels (Beginner, Intermediate, Advanced)
- [x] 28+ language pairs via free translation APIs
- [x] Vocabulary density control (5%-100%)
- [x] Word saving to vocabulary lists
- [x] Frequency-based word difficulty ranking

### Phase 3: Smart Features (v0.3) ✅
- [x] SM-2 spaced repetition system (VocabularyRepository)
- [x] Reading statistics (SessionRepository)
- [x] Smart word selection algorithm (Tokenizer + WordReplacer)
- [x] Learning analytics dashboard

### Phase 4: Vocabulary Manager (v0.4) ✅
- [x] Vocabulary screen with search and filters
- [x] Flashcard review with SM-2 grading
- [x] Export to CSV, Anki, JSON
- [x] Word detail modal with editing

### Phase 5: Settings & Onboarding (v0.5) ✅
- [x] 6-step onboarding flow (28 languages)
- [x] Comprehensive settings screens
- [x] Data management (export, import, clear)
- [x] About and legal screens

### Phase 6: Polish & Testing (v0.6) ✅
- [x] Unit tests for services and stores
- [x] Component tests
- [x] Error boundary and fallback UI
- [x] Performance utilities

### Phase 7: Release (v1.0) 🔶 In Progress
- [x] App store metadata
- [x] CI/CD pipelines (Fastlane; GitHub Actions optional — see REQUIRES_MANUAL_INPUT.md)
- [x] Privacy policy and terms
- [x] Session summary on close (reader)
- [ ] App icons (all sizes) — see repo root **REQUIRES_MANUAL_INPUT.md**
- [ ] Screenshots for store listings — see **REQUIRES_MANUAL_INPUT.md**
- [ ] Beta testing (TestFlight / Play internal) — see **docs/BETA_TESTING.md**

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Word frequency lists from [Lexiteria](https://github.com/lexiteria)
- EPUB parsing inspired by [epub.js](https://github.com/futurepress/epub.js)
- Language learning methodology informed by comprehensible input theory

---

<p align="center">
  <strong>Xenolexia</strong> — Where stories become your teacher 📖✨
</p>
