"use client";

import { useState, useEffect, useCallback } from "react";
import { getDevices } from "@/lib/api/devices";
import type { Device } from "@/lib/types";

const PER_PAGE = 25;

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const result = await getDevices(p, PER_PAGE);
      setDevices(result.items);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Imported Devices ({total})</h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No devices imported yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Asset Tag</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dell Serial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-900">{device.asset_tag}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{device.dell_serial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{total} devices</span>
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
