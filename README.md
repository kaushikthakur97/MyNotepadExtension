# My Tabbed Notepad - Chrome Extension

**My Tabbed Notepad** is a lightweight, feature-rich, and effective notepad that runs directly in your browser. Designed for quick access and efficient note-taking, it offers a clean UI with powerful features like a one-click screenshot capture, an advanced rich-text editor, note pinning, a recycle bin, and extensive theme customization. All your notes are saved securely and instantly in your browser's local storage.

_**Screenshots**_
<br>
<br>
<img width="450" height="350" alt="image" src="https://github.com/user-attachments/assets/a57bce5d-1d7f-40db-b97f-8c1b437e859f" />
<img width="450" height="350" alt="image" src="https://github.com/user-attachments/assets/5658c632-39be-4433-bcaa-d56d0bfc53ba" />

## ✨ Key Features

*   **One-Click Screenshot Capture**: Instantly capture the visible area of your current tab. The screenshot is automatically saved into a new note and copied to your clipboard for easy pasting elsewhere.
*   **Advanced Rich Text Editor**: Format your notes with a full-featured toolbar including **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~, hyperlinks, lists, and text alignment. Also includes <font color="#f56565">Text Color</font>, <mark>Highlighting</mark>, and a button to **Clear All Formatting**.
*   **Persistent & Secure Storage**: All notes are automatically saved to `chrome.storage.local`, ensuring your data is safe on your machine and persists between browser sessions.
*   **Powerful Note Organization**:
    *   **Search**: Instantly find notes by searching through both titles and content.
    *   **Sorting**: Arrange your notes by Newest First, Oldest First, or alphabetically by Title (A-Z).
    *   **Pinning**: Keep important notes at the top of your list for easy access.
*   **Safe Deletion with Recycle Bin**: Deleted notes are moved to a recycle bin where you can either restore them with a single click or delete them permanently.
*   **Four Stunning Themes**: Personalize your experience by cycling through four distinct themes: **Light**, **Dark**, a modern **Slate**, and a beautiful **Glassmorphism** effect. Your preference is saved automatically.
*   **Efficient & Modern Workflow**:
    *   **Auto-Save**: Notes are saved automatically with a smart debounce mechanism to prevent excessive saving while you type.
    *   **Helpful Feedback**: Get "toast" notifications for key actions like saving, restoring, or exporting notes.
    *   **Status Indicators**: See when your note was last saved (e.g., "Saved just now") and keep track of word and character counts in real-time.
    *   **Export**: Easily export any note as a `.txt` file.

## 📂 File Structure

The project is organized into the following files:

```
.
├── manifest.json       # Configures the extension (name, permissions, icons)
├── popup.html          # Defines the HTML structure of the notepad interface
├── style.css           # Contains all styling, including theme variables
├── script.js           # The core logic for all features and interactivity
├── README.md           # This readme file
├── icon16.png          # 16x16 pixel icon for the browser toolbar
└── icon48.png          # 48x48 pixel icon used on the extensions page
```

## 🛠️ Technical Deep Dive

*   **State Management**: The application state (including all notes, deleted notes, sort order, and selected theme) is managed in JavaScript variables within the `DOMContentLoaded` event listener.
*   **Data Persistence**: `chrome.storage.local.set()` is used to save the state, and `chrome.storage.local.get()` retrieves it when the extension is opened, ensuring a seamless user experience.
*   **Theming with CSS Variables**: The extension leverages CSS custom properties for its themes. JavaScript cycles through theme names, applying a corresponding class (e.g., `dark-mode`, `glassmorphism-mode`) to the `<body>`. The Glassmorphism theme utilizes the `backdrop-filter` property for a modern blur effect.
*   **Rich Text Editing**: The editor is built on a `contentEditable` `<div>`, with formatting applied via the `document.execCommand()` API for robust, native browser support.
*   **Screenshot & Clipboard API**: The capture feature uses `chrome.tabs.captureVisibleTab` to generate a PNG data URL. This image is then written to the user's clipboard using the modern `navigator.clipboard.write()` API with a `ClipboardItem`.
*   **Debounced Saving**: To optimize performance, user input on the title or editor triggers a `setTimeout` function. This `debounce` mechanism ensures that the `saveData()` function is only called 500ms after the user has paused typing.
*   **Note Export**: The export feature converts a note's HTML content into plain text, creates a `Blob` (a file-like object), and then generates a temporary `<a>` link to trigger a user download of the `.txt` file.

## 🚀 How to Install and Run for Development

To load this extension locally for testing or development:

1.  **Download or Clone**: Download the project files and unzip them, or clone the repository using `git clone`.
2.  **Open Chrome Extensions**: Open your Google Chrome browser and navigate to `chrome://extensions`.
3.  **Enable Developer Mode**: In the top-right corner of the Extensions page, toggle the "Developer mode" switch to the "on" position.
4.  **Load Unpacked**: Click the "Load unpacked" button that appears.
5.  **Select Directory**: In the file selection dialog, navigate to and select the root directory of this project.
6.  **Done!**: The "My Tabbed Notepad" extension will now appear in the extensions list and its icon will be added to your browser toolbar.

## 🔮 Future Improvements

While already a powerful tool, here are some ideas for future development:

*   **Enhance Data Portability**: Implement note import functionality (from JSON or TXT) and add more export format options like Markdown or HTML.
*   **True Tabbed Interface**: Introduce a UI to allow multiple notes to be open at once, truly living up to the extension's name.
*   **Advanced Editor Features**: Integrate more formatting options like code blocks, blockquotes, and different heading levels.
*   **Cloud Sync**: Offer an option to back up or sync notes with cloud services like Google Drive or Dropbox.
*   **Keyboard Shortcuts**: Introduce shortcuts for common actions like creating a new note, deleting a note, or applying text formatting.