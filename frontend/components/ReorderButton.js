"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { apiGet } from "@/lib/api";
import { buildReorderLines } from "@/lib/reorder";

export default function ReorderButton({ order, className = "" }) {
  const { addMany, openCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const reorder = async () => {
    setBusy(true);
    setMsg("");
    try {
      const menu = await apiGet("/menu");
      const { lines, skipped } = buildReorderLines(order, menu);
      if (lines.length === 0) {
        setMsg("Sorry, none of these items are available right now.");
        return;
      }
      addMany(lines);
      if (skipped.length > 0) {
        setMsg(`Not available now, so skipped: ${skipped.join(", ")}`);
      }
      openCart();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={reorder}
        disabled={busy}
        className="btn-shine rounded-full bg-caramel px-5 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#b36a30] disabled:opacity-60"
      >
        {busy ? "Adding..." : "🔁 Order again"}
      </button>
      {msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
    </div>
  );
}