"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const CartContext = createContext(null);
const KEY = "zc_cart";
const EVENT = "zc-cart";
const EMPTY = [];

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
const getSnapshot = () => localStorage.getItem(KEY);
const getServerSnapshot = () => null;
const noopSubscribe = () => () => {};

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

const makeKey = (id, variant, addOns) =>
  [id, variant || "", ...addOns.map((a) => a.name).sort()].join("|");

export function CartProvider({ children }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const items = useMemo(() => {
    try {
      return raw ? JSON.parse(raw) : EMPTY;
    } catch {
      return EMPTY;
    }
  }, [raw]);

  const showToast = useCallback((text) => {
    setToast({ id: Date.now(), text });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const addItem = useCallback(
    (line) => {
      const current = read();
      const key = makeKey(line.menuItem, line.variant, line.addOns);
      const existing = current.find((i) => i.key === key);
      if (existing) {
        existing.quantity = Math.min(20, existing.quantity + line.quantity);
      } else {
        current.push({ ...line, key, quantity: Math.min(20, line.quantity) });
      }
      write(current);
      showToast(`${line.name} added to cart`);
    },
    [showToast]
  );

  const updateQty = useCallback((key, quantity) => {
    const current = read();
    const next =
      quantity < 1
        ? current.filter((i) => i.key !== key)
        : current.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(20, quantity) } : i
          );
    write(next);
  }, []);

  const removeItem = useCallback((key) => {
    write(read().filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => write([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const value = {
    items,
    count,
    subtotal,
    mounted,
    isOpen,
    toast,
    openCart,
    closeCart,
    addItem,
    updateQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}