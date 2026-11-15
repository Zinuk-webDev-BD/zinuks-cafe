"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { burst } from "@/lib/burst";

const EMOJI = {
  "Hot Coffee": "☕",
  "Cold Drinks": "🧋",
  "Burgers & Sandwiches": "🍔",
  "Pasta & Pizza": "🍕",
  Snacks: "🍟",
  Desserts: "🍰",
};

const BURST = {
  "Hot Coffee": ["☕", "🫘", "✨"],
  "Cold Drinks": ["🧋", "🧊", "🍓"],
  "Burgers & Sandwiches": ["🍔", "🥪", "🍅"],
  "Pasta & Pizza": ["🍕", "🍝", "🌿"],
  Snacks: ["🍟", "🍗", "🧅"],
  Desserts: ["🍰", "🍩", "🧁"],
};

export default function CategoryNav({ items }) {
  const [active, setActive] = useState(items[0] ? items[0].id : "");
  const [shown, setShown] = useState(false);
  const navRef = useRef(null);
  const trackRef = useRef(null);
  const pillRef = useRef(null);

  // কোন ক্যাটাগরিতে স্ক্রল করে আছি
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  // স্ক্রিনে এলে চিপস ঢুকবে
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // পিল সরানো
  const movePill = useCallback(() => {
    const track = trackRef.current;
    const pill = pillRef.current;
    if (!track || !pill) return;
    const chip = track.querySelector(`[data-chip="${active}"]`);
    if (!chip) return;
    pill.style.width = `${chip.offsetWidth}px`;
    pill.style.transform = `translateX(${chip.offsetLeft}px)`;
  }, [active]);

  useEffect(() => {
    movePill();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(movePill);
    ro.observe(track);
    return () => ro.disconnect();
  }, [movePill]);

  // ছোট স্ক্রিনে সক্রিয় চিপ দেখা যাবে
  useEffect(() => {
    const chip = document.getElementById(`chip-${active}`);
    if (chip) {
      chip.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [active]);

  return (
    <nav
      ref={navRef}
      className={`sticky top-16 z-20 bg-cream/85 backdrop-blur ${
        shown ? "chips-in" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-3">
        <div ref={trackRef} className="relative flex w-max gap-2">
          <span
            ref={pillRef}
            className="chip-pill absolute left-0 top-0 h-full w-0 rounded-full bg-caramel shadow-md"
          />
          {items.map((item, i) => (
            <a
              key={item.id}
              id={`chip-${item.id}`}
              data-chip={item.id}
              href={`#${item.id}`}
              onClick={(e) =>
                burst(e.clientX, e.clientY, BURST[item.name] || ["☕", "🍰", "✨"])
              }
              style={{ "--d": `${i * 90}ms` }}
              className={`chip relative z-10 flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                active === item.id
                  ? "chip-on border-caramel text-white"
                  : "border-latte bg-white/50 text-espresso hover:border-caramel"
              }`}
            >
              <span className="emoji">{EMOJI[item.name] || "🍽️"}</span>
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}