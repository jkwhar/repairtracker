"use client";

import { useState, useRef } from "react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

interface Props {
  onScan: (value: string) => void;
  isLoading?: boolean;
}

export function BarcodeScanner({ onScan, isLoading }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleKeyDown, handleManualSubmit } = useBarcodeScanner((scanned) => {
    setValue("");
    onScan(scanned);
  });

  const submit = () => {
    handleManualSubmit(value);
    setValue("");
  };

  // Not a <form> — this control is nested inside RepairForm's own <form>,
  // and nested forms are invalid HTML. The browser silently collapses them,
  // which can make Enter/submit fall through to a native page reload
  // instead of firing the React handler, so submission is handled entirely
  // via this keydown/click wiring.
  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, value)}
        placeholder="Scan or type asset tag / serial number…"
        autoFocus
        autoComplete="off"
        disabled={isLoading}
        className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono disabled:bg-gray-100"
      />
      <button
        type="button"
        onClick={submit}
        disabled={isLoading || !value.trim()}
        className="px-5 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Looking up…" : "Lookup"}
      </button>
    </div>
  );
}
