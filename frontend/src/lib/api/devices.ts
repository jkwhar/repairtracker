import getPocketBase from "@/lib/pocketbase";
import type { Device } from "@/lib/types";

export async function findDevice(query: string): Promise<Device | null> {
  const pb = getPocketBase();
  const q = query.trim();
  if (!q) return null;

  try {
    // Try asset_tag first, then dell_serial
    const results = await pb.collection("devices").getList<Device>(1, 1, {
      filter: pb.filter("asset_tag = {:q} || dell_serial = {:q}", { q }),
    });
    return results.items[0] ?? null;
  } catch (err) {
    console.error("[findDevice] lookup failed:", err);
    return null;
  }
}

export async function getDevices(page = 1, perPage = 50): Promise<{ items: Device[]; total: number }> {
  const pb = getPocketBase();
  const result = await pb.collection("devices").getList<Device>(page, perPage, {
    sort: "asset_tag",
  });
  return { items: result.items, total: result.totalItems };
}

export async function createDevice(asset_tag: string, dell_serial: string): Promise<Device> {
  const pb = getPocketBase();
  return pb.collection("devices").create<Device>({ asset_tag, dell_serial });
}

export async function bulkCreateDevices(
  rows: Array<{ asset_tag: string; dell_serial: string }>
): Promise<{ created: number; errors: Array<{ row: number; message: string }> }> {
  const pb = getPocketBase();
  let created = 0;
  const errors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      await pb.collection("devices").create(rows[i]);
      created++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push({ row: i + 1, message });
    }
  }

  return { created, errors };
}
