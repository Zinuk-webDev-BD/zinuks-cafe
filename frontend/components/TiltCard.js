"use client";

import { useRef } from "react";

export default function TiltCard({ children, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-8px) scale(1.02)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onLeave = () => {
    ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt relative transition-transform duration-200 ease-out ${className}`}
    >
      {children}
      <div className="glare" />
    </div>
  );
}