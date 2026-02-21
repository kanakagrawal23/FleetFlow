export interface Vehicle {
	id: number;
	name: string;
	type: string;
	capacity: number;
	status: "available" | "trip" | "maintenance" | "retired";
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
	status: "started" | "completed" | "cancelled";
	createdAt: Date;
	updatedAt: Date;
}

export interface Driver {
	id: string;
	licenseNum: string;
	licenseCategory: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Maintenance {
	id: number;
	vehicleId: number;
	issue: string;
	cost: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ServiceLog {
	id: number;
	type: "service" | "trip";
	tripId?: number;
	serviceId?: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Expense {
	id: number;
	tripId?: number;
	driverId: string;
	amount: number;
	type: "fuel" | "maintenance" | "other";
	date: Date;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DashboardKpi {
	totalVehicles: number;
	activeTrips: number;
	totalDrivers: number;
	maintenanceAlerts: number;
	totalExpenses: number;
	fuelCost: number;
	maintenanceCost: number;
}

export interface VehicleWithTrips extends Vehicle {
	trips?: Trip[];
}
