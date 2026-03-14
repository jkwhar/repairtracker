import getPocketBase from "@/lib/pocketbase";
import type { User } from "@/lib/types";

export async function getUsers(): Promise<User[]> {
  const pb = getPocketBase();
  return pb.collection("users").getFullList<User>({ sort: "username" });
}

export async function createUser(username: string, password: string, role: "tech" | "admin"): Promise<User> {
  const pb = getPocketBase();
  return pb.collection("users").create<User>({
    username,
    password,
    passwordConfirm: password,
    role,
  });
}

export async function updateUserRole(id: string, role: "tech" | "admin"): Promise<User> {
  const pb = getPocketBase();
  return pb.collection("users").update<User>(id, { role });
}

export async function resetUserPassword(id: string, password: string): Promise<User> {
  const pb = getPocketBase();
  return pb.collection("users").update<User>(id, { password, passwordConfirm: password });
}

export async function deleteUser(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection("users").delete(id);
}
