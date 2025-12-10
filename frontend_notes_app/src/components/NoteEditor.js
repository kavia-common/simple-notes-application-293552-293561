import React, { useEffect } from 'react';

/**
 * Note editor: title and content fields. Parent supplies onChange to persist.
 */
export default function NoteEditor({ note, onChange, onDelete, focusTitleRef }) {
  useEffect(() => {
    // Attempt focusing title when provided
    if (focusTitleRef?.current) {
      focusTitleRef.current.focus();
    }
  }, [focusTitleRef, note?.id]);

  const handleTitle = (e) => {
    onChange({ title: e.target.value });
  };
  const handleContent = (e) => {
    onChange({ content: e.target.value });
  };

  const title = note?.title ?? '';
  const content = note?.content ?? '';

  return (
    <div className="editor-root">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          ref={focusTitleRef}
          className="title-input"
          placeholder="Title"
          aria-label="Note title"
          value={title}
          onChange={handleTitle}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => window.alert('All changes are saved automatically.')}
            aria-label="Save note"
          >
            💾 Saved
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              const newTitle = prompt('Rename note title:', title || 'Untitled');
              if (newTitle !== null) {
                onChange({ title: newTitle });
              }
            }}
            aria-label="Rename note"
          >
            ✏️ Rename
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              if (window.confirm('Delete this note? This cannot be undone.')) onDelete();
            }}
            aria-label="Delete note"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      <textarea
        className="content-textarea"
        placeholder="Start typing..."
        aria-label="Note content"
        value={content}
        onChange={handleContent}
      />
    </div>
  );
}
