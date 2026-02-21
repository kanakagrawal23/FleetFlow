import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { driver, user } from "@/lib/db/schema/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  console.log("[USERS-DRIVERS API] GET request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with role "driver"
    const allDriverUsers = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
      .from(user)
      .where(eq(user.role, "driver"));
    
    // Get all existing driver IDs
    const existingDrivers = await db.select({ id: driver.id }).from(driver);
    const existingDriverIds = new Set(existingDrivers.map(d => d.id));
    
    // Filter out users who already have driver profiles
    const usersWithoutDrivers = allDriverUsers.filter(u => !existingDriverIds.has(u.id));
    
    console.log("[USERS-DRIVERS API] Users without drivers:", usersWithoutDrivers.length);
    return NextResponse.json(usersWithoutDrivers);
  } catch (error) {
    console.error("[USERS-DRIVERS API] Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: String(error) }, { status: 500 });
  }
}
