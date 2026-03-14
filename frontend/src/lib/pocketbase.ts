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

export default getPocketBase;
