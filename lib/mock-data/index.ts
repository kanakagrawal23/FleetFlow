import type { Vehicle, Trip, Driver, Maintenance, ServiceLog, Expense, DashboardKpi } from "../types/index";

export const mockVehicles: Vehicle[] = [
	{
		id: 1,
		name: "Ford Transit",
		type: "Van",
		capacity: 1500,
		status: "available",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: 2,
		name: "Mercedes Sprinter",
		type: "Van",
		capacity: 2000,
		status: "trip",
		createdAt: new Date("2024-01-05"),
		updatedAt: new Date("2024-01-20"),
	},
	{
		id: 3,
		name: "Citroen Berlingo",
		type: "Van",
		capacity: 800,
		status: "maintenance",
		createdAt: new Date("2024-01-10"),
		updatedAt: new Date("2024-01-18"),
	},
	{
		id: 4,
		name: "Renault Trafic",
		type: "Van",
		capacity: 1200,
		status: "available",
		createdAt: new Date("2024-01-12"),
		updatedAt: new Date("2024-01-22"),
	},
	{
		id: 5,
		name: "Volkswagen Transporter",
		type: "Van",
		capacity: 1000,
		status: "available",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-01-25"),
	},
];

export const mockTrips: Trip[] = [
	{
		id: 1,
		origin: "London",
		destination: "Manchester",
		distance: 200,
		deadline: new Date("2024-02-01T10:00:00"),
		driverId: "driver1",
		vehicleId: 2,
		status: "started",
		createdAt: new Date("2024-01-28"),
		updatedAt: new Date("2024-01-29"),
	},
	{
		id: 2,
		origin: "Birmingham",
		destination: "Leeds",
		distance: 150,
		deadline: new Date("2024-02-02T14:00:00"),
		driverId: "driver2",
		vehicleId: 1,
		status: "completed",
		finishDate: new Date("2024-01-30T15:30:00"),
		createdAt: new Date("2024-01-29"),
		updatedAt: new Date("2024-01-30"),
	},
	{
		id: 3,
		origin: "Bristol",
		destination: "Oxford",
		distance: 80,
		deadline: new Date("2024-02-03T09:00:00"),
		driverId: "driver1",
		vehicleId: 4,
		status: "started",
		createdAt: new Date("2024-01-30"),
		updatedAt: new Date("2024-01-31"),
	},
];

export const mockDrivers: Driver[] = [
	{
		id: "driver1",
		licenseNum: "LIC123456",
		licenseCategory: "B",
		expiresAt: new Date("2026-12-31"),
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "driver2",
		licenseNum: "LIC789012",
		licenseCategory: "B",
		expiresAt: new Date("2025-08-20"),
		createdAt: new Date("2024-01-05"),
		updatedAt: new Date("2024-01-18"),
	},
	{
		id: "driver3",
		licenseNum: "LIC345678",
		licenseCategory: "C",
		expiresAt: new Date("2027-03-15"),
		createdAt: new Date("2024-01-10"),
		updatedAt: new Date("2024-01-22"),
	},
];

export const mockMaintenance: Maintenance[] = [
	{
		id: 1,
		vehicleId: 3,
		issue: "Brake pad replacement",
		cost: 250,
		createdAt: new Date("2024-01-18"),
		updatedAt: new Date("2024-01-18"),
	},
	{
		id: 2,
		vehicleId: 1,
		issue: "Oil change and filter replacement",
		cost: 120,
		createdAt: new Date("2024-01-20"),
		updatedAt: new Date("2024-01-20"),
	},
	{
		id: 3,
		vehicleId: 2,
		issue: "Tire rotation and alignment",
		cost: 80,
		createdAt: new Date("2024-01-22"),
		updatedAt: new Date("2024-01-22"),
	},
];

export const mockServiceLogs: ServiceLog[] = [
	{
		id: 1,
		type: "trip",
		tripId: 1,
		createdAt: new Date("2024-01-29"),
		updatedAt: new Date("2024-01-29"),
	},
	{
		id: 2,
		type: "service",
		serviceId: 1,
		createdAt: new Date("2024-01-18"),
		updatedAt: new Date("2024-01-18"),
	},
];

export const mockExpenses: Expense[] = [
	{
		id: 1,
		tripId: 1,
		driverId: "driver1",
		amount: 85,
		type: "fuel",
		date: new Date("2024-01-29"),
		description: "Fuel for London to Manchester trip",
		createdAt: new Date("2024-01-29"),
		updatedAt: new Date("2024-01-29"),
	},
	{
		id: 2,
		driverId: "driver1",
		amount: 250,
		type: "maintenance",
		date: new Date("2024-01-18"),
		description: "Brake pad replacement for Citroen Berlingo",
		createdAt: new Date("2024-01-18"),
		updatedAt: new Date("2024-01-18"),
	},
	{
		id: 3,
		tripId: 2,
		driverId: "driver2",
		amount: 45,
		type: "fuel",
		date: new Date("2024-01-30"),
		description: "Fuel for Birmingham to Leeds trip",
		createdAt: new Date("2024-01-30"),
		updatedAt: new Date("2024-01-30"),
	},
];

export const mockDashboardKpi: DashboardKpi = {
	totalVehicles: 5,
	activeTrips: 2,
	totalDrivers: 3,
	maintenanceAlerts: 1,
	totalExpenses: 380,
	fuelCost: 130,
	maintenanceCost: 250,
};
