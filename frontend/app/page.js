import { Suspense } from "react";
import Link from "next/link";
import MenuSection from "@/components/MenuSection";
import MenuSkeleton from "@/components/MenuSkeleton";
import OpenBadge from "@/components/OpenBadge";
import { playfair } from "@/lib/fonts";

const features = [
  { icon: "🌱", title: "Fresh ingredients", text: "Beans roasted weekly and baked goods made every morning." },
  { icon: "🛵", title: "Fast delivery", text: "Hot orders at your door while the aroma is still fresh." },
  { icon: "💛", title: "Made with love", text: "Every cup and plate prepared by hand, never rushed." },
];

export default function HomePage() {
  return (
    <>
      <section
        className="flex min-h-[75vh] items-center justify-center bg-espresso bg-cover bg-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,16,8,0.62), rgba(30,16,8,0.74)), url('/hero.jpg')",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-20">
          <Suspense fallback={null}>
            <OpenBadge />
          </Suspense>
          <p className="mb-4 mt-6 text-sm uppercase tracking-[0.3em] text-caramel">
            Freshly brewed · Freshly baked
          </p>
          <h1
            className={`${playfair.className} text-5xl font-bold leading-tight sm:text-6xl`}
          >
            Where every cup tells a story
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-stone-200">
            Handcrafted coffee, warm bites and sweet moments, ready at our
            corner or delivered to your door.
          </p>
          <Link
            href="#menu"
            className="mt-8 inline-block rounded-full bg-caramel px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#b36a30]"
          >
            Explore the menu
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-6 text-center shadow-md shadow-espresso/5">
            <div className="text-4xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{f.text}</p>
          </div>
        ))}
      </section>

      <div id="menu" className="mx-auto max-w-6xl scroll-mt-16 px-4 pb-16">
        <h2 className={`${playfair.className} text-center text-4xl font-bold`}>
          Our Menu
        </h2>
        <p className="mt-2 text-center text-stone-500">
          Pick your favourite, we will take care of the rest.
        </p>
        <Suspense fallback={<MenuSkeleton />}>
          <MenuSection />
        </Suspense>
      </div>

      <section id="about" className="scroll-mt-16 bg-latte/60 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className={`${playfair.className} text-3xl font-bold`}>Our story</h2>
          <p className="mt-4 text-stone-600">
            Zinuk&apos;s Cafe Corner started with one idea: a small corner of
            the city where a good cup of coffee and a warm welcome are always
            waiting. We keep the menu simple, the ingredients fresh and the
            service friendly.
          </p>
        </div>
      </section>
    </>
  );
}