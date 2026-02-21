import { desc, eq } from "drizzle-orm";
import { db } from "../index";
import {
  driver,
  log,
  service,
  trip,
  user,
  vehicle,
} from "../schema";

// --- 1. Bulk listing logs (join with service, trip, driver, vehicle) ---

export type LogRow = {
  logId: number;
  logType: "service" | "trip";
  logCreatedAt: Date;
  // service (when type = service)
  serviceId: number | null;
  serviceCost: number | null;
  serviceIssue: string | null;
  // trip (when type = trip)
  tripId: number | null;
  tripOrigin: string | null;
  tripDestination: string | null;
  tripDistance: number | null;
  tripDeadline: Date | null;
  tripFinishDate: Date | null;
  // driver (when type = trip)
  driverId: string | null;
  driverName: string | null;
  driverStatus: string | null;
  // vehicle (when type = trip)
  vehicleId: number | null;
  vehicleName: string | null;
  vehicleStatus: string | null;
};

export async function listLogsBulk(opts?: {
  limit?: number;
  offset?: number;
}): Promise<LogRow[]> {
  const limit = opts?.limit ?? 10;
  const offset = opts?.offset ?? 0;

  const rows = await db
    .select({
      logId: log.id,
      logType: log.type,
      logCreatedAt: log.createdAt,
      serviceId: service.id,
      serviceCost: service.cost,
      serviceIssue: service.issue,
      tripId: trip.id,
      tripOrigin: trip.origin,
      tripDestination: trip.destination,
      tripDistance: trip.distance,
      tripDeadline: trip.deadline,
      tripFinishDate: trip.finishDate,
      driverId: driver.id,
      driverName: user.name,
      driverStatus: driver.status,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleStatus: vehicle.status,
    })
    .from(log)
    .leftJoin(service, eq(log.serviceId, service.id))
    .leftJoin(trip, eq(log.tripId, trip.id))
    .leftJoin(driver, eq(trip.driverId, driver.id))
    .leftJoin(user, eq(driver.id, user.id))
    .leftJoin(vehicle, eq(trip.vehicleId, vehicle.id))
    .orderBy(desc(log.createdAt))
    .limit(limit)
    .offset(offset);

  return rows as LogRow[];
}

// --- 2. Assign available driver to available vehicle for a trip ---

export type AssignTripInput = {
  driverId: string;
  vehicleId: number;
  origin: string;
  destination: string;
  distance: number;
  deadline: Date;
};

export type AssignTripResult =
  | { ok: true; tripId: number }
  | { ok: false; error: string };

export async function assignDriverToTrip(
  input: AssignTripInput
): Promise<AssignTripResult> {
  const { driverId, vehicleId, origin, destination, distance, deadline } =
    input;

  const [driverRow] = await db
    .select()
    .from(driver)
    .where(eq(driver.id, driverId))
    .limit(1);

  if (!driverRow) {
    return { ok: false, error: "Driver not found" };
  }
  if (driverRow.status !== "available") {
    return { ok: false, error: "Driver is not available" };
  }

  const [vehicleRow] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId))
    .limit(1);

  if (!vehicleRow) {
    return { ok: false, error: "Vehicle not found" };
  }
  if (vehicleRow.status !== "available") {
    return { ok: false, error: "Vehicle is not available" };
  }

  const [inserted] = await db
    .insert(trip)
    .values({
      origin,
      destination,
      distance,
      deadline,
      driverId,
      vehicleId,
    })
    .returning({ id: trip.id });

  if (!inserted) {
    return { ok: false, error: "Failed to create trip" };
  }

  await db.update(driver).set({ status: "trip" }).where(eq(driver.id, driverId));
  await db
    .update(vehicle)
    .set({ status: "trip" })
    .where(eq(vehicle.id, vehicleId));

  await db.insert(log).values({
    type: "trip",
    tripId: inserted.id,
  });

  return { ok: true, tripId: inserted.id };
}

// --- 3. Add vehicle for maintenance ---

export type AddMaintenanceInput = {
  vehicleId: number;
  issue: string;
  cost: number;
};

export type AddMaintenanceResult =
  | { ok: true; serviceId: number }
  | { ok: false; error: string };

export async function addVehicleForMaintenance(
  input: AddMaintenanceInput
): Promise<AddMaintenanceResult> {
  const { vehicleId, issue, cost } = input;

  const [vehicleRow] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId))
    .limit(1);

  if (!vehicleRow) {
    return { ok: false, error: "Vehicle not found" };
  }

  const [serviceRow] = await db
    .insert(service)
    .values({ vehicleId, issue, cost })
    .returning({ id: service.id });

  if (!serviceRow) {
    return { ok: false, error: "Failed to create service record" };
  }

  await db.insert(log).values({
    type: "service",
    serviceId: serviceRow.id,
  });

  await db
    .update(vehicle)
    .set({ status: "maintenance" })
    .where(eq(vehicle.id, vehicleId));

  return { ok: true, serviceId: serviceRow.id };
}

// --- 4. Bulk list vehicles in maintenance and their costs ---

export type VehicleInMaintenanceRow = {
  vehicleId: number;
  vehicleName: string;
  vehicleType: string;
  vehicleCapacity: number;
  totalCost: number;
  services: { id: number; issue: string; cost: number; createdAt: Date }[];
};

export async function listVehiclesInMaintenanceWithCosts(limit: number = 10, offset: number = 0): Promise<
  typeof service.$inferSelect[]
> {

    const servicesForVehicle = await db
      .select()
      .from(service)
      .orderBy(desc(service.createdAt))
      .limit(limit)
      .offset(offset);
  return servicesForVehicle;
}
