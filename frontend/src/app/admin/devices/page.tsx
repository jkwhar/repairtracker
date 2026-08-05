import { CsvUploader } from "@/components/admin/CsvUploader";
import { DeviceList } from "@/components/admin/DeviceList";

export default function AdminDevicesPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Device Import</h2>
        <p className="text-sm text-gray-500">
          Upload a CSV with columns <code className="bg-gray-100 px-1 rounded">asset_tag</code> and{" "}
          <code className="bg-gray-100 px-1 rounded">dell_serial</code>.
        </p>
        <CsvUploader />
      </div>

      <DeviceList />
    </div>
  );
}
