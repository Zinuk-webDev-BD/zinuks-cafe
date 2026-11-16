"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { playfair } from "@/lib/fonts";

export default function RequireAdmin({ children }) {
  const { user, mounted } = useAuth();

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="h-48 animate-pulse rounded-2xl bg-latte" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="card-in rounded-3xl bg-white p-8 shadow-xl shadow-espresso/10">
          <div className="float text-6xl">🔐</div>
          <h1 className={`${playfair.className} mt-4 text-2xl font-bold`}>
            {user ? "Admins only" : "Admin login required"}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {user
              ? "This area is only for the cafe staff."
              : "Please login with an admin account."}
          </p>
          <Link
            href={user ? "/" : "/login"}
            className="btn-shine mt-6 inline-block rounded-full bg-caramel px-8 py-3 font-semibold text-white transition hover:scale-105"
          >
            {user ? "Back to home" : "Login"}
          </Link>
        </div>
      </div>
    );
  }

  return children;
}