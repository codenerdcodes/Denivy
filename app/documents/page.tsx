"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DocCategory = "Manuals" | "Receipts" | "IDs" | "Home" | "Other";

type DocItem = {
  id: string;
  title: string;
  category: DocCategory;
  location: string; // url or file path (text)
  notes: string;
  updatedAt: number;
};

const STORAGE_KEY = "denivy_documents_v1";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

const CATEGORIES: DocCategory[] = ["Manuals", "Receipts", "IDs", "Home", "Other"];

export default function DocumentsPage() {
  const [items, setItems] = useState<DocItem[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<DocCategory | "All">("All");

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocCategory>("Home");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    setItems(JSON.parse(raw) as DocItem[]);
  }, []);

  // save (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, 250);
    return () => clearTimeout(t);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((i) => (cat === "All" ? true : i.category === cat))
      .filter((i) => {
        if (!q) return true;
        return (
          i.title.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
        );
      });
  }, [items, query, cat]);

  function addItem() {
    const t = title.trim();
    if (!t) return;

    const item: DocItem = {
      id: uid(),
      title: t,
      category,
      location: location.trim(),
      notes: notes.trim(),
      updatedAt: Date.now(),
    };

    setItems((prev) => [item, ...prev]);

    // reset form
    setTitle("");
    setCategory("Home");
    setLocation("");
    setNotes("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="mt-1 text-zinc-400">
              A vault index for important home stuff. Autosaved locally.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ← Back
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[420px_1fr]">
          {/* Add Form */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-semibold">Add entry</h2>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm text-zinc-400">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Car registration, Dishwasher manual..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocCategory)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Location (optional)
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Paste a file path or URL"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Example: <span className="text-zinc-400">C:\Docs\manual.pdf</span>{" "}
                  or a Google Drive link.
                </p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any details… expiration dates, where it’s stored, etc."
                  className="mt-1 min-h-[140px] w-full resize-none rounded-xl border border-white/10 bg-zinc-950/40 p-3 text-sm outline-none placeholder:text-zinc-500"
                />
              </div>

              <button
                onClick={addItem}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                + Add to vault
              </button>
            </div>
          </section>

          {/* List */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Your entries</h2>

              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full sm:w-64 rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
                />
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value as any)}
                  className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none"
                >
                  <option value="All">All</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4 text-sm text-zinc-400">
                  No entries yet. Add your first one on the left.
                </div>
              ) : (
                filtered.map((i) => (
                  <div
                    key={i.id}
                    className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300">
                            {i.category}
                          </span>
                          <h3 className="font-semibold truncate">{i.title}</h3>
                        </div>

                        <div className="mt-2 text-xs text-zinc-500">
                          Updated: <span className="text-zinc-400">{formatTime(i.updatedAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(i.id)}
                        className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                        title="Remove"
                      >
                        Delete
                      </button>
                    </div>

                    {i.location ? (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300 break-words">
                        <span className="text-zinc-500">Location:</span>{" "}
                        {i.location}
                      </div>
                    ) : null}

                    {i.notes ? (
                      <div className="mt-3 text-sm text-zinc-300 whitespace-pre-wrap">
                        {i.notes}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
