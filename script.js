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
    const screenshotBtn = document.getElementById('screenshotBtn');
    const toastContainer = document.getElementById('toastContainer');
    const editorToolbar = document.getElementById('editorToolbar');

    // --- State Variables ---
    let notes = [];
    let deletedNotes = [];
    let currentNoteId = null;
    let isRecycleBinViewActive = false;
    let currentSortOrder = 'date-desc';
    const themes = ['light', 'dark', 'slate', 'glassmorphism'];
    let currentTheme = 'glassmorphism'; // Default theme is now glassmorphism
    let debounceTimer;

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
        
        const newNote = { id: Date.now(), title: '', content: '', isPinned: false, lastModified: Date.now() };
        notes.unshift(newNote);
        currentNoteId = newNote.id;
        
        if (shouldSave) saveData();

        searchInput.value = '';
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
    // FIXED: Now correctly switches view if you take a screenshot from the recycle bin.
    const captureAndSaveScreenshot = async () => {
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            
            const timestamp = new Date();
            const newNote = {
                id: timestamp.getTime(),
                title: `Screenshot - ${timestamp.toLocaleString()}`,
                content: `<img src="${dataUrl}" alt="Screen Capture"/>`,
                isPinned: false,
                lastModified: timestamp.getTime()
            };
            
            notes.unshift(newNote);
            currentNoteId = newNote.id;
            saveData();

            // If we were in the bin, we must switch back to the editor to see the new note.
            if (isRecycleBinViewActive) {
                showEditorView();
            } else {
                // Otherwise, a simple UI refresh is enough.
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
        sortNotes(); // Sort data before rendering
        const fragment = document.createDocumentFragment();
        const searchQuery = searchInput.value.toLowerCase().trim();
        const filteredNotes = searchQuery 
            ? notes.filter(n => n.title.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery))
            : notes;

        filteredNotes.forEach(note => {
            const item = document.createElement('div');
            item.className = `note-item ${note.isPinned ? 'pinned' : ''} ${note.id === currentNoteId && !isRecycleBinViewActive ? 'active' : ''}`;
            item.dataset.id = note.id;
            const displayTitle = note.title.trim() || note.content.replace(/<[^>]*>/g, ' ').trim().substring(0, 40) || 'Untitled Note';

            item.innerHTML = `<i class="fa-solid fa-thumbtack pin-icon" title="${note.isPinned ? 'Unpin Note' : 'Pin Note'}"></i><span class="note-title">${displayTitle}</span>`;
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
        [...editorToolbar.getElementsByTagName('button')].forEach(b => b.disabled = !isEditorEnabled);

        if (note) {
            noteTitleInput.value = note.title;
            editorContainer.innerHTML = note.content;
            updateLastSavedDisplay(note.lastModified);
        } else {
            noteTitleInput.value = 'Select a Note';
            editorContainer.innerHTML = '<div class="empty-state">Select a note from the list or create a new one!</div>';
            updateLastSavedDisplay(null);
        }
        updateWordCount();
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

            if (titleChanged || contentChanged) {
                note.title = noteTitleInput.value;
                note.content = editorContainer.innerHTML;
                note.lastModified = Date.now();
                saveData();
                renderNotesList();
                updateLastSavedDisplay(note.lastModified);
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
    
    const updateWordCount = () => {
        const text = editorContainer.innerText;
        charCountSpan.textContent = `Characters: ${text.length}`;
        wordCountSpan.textContent = `Words: ${text.trim() === '' ? 0 : text.trim().split(/\s+/).length}`;
    };

    const updateDeletedCount = () => { deletedCountSpan.textContent = deletedNotes.length; };
    
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
        newNoteBtn.addEventListener('click', () => createNewNote());
        deleteNoteBtn.addEventListener('click', deleteCurrentNote);
        exportNoteBtn.addEventListener('click', exportCurrentNote);
        screenshotBtn.addEventListener('click', captureAndSaveScreenshot);
        recycleBinLink.addEventListener('click', (e) => { e.preventDefault(); showRecycleBinView(); });

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
        noteTitleInput.addEventListener('input', handleNoteUpdate);
        editorContainer.addEventListener('input', handleNoteUpdate);
        editorContainer.addEventListener('paste', handlePaste);
    }

    // --- INITIALIZATION ---
    loadData();
    setupToolbar();
    setupEventListeners();
});