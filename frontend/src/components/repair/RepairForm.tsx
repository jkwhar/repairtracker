"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDevice } from "@/hooks/useDevice";
import { useOutcomes } from "@/hooks/useOutcomes";
import { getDefaultOutcome } from "@/lib/api/outcomes";
import { createRepair } from "@/lib/api/repairs";
import { validateRepairForm } from "@/lib/validators/repair";
import { BarcodeScanner } from "./BarcodeScanner";
import { PartSelector } from "./PartSelector";
import { OutcomeSelector } from "./OutcomeSelector";
import { PhotoUpload } from "./PhotoUpload";
import { RepairHistory } from "./RepairHistory";
import type { RepairFormData } from "@/lib/types";

export function RepairForm() {
  const { device, isLoading: deviceLoading, error: deviceError, lookup, clear } = useDevice();
  const { outcomes } = useOutcomes();

  const [partsUsed, setPartsUsed] = useState<string[]>([]);
  const [outcomeId, setOutcomeId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Set default outcome once outcomes load
  useEffect(() => {
    if (!outcomeId && outcomes.length > 0) {
      const def = outcomes.find((o) => o.is_default) ?? outcomes[0];
      setOutcomeId(def.id);
    }
  }, [outcomes, outcomeId]);

  const resetForm = async () => {
    setPartsUsed([]);
    setNotes("");
    setPhotos([]);
    setFieldErrors({});
    clear();
    const def = await getDefaultOutcome();
    if (def) setOutcomeId(def.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: RepairFormData & { device_id: string } = {
      device_id: device?.id ?? "",
      parts_used: partsUsed,
      outcome_id: outcomeId,
      notes,
      photos,
    };

    const { valid, errors } = validateRepairForm(formData);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createRepair(formData);
      toast.success("Repair saved successfully.");
      await resetForm();
    } catch {
      toast.error("Failed to save repair. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main form */}
      <div className="flex-1 min-w-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Barcode scanner */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Device Lookup</h2>
            <BarcodeScanner onScan={lookup} isLoading={deviceLoading} />
            {deviceError && (
              <p className="text-sm text-red-600">{deviceError}</p>
            )}
            {fieldErrors.device && (
              <p className="text-sm text-red-600">{fieldErrors.device}</p>
            )}
            {device && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Asset: {device.asset_tag}</span>
                  <span className="text-blue-600 ml-3">Serial: {device.dell_serial}</span>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  className="text-blue-400 hover:text-blue-600 text-xs"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Parts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">
              Parts / Actions
              {partsUsed.length > 0 && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  {partsUsed.length} selected
                </span>
              )}
            </h2>
            <PartSelector
              selected={partsUsed}
              onChange={setPartsUsed}
              error={fieldErrors.parts_used}
            />
          </div>

          {/* Outcome */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Outcome</h2>
            <OutcomeSelector
              selected={outcomeId}
              onChange={setOutcomeId}
              error={fieldErrors.outcome}
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Notes <span className="font-normal text-gray-400 text-sm">(optional)</span></h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.notes && <p className="text-sm text-red-600">{fieldErrors.notes}</p>}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Photos <span className="font-normal text-gray-400 text-sm">(optional)</span></h2>
            <PhotoUpload files={photos} onChange={setPhotos} error={fieldErrors.photos} />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !device}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving…" : "Save Repair"}
            </button>
          </div>
        </form>
      </div>

      {/* History sidebar */}
      <div className="w-72 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
          {device ? (
            <RepairHistory deviceId={device.id} />
          ) : (
            <div className="text-sm text-gray-400 py-4 text-center">
              Scan a device to see repair history
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
