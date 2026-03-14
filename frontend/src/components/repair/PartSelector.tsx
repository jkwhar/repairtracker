"use client";

import { useParts } from "@/hooks/useParts";

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}

export function PartSelector({ selected, onChange, error }: Props) {
  const { parts, isLoading } = useParts();

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next);
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading parts…</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {parts.map((part) => {
          const checked = selected.includes(part.id);
          return (
            <label
              key={part.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                checked
                  ? "bg-blue-50 border-blue-500 text-blue-800"
                  : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(part.id)}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  checked ? "bg-blue-600 border-blue-600" : "border-gray-400"
                }`}
              >
                {checked && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </span>
              {part.name}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
