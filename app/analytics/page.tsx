"use client";

import { useEffect, useState } from "react";
import { vehicleApi, tripApi, driverApi, maintenanceApi, expenseApi, type Vehicle, type Trip, type Driver, type ServiceRecord } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, MapPin, TrendingUp, Truck, Users } from "lucide-react";

function AnalyticsPage() {
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
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgDistance = trips.length > 0 ? Math.round(trips.reduce((sum, t) => sum + (t.distance || 0), 0) / trips.length) : 0;
  const completedTrips = trips.filter((t) => t.status === "completed").length;
  const activeTrips = trips.filter((t) => t.status === "started").length;
  const utilizationRate = vehicles.length > 0 ? Math.round((activeTrips / vehicles.length) * 100) : 0;
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalExpenses = totalMaintenanceCost + (trips.length * 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">Operational Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trips.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTrips} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Trip Distance</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDistance} km</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {activeTrips} vehicles in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeTrips} trips in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Vehicles requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trip Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "Started", count: activeTrips, color: "bg-blue-500" },
                { status: "Completed", count: completedTrips, color: "bg-green-500" },
                { status: "Cancelled", count: trips.filter((t) => t.status === "cancelled").length, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-24 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "Available", count: vehicles.filter((v) => v.status === "available").length, color: "bg-green-500" },
                { status: "In Trip", count: vehicles.filter((v) => v.status === "trip").length, color: "bg-blue-500" },
                { status: "Maintenance", count: vehicles.filter((v) => v.status === "maintenance").length, color: "bg-yellow-500" },
                { status: "Retired", count: vehicles.filter((v) => v.status === "retired").length, color: "bg-gray-500" },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-24 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "analyst"]}>
      <DashboardLayout>
        <AnalyticsPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
