import Link from "next/link";
import { apiGet } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import Reveal from "@/components/Reveal";

const fromPrice = (item) =>
  item.variants && item.variants.length > 0
    ? Math.min(...item.variants.map((v) => v.price))
    : item.price;

function Row({ picks, reverse }) {
  return (
    <div className="marquee">
      <div
        className={`marquee-track flex w-max ${reverse ? "marquee-reverse" : ""}`}
      >
        {[0, 1].map((copy) =>
          picks.map((item) => (
            <Link
              key={`${copy}-${item._id}`}
              href="#menu"
              aria-hidden={copy === 1}
              tabIndex={copy === 1 ? -1 : 0}
              className="group relative mr-6 block h-56 w-64 shrink-0 overflow-hidden rounded-2xl shadow-lg"
            >
              <img
                src={item.image}
                alt={copy === 0 ? item.name : ""}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-espresso/75 px-4 py-3 text-white backdrop-blur-sm">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-caramel">
                  {item.variants && item.variants.length > 0 ? "From " : ""}
                  {fromPrice(item)} Tk
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default async function FavouritesMarquee() {
  let items = [];
  try {
    items = await apiGet("/menu");
  } catch {
    return null;
  }

  const withPhoto = items.filter((i) => i.image && i.isAvailable);
  const rowA = withPhoto.filter((_, i) => i % 2 === 0).slice(0, 14);
  const rowB = withPhoto.filter((_, i) => i % 2 === 1).slice(0, 14);

  if (rowA.length < 4) return null;

  return (
    <section className="overflow-hidden bg-cream pb-2 pt-16">
      <Reveal variant="up">
        <p className="text-center text-sm uppercase tracking-[0.3em] text-caramel">
          Customer favourites
        </p>
        <h2
          className={`${playfair.className} mt-2 text-center text-4xl font-bold`}
        >
          Fresh from our kitchen
        </h2>
      </Reveal>

      <div className="mt-8 space-y-6">
        <Row picks={rowA} />
        {rowB.length >= 4 && <Row picks={rowB} reverse />}
      </div>
    </section>
  );
}