"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiRequest, apiUpload } from "@/lib/api";
import { playfair } from "@/lib/fonts";

const TAG_OPTIONS = [
  { key: "popular", label: "🔥 Popular" },
  { key: "veg", label: "🌿 Vegetarian" },
  { key: "spicy", label: "🌶️ Spicy" },
  { key: "new", label: "✨ New" },
];

const inputClass =
  "w-full rounded-xl border-[1.5px] border-latte px-4 py-2.5 outline-none transition focus:border-caramel focus:shadow-[0_0_0_4px_rgba(200,121,58,0.18)]";

function RowsEditor({ title, hint, rows, setRows, placeholder, addLabel }) {
  const update = (i, field, value) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-stone-500">{hint}</p>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={r.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder={placeholder}
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              min="0"
              value={r.price}
              onChange={(e) => update(i, "price", e.target.value)}
              placeholder="Tk"
              className={`${inputClass} w-24`}
            />
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
              aria-label="Remove row"
              className="rounded-full px-3 text-red-500 transition hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, { name: "", price: "" }])}
        className="mt-2 text-sm font-medium text-caramel hover:underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export default function ItemEditor({
  item,
  categories,
  token,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => ({
    name: item ? item.name : "",
    description: item ? item.description || "" : "",
    category: item && item.category ? item.category._id : categories[0] ? categories[0]._id : "",
    price: item ? String(item.price) : "",
    tags: item ? item.tags || [] : [],
    isAvailable: item ? item.isAvailable : true,
  }));
  const [variants, setVariants] = useState(() =>
    item ? (item.variants || []).map((v) => ({ name: v.name, price: String(v.price) })) : []
  );
  const [addOns, setAddOns] = useState(() =>
    item ? (item.addOns || []).map((a) => ({ name: a.name, price: String(a.price) })) : []
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item ? item.image || "" : "");
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleTag = (key) =>
    setForm({
      ...form,
      tags: form.tags.includes(key)
        ? form.tags.filter((t) => t !== key)
        : [...form.tags, key],
    });

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please choose an image file");
    if (f.size > 3 * 1024 * 1024) return setError("Image must be under 3 MB");
    setError("");
    setFile(f);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    setFile(null);
    setPreview("");
    setRemoveImage(true);
  };

  const cleanRows = (rows, label) => {
    const out = [];
    for (const r of rows) {
      const name = r.name.trim();
      if (!name && r.price === "") continue;
      const price = Number(r.price);
      if (!name || r.price === "" || Number.isNaN(price) || price < 0) {
        throw new Error(`Check the ${label}: each row needs a name and a price`);
      }
      out.push({ name, price });
    }
    return out;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    if (!form.name.trim()) return setError("Name is required");
    if (!form.category) return setError("Please choose a category");
    if (form.price === "" || Number.isNaN(price) || price < 0)
      return setError("Enter a valid price");

    setSaving(true);
    let saved;
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price,
        tags: form.tags,
        isAvailable: form.isAvailable,
        variants: cleanRows(variants, "sizes"),
        addOns: cleanRows(addOns, "extras"),
      };
      if (removeImage && !file) body.image = "";

      saved = item
        ? await apiRequest(`/menu/${item._id}`, { method: "PUT", token, body })
        : await apiRequest("/menu", { method: "POST", token, body });
    } catch (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    if (file) {
      try {
        const fd = new FormData();
        fd.append("image", file);
        await apiUpload(`/menu/${saved._id}/image`, fd, token);
      } catch (err) {
        onSaved(`Item saved, but the photo failed to upload: ${err.message}`, true);
        return;
      }
    }

    onSaved(item ? `"${saved.name}" updated` : `"${saved.name}" added to the menu`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={submit}
        className="card-in flex max-h-[94vh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-latte px-6 py-4">
          <h2 className={`${playfair.className} text-2xl font-bold`}>
            {item ? "Edit item" : "Add new item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-3xl leading-none text-stone-500 transition hover:rotate-90 hover:text-espresso"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {categories.length === 0 && (
            <p className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Add a category first, then you can add items to it.
            </p>
          )}

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="sm:w-44">
              <p className="mb-1 text-sm font-semibold">Photo</p>
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-latte sm:h-40">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-stone-400">
                    📷
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer text-sm font-medium text-caramel hover:underline">
                  {preview ? "Change" : "Choose photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                    className="hidden"
                  />
                </label>
                {preview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500">JPG or PNG, max 3 MB</p>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="e.g. Cold Brew"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    className={inputClass}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Price (Tk)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={onChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={2}
              placeholder="A short, tasty description"
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Tags</p>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTag(t.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    form.tags.includes(t.key)
                      ? "border-caramel bg-caramel text-white"
                      : "border-latte hover:border-caramel"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <RowsEditor
            title="Sizes (optional)"
            hint="If you add sizes, set the price above to the smallest size"
            rows={variants}
            setRows={setVariants}
            placeholder="e.g. Large"
            addLabel="Add size"
          />

          <RowsEditor
            title="Extras (optional)"
            hint="Customers can tick these (price is added)"
            rows={addOns}
            setRows={setAddOns}
            placeholder="e.g. Extra shot"
            addLabel="Add extra"
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm({ ...form, isAvailable: e.target.checked })
              }
              className="accent-[#c8793a]"
            />
            Available to order
          </label>

          {error && (
            <p className="shake rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-latte px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-latte px-6 py-2.5 font-medium transition hover:bg-cream"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || categories.length === 0}
            className="btn-shine flex flex-1 items-center justify-center gap-2 rounded-full bg-caramel py-2.5 font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="spinner" /> Saving...
              </>
            ) : item ? (
              "Save changes"
            ) : (
              "Add to menu"
            )}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}