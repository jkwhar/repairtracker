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

/** Decrement stock by 1 for each part id. Errors are swallowed — inventory is best-effort. */
export async function decrementPartStock(partIds: string[]): Promise<void> {
  const pb = getPocketBase();
  const unique = [...new Set(partIds)];
  await Promise.allSettled(
    unique.map(async (id) => {
      const part = await pb.collection("parts").getOne<Part>(id);
      const current = part.quantity ?? null;
      if (current === null) return; // no inventory tracking for this part
      await pb.collection("parts").update<Part>(id, {
        quantity: Math.max(0, current - partIds.filter((p) => p === id).length),
      });
    })
  );
}
