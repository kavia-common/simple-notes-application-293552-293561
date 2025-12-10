import { useCallback, useRef, useState } from 'react';
import { newId } from '../utils/id';

/**
 * Note type JSDoc
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} updatedAt
 */

// PUBLIC_INTERFACE
export function useNotes(storage) {
  /** Public hook: manages notes and persistence. */
  const [notes, setNotes] = useState(
    /** @type {Note[]} */([])
  );
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const selectingRef = useRef(false);

  const persist = useCallback((next) => {
    setNotes(next);
    storage.set(next);
  }, [storage]);

  const loadFromStorage = useCallback(() => {
    const loaded = storage.get() || [];
    // basic validation
    const cleaned = Array.isArray(loaded)
      ? loaded
          .filter((n) => n && typeof n.id === 'string')
          .map((n) => ({
            id: String(n.id),
            title: String(n.title || ''),
            content: String(n.content || ''),
            updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
          }))
      : [];
    setNotes(cleaned);
  }, [storage]);

  const createNote = useCallback(() => {
    const id = newId();
    const now = Date.now();
    const note = { id, title: '', content: '', updatedAt: now };
    const next = [note, ...notes];
    persist(next);
    selectingRef.current = true;
    return id;
  }, [notes, persist]);

  const updateNote = useCallback((id, patch) => {
    const now = Date.now();
    let next = notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now } : n));
    // reorder by updatedAt desc
    next = next.sort((a, b) => b.updatedAt - a.updatedAt);
    persist(next);
  }, [notes, persist]);

  const deleteNote = useCallback((id) => {
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const next = notes.filter((n) => n.id !== id);
    persist(next);
    // select nearest remaining
    if (next.length === 0) {
      setSelectedNoteId(null);
      return;
    }
    const neighbor = next[Math.max(0, idx - 1)];
    setSelectedNoteId(neighbor?.id ?? null);
  }, [notes, persist]);

  // Ensure selecting newly created note does not get overridden
  const setSelectedSafe = useCallback((id) => {
    setSelectedNoteId(id);
    selectingRef.current = false;
  }, []);

  return {
    notes,
    selectedNoteId,
    setSelectedNoteId: setSelectedSafe,
    createNote,
    updateNote,
    deleteNote,
    loadFromStorage,
  };
}
