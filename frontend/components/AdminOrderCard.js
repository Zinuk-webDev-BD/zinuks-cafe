"use client";

import { STATUS_LABEL, STATUS_STYLE, formatDate } from "@/lib/status";

const NEXT = {
  pending: { to: "confirmed", label: "✅ Confirm" },
  confirmed: { to: "preparing", label: "🍳 Start preparing" },
  preparing: { to: "out_for_delivery", label: "🛵 Send out" },
  out_for_delivery: { to: "delivered", label: "🎉 Mark delivered" },
};

const CANCELLABLE = ["pending", "confirmed", "preparing"];

export default function AdminOrderCard({
  order,
  busy,
  fresh,
  onAdvance,
  onCancel,
}) {
  const next = NEXT[order.status];

  return (
    <article
      className={`card-in flex flex-col rounded-2xl bg-white p-5 shadow-md ${
        fresh ? "flash-new ring-2 ring-caramel" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{order.orderNumber}</p>
          <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span>
              {it.quantity} x {it.name}
              {it.variant ? ` (${it.variant})` : ""}
              {it.addOns && it.addOns.length > 0
                ? ` + ${it.addOns.map((a) => a.name).join(", ")}`
                : ""}
            </span>
            <span className="shrink-0 text-stone-500">{it.lineTotal}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg bg-cream p-3 text-sm">
        <p className="font-medium">{order.address.name}</p>
        <a
          href={`tel:${order.address.phone}`}
          className="text-caramel hover:underline"
        >
          📞 {order.address.phone}
        </a>
        <p className="text-stone-600">📍 {order.address.address}</p>
        {order.address.note && (
          <p className="mt-1 text-stone-500">📝 {order.address.note}</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-lg font-bold text-caramel">{order.total} Tk</p>
        <p className="text-xs text-stone-500">
          💵 COD · {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
        </p>
      </div>

      {(next || CANCELLABLE.includes(order.status)) && (
        <div className="mt-auto flex gap-2 pt-4">
          {next && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdvance(order, next.to)}
              className="btn-shine flex-1 rounded-full bg-caramel py-2.5 text-sm font-semibold text-white transition hover:bg-[#b36a30] active:scale-95 disabled:opacity-60"
            >
              {busy ? "Updating..." : next.label}
            </button>
          )}
          {CANCELLABLE.includes(order.status) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancel(order)}
              className="rounded-full border border-red-300 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </article>
  );
}