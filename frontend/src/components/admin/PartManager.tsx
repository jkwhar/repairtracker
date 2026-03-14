"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAllParts, createPart, updatePart, deletePart } from "@/lib/api/parts";
import type { Part } from "@/lib/types";

export function PartManager() {
  const [parts, setParts] = useState<Part[]>([]);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const load = () => getAllParts().then(setParts);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      await createPart(name);
      setNewName("");
      await load();
      toast.success(`Part "${name}" added.`);
    } catch {
      toast.error("Failed to add part.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (part: Part) => {
    try {
      await updatePart(part.id, { active: !part.active });
      await load();
      toast.success(`"${part.name}" ${part.active ? "deactivated" : "activated"}.`);
    } catch {
      toast.error("Failed to update part.");
    }
  };

  const handleRename = async (part: Part, name: string) => {
    if (!name.trim() || name === part.name) return;
    try {
      await updatePart(part.id, { name: name.trim() });
      await load();
      toast.success("Part renamed.");
    } catch {
      toast.error("Failed to rename part.");
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Parts</h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New part name…"
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
        {parts.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No parts yet</div>
        )}
        {parts.map((part) => (
          <div key={part.id} className={`flex items-center gap-3 px-4 py-3 ${!part.active ? "opacity-50" : ""}`}>
            <input
              type="text"
              defaultValue={part.name}
              onBlur={(e) => handleRename(part, e.target.value)}
              className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 hover:bg-gray-50 rounded px-1"
            />
            <span className={`text-xs px-2 py-0.5 rounded-full ${part.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {part.active ? "Active" : "Inactive"}
            </span>
            <button
              onClick={() => handleToggle(part)}
              className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              {part.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
