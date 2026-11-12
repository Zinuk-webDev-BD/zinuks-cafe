"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { playfair } from "@/lib/fonts";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-espresso/10">
        <h1 className={`${playfair.className} text-3xl font-bold`}>Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">Login to order your favourites.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className="w-full rounded-lg border border-latte px-4 py-2.5 outline-none focus:border-caramel"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg border border-latte px-4 py-2.5 outline-none focus:border-caramel"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-caramel py-3 font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setForm({ email: "customer@test.com", password: "123456" })}
          className="mt-3 w-full rounded-full border border-latte py-2.5 text-sm text-stone-600 transition hover:bg-cream"
        >
          Fill demo customer login
        </button>

        <p className="mt-6 text-center text-sm text-stone-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-caramel">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}