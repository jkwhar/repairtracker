"use client";

import { useRef, useCallback } from "react";

const SCANNER_THRESHOLD_MS = 50; // Keystrokes faster than this = scanner input

export function useBarcodeScanner(onScan: (value: string) => void) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const now = Date.now();
      const delta = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const value = bufferRef.current.trim();
        bufferRef.current = "";
        if (value) {
          // Scanner input: buffer has content, fire directly
          e.preventDefault();
          onScan(value);
        }
        // Manual typing: buffer is empty, let the form's onSubmit handle it
        return;
      }

      // If keystrokes are very fast (scanner), accumulate in buffer silently
      if (delta < SCANNER_THRESHOLD_MS && e.key.length === 1) {
        bufferRef.current += e.key;
        // Let the input handle it naturally too — the input's value is the source of truth
      }
    },
    [onScan]
  );

  // For manual submission (button click or form submit)
  const handleManualSubmit = useCallback(
    (value: string) => {
      bufferRef.current = "";
      if (value.trim()) onScan(value.trim());
    },
    [onScan]
  );

  return { handleKeyDown, handleManualSubmit };
}
