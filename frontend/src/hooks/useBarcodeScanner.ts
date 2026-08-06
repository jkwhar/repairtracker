"use client";

import { useCallback } from "react";

// Hardware barcode scanners act as a keyboard: they type the code's
// characters and then send Enter. The input's controlled value is always
// accurate by the time Enter fires — even for scanner-speed keystrokes a
// few ms apart, each keydown is a separate DOM event that React has
// already committed the prior character's state update for — so scanned
// and manually-typed/pasted input can share the exact same submit path.
export function useBarcodeScanner(onScan: (value: string) => void) {
  const handleManualSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed) onScan(trimmed);
    },
    [onScan]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, value: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleManualSubmit(value);
      }
    },
    [handleManualSubmit]
  );

  return { handleKeyDown, handleManualSubmit };
}
