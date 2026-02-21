import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { service, trip } from "@/lib/db/schema/trip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  console.log("[EXPENSES API] GET request received");
  try {
    const headerList = await headers();
    console.log("[EXPENSES API] Headers received");
    
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[EXPENSES API] Session:", session ? "authenticated" : "not authenticated");
    
    if (!session?.user) {
      console.log("[EXPENSES API] Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    console.log("[EXPENSES API] Type filter:", type);

    let expenses: Array<{
      id: number;
      type: string;
      amount: number;
      description: string;
      date: Date;
      tripId?: number;
      driverId?: string;
    }> = [];

    try {
      const services = await db.select({
        id: service.id,
        amount: service.cost,
        description: service.issue,
        date: service.createdAt,
      }).from(service);
      console.log("[EXPENSES API] Services fetched:", services.length);

      if (!type || type === "maintenance") {
        const maintenanceExpenses = services.map((s) => ({
          id: s.id,
          type: "maintenance" as const,
          amount: Number(s.amount) || 0,
          description: String(s.description) || "",
          date: s.date,
        }));
        expenses = [...expenses, ...maintenanceExpenses];
      }
    } catch (serviceError) {
      console.error("[EXPENSES API] Error fetching services:", serviceError);
    }

    try {
      const tripsData = await db.select({
        id: trip.id,
        distance: trip.distance,
        driverId: trip.driverId,
        date: trip.deadline,
      }).from(trip);
      console.log("[EXPENSES API] Trips fetched:", tripsData.length);

      if (!type || type === "fuel") {
        const fuelExpenses = tripsData.map((t) => ({
          id: Number(t.id) + 10000,
          type: "fuel" as const,
          amount: Math.round(Number(t.distance || 0) * 0.5),
          description: `Trip #${t.id} - Fuel estimate`,
          date: t.date,
          tripId: Number(t.id),
          driverId: String(t.driverId),
        }));
        expenses = [...expenses, ...fuelExpenses];
      }
    } catch (tripError) {
      console.error("[EXPENSES API] Error fetching trips:", tripError);
    }

    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log("[EXPENSES API] Total expenses:", expenses.length);

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("[EXPENSES API] Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[EXPENSES API] POST request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[EXPENSES API] Session:", session ? `user: ${session.user?.email}, role: ${session.user?.role}` : "not authenticated");
    
    if (!session?.user) {
      console.log("[EXPENSES API] Unauthorized POST attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin" && session.user.role !== "driver") {
      console.log("[EXPENSES API] Forbidden - insufficient permissions:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("[EXPENSES API] Request body:", body);

    const { type, amount, description } = body;

    if (!type || !amount || !description) {
      console.log("[EXPENSES API] Missing required fields");
      return NextResponse.json({ error: "Missing required fields: type, amount, description" }, { status: 400 });
    }

    // Maintenance expenses should be logged via the Maintenance page (requires vehicleId)
    if (type === "maintenance") {
      return NextResponse.json({ error: "Maintenance expenses should be logged via the Maintenance page" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid expense type. Supported: fuel, other" }, { status: 400 });
  } catch (error) {
    console.error("[EXPENSES API] Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[EXPENSES API] DELETE request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      console.log("[EXPENSES API] Unauthorized DELETE attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin") {
      console.log("[EXPENSES API] Forbidden - insufficient permissions:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    console.log("[EXPENSES API] Delete params - id:", id, "type:", type);

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
    }

    if (type === "maintenance") {
      const result = await db.delete(service).where(eq(service.id, parseInt(id))).returning();
      if (result.length === 0) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }
      console.log("[EXPENSES API] Deleted expense:", result[0]);
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("[EXPENSES API] Error deleting expense:", error);
    return NextResponse.json({ error: "Failed to delete expense", details: String(error) }, { status: 500 });
  }
}
