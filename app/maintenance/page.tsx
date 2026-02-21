"use client";
import { Column, DataTable } from "@/components/table";
import { Wrench, Circle } from "lucide-react";

interface MaintenanceRecord {
  id: number;
  vehicleId: string;
  issue: string;
  date: string;
  status: "Pending" | "In Progress" | "Completed";
}

export default function MaintenancePage() {
  const maintenanceData: MaintenanceRecord[] = [
    {
      id: 1,
      vehicleId: "TRK-21",
      issue: "Engine Inspection",
      date: "12 Feb 2026",
      status: "Pending",
    },
    {
      id: 2,
      vehicleId: "VAN-05",
      issue: "Brake Repair",
      date: "15 Feb 2026",
      status: "In Progress",
    },
    {
      id: 3,
      vehicleId: "VAN-12",
      issue: "Oil Change",
      date: "05 Feb 2026",
      status: "Completed",
    },
  ];

  const columns: Column<MaintenanceRecord>[] = [
    {
      header: "Vehicle",
      accessor: "vehicleId",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-600" />
          <span>{val}</span>
        </div>
      ),
    },
    { header: "Issue", accessor: "issue" },
    { header: "Date", accessor: "date" },
    {
      header: "Status",
      accessor: "status",
      render: (val: MaintenanceRecord["status"]) => {
        const colors: Record<MaintenanceRecord["status"], string> = {
          Pending: "bg-amber-50 text-amber-600 border-amber-100",
          "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
          Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
        };

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full border ${colors[val]}`}
          >
            <Circle className="w-2 h-2 inline-block mr-1 fill-current" />
            {val}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <DataTable
        title="Maintenance Logs"
        data={maintenanceData}
        columns={columns}
      />
    </div>
  );
}
