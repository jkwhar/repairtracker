"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { searchRepairs } from "@/lib/api/repairs";
import { getOutcomes } from "@/lib/api/outcomes";
import { getUsers } from "@/lib/api/users";
import type { Repair, Outcome, User } from "@/lib/types";

export default function SearchPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [filters, setFilters] = useState({
    deviceQuery: "",
    techId: "",
    outcomeId: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    getOutcomes().then(setOutcomes);
    getUsers().then(setUsers);
  }, []);

  const search = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const result = await searchRepairs(filters, currentPage, 25);
      setRepairs(result.items);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    search(page);
  }, [search, page]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">Search Repairs</h1>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Asset tag / serial"
              value={filters.deviceQuery}
              onChange={(e) => handleFilterChange("deviceQuery", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.techId}
              onChange={(e) => handleFilterChange("techId", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All techs</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <select
              value={filters.outcomeId}
              onChange={(e) => handleFilterChange("outcomeId", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All outcomes</option>
              {outcomes.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
            ) : repairs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No repairs found</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Device</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tech</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Parts</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Outcome</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {repairs.map((repair) => {
                    const parts = repair.expand?.parts_used?.map((p) => p.name).join(", ") ?? "—";
                    const outcome = repair.expand?.outcome?.name ?? "—";
                    const device = repair.expand?.device;
                    const tech = repair.expand?.tech?.username ?? "—";
                    const date = new Date(repair.created).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    });

                    return (
                      <tr key={repair.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{date}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{device?.asset_tag ?? "—"}</div>
                          <div className="text-xs text-gray-400">{device?.dell_serial}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{tech}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{parts}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            outcome === "Unrepairable"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {outcome}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                          {repair.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{total} repairs</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
