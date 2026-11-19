"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function NavAuth() {
  const { user, mounted, logout } = useAuth();

  if (!mounted) return <div className="h-8 w-24" />;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="nav-link">
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-caramel px-4 py-1.5 font-medium text-white transition hover:bg-[#b36a30]"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user.role === "admin" ? (
        <Link href="/admin" className="nav-link font-semibold text-caramel">
          📊 Dashboard
        </Link>
      ) : (
        <Link href="/orders" className="nav-link">
          My Orders
        </Link>
      )}
      <Link href="/profile" className="nav-link">
        👤 {user.name.split(" ")[0]}
      </Link>
      <button
        onClick={logout}
        className="rounded-full border border-white/30 px-4 py-1.5 transition hover:bg-white/10"
      >
        Logout
      </button>
    </div>
  );
}