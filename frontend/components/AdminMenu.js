"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ItemEditor from "@/components/ItemEditor";
import { apiGet, apiRequest } from "@/lib/api";

export default function AdminMenu() {
  const { token } = useAuth();
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState({ text: "", warn: false });
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editing, setEditing] = useState(null);
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiGet("/menu"), apiGet("/categories")])
      .then(([menu, cats]) => {
        if (cancelled) return;
        setItems(menu);
        setCategories(cats);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = async () => {
    const [menu, cats] = await Promise.all([
      apiGet("/menu"),
      apiGet("/categories"),
    ]);
    setItems(menu);
    setCategories(cats);
  };

  const flash = (text, warn = false) => {
    setNote({ text, warn });
    setTimeout(() => setNote({ text: "", warn: false }), 4000);
  };

  const toggle = async (item) => {
    setBusyId(item._id);
    setError("");
    try {
      const res = await apiRequest(`/menu/${item._id}/availability`, {
        method: "PATCH",
        token,
      });
      setItems((prev) =>
        prev.map((i) =>
          i._id === res._id ? { ...i, isAvailable: res.isAvailable } : i
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  const remove = async (item) => {
    if (
      !window.confirm(
        `Delete "${item.name}"? This cannot be undone. Past orders keep their records.`
      )
    )
      return;
    setBusyId(item._id);
    setError("");
    try {
      await apiRequest(`/menu/${item._id}`, { method: "DELETE", token });
      await reload();
      flash(`"${item.name}" deleted`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  const onSaved = async (text, warn) => {
    setEditing(null);
    try {
      await reload();
    } catch (err) {
      setError(err.message);
    }
    flash(text, Boolean(warn));
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name) return;
    setError("");
    try {
      await apiRequest("/categories", {
        method: "POST",
        token,
        body: { name, order: categories.length },
      });
      setNewCat("");
      await reload();
      flash(`Category "${name}" added`);
    } catch (err) {
      setError(err.message);
    }
  };

  const renameCategory = async (cat) => {
    const name = window.prompt("New category name", cat.name);
    if (!name || !name.trim() || name.trim() === cat.name) return;
    setError("");
    try {
      await apiRequest(`/categories/${cat._id}`, {
        method: "PUT",
        token,
        body: { name: name.trim() },
      });
      await reload();
      flash("Category renamed");
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    setError("");
    try {
      await apiRequest(`/categories/${cat._id}`, { method: "DELETE", token });
      await reload();
      flash(`Category "${cat.name}" deleted`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!items) {
    return error ? (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">⚠️ {error}</p>
    ) : (
      <div className="h-64 animate-pulse rounded-2xl bg-latte" />
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = items.filter((i) => i.name.toLowerCase().includes(q));

  const groups = categories
    .map((c) => ({
      id: c._id,
      name: c.name,
      items: filtered.filter((i) => i.category && i.category._id === c._id),
    }))
    .filter((g) => g.items.length > 0);
  const orphan = filtered.filter(
    (i) => !i.category || !categories.some((c) => c._id === i.category._id)
  );
  if (orphan.length) groups.push({ id: "other", name: "Other", items: orphan });

  const available = items.filter((i) => i.isAvailable).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          <span className="font-semibold text-green-600">{available}</span> of{" "}
          {items.length} items available
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Search items..."
            className="rounded-full border-[1.5px] border-latte bg-white px-4 py-2 text-sm outline-none transition focus:border-caramel sm:w-56"
          />
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="btn-shine rounded-full bg-caramel px-5 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#b36a30]"
          >
            ➕ Add new item
          </button>
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-latte bg-cream/60 p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          📁 Manage categories ({categories.length})
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c._id}
              className="flex items-center gap-1 rounded-full bg-white py-1 pl-3 pr-1 text-sm shadow-sm"
            >
              {c.name}
              <button
                type="button"
                onClick={() => renameCategory(c)}
                aria-label={`Rename ${c.name}`}
                className="rounded-full px-1.5 transition hover:bg-latte"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => deleteCategory(c)}
                aria-label={`Delete ${c.name}`}
                className="rounded-full px-1.5 text-red-500 transition hover:bg-red-50"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={addCategory} className="mt-3 flex gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-full border-[1.5px] border-latte bg-white px-4 py-2 text-sm outline-none transition focus:border-caramel"
          />
          <button
            type="submit"
            className="rounded-full bg-espresso px-5 py-2 text-sm font-semibold text-white transition hover:bg-caramel"
          >
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-stone-500">
          A category can only be deleted when it has no items.
        </p>
      </details>

      {note.text && (
        <p
          className={`mt-4 rounded-lg px-4 py-2 text-sm font-medium ${
            note.warn ? "bg-yellow-50 text-yellow-800" : "bg-green-50 text-green-700"
          }`}
        >
          {note.warn ? "⚠️" : "✓"} {note.text}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          ⚠️ {error}
        </p>
      )}

      <div className="mt-6 space-y-8">
        {groups.map((g) => (
          <section key={g.id}>
            <h3 className="mb-3 text-lg font-semibold">{g.name}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {g.items.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition ${
                    item.isAvailable ? "" : "opacity-60"
                  }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-latte text-xl">
                      ☕
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-stone-500">
                      {item.price} Tk ·{" "}
                      {item.isAvailable ? "Available" : "Sold out"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    aria-label={`Edit ${item.name}`}
                    className="rounded-full p-2 transition hover:bg-latte"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => remove(item)}
                    aria-label={`Delete ${item.name}`}
                    className="rounded-full p-2 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    🗑️
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.isAvailable}
                    aria-label={`Toggle ${item.name}`}
                    disabled={busyId === item._id}
                    onClick={() => toggle(item)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-60 ${
                      item.isAvailable ? "bg-green-500" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-300 ${
                        item.isAvailable ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-stone-500">
            No items match your search.
          </p>
        )}
      </div>

      {editing && (
        <ItemEditor
          key={editing === "new" ? "new" : editing._id}
          item={editing === "new" ? null : editing}
          categories={categories}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}