"use client";

import { useEffect, useState } from "react";
import { driverApi, tripApi, type Driver, type Trip } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Plus } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<{ status: "available" | "break" | "trip"; licenseCategory: string; licenseNum: string }>({ status: "available", licenseCategory: "", licenseNum: "" });
  const [newDriverData, setNewDriverData] = useState({ name: "", email: "", password: "", licenseNum: "", licenseCategory: "", expiresAt: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversData, tripsData] = await Promise.all([
        driverApi.getAll(),
        tripApi.getAll(),
      ]);
      setDrivers(driversData);
      setTrips(tripsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    try {
      await driverApi.update(editingDriver.id, formData);
      setEditingDriver(null);
      setFormData({ status: "available", licenseCategory: "", licenseNum: "" });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update driver");
    }
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      status: driver.status || "available",
      licenseCategory: driver.licenseCategory || "",
      licenseNum: driver.licenseNum || "",
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await driverApi.create(newDriverData);
      setShowForm(false);
      setIsCreating(false);
      setNewDriverData({ name: "", email: "", password: "", licenseNum: "", licenseCategory: "", expiresAt: "" });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create driver");
      setIsCreating(false);
    }
  };

  const getDriverStats = (driverId: string) => {
    const driverTrips = trips.filter((t) => t.driverId === driverId);
    const completedTrips = driverTrips.filter((t) => t.status === "completed").length;
    const activeTrips = driverTrips.filter((t) => t.status === "started").length;
    const totalDistance = driverTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
    return { completedTrips, activeTrips, totalDistance };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "trip": return "bg-blue-100 text-blue-800";
      case "break": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 size-4" />
          Add Driver
        </Button>
      </div>

      {showForm && !editingDriver && (
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Create New Driver</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  required
                  value={newDriverData.name}
                  onChange={(e) => setNewDriverData({ ...newDriverData, name: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={newDriverData.email}
                  onChange={(e) => setNewDriverData({ ...newDriverData, email: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newDriverData.password}
                  onChange={(e) => setNewDriverData({ ...newDriverData, password: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Number</label>
                <input
                  type="text"
                  required
                  value={newDriverData.licenseNum}
                  onChange={(e) => setNewDriverData({ ...newDriverData, licenseNum: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CDL-A, CDL-B"
                  value={newDriverData.licenseCategory}
                  onChange={(e) => setNewDriverData({ ...newDriverData, licenseCategory: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newDriverData.expiresAt}
                  onChange={(e) => setNewDriverData({ ...newDriverData, expiresAt: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create Driver
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setNewDriverData({ name: "", email: "", password: "", licenseNum: "", licenseCategory: "", expiresAt: "" }); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {showForm && editingDriver && (
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Edit Driver</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNum}
                  onChange={(e) => setFormData({ ...formData, licenseNum: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Category</label>
                <input
                  type="text"
                  value={formData.licenseCategory}
                  onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "break" | "trip" })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="break">On Break</option>
                  <option value="trip">On Trip</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Update</Button>
              <Button type="button" variant="outline" onClick={() => { setEditingDriver(null); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg mb-2">No drivers found</p>
          <p className="text-sm">Click "Add Driver" to create a new driver with login credentials.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver) => {
            const stats = getDriverStats(driver.id);
            return (
              <div key={driver.id} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{driver.name || driver.id}</h3>
                  <p className="text-sm text-muted-foreground">License: {driver.licenseNum || "Not set"}</p>
                  <span className={`inline-flex mt-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(driver.status || "available")}`}>
                    {driver.status || "available"}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Category:</span> {driver.licenseCategory || "Not set"}</div>
                  <div><span className="font-medium">Expires:</span> {driver.expiresAt ? new Date(driver.expiresAt).toLocaleDateString() : "Not set"}</div>
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-2 font-medium">Performance</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-muted p-2 text-center">
                        <div className="text-lg font-bold">{stats.completedTrips}</div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                      <div className="rounded-lg bg-muted p-2 text-center">
                        <div className="text-lg font-bold">{stats.activeTrips}</div>
                        <div className="text-muted-foreground">Active</div>
                      </div>
                      <div className="rounded-lg bg-muted p-2 text-center">
                        <div className="text-lg font-bold">{stats.totalDistance}</div>
                        <div className="text-muted-foreground">km Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" onClick={() => { setShowForm(true); handleEditClick(driver); }}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Drivers() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <DriversPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
