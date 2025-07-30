document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
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

    // --- State Variables ---
    let notes = [];
    let deletedNotes = [];
    let currentNoteId = null;
    let isRecycleBinViewActive = false;
    let currentSortOrder = 'date-desc';
    let currentTheme = 'light';
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
            currentTheme = result.theme || 'light';
            
            applyTheme();
            sortOrderSelect.value = currentSortOrder;

            if (notes.length === 0 && deletedNotes.length === 0) {
                createNewNote(false);
            } else {
                sortNotes();
                currentNoteId = notes.length > 0 ? notes[0].id : null;
            }

            renderNotesList();
            updateDeletedCount();
            loadNoteContent();
        });
    };

    // --- THEME MANAGEMENT ---
    const applyTheme = () => {
        body.classList.toggle('dark-mode', currentTheme === 'dark');
        const icon = themeToggleBtn.querySelector('i');
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-palette';
    };

    const handleThemeToggle = () => {
        currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
        applyTheme();
        saveData();
    };

    // --- UI VIEW TOGGLING ---
    const showEditorView = () => {
        isRecycleBinViewActive = false;
        editorWrapper.style.display = 'flex';
        editorFooter.style.display = 'flex';
        mainContent.querySelector('.recycle-bin-view')?.remove();
        loadNoteContent();
    };

    const showRecycleBinView = () => {
        isRecycleBinViewActive = true;
        editorWrapper.style.display = 'none';
        editorFooter.style.display = 'none';
        mainContent.querySelector('.recycle-bin-view')?.remove();

        const recycleBinView = document.createElement('div');
        recycleBinView.className = 'recycle-bin-view';

        let html = `
            <div class="recycle-bin-header">
                <h3>Recycle Bin</h3>
                <button class="back-to-notes-btn">Back to Notes</button>
            </div>`;

        if (deletedNotes.length === 0) {
            html += '<p>The Recycle Bin is empty.</p>';
        } else {
            deletedNotes.forEach(note => {
                html += `
                    <div class="deleted-note-item" data-id="${note.id}">
                        <span class="deleted-note-title">${note.title || 'Untitled Note'}</span>
                        <div>
                            <button class="restore-btn">Restore</button>
                            <button class="perm-delete-btn">Delete Permanently</button>
                        </div>
                    </div>`;
            });
        }
        recycleBinView.innerHTML = html;
        mainContent.appendChild(recycleBinView);

        recycleBinView.querySelector('.back-to-notes-btn')?.addEventListener('click', showEditorView);
        recycleBinView.querySelectorAll('.restore-btn').forEach(btn => btn.addEventListener('click', handleRestoreNote));
        recycleBinView.querySelectorAll('.perm-delete-btn').forEach(btn => btn.addEventListener('click', handleDeletePermanently));
    };

    // --- NOTE & BIN OPERATIONS ---
    const handleRestoreNote = (e) => {
        const noteId = Number(e.target.closest('.deleted-note-item').dataset.id);
        const noteIndex = deletedNotes.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            const [restoredNote] = deletedNotes.splice(noteIndex, 1);
            notes.unshift(restoredNote);
            saveData();
            updateDeletedCount();
            renderNotesList();
            showRecycleBinView();
        }
    };

    const handleDeletePermanently = (e) => {
        const noteId = Number(e.target.closest('.deleted-note-item').dataset.id);
        if (confirm("Are you sure you want to permanently delete this note? This cannot be undone.")) {
            const noteIndex = deletedNotes.findIndex(n => n.id === noteId);
            if (noteIndex > -1) {
                deletedNotes.splice(noteIndex, 1);
                saveData();
                updateDeletedCount();
                showRecycleBinView();
            }
        }
    };

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
        if (notes.length <= 1) {
            alert("Cannot delete the last remaining note.");
            return;
        }
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex > -1) {
            const [deletedNote] = notes.splice(noteIndex, 1);
            deletedNotes.unshift(deletedNote);
            const newActiveNoteIndex = Math.max(0, noteIndex - 1);
            currentNoteId = notes.length > 0 ? notes[newActiveNoteIndex].id : null;
            saveData();
            renderNotesList();
            updateDeletedCount();
            loadNoteContent();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const togglePin = (noteId) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            note.isPinned = !note.isPinned;
            saveData();
            renderNotesList();
        }
    };

    const sortNotes = () => {
        notes.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            switch (currentSortOrder) {
                case 'title-az':
                    return a.title.localeCompare(b.title);
                case 'date-asc':
                    return a.id - b.id;
                case 'date-desc':
                default:
                    return b.id - a.id;
            }
        });
    };

    // --- UI RENDERING & CONTENT UPDATES ---
    const renderNotesList = () => {
        sortNotes();
        const lastScrollTop = notesListContainer.scrollTop;
        notesListContainer.innerHTML = '';
        const searchQuery = searchInput.value.toLowerCase();
        const notesToRender = notes.filter(n => n.title.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery));

        notesToRender.forEach(note => {
            const item = document.createElement('div');
            item.className = 'note-item';
            item.dataset.id = note.id;
            if (note.isPinned) item.classList.add('pinned');
            if (note.id === currentNoteId) item.classList.add('active');
            let displayTitle = note.title.trim() || note.content.trim().split('\n')[0] || 'Untitled Note';

            item.innerHTML = `
                <i class="fa-solid fa-thumbtack pin-icon" title="Pin Note"></i>
                <span class="note-title">${displayTitle}</span>`;
            
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('pin-icon')) return;
                if (isRecycleBinViewActive) showEditorView();
                currentNoteId = note.id;
                renderNotesList();
                loadNoteContent();
            });

            item.querySelector('.pin-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                togglePin(note.id);
            });
            notesListContainer.appendChild(item);
        });
        notesListContainer.scrollTop = lastScrollTop;
    };

    const loadNoteContent = () => {
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            noteTitleInput.value = note.title;
            editorContainer.innerHTML = note.content;
            updateLastSavedDisplay(note.lastModified);
        } else {
            noteTitleInput.value = '';
            editorContainer.innerHTML = '';
            updateLastSavedDisplay(null);
        }
        updateWordCount();
    };

    const handleNoteUpdate = () => {
        if (!currentNoteId || isRecycleBinViewActive) return;
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
        updateWordCount();
    };
    
    const updateLastSavedDisplay = (timestamp) => {
        if (!timestamp) {
            lastSavedSpan.textContent = '';
            return;
        }
        const now = new Date();
        const savedDate = new Date(timestamp);
        const diffSeconds = Math.round((now - savedDate) / 1000);
        
        if (diffSeconds < 5) {
            lastSavedSpan.textContent = 'Saved just now';
        } else if (diffSeconds < 60) {
            lastSavedSpan.textContent = `Saved ${diffSeconds}s ago`;
        } else {
            const diffMinutes = Math.round(diffSeconds / 60);
            if (diffMinutes < 60) {
                lastSavedSpan.textContent = `Saved ${diffMinutes}m ago`;
            } else {
                const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
                lastSavedSpan.textContent = `Saved ${savedDate.toLocaleDateString(undefined, options)}`;
            }
        }
    };
    
    const updateWordCount = () => {
        const text = editorContainer.innerText;
        charCountSpan.textContent = `Characters: ${text.length}`;
        const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
        wordCountSpan.textContent = `Words: ${words.length}`;
    };

    const updateDeletedCount = () => {
        deletedCountSpan.textContent = deletedNotes.length;
    };

    const setupToolbar = () => {
        const exec = (cmd, val = null) => {
            document.execCommand(cmd, false, val);
            editorContainer.focus();
            handleNoteUpdate();
        };
        document.getElementById('boldBtn').addEventListener('click', () => exec('bold'));
        document.getElementById('italicBtn').addEventListener('click', () => exec('italic'));
        document.getElementById('underlineBtn').addEventListener('click', () => exec('underline'));
        document.getElementById('strikeBtn').addEventListener('click', () => exec('strikethrough'));
        document.getElementById('linkBtn').addEventListener('click', () => {
            const url = prompt('Enter a URL:');
            if(url) exec('createLink', url);
        });
        document.getElementById('alignLeftBtn').addEventListener('click', () => exec('justifyLeft'));
        document.getElementById('alignCenterBtn').addEventListener('click', () => exec('justifyCenter'));
        document.getElementById('alignRightBtn').addEventListener('click', () => exec('justifyRight'));
        document.getElementById('ulBtn').addEventListener('click', () => exec('insertUnorderedList'));
        document.getElementById('olBtn').addEventListener('click', () => exec('insertOrderedList'));
    };

    // --- INITIALIZATION ---
    themeToggleBtn.addEventListener('click', handleThemeToggle);
    newNoteBtn.addEventListener('click', createNewNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    recycleBinLink.addEventListener('click', () => { if (!isRecycleBinViewActive) showRecycleBinView(); });
    searchInput.addEventListener('input', renderNotesList);
    sortOrderSelect.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        saveData();
        renderNotesList();
    });
    
    noteTitleInput.addEventListener('input', handleNoteUpdate);
    editorContainer.addEventListener('input', handleNoteUpdate);
    editorContainer.addEventListener('paste', handlePaste);

    loadData();
    setupToolbar();
});