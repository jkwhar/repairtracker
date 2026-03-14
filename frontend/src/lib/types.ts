import type { RecordModel } from "pocketbase";

export interface User extends RecordModel {
  username: string;
  email: string;
  role: "tech" | "admin";
}

export interface Device extends RecordModel {
  asset_tag: string;
  dell_serial: string;
}

export interface Part extends RecordModel {
  name: string;
  active: boolean;
}

export interface Outcome extends RecordModel {
  name: string;
  is_default: boolean;
}

export interface Repair extends RecordModel {
  device: string;
  tech: string;
  parts_used: string[];
  outcome: string;
  notes: string;
  photos: string[];
  // Expanded relations (when fetched with expand)
  expand?: {
    device?: Device;
    tech?: User;
    parts_used?: Part[];
    outcome?: Outcome;
  };
}

export interface RepairFormData {
  device_id: string;
  parts_used: string[];
  outcome_id: string;
  notes: string;
  photos: File[];
}
