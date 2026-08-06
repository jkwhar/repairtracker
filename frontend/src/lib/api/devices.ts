import getPocketBase from "@/lib/pocketbase";
import type { Device } from "@/lib/types";

export async function findDevice(query: string): Promise<Device | null> {
  const pb = getPocketBase();
  const q = query.trim();
  if (!q) return null;

  try {
    // Techs scan or type asset tags/serials in whatever case is printed on
    // the label, which doesn't always match how a device was imported, so
    // match case-insensitively. PocketBase's `=` is case-sensitive; `~` is
    // a case-insensitive *substring* match, so narrow with it and then
    // require an exact (case-insensitive) match locally to avoid returning
    // an unrelated device whose tag merely contains the query.
    const results = await pb.collection("devices").getList<Device>(1, 50, {
      filter: pb.filter("asset_tag ~ {:q} || dell_serial ~ {:q}", { q }),
    });
    const qLower = q.toLowerCase();
    return (
      results.items.find(
        (d) => d.asset_tag.toLowerCase() === qLower || d.dell_serial.toLowerCase() === qLower
      ) ?? null
    );
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
