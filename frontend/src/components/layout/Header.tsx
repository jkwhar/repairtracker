"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-14 bg-gray-900 text-white flex items-center justify-between px-6 shrink-0">
      <Link href="/repairs" className="font-semibold text-lg tracking-tight">
        Repair Tracker
      </Link>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/repairs" className="hover:text-gray-300 transition-colors">
          New Repair
        </Link>
        <Link href="/repairs/search" className="hover:text-gray-300 transition-colors">
          Search
        </Link>
        {isAdmin && (
          <Link href="/admin/parts" className="hover:text-gray-300 transition-colors">
            Admin
          </Link>
        )}
        <span className="text-gray-400">|</span>
        <span className="text-gray-300">{user?.username}</span>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
