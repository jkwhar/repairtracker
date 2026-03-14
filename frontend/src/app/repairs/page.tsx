import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { RepairForm } from "@/components/repair/RepairForm";

export default function RepairsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">New Repair</h1>
          <RepairForm />
        </main>
      </div>
    </AuthGuard>
  );
}
