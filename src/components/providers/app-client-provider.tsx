"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LOCAL_STORAGE_SESSION_KEY } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

export interface AppSession {
  role: UserRole;
  walletAddress: string;
  walletProvider: string;
  name: string;
  email: string;
}

interface AppClientContextValue {
  session: AppSession;
  setRole: (role: UserRole) => void;
  setSession: (next: Partial<AppSession>) => void;
  clearSession: () => void;
}

const defaultSession: AppSession = {
  role: "LANDLORD",
  walletAddress: "",
  walletProvider: "",
  name: "",
  email: "",
};

const AppClientContext = createContext<AppClientContextValue | null>(null);

export function AppClientProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AppSession>(() => {
    if (typeof window === "undefined") {
      return defaultSession;
    }

    const raw = window.localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

    if (!raw) {
      return defaultSession;
    }

    try {
      const parsed = JSON.parse(raw) as AppSession;
      return {
        ...defaultSession,
        ...parsed,
      };
    } catch {
      window.localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      return defaultSession;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const value = useMemo<AppClientContextValue>(
    () => ({
      session,
      setRole(role) {
        startTransition(() => {
          setSessionState((current) => ({ ...current, role }));
        });
      },
      setSession(next) {
        startTransition(() => {
          setSessionState((current) => ({ ...current, ...next }));
        });
      },
      clearSession() {
        setSessionState(defaultSession);
        window.localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      },
    }),
    [session],
  );

  return <AppClientContext.Provider value={value}>{children}</AppClientContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppClientContext);

  if (!context) {
    throw new Error("useAppSession must be used inside AppClientProvider.");
  }

  return context;
}
