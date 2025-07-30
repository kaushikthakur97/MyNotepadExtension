document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainContent = document.querySelector('.main-content');
    const editorContainer = document.getElementById('editor');
    const editorToolbar = document.getElementById('editorToolbar');
    const topControls = document.querySelector('.top-controls');
    const notesListContainer = document.getElementById('notesList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const sortOrderSelect = document.getElementById('sortOrderSelect');
    const recycleBinLink = document.getElementById('recycleBinLink');
    const deletedCountSpan = document.getElementById('deletedCount');
    const wordCountSpan = document.getElementById('wordCount');
    const charCountSpan = document.getElementById('charCount');

    // --- State Variables ---
    let notes = [];
    let deletedNotes = [];
    let currentNoteId = null;
    let isRecycleBinViewActive = false;
    let currentSortOrder = 'date-desc';
    let debounceTimer;

    // --- DATA MANAGEMENT ---
    const saveData = () => {
        chrome.storage.local.set({ notes, deletedNotes, sortOrder: currentSortOrder });
    };

    const loadData = () => {
        chrome.storage.local.get(['notes', 'deletedNotes', 'sortOrder'], (result) => {
            notes = result.notes || [];
            deletedNotes = result.deletedNotes || [];
            currentSortOrder = result.sortOrder || 'date-desc';
            sortOrderSelect.value = currentSortOrder;

            if (notes.length === 0 && deletedNotes.length === 0) {
                createNewNote(false);
            }
            
            // On first load, set active note based on sorted list
            sortNotes();
            currentNoteId = notes.length > 0 ? notes[0].id : null;
            
            renderNotesList();
            updateDeletedCount();
            loadNoteContent();
        });
    };

    // --- UI VIEW TOGGLING ---
    const showEditorView = () => {
        isRecycleBinViewActive = false;
        editorToolbar.style.display = 'flex';
        topControls.style.display = 'flex';
        mainContent.querySelector('.recycle-bin-view')?.remove();
        editorContainer.style.display = 'block';
        loadNoteContent();
    };
    
    const showRecycleBinView = () => {
        isRecycleBinViewActive = true;
        editorToolbar.style.display = 'none';
        topControls.style.display = 'none';
        editorContainer.style.display = 'none';
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
                        <span class="deleted-note-title">${note.title}</span>
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
        const noteId = e.target.closest('.deleted-note-item').dataset.id;
        const noteIndex = deletedNotes.findIndex(n => n.id == noteId);
        if (noteIndex === -1) return;

        const [restoredNote] = deletedNotes.splice(noteIndex, 1);
        notes.unshift(restoredNote);

        saveData();
        updateDeletedCount();
        renderNotesList();
        showRecycleBinView();
    };

    const handleDeletePermanently = (e) => {
        const noteId = e.target.closest('.deleted-note-item').dataset.id;
        if (confirm("Are you sure you want to permanently delete this note? This cannot be undone.")) {
            const noteIndex = deletedNotes.findIndex(n => n.id == noteId);
            if (noteIndex === -1) return;

            deletedNotes.splice(noteIndex, 1);
            saveData();
            updateDeletedCount();
            showRecycleBinView();
        }
    };

    const createNewNote = (shouldSave = true) => {
        if (isRecycleBinViewActive) showEditorView();
        const newNote = { id: Date.now(), title: 'New Note', content: '', isPinned: false };
        notes.unshift(newNote);
        currentNoteId = newNote.id;
        if (shouldSave) saveData();
        searchInput.value = '';
        renderNotesList();
        loadNoteContent();
        editorContainer.focus();
    };

    const deleteCurrentNote = () => {
        if (!currentNoteId) return;
        if (notes.length <= 1) {
            alert("Cannot delete the last remaining note.");
            return;
        }

        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex === -1) return;

        const [deletedNote] = notes.splice(noteIndex, 1);
        deletedNotes.unshift(deletedNote);
        
        // Find a new note to make active before saving and re-rendering
        const newActiveNoteIndex = Math.max(0, noteIndex - 1);
        currentNoteId = notes.length > 0 ? notes[newActiveNoteIndex].id : null;
        
        saveData();
        renderNotesList();
        updateDeletedCount();
        loadNoteContent();
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
        notesListContainer.innerHTML = '';
        const searchQuery = searchInput.value.toLowerCase();
        const notesToRender = notes.filter(note => searchQuery === '' || note.title.toLowerCase().includes(searchQuery) || note.content.toLowerCase().includes(searchQuery));

        notesToRender.forEach(note => {
            const item = document.createElement('div');
            item.className = 'note-item';
            item.dataset.id = note.id;
            if (note.isPinned) item.classList.add('pinned');
            if (note.id === currentNoteId) item.classList.add('active');

            item.innerHTML = `
                <i class="fa-solid fa-thumbtack pin-icon" title="Pin Note"></i>
                <span class="note-title">${note.title}</span>
            `;
            
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('pin-icon')) return; // Ignore clicks on the pin icon itself
                if (isRecycleBinViewActive) showEditorView();
                currentNoteId = note.id;
                renderNotesList(); // Re-render to show active state
                loadNoteContent();
            });

            item.querySelector('.pin-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                togglePin(note.id);
            });
            notesListContainer.appendChild(item);
        });
    };
    
    const loadNoteContent = () => {
        const note = notes.find(n => n.id === currentNoteId);
        editorContainer.innerHTML = note ? note.content : '';
        updateWordCount();
    };
    
    const saveCurrentNoteContent = () => {
        if (!currentNoteId || isRecycleBinViewActive) return;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const note = notes.find(n => n.id === currentNoteId);
            const contentChanged = note && note.content !== editorContainer.innerHTML;

            if (contentChanged) {
                note.content = editorContainer.innerHTML;
                const tempTitle = editorContainer.innerText.trim().split('\n')[0] || 'New Note';
                note.title = tempTitle.substring(0, 40);
                saveData();
                // We re-render to update the title in the list
                renderNotesList();
            }
            updateWordCount(); // Update count even if content hasn't been saved yet
        }, 300);
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
            saveCurrentNoteContent();
        }
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
    newNoteBtn.addEventListener('click', createNewNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    recycleBinLink.addEventListener('click', () => { if (!isRecycleBinViewActive) showRecycleBinView(); });
    searchInput.addEventListener('input', renderNotesList);
    sortOrderSelect.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        saveData();
        renderNotesList();
    });
    editorContainer.addEventListener('input', saveCurrentNoteContent);
    editorContainer.addEventListener('paste', handlePaste);

    loadData();
    setupToolbar();
});