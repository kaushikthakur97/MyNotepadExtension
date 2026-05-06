document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements (Cached for performance) ---
    const body = document.body;
    const mainContent = document.querySelector('.main-content');
    const noteTitleInput = document.getElementById('noteTitleInput');
    const editorContainer = document.getElementById('editor');
    const notesListContainer = document.getElementById('notesList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const sortOrderSelect = document.getElementById('sortOrderSelect');
    const recycleBinLink = document.getElementById('recycleBinLink');
    const deletedCountSpan = document.getElementById('deletedCount');
    const wordCountSpan = document.getElementById('wordCount');
    const charCountSpan = document.getElementById('charCount');
    const editorWrapper = document.querySelector('.note-editor-container');
    const editorFooter = document.querySelector('.editor-footer');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const lastSavedSpan = document.getElementById('lastSaved');
    const exportNoteBtn = document.getElementById('exportNoteBtn');
    const exportDropdown = document.getElementById('exportDropdown');
    const screenshotBtn = document.getElementById('screenshotBtn');
    const screenshotDropdown = document.getElementById('screenshotDropdown');
    const importNoteBtn = document.getElementById('importNoteBtn');
    const importFileInput = document.getElementById('importFileInput');
    const printNoteBtn = document.getElementById('printNoteBtn');
    const categorySelect = document.getElementById('categorySelect');
    const categoryFilterSelect = document.getElementById('categoryFilterSelect');
    const noteInfoSpan = document.getElementById('noteInfo');
    const codeBlockBtn = document.getElementById('codeBlockBtn');
    const tableBtn = document.getElementById('tableBtn');
    const hrBtn = document.getElementById('hrBtn');
    const spellCheckBtn = document.getElementById('spellCheckBtn');
    const toastContainer = document.getElementById('toastContainer');
    const editorToolbar = document.getElementById('editorToolbar');
    const focusModeBtn = document.getElementById('focusModeBtn');
    const duplicateNoteBtn = document.getElementById('duplicateNoteBtn');
    const findReplaceBar = document.getElementById('findReplaceBar');
    const findInput = document.getElementById('findInput');
    const findMatchCount = document.getElementById('findMatchCount');
    const findPrevBtn = document.getElementById('findPrevBtn');
    const findNextBtn = document.getElementById('findNextBtn');
    const findCloseBtn = document.getElementById('findCloseBtn');
    const findCaseBtn = document.getElementById('findCaseBtn');
    const replaceRow = document.getElementById('replaceRow');
    const replaceInput = document.getElementById('replaceInput');
    const replaceBtn = document.getElementById('replaceBtn');
    const replaceAllBtn = document.getElementById('replaceAllBtn');
    const lineCountSpan = document.getElementById('lineCount');
    const fontSizeDecreaseBtn = document.getElementById('fontSizeDecreaseBtn');
    const fontSizeIncreaseBtn = document.getElementById('fontSizeIncreaseBtn');
    const fontSizeResetBtn = document.getElementById('fontSizeResetBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // New feature DOM elements
    const statsBtn = document.getElementById('statsBtn');
    const templateBtn = document.getElementById('templateBtn');
    const templateDropdown = document.getElementById('templateDropdown');
    const markdownToggleBtn = document.getElementById('markdownToggleBtn');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const bulkCount = document.getElementById('bulkCount');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    const bulkCategorySelect = document.getElementById('bulkCategorySelect');
    const bulkClearBtn = document.getElementById('bulkClearBtn');
    const commandPalette = document.getElementById('commandPalette');
    const cpInput = document.getElementById('cpInput');
    const cpResults = document.getElementById('cpResults');
    const statsDashboard = document.getElementById('statsDashboard');
    const statsCloseBtn = document.getElementById('statsCloseBtn');
    const readingMode = document.getElementById('readingMode');
    const readingBody = document.getElementById('readingBody');
    const readingToc = document.getElementById('readingToc');
    const tocList = document.getElementById('tocList');
    const readingTimeSpan = document.getElementById('readingTime');
    const readingWordCountSpan = document.getElementById('readingWordCount');
    const readingCloseBtn = document.getElementById('readingCloseBtn');

    // --- State Variables ---
    let notes = [];
    let deletedNotes = [];
    let currentNoteId = null;
    let isRecycleBinViewActive = false;
    let currentSortOrder = 'date-desc';
    const themes = ['light', 'dark', 'slate', 'glassmorphism'];
    let currentTheme = 'glassmorphism'; // Default theme is now glassmorphism
    let debounceTimer;
    let isFocusMode = false;
    let findCaseSensitive = false;
    let lastFindQuery = '';
    let fontSize = 16;
    let isMarkdownView = false;
    let selectedNoteIds = new Set();
    let isBulkMode = false;

    // --- TOOLTIP SYSTEM ---
    const customTooltip = document.getElementById('customTooltip');
    const tooltipWhat = customTooltip.querySelector('.tooltip-what');
    const tooltipWhy = customTooltip.querySelector('.tooltip-why');
    let tooltipTimer = null;
    let tooltipTarget = null;

    const TOOLTIPS = {
        themeToggleBtn:        ['Cycle Theme', 'Switch between Light, Dark, Slate, and Glassmorphism — pick what is easiest on your eyes for the time of day.'],
        focusModeBtn:          ['Focus Mode', 'Hides the sidebar and toolbars so you can write without distractions. Toolbars fade in when you hover over them.'],
        screenshotBtn:         ['Screenshot Capture', 'Save what you see on screen as a note. Choose visible area, full page scroll, or download directly as a PNG file.'],
        exportNoteBtn:         ['Export Note', 'Download your note as a .txt (plain text) or .md (Markdown) file to share or back up outside the browser.'],
        importNoteBtn:         ['Import Notes', 'Bring in .txt, .md, or .json files from your computer — great for migrating notes from other apps.'],
        printNoteBtn:          ['Print Note', 'Opens a clean print-ready preview with proper formatting so you can have a physical copy or save as PDF.'],
        duplicateNoteBtn:      ['Duplicate Note', 'Clones the current note instantly — useful for making variations or templates without losing the original.'],
        deleteNoteBtn:         ['Delete Note', 'Moves the current note to the Recycle Bin where you can recover it later if needed. Permanent delete requires confirmation.'],
        newNoteBtn:            ['New Note', 'Starts a fresh blank note. All notes auto-save as you type — no risk of losing work.'],

        undoBtn:               ['Undo', 'Reverts your last edit. Essential safety net when you change your mind or make a mistake (Ctrl+Z).'],
        redoBtn:               ['Redo', 'Re-applies an edit you just undid. Toggle back and forth to compare versions (Ctrl+Y).'],
        boldBtn:               ['Bold', 'Makes text stand out for headings, key terms, or emphasis. Use sparingly for maximum impact.'],
        italicBtn:              ['Italic', 'Adds gentle emphasis — ideal for book titles, foreign words, or subtle stress on a phrase.'],
        underlineBtn:           ['Underline', 'Draws attention to specific text. Traditionally used for links or legal citations.'],
        strikeBtn:              ['Strikethrough', 'Visually marks text as removed or completed while keeping it readable — perfect for to-do lists.'],
        linkBtn:                ['Insert Link', 'Turns selected text into a clickable hyperlink. Great for referencing websites, docs, or email addresses.'],
        alignLeftBtn:           ['Align Left', 'Standard left alignment — the most readable option for continuous prose in Western languages.'],
        alignCenterBtn:         ['Align Center', 'Centres your text — ideal for titles, poems, invitations, or any short decorative text.'],
        alignRightBtn:          ['Align Right', 'Right-aligns text — useful for dates, signatures, or languages that read right-to-left.'],
        ulBtn:                  ['Bulleted List', 'Creates an unordered list. Use when the order does not matter — brainstorming, shopping lists, pros/cons.'],
        olBtn:                  ['Numbered List', 'Creates an ordered list. Use when sequence matters — steps, rankings, or priority items.'],
        codeBlockBtn:           ['Code Block', 'Wraps text in a monospace code block with a distinct background — keeps code snippets readable and separate from prose.'],
        tableBtn:               ['Insert Table', 'Creates an editable grid — perfect for comparing options, tracking data, or laying out structured information.'],
        hrBtn:                  ['Horizontal Rule', 'Inserts a dividing line to separate sections — helps organize long notes into logical chunks.'],
        fontSizeDecreaseBtn:    ['Smaller Text', 'Shrinks the editor font by 1px. Helps fit more content on screen or reduce eye strain on large monitors.'],
        fontSizeResetBtn:       ['Reset Font Size', 'Returns the editor font to the default 16px — your baseline for comfortable reading.'],
        fontSizeIncreaseBtn:    ['Larger Text', 'Enlarges the editor font by 1px. Easier on the eyes during long writing sessions or on high-DPI screens.'],
        foreColorBtn:           ['Text Colour', 'Changes the colour of selected text — use colour to categorize, highlight importance, or add personality.'],
        backColorBtn:           ['Highlight Colour', 'Adds a background colour behind text — like a digital highlighter for marking key passages.'],
        clearFormatBtn:         ['Clear Formatting', 'Strips all bold, colours, sizes, and styles from selected text — restores plain default appearance instantly.'],
        spellCheckBtn:          ['Spell Check', 'Toggles browser spell-checking (red underlines). Turn on for important writing, turn off for code or casual notes.'],

        markdownToggleBtn:      ['Toggle Markdown View', 'Switch between rich WYSIWYG editing and raw Markdown source. Edit visually or hack plain text — same content, two views.'],
        statsBtn:               ['Statistics Dashboard', 'See your writing activity: total words, notes per category, weekly/monthly output, and more.'],
        templateBtn:            ['Templates', 'Skip the blank page. Choose from 6 pre-made templates — meeting notes, journal, tasks, project plan, brainstorm, and research.'],
        searchInput:            ['Search Notes', 'Filters notes by title and content as you type — find any note in seconds, even across hundreds of entries.'],
        sortOrderSelect:        ['Sort Order', 'Changes how notes are ordered in the sidebar. Newest first keeps recent work handy; A–Z helps when browsing by topic.'],
        categoryFilterSelect:   ['Filter by Category', 'Shows only notes tagged with a specific category — a quick way to focus on work, personal, or ideas.'],
        categorySelect:         ['Note Category', 'Assign a colour-coded category to this note. Categories help you group and filter related notes together.'],
        recycleBinLink:         ['Recycle Bin', 'View deleted notes. You can restore them with one click or permanently delete them after confirmation.'],

        findPrevBtn:            ['Previous Match', 'Jumps to the previous occurrence of your search term — cycle backward through results.'],
        findNextBtn:            ['Next Match', 'Jumps to the next occurrence — cycle forward. Press Enter in the search box to go next, Shift+Enter for previous.'],
        findCaseBtn:            ['Case Sensitive', 'When active, "Apple" will not match "apple". Toggle this to narrow or broaden your search results.'],
        findCloseBtn:           ['Close Search', 'Closes the find bar and removes all highlights — press Escape as a shortcut.'],
        replaceBtn:             ['Replace One', 'Replaces only the currently highlighted match. Use this for careful, case-by-case changes.'],
        replaceAllBtn:          ['Replace All', 'Replaces every match in the entire note at once. Safe — you can always Undo if you change your mind.'],
        
        noteTitleInput:         ['Note Title', 'Give your note a descriptive name — titles help you find it later when searching or browsing the list.'],
        editor:                 ['Editor', 'Start typing here. Use the toolbar above for rich formatting. Your content auto-saves as you type.'],
    };

    const showTooltip = (target) => {
        const tip = TOOLTIPS[target.id];
        if (!tip) return;
        tooltipTarget = target;
        tooltipWhat.textContent = tip[0];
        tooltipWhy.textContent = tip[1];
        positionAndShowTooltip(target);
    };

    const hideTooltip = () => {
        tooltipTarget = null;
        customTooltip.classList.remove('show');
        clearTimeout(tooltipTimer);
    };

    const setupTooltips = () => {
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[id]') || e.target.closest('[data-tip]');
            if (!target || target === tooltipTarget) return;
            clearTimeout(tooltipTimer);
            hideTooltip();
            
            if (target.dataset.tip) {
                tooltipTimer = setTimeout(() => {
                    tooltipTarget = target;
                    tooltipWhat.textContent = target.dataset.tip;
                    tooltipWhy.textContent = target.dataset.tipWhy || '';
                    positionAndShowTooltip(target);
                }, 400);
            } else if (TOOLTIPS[target.id]) {
                tooltipTimer = setTimeout(() => showTooltip(target), 400);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[id]') || e.target.closest('[data-tip]');
            if (target && target === tooltipTarget) {
                clearTimeout(tooltipTimer);
                hideTooltip();
            }
        });
        
        document.addEventListener('mouseover', (e) => {
            const opt = e.target.closest('.dropdown-option');
            if (!opt) return;
            const dropdown = opt.closest('.dropdown-menu');
            if (!dropdown) return;
            const triggerBtn = dropdown.previousElementSibling;
            if (triggerBtn && TOOLTIPS[triggerBtn.id]) {
                clearTimeout(tooltipTimer);
                hideTooltip();
                tooltipTimer = setTimeout(() => showTooltip(triggerBtn), 400);
            }
        });
    };

    const positionAndShowTooltip = (target) => {
        const rect = target.getBoundingClientRect();
        let left = rect.left;
        let top = rect.bottom + 6;
        customTooltip.style.display = 'block';
        const ttRect = customTooltip.getBoundingClientRect();
        if (left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
        if (top + ttRect.height > window.innerHeight - 8) top = rect.top - ttRect.height - 6;
        if (left < 4) left = 4;
        customTooltip.style.left = left + 'px';
        customTooltip.style.top = top + 'px';
        customTooltip.classList.add('show');
    };

    // --- DATA MANAGEMENT ---
    const saveData = () => {
        chrome.storage.local.set({ notes, deletedNotes, sortOrder: currentSortOrder, theme: currentTheme });
    };

    const loadData = () => {
        chrome.storage.local.get(['notes', 'deletedNotes', 'sortOrder', 'theme'], (result) => {
            notes = result.notes || [];
            deletedNotes = result.deletedNotes || [];
            currentSortOrder = result.sortOrder || 'date-desc';
            currentTheme = result.theme && themes.includes(result.theme) ? result.theme : 'glassmorphism'; 
            
            applyTheme();
            sortOrderSelect.value = currentSortOrder;

            if (notes.length === 0 && deletedNotes.length === 0) {
                createNewNote(false);
            } else {
                sortNotes();
                if (!notes.find(n => n.id === currentNoteId)) {
                    currentNoteId = notes.length > 0 ? notes[0].id : null;
                }
            }
            renderNotesList();
            updateDeletedCount();
            loadNoteContent();
        });
    };

    // --- THEME MANAGEMENT ---
    const applyTheme = () => {
        body.className = '';
        document.documentElement.classList.remove('has-glass-backdrop');

        body.classList.add(currentTheme + '-mode');
        
        if (currentTheme === 'glassmorphism') {
            document.documentElement.classList.add('has-glass-backdrop');
        }

        const capitalizedTheme = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
        themeToggleBtn.title = `Current Theme: ${capitalizedTheme} (Click to Cycle)`;
    };

    const handleThemeToggle = () => {
        const currentIndex = themes.indexOf(currentTheme);
        currentTheme = themes[(currentIndex + 1) % themes.length];
        applyTheme();
        saveData();
        showToast(`Theme changed to ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`, 'info');
    };

    // --- UI VIEW TOGGLING ---
    const showEditorView = () => {
        if (!isRecycleBinViewActive) return;
        isRecycleBinViewActive = false;
        mainContent.querySelector('.recycle-bin-view')?.remove();
        editorWrapper.style.display = 'flex';
        editorFooter.style.display = 'flex';
        renderNotesList();
        loadNoteContent();
    };

    const showRecycleBinView = () => {
        // If view is already active, just remove the old content to refresh it.
        if (isRecycleBinViewActive) {
            mainContent.querySelector('.recycle-bin-view')?.remove();
        } else {
            // Otherwise, switch to the recycle bin view.
            isRecycleBinViewActive = true;
            currentNoteId = null; 
            editorWrapper.style.display = 'none';
            editorFooter.style.display = 'none';
        }

        // Render the recycle bin content.
        const recycleBinView = document.createElement('div');
        recycleBinView.className = 'recycle-bin-view';

        let html = `
            <div class="recycle-bin-header">
                <h3>Recycle Bin</h3>
                <button class="back-to-notes-btn" data-tip="Back to Notes" data-tip-why="Returns to the main editor view. Your deleted notes will still be here when you come back.">Back to Notes</button>
            </div>`;

        if (deletedNotes.length === 0) {
            html += '<div class="empty-state">The Recycle Bin is empty.</div>';
        } else {
            const sortedDeleted = [...deletedNotes].sort((a, b) => b.lastModified - a.lastModified);
            html += sortedDeleted.map(note => `
                <div class="deleted-note-item" data-id="${note.id}" data-tip="${note.title.trim() || 'Untitled Note'}" data-tip-why="Deleted ${new Date(note.lastModified).toLocaleDateString()}. Restore to bring it back or delete permanently to free up space.">
                    <span class="deleted-note-title">${note.title.trim() || 'Untitled Note'}</span>
                    <div class="deleted-note-actions">
                        <button class="restore-btn" data-tip="Restore" data-tip-why="Moves this note back to your active notes list — nothing is ever truly lost."><i class="fas fa-undo"></i></button>
                        <button class="perm-delete-btn" data-tip="Delete Forever" data-tip-why="Permanently removes this note. This action cannot be undone — confirm before proceeding."><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>`).join('');
        }
        recycleBinView.innerHTML = html;
        mainContent.appendChild(recycleBinView);
        renderNotesList(); // Also refresh the notes list on the side.
    };


    // --- NOTE & BIN OPERATIONS ---
    const createNewNote = (shouldSave = true) => {
        if (isRecycleBinViewActive) showEditorView();
        
        const newNote = { id: Date.now(), title: '', content: '', category: '', isPinned: false, createdAt: Date.now(), lastModified: Date.now() };
        notes.unshift(newNote);
        currentNoteId = newNote.id;
        
        if (shouldSave) saveData();

        searchInput.value = '';
        categoryFilterSelect.value = '';
        renderNotesList();
        loadNoteContent();
        noteTitleInput.focus();
    };

    const deleteCurrentNote = () => {
        if (!currentNoteId) return;
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex === -1) return;
        if (notes.length === 1) { 
            const note = notes[0];
            note.title = ""; note.content = ""; note.isPinned = false; note.lastModified = Date.now();
            saveData();
            loadNoteContent();
            renderNotesList();
            return;
        }

        const [deletedNote] = notes.splice(noteIndex, 1);
        deletedNote.lastModified = Date.now(); 
        deletedNotes.unshift(deletedNote);
        
        if (notes.length > 0) {
            const newIndex = Math.min(noteIndex, notes.length - 1);
            currentNoteId = notes[newIndex].id;
        } else {
            currentNoteId = null;
        }

        saveData();
        updateDeletedCount();
        renderNotesList();
        loadNoteContent();
    };
    
    const handlePaste = (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    // --- SCREENSHOT FEATURE ---
    const captureAndSaveScreenshot = async (mode = 'visible') => {
        if (mode === 'fullpage') {
            await captureFullPage();
            return;
        }
        if (mode === 'save') {
            await saveScreenshotAsFile();
            return;
        }
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            
            const timestamp = Date.now();
            const newNote = {
                id: timestamp,
                title: `Screenshot - ${new Date(timestamp).toLocaleString()}`,
                content: `<img src="${dataUrl}" alt="Screen Capture"/>`,
                category: '',
                isPinned: false,
                createdAt: timestamp,
                lastModified: timestamp
            };
            
            notes.unshift(newNote);
            currentNoteId = newNote.id;
            saveData();

            if (isRecycleBinViewActive) {
                showEditorView();
            } else {
                renderNotesList();
                loadNoteContent();
            }

            await copyImageToClipboard(dataUrl);
            showToast('Screenshot saved & copied!', 'success');
        } catch (error) {
            console.error("Screenshot Error:", error);
            showToast('Failed to capture screen. Try again.', 'error');
        }
    };

    const saveScreenshotAsFile = async () => {
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `screenshot-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Screenshot saved as file!', 'success');
        } catch (error) {
            console.error("Screenshot Save Error:", error);
            showToast('Failed to save screenshot.', 'error');
        }
    };

    const captureFullPage = async () => {
        try {
            showToast('Capturing full page...', 'info');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const dimResult = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => ({
                    pageWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth),
                    pageHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight),
                    viewHeight: window.innerHeight
                })
            });
            
            const { pageWidth, pageHeight, viewHeight } = dimResult[0].result;
            const chunks = [];
            let scrollY = 0;
            
            while (scrollY < pageHeight) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (y) => { window.scrollTo(0, y); },
                    args: [scrollY]
                });
                
                await new Promise(r => setTimeout(r, 300));
                
                const dataUrl = await new Promise((resolve, reject) => {
                    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (result) => {
                        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                        else resolve(result);
                    });
                });
                
                chunks.push({ dataUrl, y: scrollY });
                scrollY += viewHeight;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = pageWidth;
            canvas.height = pageHeight;
            const ctx = canvas.getContext('2d');
            
            await Promise.all(chunks.map(chunk => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const scale = pageWidth / img.width;
                        ctx.drawImage(img, 0, chunk.y * scale, pageWidth, viewHeight * scale);
                        resolve();
                    };
                    img.src = chunk.dataUrl;
                });
            }));
            
            // Restore scroll position
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => { window.scrollTo(0, 0); }
            });
            
            const dataUrl = canvas.toDataURL('image/png');
            const timestamp = Date.now();
            const newNote = {
                id: timestamp,
                title: `Full Page - ${new Date(timestamp).toLocaleString()}`,
                content: `<img src="${dataUrl}" alt="Full Page Capture"/>`,
                category: '',
                isPinned: false,
                createdAt: timestamp,
                lastModified: timestamp
            };
            notes.unshift(newNote);
            currentNoteId = newNote.id;
            saveData();
            if (isRecycleBinViewActive) showEditorView();
            else { renderNotesList(); loadNoteContent(); }
            copyImageToClipboard(dataUrl);
            showToast('Full page captured!', 'success');
        } catch (error) {
            console.error("Full Page Error:", error);
            showToast('Full page capture failed. Try visible tab.', 'error');
            await chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => { window.scrollTo(0, 0); }
                });
            });
        }
    };
    
    const copyImageToClipboard = async (dataUrl) => {
        try {
            const blob = await (await fetch(dataUrl)).blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
        } catch(err) {
            console.error('Failed to copy image to clipboard:', err);
        }
    };

    const togglePin = (noteId) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            note.isPinned = !note.isPinned;
            note.lastModified = Date.now();
            saveData();
            renderNotesList();
        }
    };

    const exportCurrentNote = () => {
        if (!currentNoteId) {
            showToast('Select a note to export.', 'error');
            return;
        }
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        const blobContent = `# ${note.title}\n\n${textContent}`;
        const blob = new Blob([blobContent], { type: 'text/plain;charset=utf-8' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const fileName = (note.title.trim() || 'untitled_note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Note exported as .txt', 'success');
    };

    const exportCurrentNoteAsMarkdown = () => {
        if (!currentNoteId) {
            showToast('Select a note to export.', 'error');
            return;
        }
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        
        let md = `# ${note.title}\n\n`;
        const convertNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                md += node.textContent;
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const tag = node.tagName.toLowerCase();
            const children = Array.from(node.childNodes);
            switch (tag) {
                case 'br': md += '\n'; break;
                case 'p': case 'div': children.forEach(convertNode); md += '\n\n'; break;
                case 'b': case 'strong': md += '**'; children.forEach(convertNode); md += '**'; break;
                case 'i': case 'em': md += '*'; children.forEach(convertNode); md += '*'; break;
                case 'u': case 'ins': md += '<u>'; children.forEach(convertNode); md += '</u>'; break;
                case 's': case 'strike': case 'del': md += '~~'; children.forEach(convertNode); md += '~~'; break;
                case 'a': md += '['; children.forEach(convertNode); md += `](${node.href || ''})`; break;
                case 'ul': md += '\n'; children.forEach(convertNode); md += '\n'; break;
                case 'ol': md += '\n'; children.forEach((c, i) => { md += `${i + 1}. `; convertNode(c); md += '\n'; }); break;
                case 'li': children.forEach(convertNode); md += '\n'; break;
                case 'img': md += `![${node.alt || 'image'}](${node.src})`; break;
                case 'mark': children.forEach(convertNode); break;
                case 'span': children.forEach(convertNode); break;
                case 'h1': md += '# '; children.forEach(convertNode); md += '\n\n'; break;
                case 'h2': md += '## '; children.forEach(convertNode); md += '\n\n'; break;
                case 'h3': md += '### '; children.forEach(convertNode); md += '\n\n'; break;
                default: children.forEach(convertNode); break;
            }
        };
        Array.from(tempDiv.childNodes).forEach(convertNode);
        
        const blob = new Blob([md.trim()], { type: 'text/markdown;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const fileName = (note.title.trim() || 'untitled_note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Note exported as .md', 'success');
    };

    const duplicateNote = () => {
        if (!currentNoteId) {
            showToast('Select a note to duplicate.', 'error');
            return;
        }
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return;
        const newNote = {
            id: Date.now(),
            title: `${note.title} (Copy)`,
            content: note.content,
            category: note.category,
            isPinned: false,
            createdAt: Date.now(),
            lastModified: Date.now()
        };
        notes.unshift(newNote);
        currentNoteId = newNote.id;
        saveData();
        renderNotesList();
        loadNoteContent();
        showToast('Note duplicated!', 'success');
    };

    const toggleFocusMode = () => {
        isFocusMode = !isFocusMode;
        body.classList.toggle('focus-mode', isFocusMode);
        focusModeBtn.classList.toggle('active', isFocusMode);
        focusModeBtn.title = isFocusMode ? 'Exit Focus Mode (Ctrl+Shift+F)' : 'Focus Mode (Ctrl+Shift+F)';
        showToast(isFocusMode ? 'Focus mode ON' : 'Focus mode OFF', 'info');
        // Force editor to resize properly
        setTimeout(() => editorContainer.focus(), 50);
    };

    const navigateNotes = (direction) => {
        if (isRecycleBinViewActive) return;
        const visibleNotes = notes.filter(n => {
            const q = searchInput.value.toLowerCase().trim();
            if (!q) return true;
            return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        });
        if (visibleNotes.length === 0) return;
        const currentIdx = visibleNotes.findIndex(n => n.id === currentNoteId);
        let newIdx;
        if (direction === 'up') {
            newIdx = currentIdx <= 0 ? visibleNotes.length - 1 : currentIdx - 1;
        } else {
            newIdx = currentIdx >= visibleNotes.length - 1 ? 0 : currentIdx + 1;
        }
        currentNoteId = visibleNotes[newIdx].id;
        renderNotesList();
        loadNoteContent();
    };

    const sortNotes = () => {
        notes.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            
            switch (currentSortOrder) {
                case 'title-az':
                    return a.title.localeCompare(b.title);
                case 'date-asc':
                    return a.lastModified - b.lastModified; // FIX: Was a-a, now a-b
                case 'date-desc':
                default:
                    return b.lastModified - a.lastModified;
            }
        });
    };

    // --- UI RENDERING & CONTENT UPDATES ---
    const renderNotesList = () => {
        sortNotes();
        const fragment = document.createDocumentFragment();
        const searchQuery = searchInput.value.toLowerCase().trim();
        const categoryFilter = categoryFilterSelect.value;
        
        let filteredNotes = notes;
        if (searchQuery) {
            filteredNotes = filteredNotes.filter(n => 
                n.title.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery));
        }
        if (categoryFilter) {
            filteredNotes = filteredNotes.filter(n => n.category === categoryFilter);
        }

        filteredNotes.forEach(note => {
            const item = document.createElement('div');
            item.className = `note-item ${note.isPinned ? 'pinned' : ''} ${note.id === currentNoteId && !isRecycleBinViewActive ? 'active' : ''}`;
            item.dataset.id = note.id;
            const displayTitle = note.title.trim() || note.content.replace(/<[^>]*>/g, ' ').trim().substring(0, 40) || 'Untitled Note';
            const categoryDot = note.category ? `<span class="note-category ${note.category}"></span>` : '';
            const preview = note.content.replace(/<[^>]*>/g, ' ').trim().substring(0, 80);
            item.dataset.tip = note.title.trim() || 'Untitled Note';
            item.dataset.tipWhy = preview || 'Click to open this note and start editing.';
            const checked = selectedNoteIds.has(note.id) ? 'checked' : '';

            item.innerHTML = `${isBulkMode ? `<input type="checkbox" class="bulk-checkbox" ${checked}>` : ''}${categoryDot}<i class="fa-solid fa-thumbtack pin-icon" title="${note.isPinned ? 'Unpin — keep at top of list' : 'Pin — keep at top of list'}"></i><span class="note-title">${displayTitle}</span>`;
            fragment.appendChild(item);
        });

        notesListContainer.innerHTML = '';
        if (notes.length > 0 && filteredNotes.length === 0) {
            notesListContainer.innerHTML = `<div class="empty-state">No matches found.</div>`;
        } else {
            notesListContainer.appendChild(fragment);
        }
    };

    const loadNoteContent = () => {
        if (isRecycleBinViewActive) return;
        const note = notes.find(n => n.id === currentNoteId);
        const isEditorEnabled = !!note;

        noteTitleInput.disabled = !isEditorEnabled;
        editorContainer.setAttribute('contenteditable', isEditorEnabled.toString());
        deleteNoteBtn.disabled = !isEditorEnabled;
        exportNoteBtn.disabled = !isEditorEnabled;
        duplicateNoteBtn.disabled = !isEditorEnabled;
        printNoteBtn.disabled = !isEditorEnabled;
        categorySelect.disabled = !isEditorEnabled;
        [...editorToolbar.getElementsByTagName('button')].forEach(b => b.disabled = !isEditorEnabled);

        if (note) {
            noteTitleInput.value = note.title;
            editorContainer.innerHTML = note.content;
            categorySelect.value = note.category || '';
            updateNoteInfo(note);
            updateLastSavedDisplay(note.lastModified);
            // Reset markdown view state when loading a new note
            if (isMarkdownView) {
                isMarkdownView = false;
                editorContainer.classList.remove('markdown-source');
                markdownToggleBtn.classList.remove('markdown-toggle-active');
            }
        } else {
            noteTitleInput.value = 'Select a Note';
            editorContainer.innerHTML = '<div class="empty-state">Select a note from the list or create a new one!</div>';
            categorySelect.value = '';
            noteInfoSpan.textContent = '';
            updateLastSavedDisplay(null);
        }
        updateWordCount();
        if (findReplaceBar.style.display === 'block' && findInput.value) {
            highlightFindMatches(findInput.value);
        }
    };

    const handleNoteUpdate = () => {
        if (!currentNoteId || isRecycleBinViewActive) return;
        updateWordCount();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) return;

            const titleChanged = note.title !== noteTitleInput.value;
            const contentChanged = note.content !== editorContainer.innerHTML;
            const categoryChanged = note.category !== (categorySelect.value || '');

            if (titleChanged || contentChanged || categoryChanged) {
                clearFindHighlights();
                note.title = noteTitleInput.value;
                note.content = editorContainer.innerHTML;
                note.category = categorySelect.value || '';
                note.lastModified = Date.now();
                saveData();
                renderNotesList();
                updateLastSavedDisplay(note.lastModified);
                if (findReplaceBar.style.display === 'block' && findInput.value) {
                    highlightFindMatches(findInput.value);
                }
            }
        }, 500);
    };
    
    const updateLastSavedDisplay = (timestamp) => {
        if (!timestamp) { lastSavedSpan.textContent = ''; return; }
        const now = new Date();
        const savedDate = new Date(timestamp);
        const diffSeconds = Math.round((now - savedDate) / 1000);
        
        if (diffSeconds < 5) { lastSavedSpan.textContent = 'Saved just now'; }
        else if (diffSeconds < 60) { lastSavedSpan.textContent = `Saved ${diffSeconds}s ago`; }
        else {
            const diffMinutes = Math.round(diffSeconds / 60);
            if (diffMinutes < 60) { lastSavedSpan.textContent = `Saved ${diffMinutes}m ago`; }
            else { lastSavedSpan.textContent = `Saved: ${savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`; }
        }
    };
    
    const updateNoteInfo = (note) => {
        if (!note) { noteInfoSpan.textContent = ''; return; }
        const created = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '—';
        const modified = new Date(note.lastModified).toLocaleDateString();
        noteInfoSpan.textContent = `Created: ${created}  ·  Modified: ${modified}`;
    };
    
    const updateWordCount = () => {
        const text = editorContainer.innerText;
        charCountSpan.textContent = `Characters: ${text.length}`;
        wordCountSpan.textContent = `Words: ${text.trim() === '' ? 0 : text.trim().split(/\s+/).length}`;
        lineCountSpan.textContent = `Lines: ${text === '' ? 0 : text.split('\n').length}`;
    };

    const updateDeletedCount = () => { deletedCountSpan.textContent = deletedNotes.length; };

    // --- FIND & REPLACE ---
    const clearFindHighlights = () => {
        editorContainer.querySelectorAll('.find-highlight, .find-highlight-current').forEach(el => {
            const parent = el.parentNode;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        });
    };

    const highlightFindMatches = (query) => {
        clearFindHighlights();
        if (!query) { findMatchCount.textContent = ''; return; }
        
        const regexFlags = findCaseSensitive ? 'g' : 'gi';
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), regexFlags);
        
        let matchIndex = 0;
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const match = text.match(regex);
                if (match) {
                    const frag = document.createDocumentFragment();
                    let lastIdx = 0;
                    let m;
                    const localRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), regexFlags);
                    while ((m = localRegex.exec(text)) !== null) {
                        if (m.index > lastIdx) {
                            frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
                        }
                        const mark = document.createElement('mark');
                        mark.className = 'find-highlight';
                        mark.dataset.findIdx = matchIndex++;
                        mark.textContent = m[0];
                        frag.appendChild(mark);
                        lastIdx = m.index + m[0].length;
                    }
                    if (lastIdx < text.length) {
                        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
                    }
                    node.parentNode.replaceChild(frag, node);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'MARK' && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                Array.from(node.childNodes).forEach(walk);
            }
        };
        
        editorContainer.querySelectorAll('.find-highlight, .find-highlight-current').forEach(el => {
            const parent = el.parentNode;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        });
        
        Array.from(editorContainer.childNodes).forEach(walk);
        
        const totalMatches = editorContainer.querySelectorAll('.find-highlight').length;
        findMatchCount.textContent = totalMatches > 0 ? `${totalMatches} match${totalMatches > 1 ? 'es' : ''}` : 'No matches';
    };

    const navigateFindMatch = (direction) => {
        const marks = editorContainer.querySelectorAll('.find-highlight');
        if (marks.length === 0) return;
        
        const currentMark = editorContainer.querySelector('.find-highlight-current');
        let currentIdx = -1;
        if (currentMark && currentMark.dataset.findIdx) {
            currentIdx = parseInt(currentMark.dataset.findIdx);
        }
        
        let newIdx;
        if (direction === 'next') {
            newIdx = currentIdx < marks.length - 1 ? currentIdx + 1 : 0;
        } else {
            newIdx = currentIdx > 0 ? currentIdx - 1 : marks.length - 1;
        }
        
        marks.forEach(m => m.classList.remove('find-highlight-current'));
        const target = editorContainer.querySelector(`.find-highlight[data-find-idx="${newIdx}"]`);
        if (target) {
            target.classList.add('find-highlight-current');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const replaceCurrentMatch = () => {
        const currentMark = editorContainer.querySelector('.find-highlight-current');
        if (currentMark) {
            const replacement = replaceInput.value;
            const textNode = document.createTextNode(replacement);
            currentMark.parentNode.replaceChild(textNode, currentMark);
            handleNoteUpdate();
            highlightFindMatches(findInput.value);
        }
    };

    const replaceAllMatches = () => {
        const marks = editorContainer.querySelectorAll('.find-highlight');
        if (marks.length === 0) return;
        const replacement = replaceInput.value;
        marks.forEach(mark => {
            const textNode = document.createTextNode(replacement);
            mark.parentNode.replaceChild(textNode, mark);
        });
        handleNoteUpdate();
        findMatchCount.textContent = 'All replaced';
        setTimeout(() => highlightFindMatches(findInput.value), 300);
    };

    const openFindBar = (showReplace = false) => {
        findReplaceBar.style.display = 'block';
        replaceRow.style.display = showReplace ? 'flex' : 'none';
        findInput.focus();
        findInput.select();
        if (findInput.value) highlightFindMatches(findInput.value);
    };

    const closeFindBar = () => {
        findReplaceBar.style.display = 'none';
        clearFindHighlights();
        findMatchCount.textContent = '';
        editorContainer.focus();
    };

    // --- FONT SIZE ---
    const changeFontSize = (delta) => {
        fontSize = Math.max(10, Math.min(32, fontSize + delta));
        editorContainer.style.fontSize = fontSize + 'px';
    };

    const resetFontSize = () => {
        fontSize = 16;
        editorContainer.style.fontSize = fontSize + 'px';
        showToast('Font size reset', 'info');
    };

    // --- IMPORT NOTES ---
    const importNotes = (files) => {
        if (!files || files.length === 0) return;
        let imported = 0;
        const processFile = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target.result;
                    const ext = file.name.split('.').pop().toLowerCase();
                    let title = file.name.replace(/\.[^.]+$/, '');
                    let content = '';

                    if (ext === 'json') {
                        try {
                            const data = JSON.parse(text);
                            if (Array.isArray(data)) {
                                data.forEach(n => {
                                    notes.unshift({
                                        id: Date.now() + Math.random(),
                                        title: n.title || 'Imported Note',
                                        content: n.content || '',
                                        category: n.category || '',
                                        isPinned: false,
                                        createdAt: n.createdAt || Date.now(),
                                        lastModified: Date.now()
                                    });
                                    imported++;
                                });
                                resolve(); return;
                            }
                        } catch (ex) { /* fall through to plain text */ }
                    }
                    
                    if (ext === 'md') {
                        content = text;
                    } else {
                        content = text.replace(/\n/g, '<br>');
                    }

                    notes.unshift({
                        id: Date.now() + Math.random(),
                        title,
                        content,
                        category: '',
                        isPinned: false,
                        createdAt: Date.now(),
                        lastModified: Date.now()
                    });
                    imported++;
                    resolve();
                };
                reader.readAsText(file);
            });
        };

        Promise.all(Array.from(files).map(processFile)).then(() => {
            if (imported > 0) {
                saveData();
                currentNoteId = notes[0].id;
                renderNotesList();
                loadNoteContent();
                showToast(`Imported ${imported} note${imported > 1 ? 's' : ''}!`, 'success');
            } else {
                showToast('No valid notes found.', 'error');
            }
        });
    };

    // --- PRINT NOTE ---
    const printCurrentNote = () => {
        if (!currentNoteId) {
            showToast('Select a note to print.', 'error');
            return;
        }
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html><head><title>${note.title || 'Untitled'}</title>
            <style>
                body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #222; }
                h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; }
                img { max-width: 100%; }
                pre, code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: Consolas, monospace; }
                pre { padding: 12px; overflow-x: auto; }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #ddd; padding: 8px; }
                hr { border: none; border-top: 2px solid #ddd; margin: 20px 0; }
                @media print { body { margin: 0; } }
            </style></head>
            <body>
                <h1>${note.title || 'Untitled Note'}</h1>
                ${note.content}
            </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    // --- SPELL CHECK ---
    const toggleSpellCheck = () => {
        const current = editorContainer.getAttribute('spellcheck') !== 'false';
        const enabled = !current;
        editorContainer.setAttribute('spellcheck', enabled.toString());
        spellCheckBtn.classList.toggle('active', enabled);
        showToast(enabled ? 'Spell check ON' : 'Spell check OFF', 'info');
    };

    // ================================================================
    // TEMPLATES
    // ================================================================
    const TEMPLATES = {
        meeting: {
            title: 'Meeting Notes',
            content: `<h2>📋 Meeting: [Topic]</h2>
<p><b>Date:</b> ${new Date().toLocaleDateString()}</p>
<p><b>Attendees:</b> </p>
<p><b>Agenda:</b></p>
<ul><li></li><li></li></ul>
<hr>
<h3>Notes</h3>
<p></p>
<h3>Action Items</h3>
<ul><li>[ ] Task 1 — <i>Owner</i></li><li>[ ] Task 2 — <i>Owner</i></li></ul>
<h3>Next Meeting</h3>
<p>Date: </p>`
        },
        journal: {
            title: `Journal — ${new Date().toLocaleDateString()}`,
            content: `<h2>📔 Daily Journal</h2>
<p><b>${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</b></p>
<hr>
<h3>Morning Reflection</h3>
<p>Today I'm grateful for...</p>
<p>My top priority is...</p>
<h3>What Happened Today</h3>
<p></p>
<h3>Evening Reflection</h3>
<p>What went well:</p><ul><li></li></ul>
<p>What I'd improve:</p><ul><li></li></ul>`
        },
        tasks: {
            title: 'Task List',
            content: `<h2>✅ Tasks</h2>
<p><b>Priority:</b> 🔴 High</p>
<ul><li>[ ] </li><li>[ ] </li></ul>
<p><b>Priority:</b> 🟡 Medium</p>
<ul><li>[ ] </li><li>[ ] </li></ul>
<p><b>Priority:</b> 🟢 Low</p>
<ul><li>[ ] </li><li>[ ] </li></ul>
<hr><p><i>Last updated: ${new Date().toLocaleString()}</i></p>`
        },
        project: {
            title: 'Project Plan',
            content: `<h2>🚀 Project: [Name]</h2>
<p><b>Goal:</b> </p>
<p><b>Timeline:</b> Start — End</p>
<hr>
<h3>Milestones</h3>
<ol><li><b>[Milestone 1]</b> — Due: <ul><li>Subtask</li><li>Subtask</li></ul></li>
<li><b>[Milestone 2]</b> — Due: <ul><li>Subtask</li></ul></li></ol>
<h3>Risks & Dependencies</h3>
<ul><li></li></ul>
<h3>Notes</h3>
<p></p>`
        },
        brainstorm: {
            title: 'Brainstorming Session',
            content: `<h2>💡 Brainstorm: [Topic]</h2>
<p><b>Goal:</b> Generate ideas for...</p>
<hr>
<h3>Ideas (no filter)</h3>
<ul><li></li><li></li><li></li><li></li><li></li></ul>
<h3>Top Picks</h3>
<ol><li></li><li></li><li></li></ol>
<h3>Next Steps</h3>
<ul><li>[ ] Research feasibility</li><li>[ ] Prototype top idea</li></ul>`
        },
        research: {
            title: 'Research Notes',
            content: `<h2>🔍 Research: [Topic]</h2>
<p><b>Question:</b> </p>
<p><b>Sources:</b></p>
<ol><li><a href="#">[Source Title]</a> — Key takeaway</li><li><a href="#">[Source Title]</a> — Key takeaway</li></ol>
<hr>
<h3>Key Findings</h3>
<ul><li></li><li></li></ul>
<h3>Quotes & Excerpts</h3>
<blockquote><p></p></blockquote>
<h3>Open Questions</h3>
<ul><li></li></ul>`
        }
    };

    const applyTemplate = (templateName) => {
        if (isRecycleBinViewActive) showEditorView();
        const tpl = TEMPLATES[templateName];
        if (!tpl) return;
        
        const newNote = {
            id: Date.now(),
            title: tpl.title,
            content: tpl.content,
            category: templateName === 'tasks' ? 'todo' : templateName === 'brainstorm' ? 'ideas' : templateName === 'research' ? 'reference' : '',
            isPinned: false,
            createdAt: Date.now(),
            lastModified: Date.now()
        };
        notes.unshift(newNote);
        currentNoteId = newNote.id;
        saveData();
        categoryFilterSelect.value = '';
        renderNotesList();
        loadNoteContent();
        showToast(`"${tpl.title}" template applied!`, 'success');
        setTimeout(() => editorContainer.focus(), 100);
    };

    // ================================================================
    // COMMAND PALETTE
    // ================================================================
    const COMMANDS = [
        { name: 'New Note', icon: 'fa-plus', desc: 'Create a blank note', keys: ['Ctrl+N'], action: () => createNewNote() },
        { name: 'Delete Note', icon: 'fa-trash', desc: 'Move current note to recycle bin', keys: ['Ctrl+Shift+D'], action: deleteCurrentNote },
        { name: 'Duplicate Note', icon: 'fa-copy', desc: 'Clone the current note', keys: ['Ctrl+D'], action: duplicateNote },
        { name: 'Export as .txt', icon: 'fa-file-alt', desc: 'Download note as plain text file', keys: ['Ctrl+E'], action: exportCurrentNote },
        { name: 'Export as Markdown', icon: 'fa-markdown', desc: 'Download note as .md file', keys: ['Ctrl+Shift+E'], action: exportCurrentNoteAsMarkdown },
        { name: 'Import Notes', icon: 'fa-file-import', desc: 'Import .txt, .md, or .json files', action: () => importFileInput.click() },
        { name: 'Print Note', icon: 'fa-print', desc: 'Open print-ready preview', keys: ['Ctrl+P'], action: printCurrentNote },
        { name: 'Find in Note', icon: 'fa-search', desc: 'Search within the current note', keys: ['Ctrl+F'], action: () => openFindBar() },
        { name: 'Find & Replace', icon: 'fa-exchange-alt', desc: 'Search and replace text in note', keys: ['Ctrl+H'], action: () => openFindBar(true) },
        { name: 'Toggle Focus Mode', icon: 'fa-expand', desc: 'Hide distractions for deep writing', keys: ['Ctrl+Shift+F'], action: toggleFocusMode },
        { name: 'Toggle Markdown View', icon: 'fa-code', desc: 'Switch between WYSIWYG and raw markdown', action: toggleMarkdownView },
        { name: 'Reading Mode', icon: 'fa-book-open', desc: 'Read note with clean typography and TOC', action: openReadingMode },
        { name: 'Statistics Dashboard', icon: 'fa-chart-bar', desc: 'View writing stats and category breakdown', action: openStats },
        { name: 'Capture Visible Tab', icon: 'fa-camera', desc: 'Screenshot visible area as a note', action: () => captureAndSaveScreenshot('visible') },
        { name: 'Capture Full Page', icon: 'fa-images', desc: 'Screenshot entire scrollable page', action: () => captureAndSaveScreenshot('fullpage') },
        { name: 'Save Screenshot as File', icon: 'fa-download', desc: 'Download screenshot as PNG file', action: () => captureAndSaveScreenshot('save') },
        { name: 'Apply Meeting Template', icon: 'fa-clipboard-list', desc: 'Pre-formatted meeting notes structure', action: () => applyTemplate('meeting') },
        { name: 'Apply Journal Template', icon: 'fa-book', desc: 'Daily reflection and gratitude journal', action: () => applyTemplate('journal') },
        { name: 'Apply Task Template', icon: 'fa-check-square', desc: 'Priority-based to-do list', action: () => applyTemplate('tasks') },
        { name: 'Apply Project Template', icon: 'fa-rocket', desc: 'Project plan with milestones', action: () => applyTemplate('project') },
        { name: 'Apply Brainstorm Template', icon: 'fa-lightbulb', desc: 'Free-form ideation session', action: () => applyTemplate('brainstorm') },
        { name: 'Apply Research Template', icon: 'fa-microscope', desc: 'Structured research notes with sources', action: () => applyTemplate('research') },
        { name: 'Recycle Bin', icon: 'fa-recycle', desc: 'View and recover deleted notes', action: () => showRecycleBinView() },
        { name: 'Cycle Theme', icon: 'fa-palette', desc: 'Switch between Light, Dark, Slate, Glass', action: handleThemeToggle },
        { name: 'Toggle Spell Check', icon: 'fa-spell-check', desc: 'Enable or disable browser spell checking', action: toggleSpellCheck },
        { name: 'Undo', icon: 'fa-undo', desc: 'Revert last edit', keys: ['Ctrl+Z'], action: () => { document.execCommand('undo'); editorContainer.focus(); } },
        { name: 'Redo', icon: 'fa-redo', desc: 'Re-apply undone edit', keys: ['Ctrl+Y'], action: () => { document.execCommand('redo'); editorContainer.focus(); } },
    ];

    let cpFiltered = [...COMMANDS];
    let cpActiveIndex = 0;

    const openCommandPalette = () => {
        cpFiltered = [...COMMANDS];
        cpActiveIndex = 0;
        cpInput.value = '';
        commandPalette.style.display = 'flex';
        cpInput.focus();
        renderCpResults();
    };

    const closeCommandPalette = () => {
        commandPalette.style.display = 'none';
    };

    const renderCpResults = () => {
        cpResults.innerHTML = '';
        if (cpFiltered.length === 0) {
            cpResults.innerHTML = '<div class="cp-empty">No matching commands</div>';
            return;
        }
        cpFiltered.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = `cp-item${idx === cpActiveIndex ? ' active' : ''}`;
            item.innerHTML = `
                <div>
                    <div class="cp-item-name"><i class="fas ${cmd.icon}"></i>${cmd.name}</div>
                    <div class="cp-item-desc">${cmd.desc}</div>
                </div>
                ${cmd.keys ? cmd.keys.map(k => `<kbd>${k}</kbd>`).join('') : ''}
            `;
            item.addEventListener('click', () => { closeCommandPalette(); cmd.action(); });
            cpResults.appendChild(item);
        });
    };

    // ================================================================
    // MARKDOWN TOGGLE
    // ================================================================
    const toggleMarkdownView = () => {
        if (!currentNoteId || isRecycleBinViewActive) return;
        isMarkdownView = !isMarkdownView;
        markdownToggleBtn.classList.toggle('markdown-toggle-active', isMarkdownView);
        
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return;
        
        if (isMarkdownView) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = note.content;
            editorContainer.textContent = htmlToMarkdown(tempDiv);
            editorContainer.classList.add('markdown-source');
            editorContainer.setAttribute('contenteditable', 'true');
        } else {
            const md = editorContainer.textContent;
            const html = markdownToHtml(md);
            editorContainer.innerHTML = html;
            editorContainer.classList.remove('markdown-source');
            note.content = editorContainer.innerHTML;
            saveData();
        }
        updateWordCount();
        showToast(isMarkdownView ? 'Markdown source view' : 'Rich text view', 'info');
    };

    const htmlToMarkdown = (node) => {
        let md = '';
        const walk = (n) => {
            if (n.nodeType === Node.TEXT_NODE) { md += n.textContent; return; }
            if (n.nodeType !== Node.ELEMENT_NODE) return;
            const tag = n.tagName.toLowerCase();
            const children = Array.from(n.childNodes);
            switch (tag) {
                case 'br': md += '\n'; break;
                case 'p': case 'div': children.forEach(walk); md += '\n\n'; break;
                case 'b': case 'strong': md += '**'; children.forEach(walk); md += '**'; break;
                case 'i': case 'em': md += '*'; children.forEach(walk); md += '*'; break;
                case 'u': md += '<u>'; children.forEach(walk); md += '</u>'; break;
                case 's': case 'strike': case 'del': md += '~~'; children.forEach(walk); md += '~~'; break;
                case 'a': md += '['; children.forEach(walk); md += `](${n.href || ''})`; break;
                case 'ul': children.forEach(walk); break;
                case 'ol': children.forEach((c, i) => { md += `${i + 1}. `; walk(c); }); break;
                case 'li': children.forEach(walk); md += '\n'; break;
                case 'img': md += `![${n.alt || ''}](${n.src})`; break;
                case 'pre': md += '```\n'; children.forEach(walk); md += '\n```\n\n'; break;
                case 'code': if (n.parentElement.tagName !== 'PRE') { md += '`'; children.forEach(walk); md += '`'; } else children.forEach(walk); break;
                case 'h1': md += '# '; children.forEach(walk); md += '\n\n'; break;
                case 'h2': md += '## '; children.forEach(walk); md += '\n\n'; break;
                case 'h3': md += '### '; children.forEach(walk); md += '\n\n'; break;
                case 'h4': md += '#### '; children.forEach(walk); md += '\n\n'; break;
                case 'hr': md += '---\n\n'; break;
                case 'blockquote': children.forEach(walk); break;
                case 'table': case 'tr': children.forEach(walk); break;
                case 'td': case 'th': children.forEach(walk); md += ' | '; break;
                case 'mark': case 'span': children.forEach(walk); break;
                default: children.forEach(walk); break;
            }
        };
        Array.from(node.childNodes).forEach(walk);
        return md.trim();
    };

    const markdownToHtml = (md) => {
        let html = md
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^---$/gm, '<hr>')
            .replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>')
            .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.+?)\*/g, '<i>$1</i>')
            .replace(/~~(.+?)~~/g, '<s>$1</s>')
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        return '<p>' + html + '</p>';
    };

    // ================================================================
    // BULK OPERATIONS
    // ================================================================
    const toggleBulkNote = (noteId) => {
        if (selectedNoteIds.has(noteId)) selectedNoteIds.delete(noteId);
        else selectedNoteIds.add(noteId);
        updateBulkUI();
    };

    const updateBulkUI = () => {
        if (selectedNoteIds.size > 0) {
            isBulkMode = true;
            bulkActionsBar.style.display = 'flex';
            bulkCount.textContent = `${selectedNoteIds.size} selected`;
        } else {
            isBulkMode = false;
            bulkActionsBar.style.display = 'none';
        }
        renderNotesList();
    };

    const bulkDelete = () => {
        if (selectedNoteIds.size === 0) return;
        if (!confirm(`Move ${selectedNoteIds.size} note(s) to Recycle Bin?`)) return;
        
        const toDelete = notes.filter(n => selectedNoteIds.has(n.id));
        notes = notes.filter(n => !selectedNoteIds.has(n.id));
        toDelete.forEach(n => { n.lastModified = Date.now(); deletedNotes.unshift(n); });
        
        if (selectedNoteIds.has(currentNoteId)) {
            currentNoteId = notes.length > 0 ? notes[0].id : null;
        }
        selectedNoteIds.clear();
        saveData();
        updateDeletedCount();
        updateBulkUI();
        if (currentNoteId && !isRecycleBinViewActive) loadNoteContent();
        showToast(`${toDelete.length} note(s) moved to bin.`, 'success');
    };

    const bulkExport = () => {
        if (selectedNoteIds.size === 0) return;
        const selected = notes.filter(n => selectedNoteIds.has(n.id));
        let combined = '';
        selected.forEach(note => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = note.content;
            combined += `# ${note.title}\n\n${tempDiv.textContent}\n\n---\n\n`;
        });
        const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `notes_export_${Date.now()}.txt`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showToast(`${selected.length} note(s) exported.`, 'success');
    };

    const bulkSetCategory = (category) => {
        if (!category || selectedNoteIds.size === 0) return;
        notes.forEach(n => { if (selectedNoteIds.has(n.id)) n.category = category; });
        saveData();
        renderNotesList();
        showToast(`${selectedNoteIds.size} note(s) categorized.`, 'success');
    };

    const clearBulkSelection = () => {
        selectedNoteIds.clear();
        updateBulkUI();
    };

    // ================================================================
    // READING MODE
    // ================================================================
    const openReadingMode = () => {
        if (!currentNoteId || isRecycleBinViewActive) return;
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return;
        
        readingBody.innerHTML = note.content;
        
        const text = readingBody.innerText;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));
        readingTimeSpan.textContent = `⏱ ${readingTime} min read`;
        readingWordCountSpan.textContent = `${wordCount} words`;
        
        // Build TOC from headings
        const headings = readingBody.querySelectorAll('h1, h2, h3');
        tocList.innerHTML = '';
        if (headings.length === 0) {
            tocList.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px;">No headings found</div>';
        }
        headings.forEach((h, i) => {
            h.id = `toc-${i}`;
            const item = document.createElement('a');
            item.className = `toc-item ${h.tagName.toLowerCase()}`;
            item.textContent = h.textContent.trim().substring(0, 50);
            item.href = `#toc-${i}`;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                h.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            tocList.appendChild(item);
        });
        
        readingMode.style.display = 'flex';
        readingBody.focus();
        showToast('Reading mode — press Escape to exit', 'info');
    };

    const closeReadingMode = () => {
        readingMode.style.display = 'none';
        editorContainer.focus();
    };

    // ================================================================
    // STATISTICS DASHBOARD
    // ================================================================
    const openStats = () => {
        computeAndRenderStats();
        statsDashboard.style.display = 'flex';
    };

    const closeStats = () => {
        statsDashboard.style.display = 'none';
    };

    const computeAndRenderStats = () => {
        const totalNotes = notes.length;
        let totalWords = 0, totalChars = 0;
        const categoryMap = {};
        
        notes.forEach(n => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = n.content;
            const text = tempDiv.textContent || '';
            const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            totalWords += words;
            totalChars += text.length;
            
            const cat = n.category || 'uncategorized';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        
        document.getElementById('statTotalNotes').textContent = totalNotes;
        document.getElementById('statTotalWords').textContent = totalWords.toLocaleString();
        document.getElementById('statTotalChars').textContent = totalChars.toLocaleString();
        document.getElementById('statAvgWords').textContent = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
        
        // Week & month counts
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        document.getElementById('statWeekNotes').textContent = notes.filter(n => n.createdAt > weekAgo).length;
        document.getElementById('statMonthNotes').textContent = notes.filter(n => n.createdAt > monthAgo).length;
        document.getElementById('statBinCount').textContent = deletedNotes.length;
        
        // Category breakdown
        const catColors = { work: '#3b82f6', personal: '#10b981', ideas: '#f59e0b', todo: '#ef4444', reference: '#8b5cf6', uncategorized: '#9ca3af' };
        const catNames = { work: 'Work', personal: 'Personal', ideas: 'Ideas', todo: 'To-Do', reference: 'Reference', uncategorized: 'Other' };
        const catContainer = document.getElementById('statCategories');
        catContainer.innerHTML = '';
        Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            catContainer.innerHTML += `
                <div class="stat-category-bar">
                    <span class="stat-category-dot" style="background:${catColors[cat] || '#999'}"></span>
                    <span>${catNames[cat] || cat}</span>
                    <span class="stat-category-count">${count}</span>
                </div>`;
        });
        if (Object.keys(categoryMap).length === 0) {
            catContainer.innerHTML = '<div class="empty-state">No categorized notes yet</div>';
        }
    };
    
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    const setupToolbar = () => {
        editorToolbar.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button || button.disabled) return;
            const exec = (cmd, val = null) => {
                document.execCommand(cmd, false, val);
                editorContainer.focus();
                handleNoteUpdate();
            };
            switch (button.id) {
                case 'undoBtn': exec('undo'); break;
                case 'redoBtn': exec('redo'); break;
                case 'boldBtn': exec('bold'); break;
                case 'italicBtn': exec('italic'); break;
                case 'underlineBtn': exec('underline'); break;
                case 'strikeBtn': exec('strikethrough'); break;
                case 'linkBtn':
                    const url = prompt('Enter a URL:', 'https://');
                    if(url) exec('createLink', url);
                    break;
                case 'alignLeftBtn': exec('justifyLeft'); break;
                case 'alignCenterBtn': exec('justifyCenter'); break;
                case 'alignRightBtn': exec('justifyRight'); break;
                case 'ulBtn': exec('insertUnorderedList'); break;
                case 'olBtn': exec('insertOrderedList'); break;
                case 'foreColorBtn': document.getElementById('foreColorPicker').click(); break;
                case 'backColorBtn': document.getElementById('backColorPicker').click(); break;
                case 'clearFormatBtn': exec('removeFormat'); break;
                case 'fontSizeDecreaseBtn': changeFontSize(-1); break;
                case 'fontSizeIncreaseBtn': changeFontSize(1); break;
                case 'fontSizeResetBtn': resetFontSize(); break;
                case 'codeBlockBtn':
                    const sel = window.getSelection();
                    if (sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        const pre = document.createElement('pre');
                        pre.textContent = range.toString() || 'code';
                        range.deleteContents();
                        range.insertNode(pre);
                        range.selectNodeContents(pre);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        handleNoteUpdate();
                    } else {
                        exec('insertHTML', '<pre>code</pre>');
                    }
                    break;
                case 'tableBtn':
                    const rows = prompt('Number of rows:', '3');
                    const cols = prompt('Number of columns:', '3');
                    if (rows && cols) {
                        let tableHtml = '<table>';
                        for (let r = 0; r < parseInt(rows); r++) {
                            tableHtml += '<tr>';
                            for (let c = 0; c < parseInt(cols); c++) {
                                tableHtml += '<td>&nbsp;</td>';
                            }
                            tableHtml += '</tr>';
                        }
                        tableHtml += '</table>';
                        exec('insertHTML', tableHtml);
                    }
                    break;
                case 'hrBtn':
                    exec('insertHorizontalRule');
                    break;
                case 'spellCheckBtn':
                    toggleSpellCheck();
                    break;
            }
        });
        document.getElementById('foreColorPicker').addEventListener('input', (e) => {
            document.execCommand('foreColor', false, e.target.value);
            handleNoteUpdate();
        });
        document.getElementById('backColorPicker').addEventListener('input', (e) => {
            document.execCommand('hiliteColor', false, e.target.value);
            handleNoteUpdate();
        });
    };
    
    const setupEventListeners = () => {
        themeToggleBtn.addEventListener('click', handleThemeToggle);
        focusModeBtn.addEventListener('click', toggleFocusMode);
        newNoteBtn.addEventListener('click', () => createNewNote());
        deleteNoteBtn.addEventListener('click', deleteCurrentNote);
        duplicateNoteBtn.addEventListener('click', duplicateNote);
        importNoteBtn.addEventListener('click', () => importFileInput.click());
        printNoteBtn.addEventListener('click', printCurrentNote);
        
        // Export dropdown
        exportNoteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            screenshotDropdown.classList.remove('show');
            exportDropdown.classList.toggle('show');
        });
        
        // Screenshot dropdown
        screenshotBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdown.classList.remove('show');
            screenshotDropdown.classList.toggle('show');
        });
        
        // Import file input
        importFileInput.addEventListener('change', (e) => {
            importNotes(e.target.files);
            importFileInput.value = '';
        });
        
        recycleBinLink.addEventListener('click', (e) => { e.preventDefault(); showRecycleBinView(); });
        
        // New feature buttons
        statsBtn.addEventListener('click', openStats);
        markdownToggleBtn.addEventListener('click', toggleMarkdownView);
        readingCloseBtn.addEventListener('click', closeReadingMode);
        statsCloseBtn.addEventListener('click', closeStats);
        
        // Template dropdown
        templateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdown.classList.remove('show');
            screenshotDropdown.classList.remove('show');
            templateDropdown.classList.toggle('show');
        });
        templateDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (!option) return;
            e.stopPropagation();
            templateDropdown.classList.remove('show');
            applyTemplate(option.dataset.template);
        });
        
        // Bulk action buttons
        bulkDeleteBtn.addEventListener('click', bulkDelete);
        bulkExportBtn.addEventListener('click', bulkExport);
        bulkCategorySelect.addEventListener('change', (e) => {
            bulkSetCategory(e.target.value);
            bulkCategorySelect.value = '';
        });
        bulkClearBtn.addEventListener('click', clearBulkSelection);

        // Export dropdown option clicks
        exportDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (!option) return;
            e.stopPropagation();
            const format = option.dataset.format;
            exportDropdown.classList.remove('show');
            if (format === 'md') exportCurrentNoteAsMarkdown();
            else exportCurrentNote();
        });

        // Screenshot dropdown option clicks
        screenshotDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (!option) return;
            e.stopPropagation();
            const action = option.dataset.action;
            screenshotDropdown.classList.remove('show');
            captureAndSaveScreenshot(action);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            exportDropdown.classList.remove('show');
            screenshotDropdown.classList.remove('show');
            templateDropdown.classList.remove('show');
        });

        // --- Find & Replace Bar Events ---
        findInput.addEventListener('input', () => {
            lastFindQuery = findInput.value;
            highlightFindMatches(lastFindQuery);
            navigateFindMatch('next');
        });
        findInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); navigateFindMatch(e.shiftKey ? 'prev' : 'next'); }
            if (e.key === 'Escape') closeFindBar();
        });
        findPrevBtn.addEventListener('click', () => navigateFindMatch('prev'));
        findNextBtn.addEventListener('click', () => navigateFindMatch('next'));
        findCloseBtn.addEventListener('click', closeFindBar);
        findCaseBtn.addEventListener('click', () => {
            findCaseSensitive = !findCaseSensitive;
            findCaseBtn.classList.toggle('active', findCaseSensitive);
            if (findInput.value) highlightFindMatches(findInput.value);
        });
        replaceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); replaceCurrentMatch(); }
            if (e.key === 'Escape') closeFindBar();
        });
        replaceBtn.addEventListener('click', replaceCurrentMatch);
        replaceAllBtn.addEventListener('click', replaceAllMatches);

        // --- Keyboard Shortcuts ---
        document.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            
            // Ctrl+Shift+F: Toggle focus mode
            if (ctrl && shift && e.key === 'F') { e.preventDefault(); toggleFocusMode(); return; }
            // Ctrl+Shift+E: Export as markdown
            if (ctrl && shift && e.key === 'E') { e.preventDefault(); exportCurrentNoteAsMarkdown(); return; }
            // Ctrl+Shift+H: Find & Replace
            if (ctrl && shift && e.key === 'H') { e.preventDefault(); openFindBar(true); return; }
            // Ctrl+Shift+D: Delete note
            if (ctrl && shift && e.key === 'D') { e.preventDefault(); deleteCurrentNote(); return; }
            
            if (!ctrl) return;
            
            switch (e.key.toLowerCase()) {
                case 'n': e.preventDefault(); createNewNote(); break;
                case 's': e.preventDefault(); showToast('Note saved!', 'success'); handleNoteUpdate(); break;
                case 'd': e.preventDefault(); duplicateNote(); break;
                case 'e': e.preventDefault(); exportCurrentNote(); break;
                case 'p': e.preventDefault(); printCurrentNote(); break;
                case 'f': e.preventDefault(); openFindBar(); break;
                case 'h': e.preventDefault(); openFindBar(true); break;
                case 'k': e.preventDefault(); openCommandPalette(); break;
                case 'r': e.preventDefault(); openReadingMode(); break;
                case 'b': e.preventDefault(); 
                    isBulkMode = !isBulkMode;
                    if (!isBulkMode) { selectedNoteIds.clear(); }
                    updateBulkUI();
                    renderNotesList();
                    showToast(isBulkMode ? 'Bulk mode ON — select notes' : 'Bulk mode OFF', 'info');
                    break;
                case 'arrowup': e.preventDefault(); navigateNotes('up'); break;
                case 'arrowdown': e.preventDefault(); navigateNotes('down'); break;
                case 'escape': closeFindBar(); break;
            }
        });

        // Escape to close modals (CP, Stats, Reading)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (commandPalette.style.display === 'flex') { closeCommandPalette(); return; }
                if (statsDashboard.style.display === 'flex') { closeStats(); return; }
                if (readingMode.style.display === 'flex') { closeReadingMode(); return; }
                if (findReplaceBar.style.display === 'block' && e.target === editorContainer) {
                    closeFindBar();
                }
            }
        });
        
        // Command palette input
        cpInput.addEventListener('input', () => {
            const q = cpInput.value.toLowerCase();
            cpFiltered = COMMANDS.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
            cpActiveIndex = 0;
            renderCpResults();
        });
        cpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { closeCommandPalette(); return; }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (cpFiltered[cpActiveIndex]) {
                    closeCommandPalette();
                    cpFiltered[cpActiveIndex].action();
                }
                return;
            }
            if (e.key === 'ArrowDown') { e.preventDefault(); cpActiveIndex = Math.min(cpActiveIndex + 1, cpFiltered.length - 1); renderCpResults(); }
            if (e.key === 'ArrowUp') { e.preventDefault(); cpActiveIndex = Math.max(cpActiveIndex - 1, 0); renderCpResults(); }
        });
        
        // Click outside command palette to close
        commandPalette.addEventListener('click', (e) => { if (e.target === commandPalette) closeCommandPalette(); });
        statsDashboard.addEventListener('click', (e) => { if (e.target === statsDashboard) closeStats(); });

        notesListContainer.addEventListener('click', (e) => {
            const noteItem = e.target.closest('.note-item');
            if (!noteItem) return;
            const noteId = Number(noteItem.dataset.id);
            
            if (e.target.matches('.bulk-checkbox')) {
                toggleBulkNote(noteId);
                return;
            }
            
            if (e.target.matches('.pin-icon')) {
                togglePin(noteId);
            } else if (currentNoteId !== noteId || isRecycleBinViewActive) {
                if (isRecycleBinViewActive) {
                    showEditorView();
                }
                currentNoteId = noteId;
                renderNotesList();
                loadNoteContent();
            }
        });

        // Event handler for actions inside the main content area (Recycle Bin)
        mainContent.addEventListener('click', (e) => {
            if (!isRecycleBinViewActive) return;
            const targetButton = e.target.closest('button');
            if (!targetButton) return;

            if (targetButton.matches('.back-to-notes-btn')) {
                showEditorView();
                return;
            }

            const deletedItem = e.target.closest('.deleted-note-item');
            if (!deletedItem) return;
            const noteId = Number(deletedItem.dataset.id);

            // FIXED: When a note is restored, it now automatically switches back to the editor view.
            if (targetButton.matches('.restore-btn')) {
                const noteIndex = deletedNotes.findIndex(n => n.id === noteId);
                if (noteIndex > -1) {
                    const [restoredNote] = deletedNotes.splice(noteIndex, 1);
                    restoredNote.lastModified = Date.now();
                    notes.unshift(restoredNote);
                    currentNoteId = restoredNote.id; // Set as the active note
                    
                    saveData();
                    updateDeletedCount();
                    showEditorView(); // <-- This is the key change to switch views.
                    showToast('Note restored successfully.', 'success');
                }
                return;
            }
            
            // Handle permanent delete button click
            if (targetButton.matches('.perm-delete-btn')) {
                if (confirm("Are you sure? This cannot be undone.")) {
                    deletedNotes = deletedNotes.filter(n => n.id !== noteId);
                    saveData();
                    updateDeletedCount();
                    showRecycleBinView(); // Refresh the bin view
                    showToast('Note permanently deleted.', 'error');
                }
            }
        });
        
        searchInput.addEventListener('input', renderNotesList);
        sortOrderSelect.addEventListener('change', (e) => {
            currentSortOrder = e.target.value;
            saveData();
            renderNotesList();
        });
        categoryFilterSelect.addEventListener('change', renderNotesList);
        categorySelect.addEventListener('change', handleNoteUpdate);
        noteTitleInput.addEventListener('input', handleNoteUpdate);
        editorContainer.addEventListener('input', handleNoteUpdate);
        editorContainer.addEventListener('paste', handlePaste);
    }

    // --- INITIALIZATION ---
    loadData();
    setupToolbar();
    setupEventListeners();
    setupTooltips();
});