"use client";

import getPocketBase from "./pocketbase";
import type { User } from "./types";

export async function login(username: string, password: string): Promise<User> {
  const pb = getPocketBase();
  const authData = await pb.collection("users").authWithPassword(username, password);
  return authData.record as unknown as User;
}

export function logout(): void {
  const pb = getPocketBase();
  pb.authStore.clear();
}

export function getCurrentUser(): User | null {
  const pb = getPocketBase();
  if (!pb.authStore.isValid) return null;
  return pb.authStore.record as unknown as User;
}

export function isAuthenticated(): boolean {
  return getPocketBase().authStore.isValid;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}
