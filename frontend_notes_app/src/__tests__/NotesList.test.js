import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import NotesList from '../components/NotesList';

function makeNote(id, title, content, updatedAt) {
  return { id, title, content, updatedAt };
}

describe('NotesList', () => {
  test('filters by title and content, case-insensitive', () => {
    const notes = [
      makeNote('1', 'Alpha', 'something', 100),
      makeNote('2', 'bravo', 'HELLO caps', 200),
      makeNote('3', 'hello world', 'misc', 300),
    ];
    render(
      <NotesList
        notes={notes}
        selectedId={null}
        onSelect={() => {}}
        onDelete={() => {}}
        query="HeLLo"
      />
    );
    const list = screen.getByRole('list');
    expect(within(list).getByText(/hello world/i)).toBeInTheDocument();
    expect(within(list).getByText(/bravo/i)).toBeInTheDocument();
    expect(within(list).queryByText(/alpha/i)).not.toBeInTheDocument();
  });

  test('orders by updatedAt descending', () => {
    const notes = [
      makeNote('1', 'First', '', 100),
      makeNote('2', 'Second', '', 300),
      makeNote('3', 'Third', '', 200),
    ];
    render(
      <NotesList
        notes={notes}
        selectedId={null}
        onSelect={() => {}}
        onDelete={() => {}}
        query=""
      />
    );
    const list = screen.getByRole('list');
    const titles = Array.from(list.querySelectorAll('.note-title')).map((n) =>
      n.textContent?.trim()
    );
    expect(titles).toEqual(['Second', 'Third', 'First']);
  });

  test('shows empty message when no matches', () => {
    const notes = [makeNote('1', 'Alpha', 'content', 100)];
    render(
      <NotesList
        notes={notes}
        selectedId={null}
        onSelect={() => {}}
        onDelete={() => {}}
        query="zzz"
      />
    );
    expect(screen.getByText(/no notes match your search/i)).toBeInTheDocument();
  });

  test('keyboard selection with Enter/Space triggers onSelect', () => {
    const notes = [makeNote('1', 'Note A', 'content', 100)];
    const onSelect = jest.fn();
    render(
      <NotesList
        notes={notes}
        selectedId={null}
        onSelect={onSelect}
        onDelete={() => {}}
        query=""
      />
    );
    const item = screen.getByText(/note a/i).closest('.note-item');
    item && fireEvent.keyDown(item, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
