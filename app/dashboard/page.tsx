"use client";

import { useEffect, useState } from "react";
import { vehicleApi, tripApi, driverApi, maintenanceApi, type Vehicle, type Trip, type Driver, type ServiceRecord } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import KpiCard from "@/components/cards/kpi-card";
import { Truck, Map, Users, Wrench, DollarSign, Activity } from "lucide-react";

function DashboardContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [maintenance, setMaintenance] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, tripsData, driversData, maintenanceData] = await Promise.all([
          vehicleApi.getAll(),
          tripApi.getAll(),
          driverApi.getAll(),
          maintenanceApi.getAll(),
        ]);
        setVehicles(vehiclesData);
        setTrips(tripsData);
        setDrivers(driversData);
        setMaintenance(maintenanceData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeTrips = trips.filter((t) => t.status === "started").length;
  const totalExpenses = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0) + (trips.length * 50);
  const fuelCost = trips.length * 50;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Vehicles" value={vehicles.length} icon={Truck} />
        <KpiCard title="Active Trips" value={activeTrips} icon={Map} />
        <KpiCard title="Total Drivers" value={drivers.length} icon={Users} />
        <KpiCard title="Maintenance Alerts" value={maintenance.length} icon={Wrench} />
        <KpiCard title="Total Expenses" value={`$${totalExpenses}`} icon={DollarSign} />
        <KpiCard title="Fuel Cost" value={`$${fuelCost}`} icon={Activity} />
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Fleet Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Capacity</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Active Trips</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{vehicle.name}</td>
                  <td className="px-4 py-3">{vehicle.type}</td>
                  <td className="px-4 py-3">{vehicle.capacity} kg</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        vehicle.status === "available"
                          ? "bg-green-100 text-green-800"
                          : vehicle.status === "trip"
                            ? "bg-blue-100 text-blue-800"
                            : vehicle.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {trips.filter((t) => t.vehicleId === vehicle.id && t.status === "started").length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
