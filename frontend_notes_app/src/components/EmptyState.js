import React from 'react';

/**
 * Empty state shown when there are no notes.
 */
export default function EmptyState({ onNewNote }) {
  return (
    <div className="empty" role="status" aria-live="polite">
      <div>
        <h2 style={{ marginTop: 0 }}>No notes yet</h2>
        <p>Create your first note to get started.</p>
        <button className="btn accent" onClick={onNewNote} aria-label="Create your first note">
          + New Note
        </button>
      </div>
    </div>
  );
}
