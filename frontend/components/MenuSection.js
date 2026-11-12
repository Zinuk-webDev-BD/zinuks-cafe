import { apiGet } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import MenuCard from "@/components/MenuCard";

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
      <p className="rounded-xl bg-red-50 p-4 text-red-700">
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
      <nav className="sticky top-16 z-20 -mx-4 overflow-x-auto bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="flex gap-2">
          {visible.map((cat) => (
            <a
              key={cat._id}
              href={`#${slug(cat.name)}`}
              className="whitespace-nowrap rounded-full border border-latte bg-white px-4 py-1.5 text-sm font-medium transition hover:bg-caramel hover:text-white"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </nav>

      {visible.map((cat) => {
        const catItems = items.filter(
          (i) => i.category && i.category._id === cat._id
        );
        return (
          <section key={cat._id} id={slug(cat.name)} className="scroll-mt-32 pt-10">
            <div className="mb-5 flex items-end justify-between">
              <h2 className={`${playfair.className} text-3xl font-bold`}>
                {cat.name}
              </h2>
              <span className="text-sm text-stone-500">
                {catItems.length} items
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catItems.map((item) => (
                <MenuCard key={item._id} item={item} categoryName={cat.name} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}