"use client";

import { useOutcomes } from "@/hooks/useOutcomes";

interface Props {
  selected: string;
  onChange: (id: string) => void;
  error?: string;
}

export function OutcomeSelector({ selected, onChange, error }: Props) {
  const { outcomes, isLoading } = useOutcomes();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading outcomes…</div>;
  }

  return (
    <div>
      <div className="flex gap-3 flex-wrap">
        {outcomes.map((outcome) => {
          const active = selected === outcome.id;
          return (
            <label
              key={outcome.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                active
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="outcome"
                value={outcome.id}
                checked={active}
                onChange={() => onChange(outcome.id)}
                className="sr-only"
              />
              {outcome.name}
              {outcome.is_default && (
                <span className="text-xs text-gray-400">(default)</span>
              )}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
