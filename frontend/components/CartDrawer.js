"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { playfair } from "@/lib/fonts";

export default function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    toast,
    openCart,
    closeCart,
    updateQty,
    removeItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const onKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-latte px-5 py-4">
          <h2 className={`${playfair.className} text-2xl font-bold`}>
            Your cart
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-3xl leading-none text-stone-500 transition hover:rotate-90 hover:text-espresso"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-stone-500">
            <div className="float text-6xl">☕</div>
            <p>Your cart is empty</p>
            <button
              onClick={closeCart}
              className="mt-2 rounded-full bg-caramel px-5 py-2 text-sm font-semibold text-white transition hover:scale-105"
            >
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((it) => (
                <li
                  key={it.key}
                  className="flex gap-3 rounded-xl bg-white p-3 shadow-sm"
                >
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-latte text-2xl">
                      ☕
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {it.name}
                      {it.variant ? ` (${it.variant})` : ""}
                    </p>
                    {it.addOns.length > 0 && (
                      <p className="text-xs text-stone-500">
                        + {it.addOns.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-medium text-caramel">
                      {it.unitPrice * it.quantity} Tk
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(it.key, it.quantity - 1)}
                        className="h-7 w-7 rounded-full border border-latte transition hover:bg-latte"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(it.key, it.quantity + 1)}
                        className="h-7 w-7 rounded-full border border-latte transition hover:bg-latte"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(it.key)}
                        className="ml-auto text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-latte p-5">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{subtotal} Tk</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Delivery fee is added at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-shine mt-4 block rounded-full bg-caramel py-3 text-center font-semibold text-white transition hover:scale-[1.02] hover:bg-[#b36a30]"
              >
                Checkout
              </Link>
              <button
                onClick={clearCart}
                className="mt-3 w-full text-center text-sm text-stone-500 hover:text-red-600"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>

      {toast && (
        <div
          key={toast.id}
          className="toast-in fixed bottom-6 left-1/2 z-[80] flex items-center gap-3 rounded-full bg-espresso px-5 py-3 text-sm text-white shadow-2xl"
        >
          <span className="text-green-400">✓</span>
          <span>{toast.text}</span>
          <button
            onClick={openCart}
            className="font-semibold text-caramel hover:underline"
          >
            View cart
          </button>
        </div>
      )}
    </>
  );
}