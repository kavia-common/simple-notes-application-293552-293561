import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import EmptyState from './components/EmptyState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotes } from './hooks/useNotes';

/**
 * Root application: orchestrates layout, state, and persistence for Simple Notes.
 * Two-column layout with responsive stacking on small screens.
 */
function App() {
  // Theme toggle (light only visual style per instructions but keep toggle optional)
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // Persistence with debounce through useLocalStorage
  const storage = useLocalStorage('notes.v1', []);

  // Notes state management
  const {
    notes,
    selectedNoteId,
    setSelectedNoteId,
    createNote,
    updateNote,
    deleteNote,
    loadFromStorage,
  } = useNotes(storage);

  // Search query
  const [query, setQuery] = useState('');

  // Derived selected note
  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // Focus management: focus title on new note creation
  const focusTitleRef = useRef(null);
  const handleCreateNote = useCallback(() => {
    const id = createNote();
    setSelectedNoteId(id);
    // wait next tick for editor mount then focus
    setTimeout(() => {
      if (focusTitleRef.current) {
        focusTitleRef.current.focus();
      }
    }, 0);
  }, [createNote, setSelectedNoteId]);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="app-root">
      <Header
        onNewNote={handleCreateNote}
        query={query}
        onQueryChange={setQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="app-main" role="main">
        <aside className="sidebar" aria-label="Notes list">
          <NotesList
            notes={notes}
            selectedId={selectedNoteId}
            onSelect={setSelectedNoteId}
            query={query}
            onDelete={(id) => {
              // confirm deletion in list item interaction
              deleteNote(id);
            }}
          />
        </aside>

        <section className="editor" aria-label="Editor panel">
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onChange={(patch) => updateNote(selectedNote.id, patch)}
              onDelete={() => deleteNote(selectedNote.id)}
              focusTitleRef={focusTitleRef}
            />
          ) : notes.length === 0 ? (
            <EmptyState onNewNote={handleCreateNote} />
          ) : (
            <div className="empty-selection" role="status" aria-live="polite">
              Select a note from the list or create a new note.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
