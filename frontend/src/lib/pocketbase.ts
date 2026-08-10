"use client";

import PocketBase from "pocketbase";

// Use the Next.js rewrite proxy — works regardless of domain or IP.
// /pb/* is rewritten server-side to http://pocketbase:8090/*
const PB_URL = "/pb";

let pb: PocketBase;

export function getPocketBase(): PocketBase {
  if (!pb) {
    pb = new PocketBase(PB_URL);
  }
  return pb;
}

// PocketBase's `expand` returns a multi-relation field as a single record
// (not a one-item array) when exactly one related record is selected —
// array shape is only guaranteed for 0 or 2+ matches. Normalize so callers
// can always .map()/iterate an expanded multi-relation safely.
export function expandToArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default getPocketBase;
