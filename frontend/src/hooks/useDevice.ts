"use client";

import { useState, useCallback } from "react";
import { findDevice } from "@/lib/api/devices";
import type { Device } from "@/lib/types";

export function useDevice() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);
    setDevice(null);

    const found = await findDevice(q);
    if (found) {
      setDevice(found);
    } else {
      setError(`No device found for "${q}"`);
    }

    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    setDevice(null);
    setError(null);
  }, []);

  return { device, isLoading, error, lookup, clear };
}
