"use client";

import { useEffect, useState } from "react";

export default function CategoryNav({ items }) {
  const [active, setActive] = useState(items[0] ? items[0].id : "");

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

  useEffect(() => {
    const chip = document.getElementById(`chip-${active}`);
    if (chip) {
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <nav className="sticky top-16 z-20 bg-cream/85 backdrop-blur">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-3">
        <div className="flex gap-2">
          {items.map((item) => (
            <a
              key={item.id}
              id={`chip-${item.id}`}
              href={`#${item.id}`}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                active === item.id
                  ? "scale-110 border-caramel bg-caramel text-white shadow-md"
                  : "border-latte bg-white hover:-translate-y-0.5 hover:border-caramel"
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}