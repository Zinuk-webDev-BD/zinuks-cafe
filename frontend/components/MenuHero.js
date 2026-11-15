"use client";

import { useEffect, useRef } from "react";
import AnimatedHeading from "@/components/AnimatedHeading";
import Reveal from "@/components/Reveal";
import { playfair } from "@/lib/fonts";

const WORDS = "COFFEE • CAKE • BURGER • PIZZA • FRIES • LATTE • ";

const FLOATERS = [
  { e: "☕", left: "5%", top: "12%", size: "4rem", depth: 40, dur: 9, delay: 0 },
  { e: "🍰", left: "87%", top: "10%", size: "4.5rem", depth: 55, dur: 11, delay: -3 },
  { e: "🍕", left: "8%", top: "64%", size: "5rem", depth: 70, dur: 10, delay: -6 },
  { e: "🍔", left: "86%", top: "60%", size: "4.5rem", depth: 35, dur: 12, delay: -2 },
  { e: "🍩", left: "20%", top: "26%", size: "3rem", depth: 90, dur: 8, delay: -5 },
  { e: "🧋", left: "76%", top: "30%", size: "3.2rem", depth: 80, dur: 9, delay: -1 },
  { e: "🥐", left: "26%", top: "80%", size: "3rem", depth: 60, dur: 13, delay: -7 },
  { e: "🍟", left: "70%", top: "82%", size: "3.4rem", depth: 100, dur: 10, delay: -4 },
  { e: "🫘", left: "44%", top: "8%", size: "2.5rem", depth: 110, dur: 7, delay: -2 },
  { e: "✨", left: "55%", top: "88%", size: "2.2rem", depth: 120, dur: 6, delay: -3 },
];

export default function MenuHero() {
  const sectionRef = useRef(null);
  const rowA = useRef(null);
  const rowB = useRef(null);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      const a = rowA.current;
      const b = rowB.current;
      if (!section || !a || !b) return;

      const r = section.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      const clamped = Math.min(Math.max(p, 0), 1);
      const offset = (clamped - 0.5) * 700;
      a.style.transform = `translateX(calc(-25% + ${-offset}px))`;
      b.style.transform = `translateX(calc(-25% + ${offset}px))`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const onMove = (e) => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--sx", `${x}px`);
    el.style.setProperty("--sy", `${y}px`);
    el.style.setProperty("--px", String((x / r.width - 0.5) * 2));
    el.style.setProperty("--py", String((y / r.height - 0.5) * 2));
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="relative overflow-hidden text-center text-white"
      style={{
        background:
          "radial-gradient(650px circle at var(--sx, 50%) var(--sy, 35%), rgba(200,121,58,0.3), transparent 60%), #2b1a12",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 overflow-hidden"
      >
        <div
          ref={rowA}
          className="outline-text whitespace-nowrap"
          style={{ transform: "translateX(-25%)" }}
        >
          {WORDS.repeat(4)}
        </div>
        <div
          ref={rowB}
          className="outline-text whitespace-nowrap"
          style={{ transform: "translateX(-25%)" }}
        >
          {WORDS.repeat(4)}
        </div>
      </div>

      {FLOATERS.map((f, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`depth pointer-events-none absolute select-none ${
            i >= 4 ? "hidden sm:block" : ""
          }`}
          style={{
            left: f.left,
            top: f.top,
            fontSize: `clamp(1.6rem, 8vw, ${f.size})`,
            "--depth": f.depth,
          }}
        >
          <span
            className="drift-strong"
            style={{
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            {f.e}
          </span>
        </span>
      ))}

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-32 pt-14 sm:pb-40 sm:pt-20">
        <Reveal variant="zoom">
          <div className="relative mx-auto mb-2 w-fit">
            <span className="steam" style={{ left: "26%", animationDelay: "0s" }} />
            <span className="steam" style={{ left: "46%", animationDelay: "1.1s" }} />
            <span className="steam" style={{ left: "64%", animationDelay: "2.2s" }} />
            <div className="float text-7xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] sm:text-8xl">
              ☕
            </div>
          </div>
        </Reveal>

        <Reveal variant="up">
          <p className="spread text-sm uppercase text-caramel">Our menu</p>
        </Reveal>

        <AnimatedHeading
          text="Pick your favourite"
          className={`${playfair.className} mt-3 text-4xl font-bold sm:text-6xl lg:text-7xl`}
        />

        <Reveal variant="up" delay={300}>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="line-grow h-px bg-caramel" />
            <span className="bean-spin text-xl">
              <span className="float inline-block">✨</span>
            </span>
            <span className="line-grow h-px bg-caramel" />
          </div>
          <p className="mt-4 text-base text-stone-300 sm:text-lg">
            Everything is made fresh to order.
          </p>
        </Reveal>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[-1px] h-16 w-full sm:h-24"
        fill="#faf5ee"
      >
        <path d="M0,60 C180,120 360,0 540,50 C720,100 900,10 1080,55 C1260,100 1350,40 1440,60 L1440,120 L0,120 Z" />
      </svg>
    </section>
  );
}