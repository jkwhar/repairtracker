"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDevice } from "@/hooks/useDevice";
import { useOutcomes } from "@/hooks/useOutcomes";
import { getDefaultOutcome } from "@/lib/api/outcomes";
import { createRepair } from "@/lib/api/repairs";
import { decrementPartStock } from "@/lib/api/parts";
import { createDevice } from "@/lib/api/devices";
import { validateRepairForm } from "@/lib/validators/repair";
import { BarcodeScanner } from "./BarcodeScanner";
import { PartSelector } from "./PartSelector";
import { OutcomeSelector } from "./OutcomeSelector";
import { PhotoUpload } from "./PhotoUpload";
import { RepairHistory } from "./RepairHistory";
import type { RepairFormData } from "@/lib/types";

export function RepairForm() {
  const { device, isLoading: deviceLoading, error: deviceError, notFound, lastQuery, lookup, clear } = useDevice();
  const { outcomes } = useOutcomes();

  const [partsUsed, setPartsUsed] = useState<string[]>([]);
  const [outcomeId, setOutcomeId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [partsKey, setPartsKey] = useState(0);
  const [addAssetTag, setAddAssetTag] = useState("");
  const [addDellSerial, setAddDellSerial] = useState("");
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  useEffect(() => {
    if (!outcomeId && outcomes.length > 0) {
      const def = outcomes.find((o) => o.is_default) ?? outcomes[0];
      setOutcomeId(def.id);
    }
  }, [outcomes, outcomeId]);

  // Pre-fill the add-device form with the last searched query
  useEffect(() => {
    if (notFound && lastQuery) {
      setAddAssetTag(lastQuery);
      setAddDellSerial("");
    }
  }, [notFound, lastQuery]);

  const handleAddDevice = async () => {
    const at = addAssetTag.trim();
    const ds = addDellSerial.trim();
    if (!at || !ds) return;

    setIsAddingDevice(true);
    try {
      await createDevice(at, ds);
      toast.success(`Device ${at} added.`);
      await lookup(at);
    } catch {
      toast.error("Failed to add device. Asset tag or serial may already exist.");
    } finally {
      setIsAddingDevice(false);
    }
  };

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
      await decrementPartStock(partsUsed);
      setPartsKey((k) => k + 1);
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
            {notFound && lastQuery && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-amber-800 font-medium">
                  No device found for &ldquo;{lastQuery}&rdquo;. Add it?
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addAssetTag}
                      onChange={(e) => setAddAssetTag(e.target.value)}
                      placeholder="Asset tag"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                    <input
                      type="text"
                      value={addDellSerial}
                      onChange={(e) => setAddDellSerial(e.target.value)}
                      placeholder="Dell serial"
                      autoFocus
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddDevice}
                      disabled={isAddingDevice || !addAssetTag.trim() || !addDellSerial.trim()}
                      className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAddingDevice ? "Adding…" : "Add Device"}
                    </button>
                    <button
                      type="button"
                      onClick={clear}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
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
              key={partsKey}
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
