"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiGet, apiRequest } from "@/lib/api";

export default function AdminSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [fee, setFee] = useState("");
  const [min, setMin] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet("/settings")
      .then((s) => {
        if (cancelled) return;
        setSettings(s);
        setFee(String(s.deliveryFee));
        setMin(String(s.minOrder));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (body, okMessage) => {
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const updated = await apiRequest("/settings", {
        method: "PUT",
        token,
        body,
      });
      setSettings(updated);
      setFee(String(updated.deliveryFee));
      setMin(String(updated.minOrder));
      setMsg(okMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNumbers = (e) => {
    e.preventDefault();
    const deliveryFee = Number(fee);
    const minOrder = Number(min);
    if (Number.isNaN(deliveryFee) || Number.isNaN(minOrder)) {
      setMsg("");
      setError("Please enter valid numbers");
      return;
    }
    save({ deliveryFee, minOrder }, "Saved ✓");
  };

  if (!settings) {
    return error ? (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">⚠️ {error}</p>
    ) : (
      <div className="h-64 animate-pulse rounded-2xl bg-latte" />
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div
        className={`flex items-center justify-between gap-4 rounded-2xl p-6 shadow-md transition-colors duration-500 ${
          settings.isOpen ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <div>
          <p className="text-sm text-stone-500">Cafe status</p>
          <p
            className={`text-2xl font-bold ${
              settings.isOpen ? "text-green-700" : "text-red-700"
            }`}
          >
            {settings.isOpen ? "🟢 Open for orders" : "🔴 Closed"}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            When closed, customers cannot place new orders.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.isOpen}
          aria-label="Toggle cafe open"
          disabled={saving}
          onClick={() =>
            save(
              { isOpen: !settings.isOpen },
              settings.isOpen ? "Cafe is now closed" : "Cafe is now open"
            )
          }
          className={`relative h-9 w-16 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-60 ${
            settings.isOpen ? "bg-green-500" : "bg-stone-400"
          }`}
        >
          <span
            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all duration-300 ${
              settings.isOpen ? "left-[34px]" : "left-1"
            }`}
          />
        </button>
      </div>

      <form
        onSubmit={saveNumbers}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold">Delivery and orders</h3>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Delivery fee (Tk)
          </label>
          <input
            type="number"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-latte px-4 py-2.5 outline-none transition focus:border-caramel"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Minimum order (Tk)
          </label>
          <input
            type="number"
            min="0"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-latte px-4 py-2.5 outline-none transition focus:border-caramel"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-3 font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="spinner" /> Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>

      {msg && (
        <p className="toast-in-inline rounded-lg bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700">
          ✓ {msg}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}