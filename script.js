document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainContent = document.querySelector('.main-content');
    const editorContainer = document.getElementById('editor');
    const editorToolbar = document.querySelector('.editor-toolbar');
    const topControls = document.querySelector('.top-controls');
    const notesListContainer = document.getElementById('notesList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const recycleBinLink = document.getElementById('recycleBinLink');
    const deletedCountSpan = document.getElementById('deletedCount');

    // State Variables
    let notes = [];
    let deletedNotes = [];
    let currentNoteId = null;
    let isRecycleBinViewActive = false;
    let debounceTimer;

    // --- DATA MANAGEMENT (SAVE/LOAD FROM STORAGE) ---
    const saveData = () => {
        chrome.storage.local.set({ notes, deletedNotes });
    };

    const loadData = () => {
        chrome.storage.local.get(['notes', 'deletedNotes'], (result) => {
            notes = result.notes || [];
            deletedNotes = result.deletedNotes || [];

            if (notes.length === 0 && deletedNotes.length === 0) {
                createNewNote(false); // Create initial note without saving to avoid race condition
            }

            currentNoteId = notes.length > 0 ? notes[0].id : null;

            renderNotesList();
            updateDeletedCount();
            loadNoteContent();
        });
    };

    // --- VIEW MANAGEMENT (SWITCH BETWEEN EDITOR AND RECYCLE BIN) ---
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

        // Clear previous view before creating a new one
        mainContent.querySelector('.recycle-bin-view')?.remove();

        const recycleBinView = document.createElement('div');
        recycleBinView.className = 'recycle-bin-view';

        let html = `
            <div class="recycle-bin-header">
                <h3>Recycle Bin</h3>
                <button class="back-to-notes-btn">Back to Notes</button>
            </div>
        `;

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
                    </div>
                `;
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

        const newNote = { id: Date.now(), title: 'New Note', content: '' };
        notes.unshift(newNote);
        currentNoteId = newNote.id;

        if (shouldSave) saveData();

        searchInput.value = '';
        renderNotesList();
        loadNoteContent();
        editorContainer.focus();
    };

    const deleteCurrentNote = () => {
        if (!currentNoteId || notes.length <= 1) {
            alert("You cannot delete the last note.");
            return;
        };

        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex === -1) return;

        const [deletedNote] = notes.splice(noteIndex, 1);
        deletedNotes.unshift(deletedNote);

        currentNoteId = notes.length > 0 ? notes[Math.max(0, noteIndex - 1)].id : null;

        saveData();
        renderNotesList();
        updateDeletedCount();
        loadNoteContent();
    };

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        renderNotesList(notes.filter(note => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)));
    };

    // --- UI RENDERING & CONTENT UPDATES ---
    const renderNotesList = (notesToRender = notes) => {
        notesListContainer.innerHTML = '';
        notesToRender.forEach(note => {
            const item = document.createElement('div');
            item.className = 'note-item';
            item.textContent = note.title;
            item.dataset.id = note.id;

            if (note.id === currentNoteId) item.classList.add('active');

            item.addEventListener('click', () => {
                if (isRecycleBinViewActive) showEditorView();
                currentNoteId = note.id;
                searchInput.value = '';
                renderNotesList();
                loadNoteContent();
            });
            notesListContainer.appendChild(item);
        });
    };

    const loadNoteContent = () => {
        const note = notes.find(n => n.id === currentNoteId);
        editorContainer.innerHTML = note ? note.content : '';
    };

    const saveCurrentNoteContent = () => {
        if (!currentNoteId || isRecycleBinViewActive) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const note = notes.find(n => n.id === currentNoteId);
            if (note && note.content !== editorContainer.innerHTML) {
                note.content = editorContainer.innerHTML;
                const tempTitle = editorContainer.innerText.trim().split('\n')[0] || 'New Note';
                note.title = tempTitle.substring(0, 40); // Keep title reasonable
                
                saveData();
                renderNotesList(); // Re-render to show updated title immediately
            }
        }, 300); // Debounce saves to prevent excessive writes
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
        document.getElementById('alignLeftBtn').addEventListener('click', () => exec('justifyLeft'));
        document.getElementById('alignCenterBtn').addEventListener('click', () => exec('justifyCenter'));
        document.getElementById('alignRightBtn').addEventListener('click', () => exec('justifyRight'));
        document.getElementById('ulBtn').addEventListener('click', () => exec('insertUnorderedList'));
        document.getElementById('olBtn').addEventListener('click', () => exec('insertOrderedList'));
        document.getElementById('linkBtn').addEventListener('click', () => {
             const url = prompt('Enter a URL:');
             if(url) exec('createLink', url);
        });
    };

    // --- INITIALIZATION ---
    newNoteBtn.addEventListener('click', createNewNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    recycleBinLink.addEventListener('click', () => {
        if (!isRecycleBinViewActive) showRecycleBinView();
    });
    searchInput.addEventListener('input', handleSearch);
    editorContainer.addEventListener('input', saveCurrentNoteContent);

    setupToolbar();
    loadData();
});