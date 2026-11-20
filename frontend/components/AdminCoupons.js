"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";

const EMPTY = {
  code: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minOrder: "",
  expiresAt: "",
  usageLimit: "",
  perUserLimit: "1",
};

const field =
  "w-full rounded-xl border-[1.5px] border-latte bg-white px-3 py-2 text-sm outline-none transition focus:border-caramel";

function Label({ text, hint, children }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{text}</span>
      {hint && <span className="ml-1 text-xs text-stone-400">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function AdminCoupons() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiRequest("/coupons", { token })
      .then(setCoupons)
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (text) => {
    setNote(text);
    setTimeout(() => setNote(""), 3000);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await apiRequest("/coupons", {
        method: "POST",
        token,
        body: {
          ...form,
          code: form.code.trim().toUpperCase(),
        },
      });
      setCoupons((prev) => [created, ...(prev || [])]);
      setForm(EMPTY);
      flash(`Coupon ${created.code} created ✓`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c) => {
    setError("");
    try {
      const updated = await apiRequest(`/coupons/${c._id}/toggle`, {
        method: "PATCH",
        token,
      });
      setCoupons((prev) => prev.map((x) => (x._id === c._id ? updated : x)));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    setError("");
    try {
      await apiRequest(`/coupons/${c._id}`, { method: "DELETE", token });
      setCoupons((prev) => prev.filter((x) => x._id !== c._id));
      flash("Coupon deleted");
    } catch (err) {
      setError(err.message);
    }
  };

  const status = (c) => {
    if (c.expiresAt && new Date(c.expiresAt) < new Date())
      return { text: "Expired", style: "bg-stone-200 text-stone-600" };
    if (c.usageLimit > 0 && c.usedCount >= c.usageLimit)
      return { text: "Used up", style: "bg-stone-200 text-stone-600" };
    if (!c.isActive)
      return { text: "Off", style: "bg-red-100 text-red-700" };
    return { text: "Active", style: "bg-green-100 text-green-700" };
  };

  return (
    <div>
      {note && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          {note}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </p>
      )}

      <form
        onSubmit={create}
        className="rounded-2xl border border-latte bg-cream/60 p-5"
      >
        <h3 className="font-semibold">Create a coupon</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Label text="Code" hint="e.g. WELCOME10">
            <input
              name="code"
              value={form.code}
              onChange={onChange}
              className={`${field} uppercase`}
              placeholder="WELCOME10"
              required
            />
          </Label>

          <Label text="Type">
            <select
              name="type"
              value={form.type}
              onChange={onChange}
              className={field}
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed amount (Tk)</option>
            </select>
          </Label>

          <Label text={form.type === "percent" ? "Percent" : "Amount (Tk)"}>
            <input
              name="value"
              type="number"
              min="1"
              value={form.value}
              onChange={onChange}
              className={field}
              required
            />
          </Label>

          {form.type === "percent" && (
            <Label text="Max discount (Tk)" hint="0 = no limit">
              <input
                name="maxDiscount"
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={onChange}
                className={field}
                placeholder="0"
              />
            </Label>
          )}

          <Label text="Minimum order (Tk)" hint="0 = none">
            <input
              name="minOrder"
              type="number"
              min="0"
              value={form.minOrder}
              onChange={onChange}
              className={field}
              placeholder="0"
            />
          </Label>

          <Label text="Expires on" hint="empty = never">
            <input
              name="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={onChange}
              className={field}
            />
          </Label>

          <Label text="Total uses" hint="0 = unlimited">
            <input
              name="usageLimit"
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={onChange}
              className={field}
              placeholder="0"
            />
          </Label>

          <Label text="Uses per customer" hint="0 = unlimited">
            <input
              name="perUserLimit"
              type="number"
              min="0"
              value={form.perUserLimit}
              onChange={onChange}
              className={field}
            />
          </Label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-shine mt-5 rounded-full bg-caramel px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
        >
          {saving ? "Creating..." : "➕ Create coupon"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {!coupons && !error && (
          <div className="h-24 animate-pulse rounded-2xl bg-latte" />
        )}

        {coupons && coupons.length === 0 && (
          <p className="rounded-xl bg-cream p-6 text-center text-sm text-stone-500">
            No coupons yet. Create your first one above.
          </p>
        )}

        {coupons &&
          coupons.map((c) => {
            const st = status(c);
            return (
              <div
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-latte p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-espresso px-3 py-1 font-mono text-sm font-bold tracking-wider text-white">
                      {c.code}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.style}`}
                    >
                      {st.text}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{c.description}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {c.minOrder > 0 ? `Min order ${c.minOrder} Tk · ` : ""}
                    Used {c.usedCount}
                    {c.usageLimit > 0 ? ` / ${c.usageLimit}` : ""} times
                    {c.perUserLimit > 0
                      ? ` · ${c.perUserLimit} per customer`
                      : ""}
                    {c.expiresAt
                      ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>

                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => toggle(c)}
                    className="rounded-full border border-latte px-4 py-1.5 font-medium transition hover:bg-cream"
                  >
                    {c.isActive ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    className="rounded-full border border-red-200 px-4 py-1.5 font-medium text-red-600 transition hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}