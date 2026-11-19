"use client";

import { useState } from "react";
import FloatingInput from "@/components/FloatingInput";

const LABELS = [
  { key: "Home", icon: "🏠" },
  { key: "Office", icon: "🏢" },
  { key: "Other", icon: "📍" },
];

export default function AddressForm({
  initial,
  onSubmit,
  onCancel,
  saving,
  defaultName = "",
  defaultPhone = "",
}) {
  const [form, setForm] = useState(() => ({
    label: initial ? initial.label || "Home" : "Home",
    name: initial ? initial.name : defaultName,
    phone: initial ? initial.phone : defaultPhone,
    address: initial ? initial.address : "",
    isDefault: initial ? Boolean(initial.isDefault) : false,
  }));

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={submit}
      className="card-in space-y-4 rounded-2xl border border-latte bg-cream/60 p-5"
    >
      <div className="flex gap-2">
        {LABELS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setForm({ ...form, label: l.key })}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              form.label === l.key
                ? "border-caramel bg-caramel text-white"
                : "border-latte bg-white hover:border-caramel"
            }`}
          >
            {l.icon} {l.key}
          </button>
        ))}
      </div>

      <FloatingInput
        label="Contact name"
        icon="🙂"
        name="name"
        value={form.name}
        onChange={onChange}
        autoComplete="name"
      />
      <FloatingInput
        label="Phone"
        icon="📱"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={onChange}
        autoComplete="tel"
      />
      <FloatingInput
        label="Full address"
        icon="📍"
        name="address"
        value={form.address}
        onChange={onChange}
        autoComplete="street-address"
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="accent-[#c8793a]"
        />
        Make this my default address
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-latte bg-white px-6 py-2.5 text-sm font-medium transition hover:bg-cream"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-shine flex flex-1 items-center justify-center gap-2 rounded-full bg-caramel py-2.5 text-sm font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="spinner" /> Saving...
            </>
          ) : (
            "Save address"
          )}
        </button>
      </div>
    </form>
  );
}