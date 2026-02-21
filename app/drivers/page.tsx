"use client";
import { Column, DataTable } from "@/components/table";
import { Circle, User } from "lucide-react";

interface DriverRecord {
  id: number;
  name: string;
  licenseType: "Truck" | "Van";
  phone: string;
  status: "Available" | "On Trip" | "Inactive";
}

export default function DriversPage() {
  const driverData: DriverRecord[] = [
    {
      id: 1,
      name: "Raj Mehta",
      licenseType: "Truck",
      phone: "9876543210",
      status: "Available",
    },
    {
      id: 2,
      name: "Amit Sharma",
      licenseType: "Van",
      phone: "9123456780",
      status: "On Trip",
    },
    {
      id: 3,
      name: "Suresh Patil",
      licenseType: "Truck",
      phone: "9988776655",
      status: "Inactive",
    },
  ];

  const columns: Column<DriverRecord>[] = [
    {
      header: "Driver",
      accessor: "name",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <span className="font-medium">{val}</span>
        </div>
      ),
    },
    { header: "License Type", accessor: "licenseType" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Status",
      accessor: "status",
      render: (val: DriverRecord["status"]) => {
        const colors: Record<DriverRecord["status"], string> = {
          Available: "bg-emerald-50 text-emerald-600 border-emerald-100",
          "On Trip": "bg-blue-50 text-blue-600 border-blue-100",
          Inactive: "bg-rose-50 text-rose-600 border-rose-100",
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
      <DataTable title="Driver Registry" data={driverData} columns={columns} />
    </div>
  );
}
