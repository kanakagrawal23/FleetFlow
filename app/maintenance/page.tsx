"use client";

import { useEffect, useState } from "react";
import { maintenanceApi, vehicleApi, type ServiceRecord, type Vehicle } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";

function MaintenancePage() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [formData, setFormData] = useState({ issue: "", cost: 0, vehicleId: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsData, vehiclesData] = await Promise.all([
        maintenanceApi.getAll(),
        vehicleApi.getAll(),
      ]);
      setRecords(recordsData);
      setVehicles(vehiclesData);
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
      if (editingRecord) {
        await maintenanceApi.update(editingRecord.id, { issue: formData.issue, cost: formData.cost });
      } else {
        await maintenanceApi.create({ issue: formData.issue, cost: formData.cost });
      }
      setShowForm(false);
      setEditingRecord(null);
      setFormData({ issue: "", cost: 0, vehicleId: 0 });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record");
    }
  };

  const handleEditClick = (record: ServiceRecord) => {
    setEditingRecord(record);
    setFormData({ issue: record.issue, cost: record.cost, vehicleId: record.vehicleId || 0 });
    setShowForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await maintenanceApi.delete(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintenance & Service Logs</h1>
        <Button onClick={() => { setShowForm(true); setEditingRecord(null); setFormData({ issue: "", cost: 0, vehicleId: 0 }); }}>
          <Plus className="mr-2 size-4" />
          Add Service Record
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{editingRecord ? "Edit Service Record" : "Add Service Record"}</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Issue Description</label>
                <input
                  type="text"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cost ($)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingRecord ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingRecord(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center text-muted-foreground">No service records found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{record.issue}</h3>
                </div>
                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  Service
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Cost:</span> ${record.cost}</div>
                <div><span className="font-medium">Date:</span> {new Date(record.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditClick(record)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteClick(record.id)}>
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

export default function Maintenance() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <MaintenancePage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
