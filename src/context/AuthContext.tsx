// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, logoutRequest, refreshRequest } from "../services/auth.service";
import type { UserDTO } from "../services/auth.service";

type AuthState = {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const LS_USER = "auth_user";
const LS_REMEMBER = "auth_remember"; // ✅ nuevo: true/false (string)

let bootstrapped = false;

function is401(err: unknown) {
  const msg = String((err as any)?.message ?? "");
  return msg.includes("401") || msg.toLowerCase().includes("unauthorized");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(() => {
    const raw = localStorage.getItem(LS_USER);
    return raw ? (JSON.parse(raw) as UserDTO) : null;
  });

  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  function persist(u: UserDTO | null) {
    setUser(u);
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    else localStorage.removeItem(LS_USER);
  }

  function setRememberFlag(v: boolean) {
    localStorage.setItem(LS_REMEMBER, v ? "true" : "false");
  }

  // ✅ bootstrap:
  // - SOLO intenta refresh si rememberMe fue true la última vez
  useEffect(() => {
    if (bootstrapped) {
      setLoading(false);
      return;
    }
    bootstrapped = true;

    (async () => {
      try {
        const remember = localStorage.getItem(LS_REMEMBER) === "true";
        if (!remember) {
          // No “remember me” => no existe refresh cookie, no hagas refresh.
          return;
        }

        const r = await refreshRequest(); // requiere refreshToken cookie
        persist(r.user);
      } catch (err) {
        if (is401(err)) {
          // refresh inválido/expiró => limpiar todo
          persist(null);
          setRememberFlag(false);
        } else {
          console.error(err);
          persist(null);
          setRememberFlag(false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const r = await loginRequest({ email, password, rememberMe });
    persist(r.user);
    setRememberFlag(rememberMe); // ✅ clave
  };

  const refresh = async () => {
    const r = await refreshRequest();
    persist(r.user);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      persist(null);
      setRememberFlag(false); // ✅
    }
  };

  const value = useMemo<AuthState>(
    () => ({ user, loading, isAuthenticated, login, logout, refresh }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
