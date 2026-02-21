import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trip, vehicle } from "@/lib/db/schema/trip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  console.log("[TRIPS API] GET request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[TRIPS API] Session:", session ? "authenticated" : "not authenticated");
    
    if (!session?.user) {
      console.log("[TRIPS API] Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      console.log("[TRIPS API] Fetching trip by id:", id);
      const result = await db.select().from(trip).where(eq(trip.id, parseInt(id)));
      if (result.length === 0) {
        console.log("[TRIPS API] Trip not found:", id);
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    }

    const result = await db.select().from(trip);
    console.log("[TRIPS API] Fetched all trips, count:", result.length);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[TRIPS API] Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[TRIPS API] POST request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      console.log("[TRIPS API] Unauthorized POST attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin" && session.user.role !== "dispatcher") {
      console.log("[TRIPS API] Forbidden:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("[TRIPS API] Request body:", body);
    
    const { origin, destination, distance, deadline, driverId, vehicleId, cargoWeight } = body;

    if (!origin || !destination || !distance || !deadline || !driverId || !vehicleId) {
      console.log("[TRIPS API] Missing required fields");
      return NextResponse.json({ error: "Missing required fields: origin, destination, distance, deadline, driverId, vehicleId" }, { status: 400 });
    }

    // Validate cargo weight against vehicle capacity
    const vehicleData = await db.select().from(vehicle).where(eq(vehicle.id, parseInt(vehicleId)));
    if (vehicleData.length === 0) {
      console.log("[TRIPS API] Vehicle not found:", vehicleId);
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const maxCapacity = vehicleData[0].capacity;
    if (cargoWeight && parseInt(cargoWeight) > maxCapacity) {
      console.log("[TRIPS API] Validation failed: cargoWeight > maxCapacity", { cargoWeight, maxCapacity });
      return NextResponse.json({ 
        error: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${maxCapacity}kg)`,
        code: "CARGO_EXCEEDS_CAPACITY",
        maxCapacity 
      }, { status: 400 });
    }

    // Check if vehicle is available
    if (vehicleData[0].status !== "available") {
      console.log("[TRIPS API] Vehicle not available:", vehicleData[0].status);
      return NextResponse.json({ 
        error: `Vehicle is not available. Current status: ${vehicleData[0].status}`,
        code: "VEHICLE_NOT_AVAILABLE"
      }, { status: 400 });
    }

    console.log("[TRIPS API] Creating trip with validation passed");
    const result = await db.insert(trip).values({
      origin,
      destination,
      distance: parseInt(distance),
      deadline: new Date(deadline),
      driverId,
      vehicleId: parseInt(vehicleId),
    }).returning();

    // Update vehicle status to "trip"
    await db.update(vehicle)
      .set({ status: "trip" })
      .where(eq(vehicle.id, parseInt(vehicleId)));

    console.log("[TRIPS API] Trip created and vehicle status updated to trip:", result[0]);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("[TRIPS API] Error creating trip:", error);
    return NextResponse.json({ error: "Failed to create trip", details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin" && session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { origin, destination, distance, deadline, driverId, vehicleId, finishDate } = body;

    const updateData: Record<string, unknown> = {};
    if (origin) updateData.origin = origin;
    if (destination) updateData.destination = destination;
    if (distance) updateData.distance = parseInt(distance);
    if (deadline) updateData.deadline = new Date(deadline);
    if (driverId) updateData.driverId = driverId;
    if (vehicleId) updateData.vehicleId = parseInt(vehicleId);
    if (finishDate) updateData.finishDate = new Date(finishDate);

    const result = await db.update(trip)
      .set(updateData)
      .where(eq(trip.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin" && session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
    }

    const result = await db.delete(trip).where(eq(trip.id, parseInt(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
