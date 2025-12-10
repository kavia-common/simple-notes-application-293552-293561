import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NoteEditor from '../components/NoteEditor';

describe('NoteEditor', () => {
  test('renders title and content, calls onChange on edits', () => {
    const note = { id: 'n1', title: 'T', content: 'C', updatedAt: 1 };
    const onChange = jest.fn();
    render(
      <NoteEditor note={note} onChange={onChange} onDelete={() => {}} focusTitleRef={{ current: null }} />
    );
    fireEvent.change(screen.getByRole('textbox', { name: /note title/i }), {
      target: { value: 'New Title' },
    });
    expect(onChange).toHaveBeenCalledWith({ title: 'New Title' });

    fireEvent.change(screen.getByRole('textbox', { name: /note content/i }), {
      target: { value: 'Body' },
    });
    expect(onChange).toHaveBeenCalledWith({ content: 'Body' });
  });

  test('delete button calls onDelete after confirm', () => {
    const onDelete = jest.fn();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const note = { id: 'n1', title: 'T', content: '', updatedAt: 1 };
    render(
      <NoteEditor note={note} onChange={() => {}} onDelete={onDelete} focusTitleRef={{ current: null }} />
    );
    fireEvent.click(screen.getByRole('button', { name: /delete note/i }));
    expect(onDelete).toHaveBeenCalled();
  });

  test('rename button prompts and applies title change', () => {
    const onChange = jest.fn();
    jest.spyOn(window, 'prompt').mockReturnValue('Renamed Title');
    const note = { id: 'n1', title: 'Old', content: '', updatedAt: 1 };
    render(
      <NoteEditor note={note} onChange={onChange} onDelete={() => {}} focusTitleRef={{ current: null }} />
    );
    fireEvent.click(screen.getByRole('button', { name: /rename note/i }));
    expect(onChange).toHaveBeenCalledWith({ title: 'Renamed Title' });
  });

  test('save button is present and accessible', () => {
    const note = { id: 'n1', title: '', content: '', updatedAt: 1 };
    render(
      <NoteEditor note={note} onChange={() => {}} onDelete={() => {}} focusTitleRef={{ current: null }} />
    );
    expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument();
  });
});
