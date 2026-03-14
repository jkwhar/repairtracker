"use client";

import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://localhost:8090";

// Singleton PocketBase client — reused across all imports
let pb: PocketBase;

export function getPocketBase(): PocketBase {
  if (!pb) {
    pb = new PocketBase(PB_URL);
  }
  return pb;
}

export default getPocketBase;
