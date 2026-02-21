const API_BASE = "/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log(`[API] ${options?.method || "GET"} ${endpoint}`);
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  console.log(`[API] Response status:`, response.status);

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
      console.error(`[API] Error response:`, errorData);
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log(`[API] Success:`, endpoint);
  return data;
}

export interface Vehicle {
  id: number;
  name: string;
  type: string;
  capacity: number;
  status: "available" | "trip" | "maintenance" | "retired";
  plate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  id: number;
  origin: string;
  destination: string;
  distance: number;
  deadline: Date;
  finishDate?: Date;
  driverId: string;
  vehicleId: number;
  status?: "started" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  licenseNum: string;
  licenseCategory: string;
  status: "available" | "break" | "trip";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  email?: string;
}

export interface ServiceRecord {
  id: number;
  vehicleId?: number;
  issue: string;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: number;
  type: "fuel" | "maintenance" | "other";
  amount: number;
  description: string;
  date: Date;
  tripId?: number;
  driverId?: string;
}

export const vehicleApi = {
  getAll: () => fetchApi<Vehicle[]>("/vehicles"),
  getById: (id: number) => fetchApi<Vehicle>(`/vehicles?id=${id}`),
  create: (data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Vehicle>) =>
    fetchApi<Vehicle>(`/vehicles?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi<void>(`/vehicles?id=${id}`, { method: "DELETE" }),
};

export const tripApi = {
  getAll: () => fetchApi<Trip[]>("/trips"),
  getById: (id: number) => fetchApi<Trip>(`/trips?id=${id}`),
  create: (data: Omit<Trip, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<Trip>("/trips", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Trip>) =>
    fetchApi<Trip>(`/trips?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi<void>(`/trips?id=${id}`, { method: "DELETE" }),
};

export const driverApi = {
  getAll: () => fetchApi<Driver[]>("/drivers"),
  getById: (id: string) => fetchApi<Driver>(`/drivers?id=${id}`),
  getUsersWithoutDrivers: () => fetchApi<{ id: string; name: string; email: string; role: string }[]>("/drivers/users"),
  create: (data: { userId: string; licenseNum: string; licenseCategory: string; expiresAt: string }) =>
    fetchApi<{ user: Driver; driver: Driver }>("/drivers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Driver>) =>
    fetchApi<Driver>(`/drivers?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/drivers?id=${id}`, { method: "DELETE" }),
};

export const maintenanceApi = {
  getAll: () => fetchApi<ServiceRecord[]>("/maintenance"),
  getById: (id: number) => fetchApi<ServiceRecord>(`/maintenance?id=${id}`),
  create: (data: Omit<ServiceRecord, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<ServiceRecord>("/maintenance", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ServiceRecord>) =>
    fetchApi<ServiceRecord>(`/maintenance?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi<void>(`/maintenance?id=${id}`, { method: "DELETE" }),
};

export const expenseApi = {
  getAll: (type?: string) => fetchApi<Expense[]>(`/expenses${type ? `?type=${type}` : ""}`),
  create: (data: Omit<Expense, "id" | "date">) =>
    fetchApi<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number, type: string) => fetchApi<void>(`/expenses?id=${id}&type=${type}`, { method: "DELETE" }),
};
