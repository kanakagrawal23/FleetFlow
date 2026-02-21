"use client";
import { Column, DataTable } from "@/components/table";
import { Calendar, Circle, Download, Truck, User } from "lucide-react";

interface TripRecord {
  id: number;
  vehicle: string;
  driver: string;
  destination: string;
  weight: string;
  status: "In Transit" | "Completed" | "Pending" | "Delayed";
  date: string;
}

export default function TripsPage() {
  const tripData: TripRecord[] = [
    {
      id: 1,
      vehicle: "TRK-9021",
      driver: "Michael Chen",
      destination: "Los Angeles, CA",
      weight: "2,500 kg",
      status: "In Transit",
      date: "Oct 24, 2023",
    },
    {
      id: 2,
      vehicle: "TRK-4432",
      driver: "Sarah Jenkins",
      destination: "Seattle, WA",
      weight: "1,200 kg",
      status: "Completed",
      date: "Oct 23, 2023",
    },
    {
      id: 3,
      vehicle: "VAN-1109",
      driver: "David Rodriguez",
      destination: "Phoenix, AZ",
      weight: "450 kg",
      status: "Pending",
      date: "Oct 25, 2023",
    },
    {
      id: 4,
      vehicle: "TRK-8812",
      driver: "Emma Watson",
      destination: "Denver, CO",
      weight: "3,100 kg",
      status: "Delayed",
      date: "Oct 24, 2023",
    },
  ];

  const columns: Column<TripRecord>[] = [
    {
      header: "Vehicle",
      accessor: "vehicle",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <span className="font-medium text-slate-900">{val}</span>
        </div>
      ),
    },
    {
      header: "Driver",
      accessor: "driver",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            <User className="w-3 h-3 text-slate-500" />
          </div>
          <span>{val}</span>
        </div>
      ),
    },
    { header: "Destination", accessor: "destination" },
    {
      header: "Status",
      accessor: "status",
      render: (val: TripRecord["status"]) => {
        const colors: Record<TripRecord["status"], string> = {
          "In Transit": "bg-blue-50 text-blue-600 border-blue-100",
          Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
          Pending: "bg-amber-50 text-amber-600 border-amber-100",
          Delayed: "bg-rose-50 text-rose-600 border-rose-100",
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[val] || "bg-slate-50"}`}
          >
            <Circle className="w-2 h-2 inline-block mr-1.5 fill-current" />
            {val}
          </span>
        );
      },
    },
    {
      header: "Dispatch Date",
      accessor: "date",
      render: (val: string) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{val}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation / Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <span>Fleet Management</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Trip History</span>
        </nav>

        <DataTable
          title="Active Trip Logs"
          data={tripData}
          columns={columns}
          onAddClick={() => console.log("New trip button clicked")}
        />

        {/* Action Bar */}
        <div className="flex justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 shadow-sm hover:shadow-none">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
