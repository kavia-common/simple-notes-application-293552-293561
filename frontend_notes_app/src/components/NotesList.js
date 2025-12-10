import React, { useMemo } from 'react';

/**
 * Format timestamp into relative string or locale.
 */
function formatUpdatedAt(ts) {
  try {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

const NoteListItem = React.memo(function NoteListItem({ note, selected, onSelect, onDelete }) {
  const title = note.title?.trim() || 'Untitled';
  const preview = (note.content || '').split('\n')[0];
  return (
    <div
      className="note-item"
      role="button"
      tabIndex={0}
      aria-selected={selected ? 'true' : 'false'}
      onClick={() => onSelect(note.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(note.id);
        }
      }}
    >
      <div className="note-title">{title}</div>
      <div className="note-actions">
        <button
          className="btn ghost"
          aria-label={`Delete note ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            // confirm in UI
            if (window.confirm('Delete this note? This cannot be undone.')) {
              onDelete(note.id);
            }
          }}
        >
          🗑
        </button>
      </div>
      <div className="note-preview">{preview}</div>
      <div className="note-meta">Updated {formatUpdatedAt(note.updatedAt)}</div>
    </div>
  );
});

/**
 * NotesList: renders searchable, selectable list; filtered and sorted by updatedAt desc.
 */
export default function NotesList({ notes, selectedId, onSelect, onDelete, query }) {
  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase();
    const arr = q
      ? notes.filter(
          (n) =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q)
        )
      : notes.slice();
    arr.sort((a, b) => b.updatedAt - a.updatedAt);
    return arr;
  }, [notes, query]);

  return (
    <div className="list-root">
      <div className="list-scroll" role="list">
        {filtered.length === 0 ? (
          <div className="empty" role="status" aria-live="polite">
            No notes match your search.
          </div>
        ) : (
          filtered.map((n) => (
            <NoteListItem
              key={n.id}
              note={n}
              selected={n.id === selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
