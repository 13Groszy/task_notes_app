let notes = [];
let currentNoteId = null;
let isEditing = false;

// DOM element references
const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note');
const searchInput = document.getElementById('search');
const addNewNoteBtn = document.getElementById('add-new-note');
const addFirstNoteBtn = document.getElementById('add-first-note');
const noNotesDiv = document.querySelector('.no-notes');
const noteEditor = document.getElementById('note-editor');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelAddNoteBtn = document.querySelector('#note-editor .note-editor-header button');

// Create warning paragraph element
const warningParagraph = document.createElement('p');
warningParagraph.classList.add('warning');
warningParagraph.style.color = 'red';
warningParagraph.style.display = 'none';

// Save notes to localStorage
function saveNotesToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Load notes from localStorage
function loadNotesFromLocalStorage() {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
}

// Render the list of notes
function renderNotesList(searchTerm = '') {
    notesList.innerHTML = '';
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasNotes = filteredNotes.length > 0 || searchTerm !== '';
    noNotesDiv.style.display = hasNotes ? 'none' : 'flex';
    addNewNoteBtn.style.display = hasNotes ? 'flex' : 'none';
    notesList.style.display = hasNotes ? 'flex' : 'none';

    filteredNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note-item');
        noteElement.setAttribute('data-id', note.id);

        // Create note structure
        const headerContainer = document.createElement('div');
        headerContainer.classList.add('note-header');

        const titleElement = document.createElement('h3');
        titleElement.textContent = note.title || 'New note';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('note-buttons');
        
        const editButton = document.createElement('button');
        editButton.innerHTML = '<img src="./assets/edit_icon.svg" alt="Edit">';
        editButton.classList.add('icon-button');
        editButton.onclick = () => selectNote(note.id);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<img src="./assets/delete_icon.svg" alt="Delete">';
        deleteButton.classList.add('icon-button');
        deleteButton.onclick = () => openDeleteModal(note.id);

        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(deleteButton);

        headerContainer.appendChild(titleElement);
        headerContainer.appendChild(buttonsContainer);

        const contentElement = document.createElement('p');
        contentElement.textContent = note.content || 'No content';

        const dateElement = document.createElement('span');
        dateElement.textContent = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        noteElement.appendChild(headerContainer);
        noteElement.appendChild(contentElement);
        noteElement.appendChild(dateElement);
        
        notesList.appendChild(noteElement);
    });
}

// Add or update a note
function addNote() {
    const titleValue = noteTitle.value.trim();
    const contentValue = noteContent.value.trim();
    if (titleValue || contentValue) {
        if (currentNoteId) {
            const note = notes.find(n => n.id === currentNoteId);
            if (note) {
                Object.assign(note, { title: titleValue, content: contentValue });
            }
        } else {
            notes.push({
                id: Date.now(),
                title: titleValue,
                content: contentValue,
                createdAt: Date.now()
            });
        }
        saveNotesToLocalStorage();
        renderNotesList();
        hideNoteEditor();
    } else {
        showWarning('Please enter a title or note content.');
    }
}

// Display warning message
function showWarning(message) {
    warningParagraph.textContent = message;
    warningParagraph.style.display = 'block';
    setTimeout(() => {
        warningParagraph.style.display = 'none';
    }, 5000);
}

// Select a note for editing
function selectNote(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (note) {
        const noteElement = document.querySelector(`.note-item[data-id='${id}']`);
        noteElement.innerHTML = createNoteEditorHTML(note);

        const saveButton = noteElement.querySelector('.btn-style');
        const cancelButton = noteElement.querySelector('.btn-cancel');

        saveButton.onclick = () => {
            const titleInput = noteElement.querySelector('input');
            const contentInput = noteElement.querySelector('textarea');
            Object.assign(note, {
                title: titleInput.value,
                content: contentInput.value
            });
            saveNotesToLocalStorage();
            renderNotesList();
            isEditing = false;
        };

        cancelButton.onclick = () => {
            renderNotesList();
            isEditing = false;
        };

        isEditing = true;

        const inputs = noteElement.querySelectorAll('.input-style');
        inputs.forEach(addInputStyleListeners);
    }
}

// Create HTML for note editor
function createNoteEditorHTML(note) {
    return `
        <div class="note-editor-wrapper">
            <div class="note-editor max-width">
                <div class="note-editor-header">
                    <p>Edit note</p>
                    <button class="btn-cancel">Cancel</button>
                </div>
                <input class="input-style" value="${note.title}" placeholder="Note title">
                <textarea class="input-style" rows="8" placeholder="Your note">${note.content}</textarea>
                <div class="note-editor-footer">
                    <button class="btn-style">Save</button>
                </div>
            </div>
        </div>
    `;
}

// Show note editor
function showNoteEditor() {
    if (isEditing) {
        if (confirm("Do you want to close the current note and start a new one?")) {
            // Reset the edited note to its original state
            renderNotesList();
            isEditing = false;
        } else {
            return;
        }
    }
    noteEditor.style.display = 'flex';
    addNewNoteBtn.style.display = 'none';
    noNotesDiv.style.display = 'none';
    noteTitle.value = '';
    noteContent.value = '';
    currentNoteId = null;
    warningParagraph.style.display = 'none';
    noteEditor.insertBefore(warningParagraph, noteEditor.querySelector('.note-editor-footer'));

    const cancelButton = noteEditor.querySelector('.note-editor-header button');
    cancelButton.classList.add('btn-cancel');

    [noteTitle, noteContent].forEach(input => {
        input.style.backgroundColor = '#EEEFF0';
        addInputStyleListeners(input);
    });
}

// Hide note editor
function hideNoteEditor() {
    noteEditor.style.display = 'none';
    addNewNoteBtn.style.display = 'flex';
    if (notes.length === 0) {
        noNotesDiv.style.display = 'flex';
    }
    currentNoteId = null;
    warningParagraph.style.display = 'none';
    isEditing = false;
}

// Event listeners for adding new notes
addNewNoteBtn.addEventListener('click', showNoteEditor);
addFirstNoteBtn.addEventListener('click', showNoteEditor);
cancelAddNoteBtn.addEventListener('click', hideNoteEditor);

// Open delete confirmation modal
function openDeleteModal(id) {
    currentNoteId = id;
    document.getElementById('delete-modal').style.display = 'flex';
    document.body.classList.add('modal-open');
}

// Close delete confirmation modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Delete the current note
function deleteNote() {
    notes = notes.filter(n => n.id !== currentNoteId);
    if (currentNoteId) {
        currentNoteId = null;
        noteTitle.value = '';
        noteContent.value = '';
        noteEditor.style.display = 'none';
        addNewNoteBtn.style.display = 'flex';
    }
    saveNotesToLocalStorage();
    renderNotesList();
}

// Search functionality
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length >= 1) {
        renderNotesList(searchTerm);
    } else {
        renderNotesList();
    }
});

// Event listeners for saving and deleting notes
saveNoteBtn.addEventListener('click', addNote);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', () => {
    deleteNote();
    closeDeleteModal();
});

// Add input style listeners
function addInputStyleListeners(input) {
    input.addEventListener('focus', function() {
        this.style.backgroundColor = 'white';
    });

    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.backgroundColor = '#EEEFF0';
        }
    });
}

addInputStyleListeners(noteTitle);
addInputStyleListeners(noteContent);
addInputStyleListeners(searchInput);

// Initialize the application
loadNotesFromLocalStorage();
renderNotesList();
