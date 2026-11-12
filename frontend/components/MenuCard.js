const EMOJI = {
  "Hot Coffee": "☕",
  "Cold Drinks": "🧋",
  "Burgers & Sandwiches": "🍔",
  "Pasta & Pizza": "🍝",
  Snacks: "🍟",
  Desserts: "🍰",
};

export default function MenuCard({ item, categoryName }) {
  const hasSizes = item.variants && item.variants.length > 0;
  const startPrice = hasSizes
    ? Math.min(...item.variants.map((v) => v.price))
    : item.price;

  return (
    <article
      className={`group overflow-hidden rounded-2xl bg-white shadow-md shadow-espresso/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        item.isAvailable ? "" : "opacity-70"
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-latte text-6xl">
            {EMOJI[categoryName] || "🍽️"}
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-espresso/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
          {hasSizes ? "From " : ""}
          {startPrice} Tk
        </span>
        {!item.isAvailable && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-espresso">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-stone-500">
          {item.description}
        </p>
        {hasSizes && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.variants.map((v) => (
              <span
                key={v.name}
                className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-stone-600"
              >
                {v.name} {v.price}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}