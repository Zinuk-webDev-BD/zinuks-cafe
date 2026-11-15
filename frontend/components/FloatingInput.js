"use client";

import { useState } from "react";

export default function FloatingInput({
  label,
  icon,
  type = "text",
  name,
  value,
  onChange,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field">
      <span className="field-icon">{icon}</span>
      <input
        id={name}
        name={name}
        type={isPassword && show ? "text" : type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder=" "
        required
        className="field-input"
      />
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition hover:scale-125"
        >
          {show ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
}