# My Tabbed Notepad - Chrome Extension

**My Tabbed Notepad** is a lightweight, feature-rich, and effective notepad that runs directly in your browser. Designed for quick access and efficient note-taking, it offers a clean UI with powerful features like an advanced rich-text editor, note pinning, a recycle bin, and extensive theme customization. All your notes are saved securely in your browser's local storage.

_**Screenshots**_
<br>
<br>
<img width="450" height="350" alt="image" src="https://github.com/user-attachments/assets/34abb7b5-9804-47ad-adf9-bcd1e148f7bf" />
<img width="450" height="350" alt="image" src="https://github.com/user-attachments/assets/68d148c4-c5bf-46ad-aefd-9159b98a1063" />


## ✨ Key Features

*   **Advanced Rich Text Editor**: Format your notes with a full-featured toolbar including **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~, lists, and text alignment. Now also with <font color="#f56565">Text Color</font>, <mark>Highlighting</mark>, and a button to **Clear All Formatting**.
*   **Persistent Storage**: All notes are automatically saved to `chrome.storage.local`, ensuring your data is safe and persists between browser sessions.
*   **Note Organization**:
    *   **Search**: Instantly find notes by searching through titles and content.
    *   **Sorting**: Arrange your notes by Newest First, Oldest First, or alphabetically by Title.
    *   **Pinning**: Keep important notes at the top of your list for easy access.
*   **Recycle Bin**: Deleted notes aren't gone forever. They are moved to a recycle bin where you can either restore them or delete them permanently.
*   **Multiple Themes**: Personalize your experience by cycling through four stunning themes: **Light**, **Dark**, a modern **Slate**, and a beautiful **Glassmorphism** effect. Your choice is saved automatically.
*   **Efficient Workflow**:
    *   **Auto-Save**: Notes are saved automatically with a smart debounce mechanism to prevent excessive saving while you're typing.
    *   **Export & Feedback**: Easily export any note as a `.txt` file and get helpful "toast" notifications for key actions like saving or restoring notes.
    *   **Status Indicators**: See when your note was last saved, and keep track of word and character counts in real-time.
*   **Modern UI**: A clean, two-column layout that makes managing and editing notes intuitive and straightforward.

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
*   **Data Persistence**: `chrome.storage.local.set()` is used to save the state, and `chrome.storage.local.get()` retrieves it when the extension is opened.
*   **Theming with CSS Variables**: The extension leverages CSS custom properties (variables) for all its themes. JavaScript cycles through a list of theme names, applying a corresponding class (e.g., `dark-mode`, `slate-mode`, `glassmorphism-mode`) to the `<body>` element. This makes adding or modifying themes clean and scalable.
*   **Rich Text Editing**: The editor leverages the native `contentEditable` attribute on a `<div>`, and formatting is applied using the `document.execCommand()` API for both standard styles and new features like text/highlight coloring.
*   **Debounced Saving**: To optimize performance, user input triggers a `setTimeout` function. This `debounce` mechanism ensures that the `saveData()` function is only called after the user has paused typing for 500ms.
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
