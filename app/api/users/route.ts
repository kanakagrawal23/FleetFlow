import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  console.log("[USERS API] GET request received");
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });
    console.log("[USERS API] Session:", session ? "authenticated" : "not authenticated");
    
    if (!session?.user) {
      console.log("[USERS API] Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and manager can list users
    if (session.user.role !== "admin" && session.user.role !== "manager") {
      console.log("[USERS API] Forbidden:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }).from(user);
    
    console.log("[USERS API] Fetched users, count:", result.length);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[USERS API] Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: String(error) }, { status: 500 });
  }
}
