"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { playfair } from "@/lib/fonts";

const inputClass =
  "w-full rounded-lg border border-latte px-4 py-2.5 outline-none focus:border-caramel";

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
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      router.push("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-espresso/10">
        <h1 className={`${playfair.className} text-3xl font-bold`}>Create account</h1>
        <p className="mt-1 text-sm text-stone-500">Join us and order in a few taps.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input name="name" required value={form.name} onChange={onChange} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required value={form.email} onChange={onChange} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input name="phone" type="tel" required value={form.phone} onChange={onChange} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input name="password" type="password" required value={form.password} onChange={onChange} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Confirm password</label>
            <input name="confirm" type="password" required value={form.confirm} onChange={onChange} className={inputClass} />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-caramel py-3 font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-caramel">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}