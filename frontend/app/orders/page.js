"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequireLogin from "@/components/RequireLogin";
import { apiRequest } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { STATUS_LABEL, STATUS_STYLE, formatDate } from "@/lib/status";

function OrdersList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiRequest("/orders/my", { token })
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className={`${playfair.className} text-4xl font-bold`}>My orders</h1>
      <p className="mt-1 text-stone-500">Tap an order to track it live.</p>

      <div className="mt-8 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
            ⚠️ {error}
          </p>
        )}

        {!orders && !error && (
          <>
            <div className="h-32 animate-pulse rounded-2xl bg-latte" />
            <div className="h-32 animate-pulse rounded-2xl bg-latte" />
          </>
        )}

        {orders && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="float text-6xl">🍽️</div>
            <p className="mt-3 font-semibold">No orders yet</p>
            <p className="text-sm text-stone-500">
              Your orders will show up here.
            </p>
            <Link
              href="/#menu"
              className="btn-shine mt-5 inline-block rounded-full bg-caramel px-6 py-2.5 font-semibold text-white transition hover:scale-105"
            >
              Order something tasty
            </Link>
          </div>
        )}

        {orders &&
          orders.map((o, i) => (
            <Link
              key={o._id}
              href={`/orders/${o._id}`}
              className="fade-up group block rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{o.orderNumber}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}
                >
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {formatDate(o.createdAt)}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-stone-600">
                {o.items.map((it) => `${it.quantity} x ${it.name}`).join(", ")}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-bold text-caramel">{o.total} Tk</p>
                <span className="text-sm font-medium text-caramel transition group-hover:translate-x-1">
                  Track order →
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireLogin>
      <OrdersList />
    </RequireLogin>
  );
}