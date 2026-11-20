"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import RequireLogin from "@/components/RequireLogin";
import FloatingInput from "@/components/FloatingInput";
import AuthSuccess from "@/components/AuthSuccess";
import CheckoutSteps from "@/components/CheckoutSteps";
import AnimatedNumber from "@/components/AnimatedNumber";
import { apiGet, apiRequest } from "@/lib/api";
import { burst } from "@/lib/burst";
import { playfair } from "@/lib/fonts";

const ICON = { Home: "🏠", Office: "🏢", Other: "📍" };

const DECOR = [
  { e: "☕", left: "6%", top: "18%", size: "3.5rem", dur: 9, delay: 0 },
  { e: "🍰", left: "88%", top: "12%", size: "3rem", dur: 11, delay: -3 },
  { e: "🥐", left: "12%", top: "62%", size: "3rem", dur: 10, delay: -6 },
  { e: "🍩", left: "84%", top: "58%", size: "3.5rem", dur: 12, delay: -2 },
];

function Band({ current, title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-espresso px-4 pb-20 pt-12 text-center text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {DECOR.map((d, i) => (
          <span
            key={i}
            className="drift absolute select-none"
            style={{
              left: d.left,
              top: d.top,
              fontSize: d.size,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
            }}
          >
            {d.e}
          </span>
        ))}
      </div>

      <div className="relative z-10">
        <h1
          className={`${playfair.className} fade-up text-4xl font-bold sm:text-5xl`}
        >
          {title}
        </h1>
        <p
          className="fade-up mt-2 text-stone-300"
          style={{ animationDelay: "0.15s" }}
        >
          {subtitle}
        </p>
        <div className="fade-up mt-8" style={{ animationDelay: "0.3s" }}>
          <CheckoutSteps current={current} />
        </div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[-1px] h-14 w-full sm:h-20"
        fill="#faf5ee"
      >
        <path d="M0,60 C180,120 360,0 540,50 C720,100 900,10 1080,55 C1260,100 1350,40 1440,60 L1440,120 L0,120 Z" />
      </svg>
    </section>
  );
}

function StepTitle({ n, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-sm font-bold text-white">
        {n}
      </span>
      <h2 className="text-xl font-semibold">{children}</h2>
    </div>
  );
}

function CheckoutForm() {
  const { user, token } = useAuth();
  const { items, subtotal, mounted, clearCart, updateQty } = useCart();
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [saveAddress, setSaveAddress] = useState(true);
  const [label, setLabel] = useState("Home");
  const [form, setForm] = useState({
    name: null,
    phone: "",
    address: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(null);
    const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState(null); // { code, discount, description }
  const [couponMsg, setCouponMsg] = useState("");
  const [checking, setChecking] = useState(false);
  const appliedCode = applied ? applied.code : "";

  // Cart changed after applying? Check the coupon again with the new subtotal
  useEffect(() => {
    if (!appliedCode) return;
    let cancelled = false;
    apiRequest("/coupons/validate", {
      method: "POST",
      token,
      body: { code: appliedCode, subtotal },
    })
      .then((data) => {
        if (!cancelled) setApplied(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setApplied(null);
        setCouponMsg(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [subtotal, appliedCode, token]);

  useEffect(() => {
    apiGet("/settings")
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/auth/me", { token })
      .then((data) => {
        if (cancelled) return;
        const addrs = data.user.addresses || [];
        setSaved(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          setSelectedId(def._id);
          setForm((f) => ({
            ...f,
            name: def.name,
            phone: def.phone,
            address: def.address,
          }));
        } else if (data.user.phone) {
          setForm((f) => ({ ...f, phone: f.phone || data.user.phone }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const name = form.name !== null ? form.name : user ? user.name : "";
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pick = (a) => {
    setSelectedId(a._id);
    setForm((f) => ({
      ...f,
      name: a.name,
      phone: a.phone,
      address: a.address,
    }));
  };

  const chooseNew = () => {
    setSelectedId("new");
    setForm((f) => ({ ...f, name: null, phone: "", address: "" }));
  };

  const deliveryFee = settings ? settings.deliveryFee : 0;
  const minOrder = settings ? settings.minOrder : 0;
  const isOpen = settings ? settings.isOpen : true;
    const discount = applied ? Math.min(applied.discount, subtotal) : 0;
  const total = subtotal - discount + deliveryFee;
  const belowMin = subtotal < minOrder;
  const progress =
    minOrder > 0 ? Math.min(100, (subtotal / minOrder) * 100) : 100;
  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setChecking(true);
    setCouponMsg("");
    try {
      const data = await apiRequest("/coupons/validate", {
        method: "POST",
        token,
        body: { code, subtotal },
      });
      setApplied(data);
      setCouponInput("");
    } catch (err) {
      setCouponMsg(err.message);
    } finally {
      setChecking(false);
    }
  };

  const removeCoupon = () => {
    setApplied(null);
    setCouponMsg("");
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const order = await apiRequest("/orders", {
        method: "POST",
        token,
        body: {
          items: items.map((i) => ({
            menuItem: i.menuItem,
            quantity: i.quantity,
            variant: i.variant || undefined,
            addOns: i.addOns.map((a) => a.name),
          })),
          address: {
            name,
            phone: form.phone,
            address: form.address,
            note: form.note,
          },
          paymentMethod: "cod",
                    couponCode: applied ? applied.code : undefined,
        },
      });

      // নতুন ঠিকানা হলে ও টিক থাকলে পরের বারের জন্য সেভ
      if (selectedId === "new" && saveAddress) {
        const exists = saved.some(
          (a) =>
            a.address.trim().toLowerCase() === form.address.trim().toLowerCase()
        );
        if (!exists) {
          try {
            await apiRequest("/auth/addresses", {
              method: "POST",
              token,
              body: { label, name, phone: form.phone, address: form.address },
            });
          } catch {}
        }
      }

      clearCart();
      burst(
        window.innerWidth / 2,
        window.innerHeight / 2,
        ["☕", "🍰", "🎉", "✨", "🍕", "🥐"],
        45
      );
      setPlaced(order);
    } catch (err) {
      setError(err.message);
      setErrorKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div>
        <Band
          current={3}
          title="Order placed!"
          subtitle="The kitchen has your order."
        />
        <div className="mx-auto max-w-lg px-4 pb-16">
          <div className="card-in -mt-6 overflow-hidden rounded-3xl bg-white p-8 text-center shadow-xl shadow-espresso/10">
            <AuthSuccess
              message={`Order ${placed.orderNumber} placed!`}
              sub={`Total ${placed.total} Tk. Pay cash when it arrives.`}
            />

            <div className="relative mx-auto my-2 h-10 max-w-xs overflow-hidden">
              <span className="absolute inset-x-0 bottom-0 border-b-2 border-dashed border-latte" />
              <span className="ride text-3xl">🛵</span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/orders/${placed._id}`}
                className="btn-shine pulse-ring rounded-full bg-caramel px-6 py-3 font-semibold text-white transition hover:scale-105"
              >
                Track my order
              </Link>
              <Link
                href="/#menu"
                className="rounded-full border border-latte px-6 py-3 font-medium transition hover:bg-cream"
              >
                Back to menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="h-48 animate-pulse rounded-2xl bg-latte" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="float text-6xl">🛒</div>
        <h1 className={`${playfair.className} mt-4 text-2xl font-bold`}>
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Add something delicious to get started.
        </p>
        <Link
          href="/#menu"
          className="btn-shine mt-6 inline-block rounded-full bg-caramel px-8 py-3 font-semibold text-white transition hover:scale-105"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Band
        current={1}
        title="Checkout"
        subtitle="Almost there, just tell us where to deliver."
      />

      <div className="mx-auto max-w-5xl px-4 pb-16">
        {settings && !isOpen && (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
            The cafe is closed right now, so orders are paused.
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          <form
            onSubmit={onSubmit}
            className="card-in space-y-5 rounded-2xl bg-white p-6 shadow-md lg:col-span-3"
          >
            <StepTitle n="1">Delivery details</StepTitle>

            {saved.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {saved.map((a) => (
                  <button
                    type="button"
                    key={a._id}
                    onClick={() => pick(a)}
                    className={`relative rounded-xl border-2 p-3 text-left transition ${
                      selectedId === a._id
                        ? "border-caramel bg-cream"
                        : "border-latte hover:border-caramel/60"
                    }`}
                  >
                    {selectedId === a._id && (
                      <span className="pop absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-[10px] text-white">
                        ✓
                      </span>
                    )}
                    <p className="text-sm font-semibold">
                      {ICON[a.label] || "📍"} {a.label}
                      {a.isDefault ? " · Default" : ""}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {a.address}
                    </p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={chooseNew}
                  className={`rounded-xl border-2 border-dashed p-3 text-left text-sm transition ${
                    selectedId === "new"
                      ? "border-caramel bg-cream"
                      : "border-latte hover:border-caramel/60"
                  }`}
                >
                  ➕ New address
                </button>
              </div>
            )}

            <FloatingInput
              label="Full name"
              icon="🙂"
              name="name"
              value={name}
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
              label="Delivery address"
              icon="📍"
              name="address"
              value={form.address}
              onChange={onChange}
              autoComplete="street-address"
            />

            {selectedId === "new" && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="accent-[#c8793a]"
                  />
                  Save this address for next time
                </label>
                {saveAddress && (
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="rounded-full border border-latte bg-white px-3 py-1 text-sm outline-none"
                  >
                    <option>Home</option>
                    <option>Office</option>
                    <option>Other</option>
                  </select>
                )}
              </div>
            )}

            <textarea
              name="note"
              value={form.note}
              onChange={onChange}
              rows={2}
              placeholder="Note for the kitchen or rider (optional)"
              className="w-full rounded-xl border-[1.5px] border-latte px-4 py-3 outline-none transition focus:border-caramel focus:shadow-[0_0_0_4px_rgba(200,121,58,0.18)]"
            />

            <div className="pt-2">
              <StepTitle n="2">Payment</StepTitle>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="relative rounded-xl border-2 border-caramel bg-cream p-4">
                  <span className="pop absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-caramel text-xs text-white">
                    ✓
                  </span>
                  <p className="text-2xl">💵</p>
                  <p className="mt-1 font-semibold">Cash on delivery</p>
                  <p className="text-xs text-stone-500">
                    Pay the rider when your order arrives.
                  </p>
                </div>
                <div className="relative rounded-xl border-2 border-dashed border-latte p-4 opacity-60">
                  <span className="absolute right-3 top-3 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                    Coming soon
                  </span>
                  <p className="text-2xl">💳</p>
                  <p className="mt-1 font-semibold">Card / bKash</p>
                  <p className="text-xs text-stone-500">
                    Online payment is on the way.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p
                key={errorKey}
                className="shake rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
              >
                ⚠️ {error}{" "}
                {/token|login/i.test(error) && (
                  <Link href="/login" className="font-semibold underline">
                    Login again
                  </Link>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || belowMin || !isOpen}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-[#b36a30] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="spinner" /> Placing order...
                </>
              ) : (
                <span>
                  Place order · <AnimatedNumber value={total} /> Tk
                </span>
              )}
            </button>
          </form>

          <aside className="lg:col-span-2">
            <div
              className="card-in sticky top-24 rounded-2xl bg-white p-6 shadow-md"
              style={{ animationDelay: "0.15s" }}
            >
              <h2 className="text-xl font-semibold">Your order</h2>

              <ul className="mt-4 space-y-4">
                {items.map((it, i) => (
                  <li
                    key={it.key}
                    className="fade-up flex gap-3"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-latte text-xl">
                        ☕
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {it.name}
                        {it.variant ? ` (${it.variant})` : ""}
                      </p>
                      {it.addOns.length > 0 && (
                        <p className="truncate text-xs text-stone-500">
                          + {it.addOns.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(it.key, it.quantity - 1)}
                          className="h-6 w-6 rounded-full border border-latte text-sm transition hover:bg-latte"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-sm">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(it.key, it.quantity + 1)}
                          className="h-6 w-6 rounded-full border border-latte text-sm transition hover:bg-latte"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">
                      {it.unitPrice * it.quantity} Tk
                    </p>
                  </li>
                ))}
              </ul>

              {settings && minOrder > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>
                      {belowMin
                        ? `Add ${minOrder - subtotal} Tk more to order`
                        : "Minimum order reached ✓"}
                    </span>
                    <span>
                      {subtotal} / {minOrder} Tk
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-latte">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        belowMin ? "bg-caramel" : "bg-green-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
                                   <div className="mt-5">
                {applied ? (
                  <div className="pop flex items-center justify-between gap-2 rounded-xl border-2 border-green-400 bg-green-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-green-700">
                        🏷️ {applied.code} applied
                      </p>
                      <p className="truncate text-xs text-green-600">
                        {applied.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="shrink-0 text-xs font-medium text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyCoupon();
                          }
                        }}
                        placeholder="Coupon code"
                        className="min-w-0 flex-1 rounded-full border-[1.5px] border-latte px-4 py-2 text-sm uppercase outline-none transition focus:border-caramel"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={checking || !couponInput.trim()}
                        className="rounded-full bg-espresso px-4 py-2 text-sm font-semibold text-white transition hover:bg-caramel disabled:opacity-60"
                      >
                        {checking ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponMsg && (
                      <p className="mt-2 text-xs text-red-600">⚠️ {couponMsg}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-5 space-y-2 border-t border-latte pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span>
                    <AnimatedNumber value={subtotal} /> Tk
                  </span>
                </div>
                                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({applied.code})</span>
                    <span>- {discount} Tk</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery fee</span>
                  <span>{settings ? `${deliveryFee} Tk` : "..."}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-caramel">
                    <AnimatedNumber value={total} /> Tk
                  </span>
                </div>
              </div>

              <Link
                href="/#menu"
                className="mt-4 block text-center text-sm text-caramel hover:underline"
              >
                + Add more items
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireLogin>
      <CheckoutForm />
    </RequireLogin>
  );
}