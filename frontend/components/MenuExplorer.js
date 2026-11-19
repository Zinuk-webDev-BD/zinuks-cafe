"use client";

import { useMemo, useState } from "react";
import { playfair } from "@/lib/fonts";
import MenuCard from "@/components/MenuCard";
import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";
import CategoryNav from "@/components/CategoryNav";

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DECOR = {
  "Hot Coffee": ["☕", "🫘", "☕", "🫘"],
  "Cold Drinks": ["🧊", "🍹", "🧋", "🍓"],
  "Burgers & Sandwiches": ["🍔", "🥪", "🥬", "🍅"],
  "Pasta & Pizza": ["🍕", "🍝", "🌿", "🍅"],
  Snacks: ["🍟", "🧅", "🍗", "🥨"],
  Desserts: ["🍰", "🍩", "🧁", "🍫"],
};
const DEFAULT_DECOR = ["☕", "🍰", "🥐", "🍩"];

const POSITIONS = [
  { left: "3%", top: "10%", size: "4.5rem", duration: 9, delay: 0 },
  { left: "92%", top: "18%", size: "3.5rem", duration: 11, delay: -3 },
  { left: "5%", top: "68%", size: "3.5rem", duration: 10, delay: -6 },
  { left: "91%", top: "72%", size: "5rem", duration: 12, delay: -2 },
];

const BAND = "#f2e7d8";
const CREAM = "#faf5ee";
const DIRECTIONS = ["left", "up", "right"];

const FILTERS = [
  { key: "all", label: "All", icon: "🍽️" },
  { key: "popular", label: "Popular", icon: "🔥" },
  { key: "veg", label: "Vegetarian", icon: "🌿" },
  { key: "spicy", label: "Spicy", icon: "🌶️" },
  { key: "new", label: "New", icon: "✨" },
];

const SORTS = [
  { key: "default", label: "Recommended" },
  { key: "low", label: "Price: low to high" },
  { key: "high", label: "Price: high to low" },
];

const startPrice = (item) =>
  item.variants && item.variants.length > 0
    ? Math.min(...item.variants.map((v) => v.price))
    : item.price;

export default function MenuExplorer({ categories, items }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("default");

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const tags = i.tags || [];
        if (filter !== "all" && !tags.includes(filter)) return false;
        if (q && !`${i.name} ${i.description}`.toLowerCase().includes(q))
          return false;
        return true;
      }),
    [items, filter, q]
  );

  const visible = useMemo(
    () =>
      categories.filter((c) =>
        filtered.some((i) => i.category && i.category._id === c._id)
      ),
    [categories, filtered]
  );

  const navItems = useMemo(
    () => visible.map((c) => ({ id: slug(c.name), name: c.name })),
    [visible]
  );
  const navKey = navItems.map((n) => n.id).join("|");

  const countFor = (key) =>
    key === "all"
      ? items.length
      : items.filter((i) => (i.tags || []).includes(key)).length;

  const order = (list) => {
    if (sort === "low")
      return [...list].sort((a, b) => startPrice(a) - startPrice(b));
    if (sort === "high")
      return [...list].sort((a, b) => startPrice(b) - startPrice(a));
    return list;
  };

  const clear = () => {
    setQuery("");
    setFilter("all");
    setSort("default");
  };

  return (
    <div>
      <div className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-2">
          <div className="rounded-2xl bg-white p-4 shadow-md sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  🔍
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dishes, e.g. latte, pizza, brownie..."
                  className="w-full rounded-full border-[1.5px] border-latte py-2.5 pl-11 pr-10 outline-none transition focus:border-caramel focus:shadow-[0_0_0_4px_rgba(200,121,58,0.18)]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-espresso"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort dishes"
                className="rounded-full border-[1.5px] border-latte bg-white px-4 py-2.5 text-sm outline-none transition focus:border-caramel"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    filter === f.key
                      ? "scale-105 border-caramel bg-caramel text-white shadow"
                      : "border-latte bg-white hover:-translate-y-0.5 hover:border-caramel"
                  }`}
                >
                  {f.icon} {f.label}{" "}
                  <span className="opacity-70">({countFor(f.key)})</span>
                </button>
              ))}
            </div>

            <p className="mt-2 text-xs text-stone-500">
              Showing {filtered.length} of {items.length} dishes
            </p>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-cream px-4 pb-24 pt-6">
          <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="float text-6xl">🔎</div>
            <p className="mt-3 text-lg font-semibold">No dishes found</p>
            <p className="mt-1 text-sm text-stone-500">
              Try a different word or clear the filters.
            </p>
            <button
              type="button"
              onClick={clear}
              className="btn-shine mt-5 rounded-full bg-caramel px-6 py-2.5 font-semibold text-white transition hover:scale-105"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {filtered.length > 0 && <CategoryNav key={navKey} items={navItems} />}

      {visible.map((cat, sIdx) => {
        const catItems = order(
          filtered.filter((i) => i.category && i.category._id === cat._id)
        );
        const bg = sIdx % 2 === 1 ? BAND : CREAM;
        const decor = DECOR[cat.name] || DEFAULT_DECOR;

        return (
          <section
            key={cat._id}
            id={slug(cat.name)}
            className="relative scroll-mt-32 pb-24 pt-14"
            style={{ backgroundColor: bg }}
          >
            {sIdx > 0 && (
              <svg
                aria-hidden="true"
                viewBox="0 0 1440 80"
                preserveAspectRatio="none"
                className="absolute inset-x-0 -top-[79px] h-20 w-full"
                fill={bg}
              >
                <path d="M0,50 C240,10 480,90 720,50 C960,10 1200,90 1440,50 L1440,80 L0,80 Z" />
              </svg>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {decor.map((emoji, i) => (
                <span
                  key={i}
                  className="drift absolute select-none"
                  style={{
                    left: POSITIONS[i].left,
                    top: POSITIONS[i].top,
                    fontSize: POSITIONS[i].size,
                    animationDuration: `${POSITIONS[i].duration}s`,
                    animationDelay: `${POSITIONS[i].delay}s`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <div className="relative mx-auto max-w-6xl px-4">
              <Reveal variant="left">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <h2 className={`${playfair.className} text-3xl font-bold`}>
                      {cat.name}
                    </h2>
                    <span className="underline-grow mt-2 block h-1 rounded bg-caramel" />
                  </div>
                  <span className="text-sm text-stone-500">
                    {catItems.length} items
                  </span>
                </div>
              </Reveal>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item, idx) => (
                  <Reveal
                    key={item._id}
                    variant={DIRECTIONS[idx % 3]}
                    delay={(idx % 3) * 130}
                    className="h-full"
                  >
                    <TiltCard className="h-full">
                      <MenuCard item={item} categoryName={cat.name} />
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}