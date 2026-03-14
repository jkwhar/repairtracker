"use client";

import { useRepairsForDevice } from "@/hooks/useRepairs";
import getPocketBase from "@/lib/pocketbase";
import type { Repair } from "@/lib/types";

interface Props {
  deviceId: string;
}

function RepairCard({ repair }: { repair: Repair }) {
  const pb = getPocketBase();
  const tech = repair.expand?.tech?.username ?? "Unknown";
  const outcome = repair.expand?.outcome?.name ?? "—";
  const parts = repair.expand?.parts_used?.map((p) => p.name) ?? [];
  const date = new Date(repair.created).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white text-sm space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{date}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            outcome === "Unrepairable"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {outcome}
        </span>
      </div>
      <div className="text-gray-500">Tech: {tech}</div>
      {parts.length > 0 && (
        <div className="text-gray-600 text-xs">{parts.join(", ")}</div>
      )}
      {repair.notes && (
        <div className="text-gray-500 text-xs italic">{repair.notes}</div>
      )}
      {repair.photos?.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1">
          {repair.photos.map((photo) => (
            <a
              key={photo}
              href={pb.files.getURL(repair, photo)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pb.files.getURL(repair, photo, { thumb: "400x0" })}
                alt="repair photo"
                className="w-12 h-12 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function RepairHistory({ deviceId }: Props) {
  const { repairs, isLoading } = useRepairsForDevice(deviceId);

  if (isLoading) {
    return <div className="text-sm text-gray-400 py-4 text-center">Loading history…</div>;
  }

  if (repairs.length === 0) {
    return <div className="text-sm text-gray-400 py-4 text-center">No prior repairs</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">
        Repair History ({repairs.length})
      </h3>
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        {repairs.map((repair) => (
          <RepairCard key={repair.id} repair={repair} />
        ))}
      </div>
    </div>
  );
}
