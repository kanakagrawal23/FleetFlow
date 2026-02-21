"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { driver } from "@/lib/db/schema/auth";

export async function onboardDriver(data: {
  licenseNum: string;
  licenseCategory: string;
  expiresAt: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (session.user.role !== "driver") {
    return { error: "User role is not driver" };
  }

  const { licenseNum, licenseCategory, expiresAt } = data;
  if (!licenseNum?.trim() || !licenseCategory?.trim() || !expiresAt) {
    return { error: "License number, category, and expiry are required" };
  }

  const expiresAtDate = new Date(expiresAt);
  if (Number.isNaN(expiresAtDate.getTime())) {
    return { error: "Invalid expiry date" };
  }

  try {
    await db.insert(driver).values({
      id: session.user.id,
      licenseNum: licenseNum.trim(),
      licenseCategory: licenseCategory.trim(),
      expiresAt: expiresAtDate,
    });
    return { success: true };
  } catch (err) {
    console.error("Driver onboarding error:", err);
    return { error: "Failed to save driver details" };
  }
}
