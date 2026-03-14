"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getOutcomes, createOutcome, updateOutcome, deleteOutcome, setDefaultOutcome } from "@/lib/api/outcomes";
import type { Outcome } from "@/lib/types";

export function OutcomeManager() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const load = () => getOutcomes().then(setOutcomes);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      await createOutcome(name);
      setNewName("");
      await load();
      toast.success(`Outcome "${name}" added.`);
    } catch {
      toast.error("Failed to add outcome.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultOutcome(id);
      await load();
      toast.success("Default outcome updated.");
    } catch {
      toast.error("Failed to update default.");
    }
  };

  const handleDelete = async (outcome: Outcome) => {
    if (!confirm(`Delete "${outcome.name}"? This cannot be undone.`)) return;
    try {
      await deleteOutcome(outcome.id);
      await load();
      toast.success(`"${outcome.name}" deleted.`);
    } catch {
      toast.error("Cannot delete — outcome may be in use.");
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Outcomes</h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New outcome name…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isAdding || !newName.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {outcomes.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No outcomes yet</div>
        )}
        {outcomes.map((outcome) => (
          <div key={outcome.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 text-sm text-gray-800">{outcome.name}</span>
            {outcome.is_default ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Default</span>
            ) : (
              <button
                onClick={() => handleSetDefault(outcome.id)}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                Set default
              </button>
            )}
            <button
              onClick={() => handleDelete(outcome)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
