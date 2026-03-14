import getPocketBase from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

export interface AuditLog extends RecordModel {
  action: string;
  collection_name: string;
  record_id: string;
  performed_by: string;
  performed_by_username: string;
  details: string;
  created: string;
}

export async function getAuditLogs(
  page = 1,
  perPage = 50
): Promise<{ items: AuditLog[]; total: number }> {
  const pb = getPocketBase();
  const result = await pb.collection("audit_logs").getList<AuditLog>(page, perPage, {
    sort: "-created",
  });
  return { items: result.items, total: result.totalItems };
}
