'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Note = {
  id: string;
  title: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_NOTES_API_BASE ?? 'http://localhost:4001/api/notes';

async function jsonRequest<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }
  return data as T;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ title: '', body: '' });
  const [selectedId, setSelectedId] = useState('');
  const [updateForm, setUpdateForm] = useState({ title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedId), [notes, selectedId]);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jsonRequest<{ success: boolean; notes: Note[] }>(API_BASE);
      console.log('Fetched notes', data);
      setNotes(data.notes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch notes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setUpdateForm({ title: selectedNote.title, body: selectedNote.body ?? '' });
    } else {
      setUpdateForm({ title: '', body: '' });
    }
  }, [selectedNote]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { title: createForm.title.trim(), body: createForm.body.trim() };
      const data = await jsonRequest<{ success: boolean; note: Note }>(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('Create note response', data);
      setCreateForm({ title: '', body: '' });
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create note';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, string> = {};
      if (updateForm.title.trim() !== selectedNote?.title) {
        payload.title = updateForm.title.trim();
      }
      if ((updateForm.body ?? '').trim() !== (selectedNote?.body ?? '')) {
        payload.body = updateForm.body.trim();
      }
      if (Object.keys(payload).length === 0) {
        console.log('Update skipped: nothing changed');
        return;
      }
      const data = await jsonRequest<{ success: boolean; note: Note }>(`${API_BASE}/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('Update note response', data);
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update note';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      const data = await jsonRequest<{ success: boolean; message: string }>(`${API_BASE}/${selectedId}`, {
        method: 'DELETE',
      });
      console.log('Delete note response', data);
      setSelectedId('');
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete note';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Notes Playground</h1>
        <p className="text-sm text-muted-foreground">
          Interact with the Notes API running on the backend. Responses are logged to the browser console for demo purposes.
        </p>
      </header>

      <section className="space-y-4 rounded border border-border p-4">
        <h2 className="text-xl font-medium">Create Note</h2>
        <form className="flex flex-col gap-3" onSubmit={handleCreate}>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Title</span>
            <input
              type="text"
              value={createForm.title}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded border border-input px-3 py-2"
              placeholder="e.g. API demo"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Body</span>
            <textarea
              value={createForm.body}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, body: event.target.value }))}
              className="rounded border border-input px-3 py-2"
              rows={3}
              placeholder="Optional details"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Create Note'}
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded border border-border p-4">
        <h2 className="text-xl font-medium">Existing Notes</h2>
        {loading ? (
          <p>Loading notes…</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Create one above to get started.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className={`rounded border px-3 py-2 ${note.id === selectedId ? 'border-blue-500' : 'border-border'}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className="flex w-full flex-col items-start text-left"
                >
                  <span className="font-medium">{note.title}</span>
                  {note.body ? <span className="text-sm text-muted-foreground">{note.body}</span> : null}
                  <span className="mt-2 text-xs text-muted-foreground">
                    Updated {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : '—'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 rounded border border-border p-4">
        <h2 className="text-xl font-medium">Update / Delete</h2>
        {!selectedNote ? (
          <p>Select a note from the list above to edit or delete.</p>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleUpdate}>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Title</span>
              <input
                type="text"
                value={updateForm.title}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, title: event.target.value }))}
                className="rounded border border-input px-3 py-2"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Body</span>
              <textarea
                value={updateForm.body}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, body: event.target.value }))}
                className="rounded border border-input px-3 py-2"
                rows={3}
              />
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white"
                disabled={busy}
              >
                {busy ? 'Updating…' : 'Update Note'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white"
                disabled={busy}
              >
                {busy ? 'Deleting…' : 'Delete Note'}
              </button>
            </div>
          </form>
        )}
      </section>

      {error ? (
        <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </main>
  );
}
