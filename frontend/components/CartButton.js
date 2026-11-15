"use client";

import { useCart } from "@/components/CartProvider";

export default function CartButton() {
  const { count, mounted, openCart } = useCart();

  return (
    <button
      id="cart-btn"
      type="button"
      onClick={openCart}
      aria-label="Open cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-lg transition hover:scale-110 hover:bg-white/10"
    >
      🛒
      {mounted && count > 0 && (
        <span
          key={count}
          className="bump absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-xs font-semibold text-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}