"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { searchRepairs, deleteRepair } from "@/lib/api/repairs";
import { getOutcomes } from "@/lib/api/outcomes";
import type { Repair, Outcome } from "@/lib/types";

export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  useEffect(() => { getOutcomes().then(setOutcomes); }, []);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const result = await searchRepairs({}, p, 25);
      setRepairs(result.items);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const handleDelete = async (repair: Repair) => {
    const device = repair.expand?.device?.asset_tag ?? repair.device;
    if (!confirm(`Delete repair for device ${device}?`)) return;
    try {
      await deleteRepair(repair.id);
      await load(page);
      toast.success("Repair deleted.");
    } catch {
      toast.error("Failed to delete repair.");
    }
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">All Repairs ({total})</h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Device</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tech</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repairs.map((repair) => {
                const date = new Date(repair.created).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                });
                return (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {repair.expand?.device?.asset_tag ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {repair.expand?.tech?.username ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        repair.expand?.outcome?.name === "Unrepairable"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {repair.expand?.outcome?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(repair)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{total} repairs</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Previous
            </button>
            <span className="px-3 py-1.5">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
