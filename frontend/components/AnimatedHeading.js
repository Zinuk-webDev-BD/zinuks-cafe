"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedHeading({ text, className = "", step = 45 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  const starts = words.reduce((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + words[i - 1].length);
    return acc;
  }, []);

  return (
    <h2
      ref={ref}
      aria-label={text}
      className={`${className} ${shown ? "chars-in" : ""}`}
    >
      {words.map((word, w) => (
        <span
          key={w}
          aria-hidden="true"
          className="inline-block whitespace-nowrap"
        >
          {word.split("").map((ch, c) => (
            <span
              key={c}
              className="char"
              style={{ transitionDelay: `${(starts[w] + c) * step}ms` }}
            >
              {ch}
            </span>
          ))}
          {w < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </h2>
  );
}