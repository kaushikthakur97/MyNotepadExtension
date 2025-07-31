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
    // New Elements
    const exportNoteBtn = document.getElementById('exportNoteBtn');
    const toastContainer = document.getElementById('toastContainer');

    // --- State Variables ---
    let notes = [];
    let deletedNotes = [];
    let currentNoteId = null;
    let isRecycleBinViewActive = false;
    let currentSortOrder = 'date-desc';
    const themes = ['light', 'dark', 'slate', 'glassmorphism'];
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
            currentTheme = result.theme && themes.includes(result.theme) ? result.theme : 'light';
            
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
        themes.forEach(theme => body.classList.remove(theme + '-mode'));
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
        showToast(`Theme changed to ${currentTheme}`, 'info');
    };

    // --- UI VIEW TOGGLING ---
    const showEditorView = () => {
        isRecycleBinViewActive = false;
        editorWrapper.style.display = 'flex';
        editorFooter.style.display = 'flex';
        mainContent.querySelector('.recycle-bin-view')?.remove();
        renderNotesList();
        loadNoteContent();
    };

    const showRecycleBinView = () => {
        isRecycleBinViewActive = true;
        currentNoteId = null; 
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
            html += '<div class="empty-state">The Recycle Bin is empty.</div>';
        } else {
            deletedNotes.sort((a, b) => b.lastModified - a.lastModified);
            deletedNotes.forEach(note => {
                html += `
                    <div class="deleted-note-item" data-id="${note.id}">
                        <span class="deleted-note-title">${note.title || 'Untitled Note'}</span>
                        <div class="deleted-note-actions">
                            <button class="restore-btn" title="Restore Note"><i class="fas fa-undo"></i></button>
                            <button class="perm-delete-btn" title="Delete Permanently"><i class="fas fa-trash-alt"></i></button>
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
            restoredNote.lastModified = Date.now();
            notes.unshift(restoredNote);

            saveData();
            updateDeletedCount();
            renderNotesList();
            showRecycleBinView();
            showToast('Note restored successfully.', 'success');
        }
    };

    const handleDeletePermanently = (e) => {
        const noteId = Number(e.target.closest('.deleted-note-item').dataset.id);
        if (confirm("Are you sure you want to permanently delete this note? This action cannot be undone.")) {
            deletedNotes = deletedNotes.filter(n => n.id !== noteId);
            saveData();
            updateDeletedCount();
            showRecycleBinView();
            showToast('Note permanently deleted.', 'error');
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
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);

        if (noteIndex > -1) {
            if (notes.length === 1) { 
                const note = notes[0];
                note.title = ""; note.content = ""; note.isPinned = false; note.lastModified = Date.now();
                saveData();
                renderNotesList();
                loadNoteContent();
                return;
            }

            const [deletedNote] = notes.splice(noteIndex, 1);
            deletedNote.lastModified = Date.now(); 
            deletedNotes.unshift(deletedNote);
            currentNoteId = notes.length > 0 ? notes[Math.max(0, noteIndex - 1)].id : null;
            
            saveData();
            updateDeletedCount();
            renderNotesList();
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
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Note exported as .txt', 'success');
    };

    const sortNotes = () => {
        notes.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            switch (currentSortOrder) {
                case 'title-az':
                    return a.title.localeCompare(b.title);
                case 'date-asc':
                    return a.lastModified - b.lastModified;
                case 'date-desc':
                default:
                    return b.lastModified - a.lastModified;
            }
        });
    };

    // --- UI RENDERING & CONTENT UPDATES ---
    const renderNotesList = () => {
        sortNotes();
        const lastScrollTop = notesListContainer.scrollTop;
        notesListContainer.innerHTML = '';
        const searchQuery = searchInput.value.toLowerCase().trim();
        const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery));

        if (notes.length > 0 && filteredNotes.length === 0 && searchQuery) {
            notesListContainer.innerHTML = `<div class="empty-state">No matches found.</div>`;
            return;
        }

        if (notes.length === 0){
             if (currentNoteId) loadNoteContent();
             return;
        }

        filteredNotes.forEach(note => {
            const item = document.createElement('div');
            item.className = `note-item ${note.isPinned ? 'pinned' : ''} ${note.id === currentNoteId && !isRecycleBinViewActive ? 'active' : ''}`;
            item.dataset.id = note.id;
            const displayTitle = note.title.trim() || note.content.replace(/<[^>]*>/g, '').trim().split('\n')[0] || 'Untitled Note';

            item.innerHTML = `<i class="fa-solid fa-thumbtack pin-icon" title="${note.isPinned ? 'Unpin Note' : 'Pin Note'}"></i><span class="note-title">${displayTitle}</span>`;
            
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('pin-icon')) return;
                if (isRecycleBinViewActive) showEditorView();
                
                if (currentNoteId !== note.id){
                    currentNoteId = note.id;
                    renderNotesList();
                    loadNoteContent();
                }
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
        if(isRecycleBinViewActive) return;
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            noteTitleInput.value = note.title;
            editorContainer.innerHTML = note.content;
            updateLastSavedDisplay(note.lastModified);
            noteTitleInput.disabled = false;
            editorContainer.setAttribute('contenteditable', 'true');
            deleteNoteBtn.disabled = false;
            exportNoteBtn.disabled = false;
        } else {
            noteTitleInput.value = 'Select a Note';
            editorContainer.innerHTML = '<div class="empty-state">Select a note or create a new one!</div>';
            updateLastSavedDisplay(null);
            noteTitleInput.disabled = true;
            editorContainer.setAttribute('contenteditable', 'false');
            deleteNoteBtn.disabled = true;
            exportNoteBtn.disabled = true;
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
                renderNotesList(); // Re-render list in case title changed
                updateLastSavedDisplay(note.lastModified);
            }
        }, 500);
    };
    
    const updateLastSavedDisplay = (timestamp) => {
        if (!timestamp) { lastSavedSpan.textContent = ''; return; }
        const now = new Date();
        const savedDate = new Date(timestamp);
        const diffSeconds = Math.round((now - savedDate) / 1000);
        
        if (diffSeconds < 5) lastSavedSpan.textContent = 'Saved just now';
        else if (diffSeconds < 60) lastSavedSpan.textContent = `Saved ${diffSeconds}s ago`;
        else {
            const diffMinutes = Math.round(diffSeconds / 60);
            if (diffMinutes < 60) lastSavedSpan.textContent = `Saved ${diffMinutes}m ago`;
            else {
                lastSavedSpan.textContent = `Saved: ${savedDate.toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
            }
        }
    };
    
    const updateWordCount = () => {
        const text = editorContainer.innerText;
        charCountSpan.textContent = `Characters: ${text.length}`;
        const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
        wordCountSpan.textContent = `Words: ${words.length}`;
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
        const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); editorContainer.focus(); handleNoteUpdate(); };

        // --- Existing Buttons ---
        document.getElementById('boldBtn').addEventListener('click', () => exec('bold'));
        document.getElementById('italicBtn').addEventListener('click', () => exec('italic'));
        document.getElementById('underlineBtn').addEventListener('click', () => exec('underline'));
        document.getElementById('strikeBtn').addEventListener('click', () => exec('strikethrough'));
        document.getElementById('linkBtn').addEventListener('click', () => {
            const url = prompt('Enter a URL:', 'https://');
            if(url) exec('createLink', url);
        });
        document.getElementById('alignLeftBtn').addEventListener('click', () => exec('justifyLeft'));
        document.getElementById('alignCenterBtn').addEventListener('click', () => exec('justifyCenter'));
        document.getElementById('alignRightBtn').addEventListener('click', () => exec('justifyRight'));
        document.getElementById('ulBtn').addEventListener('click', () => exec('insertUnorderedList'));
        document.getElementById('olBtn').addEventListener('click', () => exec('insertOrderedList'));

        // --- New Buttons ---
        const foreColorPicker = document.getElementById('foreColorPicker');
        document.getElementById('foreColorBtn').addEventListener('click', () => foreColorPicker.click());
        foreColorPicker.addEventListener('input', (e) => exec('foreColor', e.target.value));

        const backColorPicker = document.getElementById('backColorPicker');
        document.getElementById('backColorBtn').addEventListener('click', () => backColorPicker.click());
        backColorPicker.addEventListener('input', (e) => exec('hiliteColor', e.target.value));
        
        document.getElementById('clearFormatBtn').addEventListener('click', () => exec('removeFormat'));
    };
    
    const setupEventListeners = () => {
        themeToggleBtn.addEventListener('click', handleThemeToggle);
        newNoteBtn.addEventListener('click', () => createNewNote());
        deleteNoteBtn.addEventListener('click', deleteCurrentNote);
        recycleBinLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isRecycleBinViewActive) showRecycleBinView();
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
        exportNoteBtn.addEventListener('click', exportCurrentNote);
    }

    // --- INITIALIZATION ---
    loadData();
    setupToolbar();
    setupEventListeners();
});