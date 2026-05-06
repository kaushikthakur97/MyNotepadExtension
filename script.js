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
                <button class="back-to-notes-btn">Back to Notes</button>
            </div>`;

        if (deletedNotes.length === 0) {
            html += '<div class="empty-state">The Recycle Bin is empty.</div>';
        } else {
            const sortedDeleted = [...deletedNotes].sort((a, b) => b.lastModified - a.lastModified);
            html += sortedDeleted.map(note => `
                <div class="deleted-note-item" data-id="${note.id}">
                    <span class="deleted-note-title">${note.title.trim() || 'Untitled Note'}</span>
                    <div class="deleted-note-actions">
                        <button class="restore-btn" title="Restore Note"><i class="fas fa-undo"></i></button>
                        <button class="perm-delete-btn" title="Delete Permanently"><i class="fas fa-trash-alt"></i></button>
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

            item.innerHTML = `${categoryDot}<i class="fa-solid fa-thumbtack pin-icon" title="${note.isPinned ? 'Unpin Note' : 'Pin Note'}"></i><span class="note-title">${displayTitle}</span>`;
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
                case 'arrowup': e.preventDefault(); navigateNotes('up'); break;
                case 'arrowdown': e.preventDefault(); navigateNotes('down'); break;
                case 'escape': closeFindBar(); break;
            }
        });

        // Close find bar on Escape when focused in find inputs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && findReplaceBar.style.display === 'block' && e.target === editorContainer) {
                closeFindBar();
            }
        });

        notesListContainer.addEventListener('click', (e) => {
            const noteItem = e.target.closest('.note-item');
            if (!noteItem) return;
            const noteId = Number(noteItem.dataset.id);
            if (e.target.matches('.pin-icon')) {
                togglePin(noteId);
            } else if (currentNoteId !== noteId || isRecycleBinViewActive) {
                // If we are in the recycle bin, we MUST switch back to the editor view.
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
});