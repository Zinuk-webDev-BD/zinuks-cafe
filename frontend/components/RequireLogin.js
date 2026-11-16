"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { playfair } from "@/lib/fonts";

export default function RequireLogin({ children }) {
  const { user, mounted } = useAuth();

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="h-48 animate-pulse rounded-2xl bg-latte" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="card-in rounded-3xl bg-white p-8 shadow-xl shadow-espresso/10">
          <div className="float text-6xl">🔒</div>
          <h1 className={`${playfair.className} mt-4 text-2xl font-bold`}>
            Please login first
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            You need an account to place and track orders.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="btn-shine rounded-full bg-caramel py-3 font-semibold text-white transition hover:scale-[1.02]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-latte py-3 font-medium transition hover:bg-cream"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}