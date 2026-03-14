"use client";

import { useState, useEffect, useCallback } from "react";
import { getRepairsForDevice } from "@/lib/api/repairs";
import type { Repair } from "@/lib/types";

export function useRepairsForDevice(deviceId: string | null) {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getRepairsForDevice(id);
      setRepairs(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (deviceId) {
      load(deviceId);
    } else {
      setRepairs([]);
    }
  }, [deviceId, load]);

  return { repairs, isLoading, reload: () => deviceId && load(deviceId) };
}
