"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs, type AuditLog } from "@/lib/api/audit";

const COLLECTION_LABELS: Record<string, string> = {
  repairs: "Repair",
  parts: "Part",
  outcomes: "Outcome",
  devices: "Device",
  users: "User",
};

function parseDetails(details: string): Record<string, unknown> {
  try {
    return JSON.parse(details);
  } catch {
    return {};
  }
}

function AuditRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const details = parseDetails(log.details);
  const label = COLLECTION_LABELS[log.collection_name] ?? log.collection_name;
  const date = new Date(log.created).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  // Build a human-readable summary from the details snapshot
  const summary = [
    details["asset_tag"] && `Asset: ${details["asset_tag"]}`,
    details["dell_serial"] && `Serial: ${details["dell_serial"]}`,
    details["name"] && `Name: ${details["name"]}`,
    details["username"] && `Username: ${details["username"]}`,
    details["outcome"] && `Outcome: ${details["outcome"]}`,
  ].filter(Boolean).join(" · ") || log.record_id;

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{date}</td>
        <td className="px-4 py-3">
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            {log.action.toUpperCase()}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">{label}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{summary}</td>
        <td className="px-4 py-3 text-sm text-gray-700">{log.performed_by_username || "—"}</td>
        <td className="px-4 py-3 text-xs text-gray-400">{expanded ? "▲" : "▼"}</td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 py-3">
            <pre className="text-xs text-gray-600 bg-gray-100 rounded p-3 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const result = await getAuditLogs(p, 50);
      setLogs(result.items);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
        <p className="text-sm text-gray-500 mt-0.5">All record deletions and system events</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No events yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Record</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">By</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{total} events</span>
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
