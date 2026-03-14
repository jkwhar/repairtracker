"use client";

import { useState, useEffect } from "react";
import { getOutcomes } from "@/lib/api/outcomes";
import type { Outcome } from "@/lib/types";

export function useOutcomes() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOutcomes()
      .then(setOutcomes)
      .catch(() => setError("Failed to load outcomes"))
      .finally(() => setIsLoading(false));
  }, []);

  return { outcomes, isLoading, error };
}
