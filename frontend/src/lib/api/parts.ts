import getPocketBase from "@/lib/pocketbase";
import type { Part } from "@/lib/types";

export async function getActiveParts(): Promise<Part[]> {
  const pb = getPocketBase();
  const result = await pb.collection("parts").getFullList<Part>({
    filter: "active = true",
    sort: "name",
  });
  return result;
}

export async function getAllParts(): Promise<Part[]> {
  const pb = getPocketBase();
  return pb.collection("parts").getFullList<Part>({ sort: "name" });
}

export async function createPart(name: string, quantity?: number): Promise<Part> {
  const pb = getPocketBase();
  return pb.collection("parts").create<Part>({
    name,
    active: true,
    quantity: quantity ?? null,
  });
}

export async function updatePart(
  id: string,
  data: Partial<Pick<Part, "name" | "active" | "quantity">>
): Promise<Part> {
  const pb = getPocketBase();
  return pb.collection("parts").update<Part>(id, data);
}

export async function deletePart(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection("parts").delete(id);
}

/**
 * Decrement stock by 1 for each part id used in a repair. Best-effort: a
 * failure to update one part's stock does not throw, since inventory drift
 * shouldn't block a repair from being logged — but failures are now logged
 * instead of silently disappearing.
 */
export async function decrementPartStock(partIds: string[]): Promise<void> {
  const pb = getPocketBase();
  const unique = [...new Set(partIds)];
  const results = await Promise.allSettled(
    unique.map(async (id) => {
      const part = await pb.collection("parts").getOne<Part>(id);
      if (part.quantity === null) return; // no inventory tracking for this part
      const count = partIds.filter((p) => p === id).length;
      // Atomic server-side decrement (PocketBase's "field-" modifier) rather
      // than reading the current value and writing it back — the latter
      // races when two repairs decrement the same part concurrently.
      await pb.collection("parts").update<Part>(id, { "quantity-": count });
    })
  );
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[decrementPartStock] failed to update part stock:", result.reason);
    }
  }
}
