"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiGet, apiRequest } from "@/lib/api";

export default function AdminMenu() {
  const { token } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiGet("/menu")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  if (!items) {
    return error ? (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">⚠️ {error}</p>
    ) : (
      <div className="h-64 animate-pulse rounded-2xl bg-latte" />
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = items.filter((i) => i.name.toLowerCase().includes(q));
  const groups = {};
  filtered.forEach((i) => {
    const cat = i.category ? i.category.name : "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(i);
  });

  const available = items.filter((i) => i.isAvailable).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          <span className="font-semibold text-green-600">{available}</span> of{" "}
          {items.length} items available
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search items..."
          className="w-full rounded-full border-[1.5px] border-latte bg-white px-4 py-2 text-sm outline-none transition focus:border-caramel sm:w-64"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          ⚠️ {error}
        </p>
      )}

      <div className="mt-6 space-y-8">
        {Object.keys(groups).map((cat) => (
          <section key={cat}>
            <h3 className="mb-3 text-lg font-semibold">{cat}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {groups[cat].map((item) => (
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
    </div>
  );
}