"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AuthShell from "@/components/AuthShell";
import FloatingInput from "@/components/FloatingInput";
import StrengthMeter from "@/components/StrengthMeter";
import AuthSuccess from "@/components/AuthSuccess";
import { burst } from "@/lib/burst";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doneName, setDoneName] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fail = (message) => {
    setError(message);
    setErrorKey((k) => k + 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      return fail("Password must be at least 6 characters");
    }
    if (form.password !== form.confirm) {
      return fail("Passwords do not match");
    }

    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      burst(
        window.innerWidth / 2,
        window.innerHeight / 2,
        ["☕", "🍰", "🎉", "✨", "🥐"],
        35
      );
      setDoneName(user.name.split(" ")[0]);
      setTimeout(() => router.push("/"), 1800);
    } catch (err) {
      fail(err.message);
      setLoading(false);
    }
  };

  const matches = form.confirm && form.password === form.confirm;

  return (
    <AuthShell
      heading="Create account"
      sub="Join us and order in a few taps."
    >
      {doneName ? (
        <AuthSuccess
          message={`Welcome, ${doneName}!`}
          sub="Your account is ready. Taking you to the menu..."
        />
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="fade-up" style={{ animationDelay: "0.2s" }}>
              <FloatingInput
                label="Full name"
                icon="🙂"
                name="name"
                value={form.name}
                onChange={onChange}
                autoComplete="name"
              />
            </div>
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
                label="Phone"
                icon="📱"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                autoComplete="tel"
              />
            </div>
            <div className="fade-up" style={{ animationDelay: "0.5s" }}>
              <FloatingInput
                label="Password"
                icon="🔑"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
              />
              <StrengthMeter password={form.password} />
            </div>
            <div className="fade-up" style={{ animationDelay: "0.6s" }}>
              <FloatingInput
                label="Confirm password"
                icon="🔐"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={onChange}
                autoComplete="new-password"
              />
              {matches && (
                <p className="mt-1 text-xs font-medium text-green-600">
                  ✓ Passwords match
                </p>
              )}
            </div>

            {error && (
              <p
                key={errorKey}
                className="shake rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
              >
                ⚠️ {error}
              </p>
            )}

            <div className="fade-up" style={{ animationDelay: "0.7s" }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-shine pulse-ring flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-[#b36a30] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-caramel">
              Login
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}