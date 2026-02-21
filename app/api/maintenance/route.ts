import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { service, vehicle } from "@/lib/db/schema/trip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  console.log("[MAINTENANCE API] GET request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[MAINTENANCE API] Session:", session ? "authenticated" : "not authenticated");
    
    if (!session?.user) {
      console.log("[MAINTENANCE API] Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      console.log("[MAINTENANCE API] Fetching service by id:", id);
      const result = await db.select().from(service).where(eq(service.id, parseInt(id)));
      if (result.length === 0) {
        console.log("[MAINTENANCE API] Service record not found:", id);
        return NextResponse.json({ error: "Service record not found" }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    }

    const result = await db.select().from(service).orderBy(service.createdAt);
    console.log("[MAINTENANCE API] Fetched all service records, count:", result.length);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[MAINTENANCE API] Error fetching service records:", error);
    return NextResponse.json({ error: "Failed to fetch service records", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[MAINTENANCE API] POST request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      console.log("[MAINTENANCE API] Unauthorized POST attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin") {
      console.log("[MAINTENANCE API] Forbidden:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("[MAINTENANCE API] Request body:", body);
    const { vehicleId, issue, cost } = body;

    if (!vehicleId || !issue || !cost) {
      console.log("[MAINTENANCE API] Missing required fields");
      return NextResponse.json({ error: "Missing required fields: vehicleId, issue, cost" }, { status: 400 });
    }

    // Check if vehicle exists
    const vehicleData = await db.select().from(vehicle).where(eq(vehicle.id, parseInt(vehicleId)));
    if (vehicleData.length === 0) {
      console.log("[MAINTENANCE API] Vehicle not found:", vehicleId);
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Create service record
    const result = await db.insert(service).values({
      issue,
      cost: parseInt(cost),
    }).returning();

    // Auto-update vehicle status to "maintenance" (In Shop)
    await db.update(vehicle)
      .set({ status: "maintenance" })
      .where(eq(vehicle.id, parseInt(vehicleId)));

    console.log("[MAINTENANCE API] Service record created and vehicle status updated to maintenance:", result[0]);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("[MAINTENANCE API] Error creating service record:", error);
    return NextResponse.json({ error: "Failed to create service record", details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { issue, cost } = body;

    const updateData: Record<string, unknown> = {};
    if (issue) updateData.issue = issue;
    if (cost) updateData.cost = parseInt(cost);

    const result = await db.update(service)
      .set(updateData)
      .where(eq(service.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Service record not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating service record:", error);
    return NextResponse.json({ error: "Failed to update service record" }, { status: 500 });
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
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const result = await db.delete(service).where(eq(service.id, parseInt(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Service record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service record deleted successfully" });
  } catch (error) {
    console.error("Error deleting service record:", error);
    return NextResponse.json({ error: "Failed to delete service record" }, { status: 500 });
  }
}
