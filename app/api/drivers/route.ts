import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { driver, user, account, verification } from "@/lib/db/schema/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, like } from "drizzle-orm";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  console.log("[DRIVERS API] GET request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[DRIVERS API] Session:", session ? "authenticated" : "not authenticated");
    
    if (!session?.user) {
      console.log("[DRIVERS API] Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      console.log("[DRIVERS API] Fetching driver by id:", id);
      const result = await db.select().from(driver).where(eq(driver.id, id));
      if (result.length === 0) {
        console.log("[DRIVERS API] Driver not found:", id);
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    }

    // Get all drivers with their user info
    const result = await db.select({
      id: driver.id,
      licenseNum: driver.licenseNum,
      licenseCategory: driver.licenseCategory,
      status: driver.status,
      expiresAt: driver.expiresAt,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
      name: user.name,
      email: user.email,
    }).from(driver).leftJoin(user, eq(driver.id, user.id));
    
    console.log("[DRIVERS API] Fetched drivers, count:", result.length);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[DRIVERS API] Error fetching drivers:", error);
    return NextResponse.json({ error: "Failed to fetch drivers", details: String(error) }, { status: 500 });
  }
}

// Endpoint to get users without driver profiles (for admin to create drivers)
export async function GET_USERS_WITHOUT_DRIVERS(request: NextRequest) {
  console.log("[DRIVERS API] GET users without drivers");
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
    
    console.log("[DRIVERS API] Users without drivers:", usersWithoutDrivers.length);
    return NextResponse.json(usersWithoutDrivers);
  } catch (error) {
    console.error("[DRIVERS API] Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[DRIVERS API] POST request received - Create driver profile for existing user");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("[DRIVERS API] Request body:", body);

    const { userId, licenseNum, licenseCategory, expiresAt } = body;

    if (!userId || !licenseNum || !licenseCategory || !expiresAt) {
      return NextResponse.json({ error: "Missing required fields: userId, licenseNum, licenseCategory, expiresAt" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select().from(user).where(eq(user.id, userId));
    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if driver profile already exists
    const existingDriver = await db.select().from(driver).where(eq(driver.id, userId));
    if (existingDriver.length > 0) {
      return NextResponse.json({ error: "Driver profile already exists for this user" }, { status: 400 });
    }

    // Create driver profile with license info
    const newDriver = await db.insert(driver).values({
      id: userId,
      licenseNum,
      licenseCategory,
      expiresAt: new Date(expiresAt),
      status: "available",
    }).returning();

    console.log("[DRIVERS API] Created driver profile:", { userId, licenseNum });
    return NextResponse.json({ 
      message: "Driver created successfully",
      driver: newDriver[0],
      user: existingUser[0]
    }, { status: 201 });
    
  } catch (error) {
    console.error("[DRIVERS API] Error creating driver:", error);
    return NextResponse.json({ error: "Failed to create driver", details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log("[DRIVERS API] PUT request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Driver ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { licenseNum, licenseCategory, status, expiresAt } = body;

    const updateData: Record<string, unknown> = {};
    if (licenseNum) updateData.licenseNum = licenseNum;
    if (licenseCategory) updateData.licenseCategory = licenseCategory;
    if (status) updateData.status = status;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);

    const result = await db.update(driver)
      .set(updateData)
      .where(eq(driver.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    console.log("[DRIVERS API] Driver updated:", result[0]);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("[DRIVERS API] Error updating driver:", error);
    return NextResponse.json({ error: "Failed to update driver", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[DRIVERS API] DELETE request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Driver ID required" }, { status: 400 });
    }

    const result = await db.delete(driver).where(eq(driver.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    console.log("[DRIVERS API] Driver deleted:", result[0]);
    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("[DRIVERS API] Error deleting driver:", error);
    return NextResponse.json({ error: "Failed to delete driver", details: String(error) }, { status: 500 });
  }
}
