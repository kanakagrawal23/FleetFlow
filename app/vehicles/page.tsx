"use client";
import { Column, DataTable } from "@/components/table";
import { Calendar, Circle, Download, Truck, User } from "lucide-react";

interface VehicleRecord {
  id: number;
  vehicleId: string;
  model: string;
  capacity: number;
  odometer: number;
  status: "Available" | "On Trip" | "In Shop";
}

export default function VehiclesPage() {
  const vehicleData: VehicleRecord[] = [
    {
      id: 1,
      vehicleId: "VAN-05",
      model: "Ford Transit",
      capacity: 500,
      odometer: 12000,
      status: "Available",
    },
    {
      id: 2,
      vehicleId: "TRK-21",
      model: "Volvo FH16",
      capacity: 2500,
      odometer: 45800,
      status: "On Trip",
    },
    {
      id: 3,
      vehicleId: "VAN-12",
      model: "Mercedes Sprinter",
      capacity: 800,
      odometer: 31000,
      status: "In Shop",
    },
  ];

  const columns: Column<VehicleRecord>[] = [
    {
      header: "Vehicle ID",
      accessor: "vehicleId",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <span className="font-medium text-slate-900">{val}</span>
        </div>
      ),
    },
    { header: "Model", accessor: "model" },
    { header: "Max Capacity (kg)", accessor: "capacity" },
    { header: "Odometer (km)", accessor: "odometer" },
    {
      header: "Status",
      accessor: "status",
      render: (val: VehicleRecord["status"]) => {
        const colors: Record<VehicleRecord["status"], string> = {
          Available: "bg-emerald-50 text-emerald-600 border-emerald-100",
          "On Trip": "bg-blue-50 text-blue-600 border-blue-100",
          "In Shop": "bg-rose-50 text-rose-600 border-rose-100",
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[val]}`}
          >
            <Circle className="w-2 h-2 inline-block mr-1.5 fill-current" />
            {val}
          </span>
        );
      },
    },
  ];
  return (
    <div className="p-8">
      <DataTable
        title="Vehicle Registry"
        data={vehicleData}
        columns={columns}
      />
    </div>
  );
}
