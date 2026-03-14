"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { validateDeviceCsv, type CsvRow } from "@/lib/validators/csv";
import { bulkCreateDevices } from "@/lib/api/devices";

type RowState = CsvRow & { status: "pending" | "ok" | "error"; message?: string };

export function CsvUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RowState[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState<{ created: number; errors: number } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImported(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const { rows: validRows, errors } = validateDeviceCsv(result.data);
        setRows(validRows.map((r) => ({ ...r, status: "pending" })));
        setParseErrors(errors);
      },
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);

    const result = await bulkCreateDevices(rows.map(({ asset_tag, dell_serial }) => ({ asset_tag, dell_serial })));

    const updated = rows.map((row, i) => {
      const err = result.errors.find((e) => e.row === i + 1);
      return err
        ? { ...row, status: "error" as const, message: err.message }
        : { ...row, status: "ok" as const };
    });

    setRows(updated);
    setImported({ created: result.created, errors: result.errors.length });
    setIsImporting(false);

    if (result.errors.length === 0) {
      toast.success(`${result.created} devices imported.`);
    } else {
      toast.warning(`${result.created} imported, ${result.errors.length} failed.`);
    }
  };

  const reset = () => {
    setRows([]);
    setParseErrors([]);
    setImported(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Choose CSV file
        </button>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
        <input ref={inputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
        <span className="text-xs text-gray-400">Expected columns: asset_tag, dell_serial</span>
      </div>

      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 space-y-1">
          <p className="font-medium">Validation errors ({parseErrors.length}):</p>
          {parseErrors.slice(0, 10).map((e, i) => (
            <p key={i}>Row {e.row}: {e.message}</p>
          ))}
          {parseErrors.length > 10 && <p>…and {parseErrors.length - 10} more</p>}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Asset Tag</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Dell Serial</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className={row.status === "error" ? "bg-red-50" : row.status === "ok" ? "bg-green-50" : ""}>
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-gray-800">{row.asset_tag}</td>
                    <td className="px-4 py-2 font-mono text-gray-800">{row.dell_serial}</td>
                    <td className="px-4 py-2">
                      {row.status === "pending" && <span className="text-gray-400">—</span>}
                      {row.status === "ok" && <span className="text-green-600">Imported</span>}
                      {row.status === "error" && <span className="text-red-600">{row.message}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!imported && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isImporting ? "Importing…" : `Import ${rows.length} devices`}
              </button>
              {rows.length > 1000 && (
                <p className="text-xs text-amber-600">Large file — import may take a moment</p>
              )}
            </div>
          )}

          {imported && (
            <p className="text-sm text-gray-600">
              Done: {imported.created} imported, {imported.errors} errors.
            </p>
          )}
        </>
      )}
    </div>
  );
}
