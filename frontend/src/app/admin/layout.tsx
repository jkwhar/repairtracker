import { RoleGuard } from "@/components/layout/RoleGuard";
import { Header } from "@/components/layout/Header";
import Link from "next/link";

const adminLinks = [
  { href: "/admin/parts", label: "Parts" },
  { href: "/admin/outcomes", label: "Outcomes" },
  { href: "/admin/devices", label: "Devices" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/repairs", label: "Repairs" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <nav className="w-48 bg-white border-r border-gray-200 p-4 shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin</p>
            <ul className="space-y-1">
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
