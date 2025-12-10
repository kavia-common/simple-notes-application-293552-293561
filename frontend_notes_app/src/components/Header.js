import React from 'react';

/**
 * Header with app title, search input, New Note button, and theme toggle.
 * Accessible controls with labels and keyboard focus.
 */
export default function Header({ onNewNote, query, onQueryChange, theme, onToggleTheme }) {
  return (
    <header className="header" role="banner">
      <div className="header-title" aria-label="Application title">Simple Notes</div>
      <div className="header-actions">
        <label htmlFor="search" className="sr-only">Search notes</label>
        <input
          id="search"
          type="search"
          className="search-input"
          placeholder="Search notes..."
          aria-label="Search notes"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button className="btn accent" onClick={onNewNote} aria-label="Create a new note">
          + New Note
        </button>
        <button className="btn ghost" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

// Utility screen-reader-only class
// Inject the CSS if not present; kept here for clarity in a template environment
if (typeof document !== 'undefined') {
  const id = 'sr-only-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`;
    document.head.appendChild(style);
  }
}
