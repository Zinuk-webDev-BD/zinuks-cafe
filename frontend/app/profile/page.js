"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequireLogin from "@/components/RequireLogin";
import FloatingInput from "@/components/FloatingInput";
import AddressForm from "@/components/AddressForm";
import { apiRequest } from "@/lib/api";
import { playfair } from "@/lib/fonts";

const ICON = { Home: "🏠", Office: "🏢", Other: "📍" };

function Profile() {
  const { token, user, updateUser } = useAuth();
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [info, setInfo] = useState({ name: null, phone: null });
  const [savingInfo, setSavingInfo] = useState(false);
  const [editing, setEditing] = useState(null);
  const [savingAddr, setSavingAddr] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/auth/me", { token })
      .then((data) => {
        if (!cancelled) setMe(data.user);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const flash = (text) => {
    setNote(text);
    setTimeout(() => setNote(""), 3500);
  };

  const name = info.name !== null ? info.name : me ? me.name : "";
  const phone = info.phone !== null ? info.phone : me ? me.phone || "" : "";

  const saveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setError("");
    try {
      const data = await apiRequest("/auth/profile", {
        method: "PUT",
        token,
        body: { name, phone },
      });
      setMe((m) => ({ ...m, name: data.user.name, phone: data.user.phone }));
      updateUser({ name: data.user.name });
      setInfo({ name: null, phone: null });
      flash("Profile updated ✓");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const saveAddress = async (data) => {
    setSavingAddr(true);
    setError("");
    try {
      const res =
        editing === "new"
          ? await apiRequest("/auth/addresses", {
              method: "POST",
              token,
              body: data,
            })
          : await apiRequest(`/auth/addresses/${editing._id}`, {
              method: "PUT",
              token,
              body: data,
            });
      setMe((m) => ({ ...m, addresses: res.addresses }));
      flash(editing === "new" ? "Address saved ✓" : "Address updated ✓");
      setEditing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAddr(false);
    }
  };

  const makeDefault = async (a) => {
    setError("");
    try {
      const res = await apiRequest(`/auth/addresses/${a._id}`, {
        method: "PUT",
        token,
        body: { isDefault: true },
      });
      setMe((m) => ({ ...m, addresses: res.addresses }));
      flash("Default address changed ✓");
    } catch (err) {
      setError(err.message);
    }
  };

  const removeAddress = async (a) => {
    if (!window.confirm(`Delete your "${a.label}" address?`)) return;
    setError("");
    try {
      const res = await apiRequest(`/auth/addresses/${a._id}`, {
        method: "DELETE",
        token,
      });
      setMe((m) => ({ ...m, addresses: res.addresses }));
      flash("Address deleted");
    } catch (err) {
      setError(err.message);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pw.next.length < 6)
      return setPwError("New password must be at least 6 characters");
    if (pw.next !== pw.confirm) return setPwError("New passwords do not match");

    setSavingPw(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        token,
        body: { currentPassword: pw.current, newPassword: pw.next },
      });
      setPw({ current: "", next: "", confirm: "" });
      flash("Password changed ✓");
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const shownName = me ? me.name : user.name;
  const addresses = me ? me.addresses || [] : [];

  return (
    <div>
      <section className="relative overflow-hidden bg-espresso px-4 pb-20 pt-12 text-white">
        <div className="relative z-10 mx-auto flex max-w-5xl items-center gap-5">
          <div className="pop flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-caramel text-4xl font-bold shadow-xl">
            {shownName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1
              className={`${playfair.className} fade-up truncate text-3xl font-bold sm:text-4xl`}
            >
              {shownName}
            </h1>
            <p
              className="fade-up truncate text-stone-300"
              style={{ animationDelay: "0.15s" }}
            >
              {user.email}
            </p>
          </div>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-[-1px] h-14 w-full sm:h-20"
          fill="#faf5ee"
        >
          <path d="M0,60 C180,120 360,0 540,50 C720,100 900,10 1080,55 C1260,100 1350,40 1440,60 L1440,120 L0,120 Z" />
        </svg>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        {note && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            {note}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
            ⚠️ {error}
          </p>
        )}

        {!me && !error && (
          <div className="h-64 animate-pulse rounded-2xl bg-latte" />
        )}

        {me && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <form
                onSubmit={saveInfo}
                className="card-in space-y-4 rounded-2xl bg-white p-6 shadow-md"
              >
                <h2 className="text-xl font-semibold">Personal info</h2>
                <FloatingInput
                  label="Full name"
                  icon="🙂"
                  name="name"
                  value={name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  autoComplete="name"
                />
                <FloatingInput
                  label="Phone"
                  icon="📱"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  autoComplete="tel"
                />
                <p className="text-xs text-stone-500">
                  ✉️ {me.email} (email cannot be changed)
                </p>
                <button
                  type="submit"
                  disabled={savingInfo}
                  className="btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-2.5 font-semibold text-white transition hover:bg-[#b36a30] disabled:opacity-60"
                >
                  {savingInfo ? (
                    <>
                      <span className="spinner" /> Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </form>

              <form
                onSubmit={savePassword}
                className="card-in space-y-4 rounded-2xl bg-white p-6 shadow-md"
                style={{ animationDelay: "0.1s" }}
              >
                <h2 className="text-xl font-semibold">Change password</h2>
                <FloatingInput
                  label="Current password"
                  icon="🔑"
                  name="current"
                  type="password"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  autoComplete="current-password"
                />
                <FloatingInput
                  label="New password"
                  icon="🔐"
                  name="next"
                  type="password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  autoComplete="new-password"
                />
                <FloatingInput
                  label="Confirm new password"
                  icon="🔐"
                  name="confirm"
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  autoComplete="new-password"
                />
                {pwError && (
                  <p className="shake rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                    ⚠️ {pwError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingPw}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-2.5 font-semibold text-white transition hover:bg-caramel disabled:opacity-60"
                >
                  {savingPw ? (
                    <>
                      <span className="spinner" /> Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            </div>

            <div
              className="card-in h-fit rounded-2xl bg-white p-6 shadow-md"
              style={{ animationDelay: "0.05s" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Saved addresses</h2>
                <span className="text-xs text-stone-500">
                  {addresses.length} of 5
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {addresses.length === 0 && editing !== "new" && (
                  <div className="rounded-xl bg-cream p-6 text-center">
                    <div className="float text-4xl">📍</div>
                    <p className="mt-2 text-sm text-stone-600">
                      No saved addresses yet. Add one to check out faster.
                    </p>
                  </div>
                )}

                {addresses.map((a, i) =>
                  editing && editing._id === a._id ? (
                    <AddressForm
                      key={a._id}
                      initial={a}
                      saving={savingAddr}
                      onSubmit={saveAddress}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <div
                      key={a._id}
                      className="fade-up rounded-xl border-2 border-latte p-4 transition hover:border-caramel/60"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">
                          {ICON[a.label] || "📍"} {a.label}
                        </p>
                        {a.isDefault && (
                          <span className="rounded-full bg-caramel px-2.5 py-0.5 text-xs font-semibold text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm">
                        {a.name} · {a.phone}
                      </p>
                      <p className="text-sm text-stone-600">{a.address}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setEditing(a)}
                          className="font-medium text-caramel hover:underline"
                        >
                          ✏️ Edit
                        </button>
                        {!a.isDefault && (
                          <button
                            type="button"
                            onClick={() => makeDefault(a)}
                            className="font-medium text-stone-600 hover:underline"
                          >
                            ⭐ Make default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAddress(a)}
                          className="font-medium text-red-500 hover:underline"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )
                )}

                {editing === "new" && (
                  <AddressForm
                    saving={savingAddr}
                    defaultName={me.name}
                    defaultPhone={me.phone || ""}
                    onSubmit={saveAddress}
                    onCancel={() => setEditing(null)}
                  />
                )}
              </div>

              {editing !== "new" && addresses.length < 5 && (
                <button
                  type="button"
                  onClick={() => setEditing("new")}
                  className="mt-4 w-full rounded-full border-2 border-dashed border-caramel py-2.5 text-sm font-semibold text-caramel transition hover:bg-cream"
                >
                  ➕ Add new address
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/orders"
            className="text-sm font-medium text-caramel hover:underline"
          >
            📦 View my orders →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireLogin>
      <Profile />
    </RequireLogin>
  );
}