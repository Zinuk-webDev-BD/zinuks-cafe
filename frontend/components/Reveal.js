"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}) {
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-variant={variant}
      style={{ transitionDelay: `${delay}ms` }}
      className={`rv ${shown ? "rv-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}