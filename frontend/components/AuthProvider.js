"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { apiRequest } from "@/lib/api";

const AuthContext = createContext(null);
const KEY = "zc_auth";
const EVENT = "zc-auth";
const EMPTY = { user: null, token: null };

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
const getSnapshot = () => localStorage.getItem(KEY);
const getServerSnapshot = () => null;
const noopSubscribe = () => () => {};

function save(data) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ user: data.user, token: data.token })
  );
  window.dispatchEvent(new Event(EVENT));
}

export function AuthProvider({ children }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const auth = useMemo(() => {
    try {
      return raw ? JSON.parse(raw) : EMPTY;
    } catch {
      return EMPTY;
    }
  }, [raw]);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    save(data);
    return data.user;
  }, []);

  const register = useCallback(async (form) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: form,
    });
    save(data);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const value = {
    user: auth.user,
    token: auth.token,
    mounted,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}