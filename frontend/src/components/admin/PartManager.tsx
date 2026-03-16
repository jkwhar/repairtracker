"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAllParts, createPart, updatePart } from "@/lib/api/parts";
import type { Part } from "@/lib/types";

export function PartManager() {
  const [parts, setParts] = useState<Part[]>([]);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const load = () => getAllParts().then(setParts);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      const qty = newQty !== "" ? parseInt(newQty, 10) : undefined;
      await createPart(name, isNaN(qty as number) ? undefined : qty);
      setNewName("");
      setNewQty("");
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

  const handleQuantityChange = async (part: Part, value: string) => {
    const qty = value === "" ? null : parseInt(value, 10);
    if (qty !== null && isNaN(qty)) return;
    if (qty === part.quantity) return;
    try {
      await updatePart(part.id, { quantity: qty });
      await load();
    } catch {
      toast.error("Failed to update quantity.");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Parts / Inventory</h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New part name…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
          placeholder="Qty"
          min={0}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 rounded-t-xl">
          <span className="flex-1">Name</span>
          <span className="w-20 text-right">Stock</span>
          <span className="w-16 text-center">Status</span>
          <span className="w-20" />
        </div>
        {parts.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No parts yet</div>
        )}
        {parts.map((part) => (
          <div key={`${part.id}-${part.quantity}`} className={`flex items-center gap-3 px-4 py-3 ${!part.active ? "opacity-50" : ""}`}>
            <input
              type="text"
              defaultValue={part.name}
              onBlur={(e) => handleRename(part, e.target.value)}
              className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 hover:bg-gray-50 rounded px-1"
            />
            <input
              type="number"
              defaultValue={part.quantity ?? ""}
              min={0}
              placeholder="—"
              onBlur={(e) => handleQuantityChange(part, e.target.value)}
              className="w-20 text-sm text-right border border-gray-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <span className={`w-16 text-center text-xs px-2 py-0.5 rounded-full ${part.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {part.active ? "Active" : "Inactive"}
            </span>
            <button
              onClick={() => handleToggle(part)}
              className="w-20 text-xs text-gray-500 hover:text-gray-800 transition-colors text-right"
            >
              {part.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Stock decrements automatically when a repair is saved. Leave blank to skip inventory tracking for a part.
      </p>
    </div>
  );
}
