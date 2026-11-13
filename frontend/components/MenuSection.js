import { apiGet } from "@/lib/api";
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

export default async function MenuSection() {
  let categories = [];
  let items = [];

  try {
    [categories, items] = await Promise.all([
      apiGet("/categories"),
      apiGet("/menu"),
    ]);
  } catch {
    return (
      <p className="mx-auto max-w-6xl rounded-xl bg-red-50 p-4 text-red-700">
        Could not load the menu. The server may be waking up, please refresh in
        a few seconds.
      </p>
    );
  }

  const visible = categories.filter((c) =>
    items.some((i) => i.category && i.category._id === c._id)
  );

  return (
    <div>
      <CategoryNav
        items={visible.map((c) => ({ id: slug(c.name), name: c.name }))}
      />

      {visible.map((cat, sIdx) => {
        const catItems = items.filter(
          (i) => i.category && i.category._id === cat._id
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