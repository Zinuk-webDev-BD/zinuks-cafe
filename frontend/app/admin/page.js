"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/components/AuthProvider";
import RequireAdmin from "@/components/RequireAdmin";
import AdminOrderCard from "@/components/AdminOrderCard";
import AdminMenu from "@/components/AdminMenu";
import AdminSettings from "@/components/AdminSettings";
import AnimatedNumber from "@/components/AnimatedNumber";
import { API_URL, apiRequest } from "@/lib/api";
import { enableSound, beep } from "@/lib/beep";
import { playfair } from "@/lib/fonts";

const ACTIVE = ["pending", "confirmed", "preparing", "out_for_delivery"];
const FILTERS = [
  { key: "active", label: "Active" },
  { key: "pending", label: "New" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];
const TABS = [
  { key: "orders", label: "📦 Orders" },
  { key: "menu", label: "🍽️ Menu" },
  { key: "settings", label: "⚙️ Settings" },
];

const matches = (order, filter) => {
  if (filter === "all") return true;
  if (filter === "active") return ACTIVE.includes(order.status);
  return order.status === filter;
};

function Dashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("active");
  const [live, setLive] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [fresh, setFresh] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [todayStr] = useState(() => new Date().toDateString());
  const soundRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/orders", { token })
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

  useEffect(() => {
    const socket = io(new URL(API_URL).origin, { auth: { token } });
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));

    socket.on("order:new", (order) => {
      setOrders((prev) => {
        const list = prev || [];
        if (list.some((o) => o._id === order._id)) return list;
        return [order, ...list];
      });
      setFresh((prev) => [...prev, order._id]);
      setTimeout(
        () => setFresh((prev) => prev.filter((id) => id !== order._id)),
        8000
      );
      if (soundRef.current) beep();
    });

    socket.on("order:updated", (order) => {
      setOrders((prev) => {
        const list = prev || [];
        return list.some((o) => o._id === order._id)
          ? list.map((o) => (o._id === order._id ? { ...o, ...order } : o))
          : [order, ...list];
      });
    });

    return () => socket.disconnect();
  }, [token]);

  const toggleSound = () => {
    const next = !soundOn;
    if (next) {
      enableSound();
      beep();
    }
    soundRef.current = next;
    setSoundOn(next);
  };

  const changeStatus = async (order, status) => {
    setBusyId(order._id);
    setError("");
    try {
      const updated = await apiRequest(`/orders/${order._id}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  const cancel = (order) => {
    if (window.confirm(`Cancel order ${order.orderNumber}?`)) {
      changeStatus(order, "cancelled");
    }
  };

  const list = orders || [];
  const todays = list.filter(
    (o) => new Date(o.createdAt).toDateString() === todayStr
  );
  const newCount = list.filter((o) => o.status === "pending").length;
  const inKitchen = list.filter((o) =>
    ["confirmed", "preparing"].includes(o.status)
  ).length;
  const revenue = todays
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { icon: "🔔", label: "New orders", value: newCount, hot: newCount > 0 },
    { icon: "🍳", label: "In the kitchen", value: inKitchen },
    { icon: "📦", label: "Orders today", value: todays.length },
    { icon: "💰", label: "Sales today (Tk)", value: revenue },
  ];

  const visible = list.filter((o) => matches(o, filter));

  return (
    <div>
      <section className="bg-espresso px-4 pb-24 pt-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className={`${playfair.className} fade-up text-3xl font-bold sm:text-4xl`}
            >
              Cafe dashboard
            </h1>
            <p
              className="fade-up mt-1 flex items-center gap-2 text-sm text-stone-300"
              style={{ animationDelay: "0.15s" }}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  live ? "animate-pulse bg-green-400" : "bg-red-400"
                }`}
              />
              {live ? "Live: new orders appear instantly" : "Connecting..."}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:scale-105 ${
              soundOn
                ? "border-green-400 bg-green-500/20 text-green-200"
                : "border-white/30 text-white hover:bg-white/10"
            }`}
          >
            {soundOn ? "🔔 Sound on" : "🔕 Turn sound on"}
          </button>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-caramel text-white shadow-lg"
                  : "bg-white/10 text-stone-200 hover:bg-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mx-auto -mt-14 max-w-7xl px-4 pb-16">
        {tab === "orders" && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`card-in rounded-2xl bg-white p-5 shadow-lg ${
                    s.hot ? "ring-2 ring-caramel" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`text-2xl ${s.hot ? "float" : ""}`}>
                    {s.icon}
                  </div>
                  <p
                    className={`${playfair.className} mt-2 text-3xl font-bold ${
                      s.hot ? "text-caramel" : ""
                    }`}
                  >
                    <AnimatedNumber value={s.value} />
                  </p>
                  <p className="text-xs text-stone-500">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => {
                const count = list.filter((o) => matches(o, f.key)).length;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      filter === f.key
                        ? "border-caramel bg-caramel text-white"
                        : "border-latte bg-white hover:border-caramel"
                    }`}
                  >
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
                ⚠️ {error}
              </p>
            )}

            {!orders && !error && (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-2xl bg-latte"
                  />
                ))}
              </div>
            )}

            {orders && visible.length === 0 && (
              <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-md">
                <div className="float text-6xl">😌</div>
                <p className="mt-3 font-semibold">Nothing here right now</p>
                <p className="text-sm text-stone-500">
                  New orders will pop up here instantly.
                </p>
              </div>
            )}

            {orders && visible.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((order) => (
                  <AdminOrderCard
                    key={order._id}
                    order={order}
                    busy={busyId === order._id}
                    fresh={fresh.includes(order._id)}
                    onAdvance={changeStatus}
                    onCancel={cancel}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "menu" && (
          <div className="card-in rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Menu availability</h2>
            <AdminMenu />
          </div>
        )}

        {tab === "settings" && (
          <div className="card-in rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Cafe settings</h2>
            <AdminSettings />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <Dashboard />
    </RequireAdmin>
  );
}