"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUsers, createUser, updateUserRole, resetUserPassword, deleteUser } from "@/lib/api/users";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";

export function UserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "tech" as "tech" | "admin" });
  const [isAdding, setIsAdding] = useState(false);

  const load = () => getUsers().then(setUsers);
  useEffect(() => { load(); }, []);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) return;
    setIsAdding(true);
    try {
      await createUser(newUser.username.trim(), newUser.password, newUser.role);
      setNewUser({ username: "", password: "", role: "tech" });
      setShowAdd(false);
      await load();
      toast.success("User created.");
    } catch {
      toast.error("Failed to create user.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (user: User, role: "tech" | "admin") => {
    if (user.id === currentUser?.id && role !== "admin" && adminCount <= 1) {
      toast.error("Cannot demote the last admin.");
      return;
    }
    try {
      await updateUserRole(user.id, role);
      await load();
      toast.success("Role updated.");
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("Cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete user "${user.username}"?`)) return;
    try {
      await deleteUser(user.id);
      await load();
      toast.success("User deleted.");
    } catch {
      toast.error("Cannot delete — user may have associated repairs.");
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAdd ? "Cancel" : "Add user"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={newUser.role}
              onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as "tech" | "admin" }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tech">Tech</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={isAdding || !newUser.username.trim() || !newUser.password.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {users.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No users</div>
        )}
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{u.username}</span>
              {u.id === currentUser?.id && (
                <span className="ml-2 text-xs text-gray-400">(you)</span>
              )}
            </div>
            <select
              value={u.role}
              onChange={(e) => handleRoleChange(u, e.target.value as "tech" | "admin")}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none"
            >
              <option value="tech">Tech</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={() => handleDelete(u)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
