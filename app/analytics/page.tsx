"use client";

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-semibold">Fleet Analytics</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Total Vehicles" value="18" />
        <Card title="Trips Completed" value="126" />
        <Card title="Delayed Trips" value="9" />
        <Card title="Maintenance Cases" value="14" />
      </div>

      {/* Usage Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <UsageCard title="Vehicle Utilization" percent={72} />
        <UsageCard title="On-Time Delivery Rate" percent={88} />
      </div>
    </div>
  );
}

/* ---------- Small Reusable Components ---------- */

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function UsageCard({ title, percent }: { title: string; percent: number }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <p className="text-sm text-slate-600">{title}</p>

      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm font-medium text-slate-700">{percent}%</p>
    </div>
  );
}
