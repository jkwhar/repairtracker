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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleManualSubmit(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Scan or type asset tag / serial number…"
        autoFocus
        autoComplete="off"
        disabled={isLoading}
        className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="px-5 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Looking up…" : "Lookup"}
      </button>
    </form>
  );
}
