"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import NavAuth from "@/components/NavAuth";
import { playfair } from "@/lib/fonts";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, mounted, logout } = useAuth();
  const close = () => setOpen(false);

  const item =
    "rounded-lg px-3 py-3 text-base transition hover:bg-white/10";

  return (
    <header className="sticky top-0 z-30 bg-espresso/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          onClick={close}
          className={`${playfair.className} text-lg font-bold sm:text-xl`}
        >
          ☕ Zinuk&apos;s Cafe Corner
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/#menu" className="nav-link">
            Menu
          </Link>
          <Link href="/#about" className="nav-link">
            About
          </Link>
          <NavAuth />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="relative h-10 w-10 md:hidden"
        >
          <span
            className={`absolute left-2 right-2 top-[14px] h-0.5 rounded bg-white transition-all duration-300 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-2 right-2 top-[20px] h-0.5 rounded bg-white transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-2 right-2 top-[26px] h-0.5 rounded bg-white transition-all duration-300 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`absolute inset-x-0 top-full overflow-hidden bg-espresso transition-all duration-300 md:hidden ${
          open ? "max-h-96 border-t border-white/10" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          <Link href="/#menu" onClick={close} className={item}>
            🍽️ Menu
          </Link>
          <Link href="/#about" onClick={close} className={item}>
            📖 About
          </Link>

          {mounted &&
            (user ? (
              <>
                <p className="px-3 pt-2 text-sm text-stone-400">
                  Signed in as {user.name.split(" ")[0]}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    close();
                  }}
                  className={`${item} text-left`}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className={item}>
                  🔑 Login
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="mt-1 rounded-full bg-caramel px-4 py-3 text-center font-semibold"
                >
                  Create account
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}