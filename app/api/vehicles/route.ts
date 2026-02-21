import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vehicle } from "@/lib/db/schema/trip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  console.log("[VEHICLES API] GET request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[VEHICLES API] Session:", session ? "authenticated" : "not authenticated");
    
    if (!session?.user) {
      console.log("[VEHICLES API] Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      console.log("[VEHICLES API] Fetching vehicle by id:", id);
      const result = await db.select().from(vehicle).where(eq(vehicle.id, parseInt(id)));
      if (result.length === 0) {
        console.log("[VEHICLES API] Vehicle not found:", id);
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
      }
      console.log("[VEHICLES API] Vehicle found:", result[0].name);
      return NextResponse.json(result[0]);
    }

    const result = await db.select().from(vehicle);
    console.log("[VEHICLES API] Fetched all vehicles, count:", result.length);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[VEHICLES API] Error fetching vehicles:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[VEHICLES API] POST request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      console.log("[VEHICLES API] Unauthorized POST attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin") {
      console.log("[VEHICLES API] Forbidden:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("[VEHICLES API] Request body:", body);
    
    const { name, type, capacity, status, plate } = body;

    if (!name || !type || !capacity || !plate) {
      console.log("[VEHICLES API] Missing required fields:", { name: !!name, type: !!type, capacity: !!capacity, plate: !!plate });
      return NextResponse.json({ error: "Missing required fields: name, type, capacity, plate" }, { status: 400 });
    }

    console.log("[VEHICLES API] Creating vehicle:", { name, type, capacity, plate, status });
    const result = await db.insert(vehicle).values({
      name,
      type,
      capacity: parseInt(capacity),
      plate,
      status: status || "available",
    }).returning();

    console.log("[VEHICLES API] Vehicle created:", result[0]);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("[VEHICLES API] Error creating vehicle:", error);
    return NextResponse.json({ error: "Failed to create vehicle", details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log("[VEHICLES API] PUT request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      console.log("[VEHICLES API] Unauthorized PUT attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin") {
      console.log("[VEHICLES API] Forbidden:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, capacity, status, plate } = body;
    console.log("[VEHICLES API] Update body:", body);

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (capacity) updateData.capacity = parseInt(capacity);
    if (status) updateData.status = status;
    if (plate) updateData.plate = plate;

    const result = await db.update(vehicle)
      .set(updateData)
      .where(eq(vehicle.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    console.log("[VEHICLES API] Vehicle updated:", result[0]);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("[VEHICLES API] Error updating vehicle:", error);
    return NextResponse.json({ error: "Failed to update vehicle", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
    }

    const result = await db.delete(vehicle).where(eq(vehicle.id, parseInt(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
