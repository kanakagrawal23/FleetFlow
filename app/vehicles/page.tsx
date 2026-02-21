"use client";

import { useEffect, useState } from "react";
import { vehicleApi, type Vehicle } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<{ name: string; type: string; capacity: number; status: "available" | "trip" | "maintenance" | "retired"; plate: string }>({ name: "", type: "", capacity: 0, status: "available", plate: "" });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.getAll();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, capacity: Number(formData.capacity) };
      if (editingVehicle) {
        await vehicleApi.update(editingVehicle.id, submitData);
      } else {
        await vehicleApi.create(submitData);
      }
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({ name: "", type: "", capacity: 0, status: "available", plate: "" });
      fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle");
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status,
      plate: (vehicle as any).plate || "",
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehicleApi.delete(id);
      fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vehicle");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "trip": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "retired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicle Registry</h1>
        <Button onClick={() => { setShowForm(true); setEditingVehicle(null); setFormData({ name: "", type: "", capacity: 0, status: "available", plate: "" }); }}>
          <Plus className="mr-2 size-4" />
          Add Vehicle
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Plate</label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Capacity (kg)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "trip" | "maintenance" | "retired" })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="trip">In Trip</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingVehicle ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingVehicle(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center text-muted-foreground">No vehicles found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Capacity:</span> {vehicle.capacity} kg</div>
                <div><span className="font-medium">Created:</span> {new Date(vehicle.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditClick(vehicle)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteClick(vehicle.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Vehicles() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <VehiclesPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
