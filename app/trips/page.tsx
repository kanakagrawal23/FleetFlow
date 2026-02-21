"use client";

import { useEffect, useState } from "react";
import { tripApi, vehicleApi, driverApi, type Trip, type Vehicle, type Driver } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";

function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<{
    origin: string;
    destination: string;
    distance: number;
    deadline: string;
    driverId: string;
    vehicleId: number;
    cargoWeight: number;
  }>({
    origin: "",
    destination: "",
    distance: 0,
    deadline: "",
    driverId: "",
    vehicleId: 0,
    cargoWeight: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        tripApi.getAll(),
        vehicleApi.getAll(),
        driverApi.getAll(),
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, deadline: new Date(formData.deadline) };
      if (editingTrip) {
        await tripApi.update(editingTrip.id, submitData);
      } else {
        await tripApi.create({ ...submitData, status: "started" });
      }
      setShowForm(false);
      setEditingTrip(null);
      setFormData({ origin: "", destination: "", distance: 0, deadline: "", driverId: "", vehicleId: 0, cargoWeight: 0 });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trip");
    }
  };

  const handleEditClick = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      deadline: new Date(trip.deadline).toISOString().split("T")[0],
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      cargoWeight: 0,
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await tripApi.delete(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip");
    }
  };

  const getVehicleName = (id: number) => vehicles.find((v) => v.id === id)?.name || `Vehicle #${id}`;
  const getDriverName = (id: string) => drivers.find((d) => d.id === id)?.name || drivers.find((d) => d.id === id)?.id || `Driver #${id}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "started": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trip Dispatcher</h1>
        <Button onClick={() => { setShowForm(true); setEditingTrip(null); setFormData({ origin: "", destination: "", distance: 0, deadline: "", driverId: "", vehicleId: 0, cargoWeight: 0 }); }}>
          <Plus className="mr-2 size-4" />
          Create Trip
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{editingTrip ? "Edit Trip" : "Create New Trip"}</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Distance (km)</label>
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name || driver.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value={0}>Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.name} ({vehicle.capacity}kg)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Cargo Weight (kg)</label>
                <input
                  type="number"
                  value={formData.cargoWeight}
                  onChange={(e) => setFormData({ ...formData, cargoWeight: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Max capacity: {formData.vehicleId ? vehicles.find(v => v.id === formData.vehicleId)?.capacity || 0 : 0}kg
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingTrip ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTrip(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center text-muted-foreground">No trips found</div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Origin</th>
                  <th className="px-4 py-3 text-left font-medium">Destination</th>
                  <th className="px-4 py-3 text-left font-medium">Distance</th>
                  <th className="px-4 py-3 text-left font-medium">Driver</th>
                  <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Deadline</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{trip.id}</td>
                    <td className="px-4 py-3">{trip.origin}</td>
                    <td className="px-4 py-3">{trip.destination}</td>
                    <td className="px-4 py-3">{trip.distance} km</td>
                    <td className="px-4 py-3">{getDriverName(trip.driverId)}</td>
                    <td className="px-4 py-3">{getVehicleName(trip.vehicleId)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(trip.status || "started")}`}>
                        {trip.status || "started"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(trip.deadline).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(trip)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteClick(trip.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Trips() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "dispatcher"]}>
      <DashboardLayout>
        <TripsPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
