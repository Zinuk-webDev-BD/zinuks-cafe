"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
import { useAuth } from "@/components/AuthProvider";
import RequireLogin from "@/components/RequireLogin";
import OrderTimeline from "@/components/OrderTimeline";
import { API_URL, apiRequest } from "@/lib/api";
import { burst } from "@/lib/burst";
import { playfair } from "@/lib/fonts";
import { STATUS_LABEL, STATUS_STYLE, formatDate } from "@/lib/status";

function OrderTracker() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [tick, setTick] = useState(0);
  const prevStatus = useRef(null);

  // আবার আনার জন্য শুধু tick বাড়ানো হয়
  const reload = useCallback(() => setTick((t) => t + 1), []);

  // অর্ডার আনা (tick বদলালেই আবার আনবে)
  useEffect(() => {
    let cancelled = false;
    apiRequest(`/orders/${id}`, { token })
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, tick]);

  // সকেটে লাইভ আপডেট
  useEffect(() => {
    const socket = io(new URL(API_URL).origin, { auth: { token } });
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("order:status", (payload) => {
      if (payload._id === id) reload();
    });
    return () => socket.disconnect();
  }, [token, id, reload]);

  const status = order ? order.status : null;

  // সকেট না চললেও ২০ সেকেন্ড পরপর আবার আনা
  useEffect(() => {
    if (!status || status === "delivered" || status === "cancelled") return;
    const timer = setInterval(reload, 20000);
    return () => clearInterval(timer);
  }, [status, reload]);

  // পৌঁছে গেলে আনন্দ
  useEffect(() => {
    if (
      status === "delivered" &&
      prevStatus.current &&
      prevStatus.current !== "delivered"
    ) {
      burst(
        window.innerWidth / 2,
        window.innerHeight / 3,
        ["🎉", "☕", "🍰", "✨", "🍕"],
        45
      );
    }
    prevStatus.current = status;
  }, [status]);

  const cancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await apiRequest(`/orders/${id}/cancel`, { method: "PATCH", token });
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/orders" className="text-sm text-stone-500 hover:text-caramel">
        ← All orders
      </Link>

      {error && !order && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          ⚠️ {error}
        </p>
      )}

      {!order && !error && (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-latte" />
      )}

      {order && (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className={`${playfair.className} text-3xl font-bold`}>
                {order.orderNumber}
              </h1>
              <p className="text-sm text-stone-500">
                Placed {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {live && status !== "delivered" && status !== "cancelled" && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Live
                </span>
              )}
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_STYLE[order.status]}`}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="card-in rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-5 text-lg font-semibold">Order status</h2>

              {order.status === "cancelled" ? (
                <div className="rounded-xl bg-red-50 p-5 text-center text-red-700">
                  <div className="text-4xl">😔</div>
                  <p className="mt-2 font-semibold">This order was cancelled</p>
                </div>
              ) : (
                <OrderTimeline
                  status={order.status}
                  history={order.statusHistory}
                />
              )}

              {order.status === "pending" && (
                <button
                  onClick={cancel}
                  disabled={cancelling}
                  className="mt-6 w-full rounded-full border border-red-300 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </button>
              )}
            </div>

            <div
              className="card-in space-y-5 rounded-2xl bg-white p-6 shadow-md"
              style={{ animationDelay: "0.15s" }}
            >
              <div>
                <h2 className="mb-3 text-lg font-semibold">Items</h2>
                <ul className="space-y-3 text-sm">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {it.quantity} x {it.name}
                          {it.variant ? ` (${it.variant})` : ""}
                        </p>
                        {it.addOns && it.addOns.length > 0 && (
                          <p className="text-xs text-stone-500">
                            + {it.addOns.map((a) => a.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0">{it.lineTotal} Tk</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1 border-t border-latte pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal</span>
                    <span>{order.subtotal} Tk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Delivery fee</span>
                    <span>{order.deliveryFee} Tk</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-caramel">{order.total} Tk</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-latte pt-4 text-sm">
                <h2 className="mb-2 text-lg font-semibold">Delivery</h2>
                <p className="font-medium">{order.address.name}</p>
                <p className="text-stone-600">{order.address.phone}</p>
                <p className="text-stone-600">{order.address.address}</p>
                {order.address.note && (
                  <p className="mt-1 text-stone-500">Note: {order.address.note}</p>
                )}
              </div>

              <div className="border-t border-latte pt-4 text-sm">
                <h2 className="mb-2 text-lg font-semibold">Payment</h2>
                <p>
                  💵 Cash on delivery ·{" "}
                  <span
                    className={
                      order.paymentStatus === "paid"
                        ? "font-semibold text-green-600"
                        : "text-stone-500"
                    }
                  >
                    {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <RequireLogin>
      <OrderTracker />
    </RequireLogin>
  );
}