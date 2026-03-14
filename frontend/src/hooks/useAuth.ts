"use client";

import { useState, useEffect, useCallback } from "react";
import { login as pbLogin, logout as pbLogout, getCurrentUser, isAdmin } from "@/lib/auth";
import getPocketBase from "@/lib/pocketbase";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: getCurrentUser(),
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const pb = getPocketBase();
    // Sync state when auth store changes (e.g. token refresh, logout)
    const unsubscribe = pb.authStore.onChange(() => {
      setState((prev) => ({ ...prev, user: getCurrentUser() }));
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await pbLogin(username, password);
      setState({ user, isLoading: false, error: null });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Invalid username or password.",
      }));
    }
  }, []);

  const logout = useCallback(() => {
    pbLogout();
    setState({ user: null, isLoading: false, error: null });
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.user !== null,
    isAdmin: isAdmin(),
    login,
    logout,
  };
}
