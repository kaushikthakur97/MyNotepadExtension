# My Tabbed Notepad — Chrome Extension

**My Tabbed Notepad** is a feature-packed, distraction-free notepad that lives in your browser toolbar. Rich-text editing, instant screenshot capture, find & replace, focus mode, markdown export, themes, and keyboard shortcuts — all saved instantly to local storage.

<br>
<p align="center">
  <img width="48%" alt="Glassmorphism theme" src="https://github.com/user-attachments/assets/2b798221-7ab1-4bc0-b1b0-388a9df43f14"/>
  <img width="48%" alt="Dark theme" src="https://github.com/user-attachments/assets/dc67634e-1215-4951-bf92-48e10395cf4b"/>
</p>

---

## 🎯 Interface Walkthrough

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌──────────SIDEBAR──────────┐  ┌─────────────MAIN CONTENT──────────┐│
│  │  🔍 Search Notes...        │  │  🎨 ⇲ 📷 📤 📋 🗑  [New Note]   ││
│  │  Sort: Newest First    ▾  │  │───────────────────────────────────││
│  │ ┌──────────────────────┐  │  │  Note Title...                    ││
│  │ │ ● 📌 Pinned Note     │  │  │───────────────────────────────────││
│  │ │   📄 Another Note    │  │  │  ↩ ↪ │ 𝐁 𝐼 𝑈̲ S̶ 🔗 ≡ ≡ ≡ ☰ ☰ ││
│  │ │   📄 Meeting Notes   │  │  │  ═══ │ A⁻ A⁰ A⁺ │ 🎨 ✏️ 🗑     ││
│  │ │   ...                │  │  │───────────────────────────────────││
│  │ └──────────────────────┘  │  │                                   ││
│  │                           │  │  Your note content here...        ││
│  │  ♻ Recycle Bin (3)       │  │                                   ││
│  └───────────────────────────┘  │───────────────────────────────────││
│                                 │  🔍 Find:_______ 2 matches ▲▼ Aa ✕││
│                                 │  ⇄ Replace:______ [Replace][All]  ││
│                                 │───────────────────────────────────││
│                                 │ Saved just now │ Words:42│Ch:230  ││
│  └─────────────────────────────┴───────────────────────────────────┘│
│                                                    [Toast messages] │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Feature Reference

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Create new note |
| `Ctrl + S` | Force save current note |
| `Ctrl + D` | Duplicate current note |
| `Ctrl + Shift + D` | Delete current note |
| `Ctrl + E` | Export as `.txt` |
| `Ctrl + Shift + E` | Export as `.md` (Markdown) |
| `Ctrl + F` | Open find bar |
| `Ctrl + H` | Open find & replace bar |
| `Ctrl + Shift + F` | Toggle focus mode |
| `Ctrl + ↑ / ↓` | Navigate between notes |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo (editor) |
| `Escape` | Close find/replace bar |

### 🔍 Find & Replace

Press `Ctrl+F` to reveal the find bar. Live match-counting, case‑sensitive toggle (`Aa`), and **highlight-all** with prev/next navigation. Press `Ctrl+H` to expose the replace row — replace one match or all at once.

```
🔍 quarterly report____  3 matches  ▲ ▼ [Aa] ✕
⇄ Q1 Report____________  [Replace]  [Replace All]
```

- **Orange highlight** = match &nbsp;&nbsp;|&nbsp;&nbsp; **Yellow + outline** = current match
- Highlights auto-clear on close and are never saved into notes.

### 📝 Rich-Text Toolbar

| Group | Buttons |
|-------|---------|
| **Undo/Redo** | `↩` Undo &nbsp; `↪` Redo |
| **Font style** | `𝐁` Bold &nbsp; `𝐼` Italic &nbsp; `U̲` Underline &nbsp; `S̶` Strikethrough |
| **Structure** | `🔗` Link &nbsp; `≡≡≡` Align Left/Center/Right &nbsp; `☰` Bullet List &nbsp; `☰1` Numbered List |
| **Font size** | `A⁻` Decrease &nbsp; `A⁰` Reset &nbsp; `A⁺` Increase |
| **Colour** | `🎨` Text color picker &nbsp; `✏️` Highlight color picker |
| **Clear** | `🗑` Remove all formatting |

### 🎯 Focus Mode

Toggle with `Ctrl+Shift+F` or the `⇲` expand button. Focus mode hides the sidebar and top buttons, centres the editor, and fades chrome until hovered — ideal for deep writing sessions.

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 ⇲                          Note Title...                │
│─────────────────────────────────────────────────────────────│
│  (toolbar fades to 50%)                                      │
│─────────────────────────────────────────────────────────────│
│                                                              │
│           A clean, centred writing surface.                  │
│           No sidebar, no distractions.                       │
│                                                              │
│─────────────────────────────────────────────────────────────│
│  (stats fade to 50%)          Words: 18 | Chars: 102        │
└─────────────────────────────────────────────────────────────┘
```

### 📤 Export Formats

Click the export `📤 ▾` button (or `Ctrl+E`) to choose:

| Format | Shortcut | Description |
|--------|----------|-------------|
| **`.txt`** | `Ctrl + E` | Plain text with `# Title` header |
| **`.md`** | `Ctrl + Shift + E` | Full Markdown — preserves bold, italic, links, lists, images |

### 📋 Duplicate Note

`Ctrl+D` or click the `📋` copy button to clone the active note instantly (appended with `" (Copy)"`).

### 📸 Screenshot Capture

Click `📷` to capture the visible tab. The screenshot is saved as a new note **and** copied to your clipboard for immediate pasting.

### 🏷️ Note Organisation

| Feature | How |
|---------|-----|
| **Pin** | Click `📌` on any note to keep it at the top |
| **Search** | Search across titles **and** content in real-time |
| **Sort** | Newest first, oldest first, or A–Z by title |
| **Recycle Bin** | Deleted notes are recoverable; permanent delete requires confirmation |

### 🎨 Themes (4)

Cycle with `🎨` palette button. Preference is saved:

| Theme | Vibe |
|-------|------|
| **Light** | Clean, high-contrast
| **Dark** | Low-light friendly
| **Slate** | Modern blue-grey
| **Glassmorphism** | Frosted glass with gradient backdrop *(default)* |

### 📊 Live Stats

```
Saved just now       │  Words: 42  |  Characters: 230  |  Lines: 5
```

---

## 📂 File Structure

```
.
├── manifest.json       # Extension config (Manifest V3)
├── popup.html          # HTML layout (750×550 px)
├── style.css           # All styles including 4 theme variable sets
├── script.js           ~880 lines — all logic, state, and features
├── icon16.png          # Toolbar icon (16×16)
├── icon48.png          # Extensions page icon (48×48)
└── README.md
```

---

## 🛠️ Architecture Notes

| Concern | Implementation |
|---------|---------------|
| **State** | Plain JS objects in closure; `notes[]`, `deletedNotes[]`, `currentNoteId`, `currentTheme`, `fontSize`, `isFocusMode` |
| **Persistence** | `chrome.storage.local` — read on load, write on every change |
| **Editor** | `contentEditable` div + `document.execCommand()` for formatting |
| **Themes** | CSS custom properties via `body.{theme}-mode` class swap |
| **Debounce** | 500 ms `setTimeout` before persisting content edits |
| **Find/Replace** | Custom TreeWalker highlights `<mark>` elements; navigated by `data-find-idx`; cleared before every save |
| **Markdown export** | Recursive DOM-to-markdown converter handling bold, italic, links, lists, images |
| **Screenshot** | `chrome.tabs.captureVisibleTab` → `ClipboardItem` for clipboard |
| **Toast** | CSS-animated fixed-position notifications with auto-dismiss |

---

## 🚀 Install for Development

1.  **Clone**: `git clone https://github.com/kaushikthakur97/MyNotepadExtension.git`
2.  Open Chrome → `chrome://extensions`
3.  Enable **Developer mode** (top-right toggle)
4.  Click **Load unpacked** → select the project folder
5.  Click the extension icon in your toolbar to launch

---

## 🔮 Roadmap

- [ ] Note import (`.txt`, `.md`, `.json`)
- [ ] Tabbed multi-note editing
- [ ] Code blocks & blockquotes
- [ ] Cloud sync (Google Drive / Dropbox)
- [ ] Global keyboard shortcut to open popup
