"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/CartProvider";
import { flyToCart } from "@/lib/fly";
import { playfair } from "@/lib/fonts";

export default function AddToCartButton({ item }) {
  const { addItem } = useCart();
  const variants = item.variants || [];
  const addOnList = item.addOns || [];
  const hasOptions = variants.length > 0 || addOnList.length > 0;

  const [open, setOpen] = useState(false);
  const [variantName, setVariantName] = useState(
    variants[0] ? variants[0].name : ""
  );
  const [selected, setSelected] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const variant = variants.find((v) => v.name === variantName);
  const base = variant ? variant.price : item.price;
  const chosen = addOnList.filter((a) => selected.includes(a.name));
  const unitPrice = base + chosen.reduce((sum, a) => sum + a.price, 0);

  const toggleAddOn = (name) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const add = (e) => {
    flyToCart(e.currentTarget, item.image);
    addItem({
      menuItem: item._id,
      name: item.name,
      image: item.image || "",
      variant: variant ? variant.name : "",
      addOns: chosen.map((a) => ({ name: a.name, price: a.price })),
      unitPrice,
      quantity,
    });
    setOpen(false);
    setSelected([]);
    setQuantity(1);
  };

  if (!item.isAvailable) {
    return (
      <button
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-full bg-stone-200 py-2.5 text-sm font-semibold text-stone-500"
      >
        Sold out
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={hasOptions ? () => setOpen(true) : add}
        className="btn-shine mt-4 w-full rounded-full bg-espresso py-2.5 text-sm font-semibold text-white transition hover:bg-caramel active:scale-95"
      >
        {hasOptions ? "Choose options" : "Add to cart"}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setOpen(false)}
            onMouseMove={(e) => e.stopPropagation()}
          >
            <div
              className="card-in max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`${playfair.className} text-2xl font-bold`}>
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-stone-500">{item.description}</p>

              {variants.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setVariantName(v.name)}
                        className={`rounded-full border px-4 py-1.5 text-sm transition ${
                          variantName === v.name
                            ? "border-caramel bg-caramel text-white"
                            : "border-latte hover:border-caramel"
                        }`}
                      >
                        {v.name} · {v.price} Tk
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {addOnList.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold">Extras</p>
                  <div className="space-y-2">
                    {addOnList.map((a) => (
                      <label
                        key={a.name}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-latte px-4 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(a.name)}
                            onChange={() => toggleAddOn(a.name)}
                            className="accent-[#c8793a]"
                          />
                          {a.name}
                        </span>
                        <span className="text-stone-500">+{a.price} Tk</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 rounded-full border border-latte text-lg"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="h-9 w-9 rounded-full border border-latte text-lg"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={add}
                  className="btn-shine rounded-full bg-caramel px-6 py-2.5 font-semibold text-white transition hover:bg-[#b36a30]"
                >
                  Add to cart · {unitPrice * quantity} Tk
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}