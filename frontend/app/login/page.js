"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AuthShell from "@/components/AuthShell";
import FloatingInput from "@/components/FloatingInput";
import AuthSuccess from "@/components/AuthSuccess";
import { burst } from "@/lib/burst";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doneName, setDoneName] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      burst(
        window.innerWidth / 2,
        window.innerHeight / 2,
        ["☕", "🍰", "✨", "🎉"],
        30
      );
      setDoneName(user.name.split(" ")[0]);
      setTimeout(() => router.push("/"), 1600);
    } catch (err) {
      setError(err.message);
      setErrorKey((k) => k + 1);
      setLoading(false);
    }
  };

  return (
    <AuthShell heading="Welcome back" sub="Login to order your favourites.">
      {doneName ? (
        <AuthSuccess message={`Welcome back, ${doneName}!`} />
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="fade-up" style={{ animationDelay: "0.3s" }}>
              <FloatingInput
                label="Email"
                icon="✉️"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
              />
            </div>
            <div className="fade-up" style={{ animationDelay: "0.4s" }}>
              <FloatingInput
                label="Password"
                icon="🔑"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p
                key={errorKey}
                className="shake rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
              >
                ⚠️ {error}
              </p>
            )}

            <div className="fade-up" style={{ animationDelay: "0.5s" }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-shine pulse-ring flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-[#b36a30] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() =>
              setForm({ email: "customer@test.com", password: "123456" })
            }
            className="fade-up mt-3 w-full rounded-full border border-latte py-2.5 text-sm text-stone-600 transition hover:-translate-y-0.5 hover:bg-cream"
            style={{ animationDelay: "0.6s" }}
          >
            ✨ Fill demo customer login
          </button>

          <p className="mt-6 text-center text-sm text-stone-500">
            New here?{" "}
            <Link href="/register" className="font-semibold text-caramel">
              Create an account
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}