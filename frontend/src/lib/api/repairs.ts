import getPocketBase from "@/lib/pocketbase";
import { getCurrentUser } from "@/lib/auth";
import type { Repair, RepairFormData } from "@/lib/types";

const EXPAND = "device,tech,parts_used,outcome";

export async function getRepairsForDevice(deviceId: string): Promise<Repair[]> {
  const pb = getPocketBase();
  return pb.collection("repairs").getFullList<Repair>({
    filter: pb.filter("device = {:id}", { id: deviceId }),
    sort: "-created",
    expand: EXPAND,
  });
}

export interface RepairFilters {
  deviceQuery?: string;
  techId?: string;
  outcomeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function searchRepairs(
  filters: RepairFilters,
  page = 1,
  perPage = 25
): Promise<{ items: Repair[]; total: number }> {
  const pb = getPocketBase();
  const conditions: string[] = [];

  if (filters.deviceQuery) {
    conditions.push(pb.filter("device.asset_tag ~ {:q} || device.dell_serial ~ {:q}", { q: filters.deviceQuery }));
  }
  if (filters.techId) conditions.push(pb.filter("tech = {:id}", { id: filters.techId }));
  if (filters.outcomeId) conditions.push(pb.filter("outcome = {:id}", { id: filters.outcomeId }));
  if (filters.dateFrom) conditions.push(pb.filter("created >= {:d}", { d: filters.dateFrom }));
  if (filters.dateTo) conditions.push(pb.filter("created <= {:d}", { d: `${filters.dateTo} 23:59:59` }));

  const filter = conditions.join(" && ");

  const result = await pb.collection("repairs").getList<Repair>(page, perPage, {
    filter,
    sort: "-created",
    expand: EXPAND,
  });

  return { items: result.items, total: result.totalItems };
}

export async function createRepair(data: RepairFormData): Promise<Repair> {
  const pb = getPocketBase();
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("device", data.device_id);
  formData.append("tech", user.id);
  formData.append("outcome", data.outcome_id);
  formData.append("notes", data.notes);

  for (const partId of data.parts_used) {
    formData.append("parts_used", partId);
  }

  for (const photo of data.photos) {
    formData.append("photos", photo);
  }

  return pb.collection("repairs").create<Repair>(formData);
}

export async function updateRepair(id: string, data: Partial<RepairFormData>): Promise<Repair> {
  const pb = getPocketBase();
  const payload: Record<string, unknown> = {};

  if (data.outcome_id !== undefined) payload["outcome"] = data.outcome_id;
  if (data.notes !== undefined) payload["notes"] = data.notes;
  if (data.parts_used !== undefined) payload["parts_used"] = data.parts_used;

  return pb.collection("repairs").update<Repair>(id, payload);
}

export async function deleteRepair(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection("repairs").delete(id);
}
