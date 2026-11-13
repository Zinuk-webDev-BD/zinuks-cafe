import { Suspense } from "react";
import Link from "next/link";
import MenuSection from "@/components/MenuSection";
import MenuSkeleton from "@/components/MenuSkeleton";
import OpenBadge from "@/components/OpenBadge";
import FavouritesMarquee from "@/components/FavouritesMarquee";
import StatsBand from "@/components/StatsBand";
import Reveal from "@/components/Reveal";
import { playfair } from "@/lib/fonts";

const features = [
  { icon: "🌱", title: "Fresh ingredients", text: "Beans roasted weekly and baked goods made every morning.", variant: "left" },
  { icon: "🛵", title: "Fast delivery", text: "Hot orders at your door while the aroma is still fresh.", variant: "up" },
  { icon: "💛", title: "Made with love", text: "Every cup and plate prepared by hand, never rushed.", variant: "right" },
];

const info = [
  { icon: "🕘", title: "Opening hours", text: "Every day, 9 AM to 11 PM" },
  { icon: "📍", title: "Find us", text: "Dhaka, Bangladesh" },
  { icon: "💵", title: "Payment", text: "Cash on delivery" },
];

const titleWords = ["Where", "every", "cup", "tells", "a", "story"];

const beans = [
  { left: "3%", duration: 14, delay: -2, scale: 1 },
  { left: "10%", duration: 18, delay: -9, scale: 1.5 },
  { left: "17%", duration: 12, delay: -5, scale: 0.9 },
  { left: "25%", duration: 16, delay: -12, scale: 1.3 },
  { left: "33%", duration: 20, delay: -7, scale: 1.8 },
  { left: "41%", duration: 13, delay: -1, scale: 1 },
  { left: "49%", duration: 17, delay: -10, scale: 1.4 },
  { left: "57%", duration: 15, delay: -4, scale: 0.9 },
  { left: "65%", duration: 19, delay: -14, scale: 1.6 },
  { left: "72%", duration: 13, delay: -6, scale: 1.1 },
  { left: "80%", duration: 16, delay: -11, scale: 1.7 },
  { left: "87%", duration: 18, delay: -3, scale: 1 },
  { left: "93%", duration: 14, delay: -8, scale: 1.3 },
  { left: "97%", duration: 17, delay: -13, scale: 0.9 },
];

export default function HomePage() {
  return (
    <>
      <section
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-espresso bg-cover bg-fixed bg-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,16,8,0.62), rgba(30,16,8,0.74)), url('/hero.jpg')",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {beans.map((b, i) => (
            <span
              key={i}
              className="bean"
              style={{
                left: b.left,
                scale: b.scale,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20">
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <Suspense fallback={null}>
              <OpenBadge />
            </Suspense>
          </div>
          <p
            className="fade-up mb-4 mt-6 text-sm uppercase tracking-[0.3em] text-caramel"
            style={{ animationDelay: "0.3s" }}
          >
            Freshly brewed · Freshly baked
          </p>
          <h1
            className={`${playfair.className} text-balance text-5xl font-bold leading-tight sm:text-7xl`}
          >
            {titleWords.map((w, i) => (
              <span
                key={i}
                className="word-in inline-block px-[0.13em]"
                style={{ animationDelay: `${0.5 + i * 0.18}s` }}
              >
                {w === "story" ? <span className="shine">{w}</span> : w}
              </span>
            ))}
          </h1>
          <p
            className="fade-up mx-auto mt-5 max-w-xl text-lg text-stone-200"
            style={{ animationDelay: "1.7s" }}
          >
            Handcrafted coffee, warm bites and sweet moments, ready at our
            corner or delivered to your door.
          </p>
          <div className="fade-up" style={{ animationDelay: "2s" }}>
            <Link
              href="#menu"
              className="pulse-ring btn-shine mt-8 inline-block rounded-full bg-caramel px-8 py-3 font-semibold text-white transition hover:scale-105 hover:bg-[#b36a30]"
            >
              Explore the menu
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-espresso">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3">
          {features.map((f, idx) => (
            <Reveal key={f.title} variant={f.variant} delay={idx * 150}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition duration-300 hover:-translate-y-2 hover:bg-white/10">
                <div
                  className="float text-4xl"
                  style={{ animationDelay: `${idx * 0.5}s` }}
                >
                  {f.icon}
                </div>
                <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-stone-400">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Suspense fallback={null}>
        <FavouritesMarquee />
      </Suspense>

            <div id="menu" className="scroll-mt-16 pt-16">
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <Reveal variant="up">
            <p className="text-center text-sm uppercase tracking-[0.3em] text-caramel">
              Our menu
            </p>
            <h2
              className={`${playfair.className} mt-2 text-center text-4xl font-bold`}
            >
              Pick your favourite
            </h2>
            <p className="mt-2 text-center text-stone-500">
              Everything is made fresh to order.
            </p>
          </Reveal>
        </div>
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4">
              <MenuSkeleton />
            </div>
          }
        >
          <MenuSection />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <StatsBand />
      </Suspense>

      <section
        id="about"
        className="scroll-mt-16 bg-espresso bg-cover bg-fixed bg-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,16,8,0.72), rgba(30,16,8,0.84)), url('/about.jpg'), url('/hero.jpg')",
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-20">
          <Reveal variant="up">
            <p className="text-sm uppercase tracking-[0.3em] text-caramel">
              Our story
            </p>
            <h2
              className={`${playfair.className} mt-2 text-balance text-4xl font-bold`}
            >
              A small corner with a big heart
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-stone-200">
              Zinuk&apos;s Cafe Corner started with one idea: a small corner of
              the city where a good cup of coffee and a warm welcome are always
              waiting. We keep the menu simple, the ingredients fresh and the
              service friendly.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {info.map((i, idx) => (
              <Reveal key={i.title} variant="zoom" delay={idx * 150}>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur transition duration-300 hover:-translate-y-2 hover:bg-white/20">
                  <div className="text-3xl">{i.icon}</div>
                  <h3 className="mt-2 font-semibold">{i.title}</h3>
                  <p className="mt-1 text-sm text-stone-300">{i.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="up" delay={200}>
            <Link
              href="#menu"
              className="btn-shine mt-10 inline-block rounded-full bg-caramel px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#b36a30]"
            >
              Order now
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}