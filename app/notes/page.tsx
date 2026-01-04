"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

const STORAGE_KEY = "denivy_notes_v2";

function uid() {
  // good-enough unique id for local notes
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [query, setQuery] = useState("");

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Note[];
      setNotes(parsed);
      if (parsed.length) setActiveId(parsed[0].id);
      return;
    }

    // First run: create a starter note
    const first: Note = {
      id: uid(),
      title: "Welcome note",
      body: "Type anything here…\n\n• Groceries\n• Reminders\n• Ideas",
      updatedAt: Date.now(),
    };
    setNotes([first]);
    setActiveId(first.id);
  }, []);

  // Persist notes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, 250);
    return () => clearTimeout(t);
  }, [notes]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId),
    [notes, activeId]
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q)
      );
    });
  }, [notes, query]);

  function createNote() {
    const newNote: Note = {
      id: uid(),
      title: "Untitled",
      body: "",
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      // pick next note (or empty)
      const remaining = notes.filter((n) => n.id !== id);
      setActiveId(remaining[0]?.id ?? "");
    }
  }

  function updateActive(patch: Partial<Note>) {
    if (!activeId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? { ...n, ...patch, updatedAt: Date.now() }
          : n
      )
    );
  }

  const wordCount = useMemo(() => {
    const text = activeNote?.body?.trim() ?? "";
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [activeNote?.body]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notes</h1>
            <p className="mt-1 text-zinc-400">
              Multiple note pads. Autosaved locally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createNote}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              + New note
            </button>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-6 grid gap-4 md:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
            />

            <div className="mt-3 space-y-2">
              {filteredNotes.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-3 text-sm text-zinc-400">
                  No notes found.
                </div>
              ) : (
                filteredNotes.map((n) => {
                  const isActive = n.id === activeId;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setActiveId(n.id)}
                      className={[
                        "w-full text-left rounded-xl border p-3 transition",
                        isActive
                          ? "border-white/20 bg-white/10"
                          : "border-white/10 bg-zinc-950/30 hover:bg-white/5",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold truncate">
                            {n.title || "Untitled"}
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
                            {formatTime(n.updatedAt)}
                          </div>
                        </div>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(n.id);
                          }}
                          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
                          role="button"
                          aria-label="Delete note"
                          title="Delete note"
                        >
                          ✕
                        </span>
                      </div>

                      <div className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {n.body?.trim() ? n.body : "No content yet…"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Editor */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {!activeNote ? (
              <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4 text-zinc-400">
                No note selected. Create one with <b>+ New note</b>.
              </div>
            ) : (
              <>
                <input
                  value={activeNote.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="Note title..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
                />

                <textarea
                  value={activeNote.body}
                  onChange={(e) => updateActive({ body: e.target.value })}
                  placeholder="Write your note..."
                  className="mt-3 min-h-[55vh] w-full resize-none rounded-xl bg-zinc-950/40 p-4 outline-none placeholder:text-zinc-500"
                />

                <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
                  <div>{wordCount} words</div>
                  <div>Updated: {formatTime(activeNote.updatedAt)}</div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
