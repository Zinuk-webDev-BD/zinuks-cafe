import { apiGet } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";

export default async function StatsBand() {
  let dishes = 0;
  let categories = 0;

  try {
    const [cats, items] = await Promise.all([
      apiGet("/categories"),
      apiGet("/menu"),
    ]);
    categories = cats.length;
    dishes = items.length;
  } catch {
    return null;
  }

  const stats = [
    { value: dishes, label: "Dishes on our menu" },
    { value: categories, label: "Categories" },
    { value: 7, label: "Days open every week" },
    { value: 14, label: "Hours open every day" },
  ];

  return (
    <section className="bg-caramel text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 text-center md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} variant="zoom" delay={i * 150}>
            <div className={`${playfair.className} text-5xl font-bold sm:text-6xl`}>
              <CountUp to={s.value} />
            </div>
            <p className="mt-2 text-sm uppercase tracking-wider text-white/90">
              {s.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}