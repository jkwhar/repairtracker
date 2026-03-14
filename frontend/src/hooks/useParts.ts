"use client";

import { useState, useEffect } from "react";
import { getActiveParts } from "@/lib/api/parts";
import type { Part } from "@/lib/types";

export function useParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveParts()
      .then(setParts)
      .catch(() => setError("Failed to load parts"))
      .finally(() => setIsLoading(false));
  }, []);

  return { parts, isLoading, error };
}
