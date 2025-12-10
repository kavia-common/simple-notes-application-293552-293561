import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import App from '../App';

// Helpers
const getNewNoteButtons = () => [
  ...screen.queryAllByRole('button', { name: /new note/i }),
  ...screen.queryAllByRole('button', { name: /create (a )?new note/i }),
  ...screen.queryAllByRole('button', { name: /create your first note/i }),
];

function createNoteViaHeader() {
  const btn = screen.getByRole('button', { name: /create a new note/i });
  fireEvent.click(btn);
}

function typeInTitle(value) {
  const title = screen.getByRole('textbox', { name: /note title/i });
  fireEvent.change(title, { target: { value } });
  return title;
}

function typeInContent(value) {
  const content = screen.getByRole('textbox', { name: /note content/i });
  fireEvent.change(content, { target: { value } });
  return content;
}

describe('App integration flows', () => {
  beforeEach(() => {
    // fresh render each test; localStorage mocked in setupTestUtils
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('1) header renders with New Note button and search', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/simple notes/i)).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create a new note/i })).toBeInTheDocument();
    // theme toggle present with aria-label
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  test('2) creating a note adds it to the list and selects editor; focus moves to title', () => {
    render(<App />);
    createNoteViaHeader();
    const title = screen.getByRole('textbox', { name: /note title/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveFocus();
    // Note should appear in list as "Untitled"
    const list = screen.getByLabelText(/notes list/i);
    const untitled = within(list).getByText(/untitled/i);
    expect(untitled).toBeInTheDocument();
    // selected
    const item = untitled.closest('.note-item');
    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  test('3) editing title updates list item and reorders by updatedAt', () => {
    render(<App />);
    // Two notes to test ordering
    createNoteViaHeader(); // note A
    typeInTitle('First');
    jest.advanceTimersByTime(350); // persist debounce
    createNoteViaHeader(); // note B newest
    typeInTitle('Second');
    jest.advanceTimersByTime(350);

    // Edit First's content to bump updatedAt and reorder to top
    const list = screen.getByLabelText(/notes list/i);
    const firstItem = within(list).getByText(/first/i);
    fireEvent.click(firstItem);

    // Change First content
    typeInContent('Update First content');
    jest.advanceTimersByTime(10);

    // List should reorder with "First" at the top now (updated most recently)
    const titles = within(list).getAllByClassName?.('note-title')
      ?? Array.from(list.querySelectorAll('.note-title'));
    const titleTexts = titles.map((el) => el.textContent?.trim());
    expect(titleTexts[0]?.toLowerCase()).toBe('first');
  });

  test('4) deleting a note removes it and selects next or shows EmptyState', () => {
    render(<App />);
    // create two notes
    createNoteViaHeader(); // first
    typeInTitle('Alpha');
    jest.advanceTimersByTime(350);

    createNoteViaHeader(); // second
    typeInTitle('Beta');
    jest.advanceTimersByTime(350);

    // Delete Beta from editor button (confirm mocked to true)
    const deleteBtn = screen.getByRole('button', { name: /delete note/i });
    fireEvent.click(deleteBtn);

    // Beta should be gone, and Alpha still in list
    const list = screen.getByLabelText(/notes list/i);
    expect(within(list).queryByText(/beta/i)).not.toBeInTheDocument();
    expect(within(list).getByText(/alpha/i)).toBeInTheDocument();

    // Now delete Alpha as well
    fireEvent.click(within(list).getByText(/alpha/i));
    fireEvent.click(screen.getByRole('button', { name: /delete note/i }));

    // Empty state visible (no notes)
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
    // And new note CTA is present
    expect(getNewNoteButtons().length).toBeGreaterThan(0);
  });

  test('5) search filters by title and content case-insensitively', () => {
    render(<App />);
    // Create three notes
    createNoteViaHeader();
    typeInTitle('Hello World');
    typeInContent('First content');
    jest.advanceTimersByTime(350);

    createNoteViaHeader();
    typeInTitle('Another Note');
    typeInContent('HELLO inside content');
    jest.advanceTimersByTime(350);

    createNoteViaHeader();
    typeInTitle('Misc');
    typeInContent('random text');
    jest.advanceTimersByTime(350);

    const search = screen.getByRole('searchbox', { name: /search notes/i });
    fireEvent.change(search, { target: { value: 'hello' } });

    const list = screen.getByLabelText(/notes list/i);
    // Should show items where title or content contains "hello" case-insensitive
    expect(within(list).getByText(/hello world/i)).toBeInTheDocument();
    expect(within(list).getByText(/another note/i)).toBeInTheDocument();
    // "Misc" should be filtered out
    expect(within(list).queryByText(/misc/i)).not.toBeInTheDocument();
  });

  test('6) notes persist via localStorage across remounts (mocked) and debounce respected', () => {
    const { unmount, rerender } = render(<App />);
    // Create a note and type data
    createNoteViaHeader();
    typeInTitle('Persisted');
    typeInContent('Keep me');
    // Debounced write: advance past 300ms
    act(() => {
      jest.advanceTimersByTime(350);
    });
    // Ensure localStorage wrote
    const setCalls = window.localStorage.setItem.mock.calls;
    expect(setCalls.length).toBeGreaterThan(0);
    const lastPayload = JSON.parse(setCalls[setCalls.length - 1][1]);
    expect(Array.isArray(lastPayload)).toBe(true);
    expect(lastPayload[0].title).toBe('Persisted');
    expect(lastPayload[0].content).toBe('Keep me');

    // Simulate "reload" by remounting App -> storage.get() returns previous state
    unmount();
    rerender(<App />);

    // After loadFromStorage useEffect
    // The note should be listed
    const list = screen.getByLabelText(/notes list/i);
    expect(within(list).getByText(/persisted/i)).toBeInTheDocument();
  });

  test('7) basic a11y: focus moves to title on new note; controls have accessible names', () => {
    render(<App />);
    // Before creating, verify header buttons have aria-labels
    expect(screen.getByRole('button', { name: /create a new note/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();

    createNoteViaHeader();
    const title = screen.getByRole('textbox', { name: /note title/i });
    expect(title).toHaveFocus();

    // Editor action buttons
    expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rename note/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete note/i })).toBeInTheDocument();
  });

  test('8) no backend calls are made (no fetch/xhr usage)', () => {
    const fetchSpy = jest.spyOn(window, 'fetch' as any).mockImplementation(() =>
      Promise.reject(new Error('unexpected fetch call'))
    );
    // XMLHttpRequest spy
    const xhrOpen = jest.fn();
    const xhrSend = jest.fn();
    // @ts-ignore
    const OriginalXHR = window.XMLHttpRequest;
    // Minimal stub to detect usage
    // @ts-ignore
    function XHRMock() {
      this.open = xhrOpen;
      this.send = xhrSend;
    }
    // @ts-ignore
    window.XMLHttpRequest = XHRMock;

    render(<App />);
    createNoteViaHeader();
    typeInTitle('Offline Only');
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
    expect(xhrSend).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    // @ts-ignore
    window.XMLHttpRequest = OriginalXHR;
  });
});
