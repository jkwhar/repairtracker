import type { RepairFormData } from "@/lib/types";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateRepairForm(data: RepairFormData & { device_id: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.device_id) {
    errors.device = "A device must be selected before submitting.";
  }

  if (data.parts_used.length === 0) {
    errors.parts_used = "Select at least one part or action.";
  }

  if (!data.outcome_id) {
    errors.outcome = "An outcome is required.";
  }

  if (data.notes.length > 5000) {
    errors.notes = "Notes must be 5000 characters or fewer.";
  }

  if (data.photos.length > 5) {
    errors.photos = "Maximum 5 photos allowed.";
  }

  const oversized = data.photos.filter((f) => f.size > 5 * 1024 * 1024);
  if (oversized.length > 0) {
    errors.photos = `Photo(s) exceed 5 MB limit: ${oversized.map((f) => f.name).join(", ")}`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
