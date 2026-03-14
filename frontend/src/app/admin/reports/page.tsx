"use client";

import { useState, useEffect } from "react";
import { searchRepairs } from "@/lib/api/repairs";
import type { Repair } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    return { ...acc, [k]: [...(acc[k] ?? []), item] };
  }, {} as Record<string, T[]>);
}

export default function ReportsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch up to 2000 repairs for client-side aggregation
    searchRepairs({}, 1, 2000).then((r) => {
      setRepairs(r.items);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading reports…</div>;
  }

  // Repairs per week
  const byWeek = groupBy(repairs, (r) => {
    const d = new Date(r.created);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    return startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const weekData = Object.entries(byWeek)
    .map(([week, items]) => ({ week, count: items.length }))
    .slice(-12);

  // Repairs by tech
  const byTech = groupBy(repairs, (r) => r.expand?.tech?.username ?? "Unknown");
  const techData = Object.entries(byTech)
    .map(([tech, items]) => ({ tech, count: items.length }))
    .sort((a, b) => b.count - a.count);

  // Parts usage
  const partCounts: Record<string, number> = {};
  for (const repair of repairs) {
    for (const part of repair.expand?.parts_used ?? []) {
      partCounts[part.name] = (partCounts[part.name] ?? 0) + 1;
    }
  }
  const partsData = Object.entries(partCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Outcome distribution
  const byOutcome = groupBy(repairs, (r) => r.expand?.outcome?.name ?? "Unknown");
  const outcomeData = Object.entries(byOutcome).map(([name, items]) => ({ name, value: items.length }));

  return (
    <div className="space-y-8 max-w-4xl">
      <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
      <p className="text-sm text-gray-500 -mt-4">Based on {repairs.length} total repairs</p>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Repairs per Week (last 12 weeks)</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Repairs by Tech</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={techData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="tech" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 10 Parts Used</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={partsData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Outcome Distribution</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-center">
          <PieChart width={300} height={200}>
            <Pie data={outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {outcomeData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </section>
    </div>
  );
}
