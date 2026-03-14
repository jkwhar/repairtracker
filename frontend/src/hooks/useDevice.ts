"use client";

import { useState, useCallback } from "react";
import { findDevice } from "@/lib/api/devices";
import type { Device } from "@/lib/types";

export function useDevice() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const lookup = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);
    setDevice(null);
    setNotFound(false);
    setLastQuery(q);

    const found = await findDevice(q);
    if (found) {
      setDevice(found);
      setNotFound(false);
    } else {
      setNotFound(true);
    }

    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    setDevice(null);
    setError(null);
    setNotFound(false);
    setLastQuery(null);
  }, []);

  return { device, isLoading, error, notFound, lastQuery, lookup, clear };
}
