# Xenolexia — Feature Implementation Status

This document maps the requested feature list to the current implementation in the **Electron (desktop) app**.

---

## 📖 Reading & Text Interaction

| Feature | Status | Notes |
|--------|--------|------|
| **Highlighting and annotations** | ⚠️ Partial | Foreign words are styled (underline, color). Save to vocabulary/favourites from popup. **Not implemented:** user-created text highlights or free-form notes. |
| **Dictionary lookup** | ✅ Done | Tap/hover on replaced words opens TranslationPopup with original, translation, pronunciation; add to favourites; "Don't replace this word" (excluded list in Settings). |
| **Search within text** | 🔲 Planned | **Not implemented.** Find-in-book / search in current chapter or section. |
| **Adjustable text size and fonts** | ✅ Done | Reader settings: font size (12–32), font family (Georgia, Serif, Times New Roman, System), line spacing. |
| **Progress tracking** | ✅ Done | Percentage read, chapter/section, EPUB CFI; reading sessions; streaks; daily goal; XP and achievements (Statistics). |

---

## 🎧 Audio & Multimodal Learning

| Feature | Status | Notes |
|--------|--------|------|
| **Text-to-speech** | ❌ Not implemented | No read-aloud or TTS. |
| **Audio speed control** | ❌ Not implemented | N/A without TTS. |
| **Word-by-word audio** | ❌ Not implemented | No pronunciation audio. |
| **Embedded multimedia** | ⚠️ Partial | EPUB images supported by epub.js. No explicit audio/video handling. |

---

## 🧠 Learning & Personalization

| Feature | Status | Notes |
|--------|--------|------|
| **Flashcards / spaced repetition** | ✅ Done | Review screen with SM-2; getDueForReview, recordReview; vocabulary status (new, learning, review, learned). |
| **Personalized recommendations** | ❌ Not implemented | No "recommended books" or lessons from history. |
| **Quizzes / comprehension checks** | ❌ Not implemented | No in-app quizzes. |
| **Reading goals or streaks** | ✅ Done | Daily goal (Settings); streaks, XP, achievements (Statistics). |

---

## 🌐 Connectivity & Content Management

| Feature | Status | Notes |
|--------|--------|------|
| **Cloud sync** | ❌ Not implemented | All data local (LowDB/electron-store). |
| **Offline mode** | ✅ Done | Books and dictionary cached locally; reading works offline. |
| **Cross-device continuity** | ❌ Not implemented | No sync across devices. |
| **Content libraries** | ✅ Done | Library (import), Book discovery (e.g. Open Library), Vocabulary, Favourites. |

---

## 🎨 User Experience & Interface

| Feature | Status | Notes |
|--------|--------|------|
| **Dark mode / theme customization** | ✅ Done | Reader themes: Light, Sepia, Dark (reader settings). |
| **Minimalist reading modes** | ⚠️ Partial | Header/footer can be toggled; no dedicated "focus" mode. |
| **Adaptive layouts** | ⚠️ Partial | Responsive layout; reader uses available space. |
| **Gamification** | ✅ Done | XP, levels, achievements, streaks, daily progress (Statistics). |

---

## 🔐 User Control & Accessibility

| Feature | Status | Notes |
|--------|--------|------|
| **Bookmarks** | ⚠️ Partial | Progress saves position (EPUB CFI, chapter). **Not implemented:** named bookmarks list, add/remove/jump. |
| **Accessibility tools** | ⚠️ Partial | Font size, line spacing, themes. **Not implemented:** dyslexic-friendly font option, screen reader hints, color adjustments. |
| **Parental controls** | ❌ Not implemented | None. |

---

## 🧩 Conceptually Relevant

| Feature | Status | Notes |
|--------|--------|------|
| **Interactive exercises** | ⚠️ Partial | Review (flashcards) only; no other exercise types. |
| **Translation overlays** | ✅ Done | Word replacement + hover/click to reveal original. |
| **Annotation export** | ⚠️ Partial | Vocabulary export (JSON, CSV, Anki). No export of highlights/notes. |
| **Adaptive difficulty** | ⚠️ Partial | User sets proficiency; no automatic adjustment from performance. |

---

## Summary

- **✅ Done:** Dictionary lookup, text size/fonts, progress tracking, dark/sepia/light themes, flashcards/SRS, reading goals/streaks, gamification, offline, content libraries, translation overlays.
- **⚠️ Partial:** Highlighting (only foreign-word styling), bookmarks (position only), accessibility (no dyslexic font), annotation export (vocabulary only).
- **🔲/❌ Not implemented:** Search in text, TTS/audio, recommendations, quizzes, cloud sync, cross-device, explicit bookmarks list, dyslexic font, parental controls.

Next implementation priorities (from this list): **Search within text**, **Dyslexic-friendly font option**, **Bookmarks (add/list/jump)**.
