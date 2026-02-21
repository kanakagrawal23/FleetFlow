"use client";

import { useEffect, useState } from "react";
import { expenseApi, driverApi, type Expense, type Driver } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2 } from "lucide-react";

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{ type: "maintenance" | "fuel" | "other"; amount: number; description: string }>({ type: "maintenance", amount: 0, description: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, driversData] = await Promise.all([
        expenseApi.getAll(),
        driverApi.getAll(),
      ]);
      setExpenses(expensesData);
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
      await expenseApi.create(formData);
      setShowForm(false);
      setFormData({ type: "maintenance", amount: 0, description: "" });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    }
  };

  const handleDeleteClick = async (id: number, type: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expenseApi.delete(id, type);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  const getDriverName = (id?: string) => {
    if (!id) return "N/A";
    return drivers.find((d) => d.id === id)?.name || drivers.find((d) => d.id === id)?.id || "Unknown";
  };

  const totalByType = expenses.reduce(
    (acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    },
    { fuel: 0, maintenance: 0, other: 0 } as Record<string, number>
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expense & Fuel Logging</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 size-4" />
          Log Expense
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Log New Expense</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                  <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "maintenance" | "fuel" | "other" })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="fuel">Fuel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount ($)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Fuel Cost</h3>
          <p className="mt-2 text-2xl font-bold">${totalByType.fuel}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Maintenance Cost</h3>
          <p className="mt-2 text-2xl font-bold">${totalByType.maintenance}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Other Expenses</h3>
          <p className="mt-2 text-2xl font-bold">${totalByType.other}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center text-muted-foreground">No expenses found</div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Driver</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b">
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        expense.type === "fuel" ? "bg-green-100 text-green-800" :
                        expense.type === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">${expense.amount}</td>
                    <td className="px-4 py-3">{getDriverName(expense.driverId)}</td>
                    <td className="px-4 py-3">{expense.description}</td>
                    <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => handleDeleteClick(expense.id, expense.type)}>
                        <Trash2 className="size-4" />
                      </Button>
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

export default function Expenses() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}>
      <DashboardLayout>
        <ExpensesPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
