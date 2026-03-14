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

export async function createPart(name: string): Promise<Part> {
  const pb = getPocketBase();
  return pb.collection("parts").create<Part>({ name, active: true });
}

export async function updatePart(id: string, data: Partial<Pick<Part, "name" | "active">>): Promise<Part> {
  const pb = getPocketBase();
  return pb.collection("parts").update<Part>(id, data);
}

export async function deletePart(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection("parts").delete(id);
}
