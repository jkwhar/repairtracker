import getPocketBase from "@/lib/pocketbase";
import type { Outcome } from "@/lib/types";

export async function getOutcomes(): Promise<Outcome[]> {
  const pb = getPocketBase();
  return pb.collection("outcomes").getFullList<Outcome>({ sort: "name" });
}

export async function getDefaultOutcome(): Promise<Outcome | null> {
  const pb = getPocketBase();
  try {
    const results = await pb.collection("outcomes").getList<Outcome>(1, 1, {
      filter: "is_default = true",
    });
    return results.items[0] ?? null;
  } catch {
    return null;
  }
}

export async function createOutcome(name: string, is_default = false): Promise<Outcome> {
  const pb = getPocketBase();
  return pb.collection("outcomes").create<Outcome>({ name, is_default });
}

export async function updateOutcome(id: string, data: Partial<Pick<Outcome, "name" | "is_default">>): Promise<Outcome> {
  const pb = getPocketBase();
  return pb.collection("outcomes").update<Outcome>(id, data);
}

export async function deleteOutcome(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection("outcomes").delete(id);
}

// Ensures only one outcome is the default
export async function setDefaultOutcome(id: string): Promise<void> {
  const pb = getPocketBase();
  const all = await getOutcomes();

  for (const outcome of all) {
    if (outcome.is_default && outcome.id !== id) {
      await pb.collection("outcomes").update(outcome.id, { is_default: false });
    }
  }

  await pb.collection("outcomes").update(id, { is_default: true });
}
