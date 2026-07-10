"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { AUTH_EXPIRED_EVENT } from "@/lib/http";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/tokens";
import { Me, Role } from "@/lib/types";

interface AuthContextValue {
  user: Me | null;
  role: Role | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hydrate = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function handleExpired() {
      setUser(null);
      router.push("/login");
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setTokens(res.token, res.refreshToken);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string, role?: Role) => {
    const res = await authApi.register(email, password, role);
    setTokens(res.token, res.refreshToken);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // best-effort; still clear local state
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const role = (user?.role as Role | undefined) ?? null;

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
