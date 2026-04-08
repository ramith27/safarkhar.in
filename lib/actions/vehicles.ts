"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { vehicleSchema } from "@/lib/validations/vehicle";
import { and, eq } from "drizzle-orm";
import { requireCurrentUserId } from "@/lib/auth/server";

export async function getVehicles() {
  const userId = await requireCurrentUserId();
  return db.query.vehicles.findMany({
    where: eq(vehicles.userId, userId),
    orderBy: (v, { desc }) => [desc(v.createdAt)],
  });
}

export async function getVehicle(id: string) {
  const userId = await requireCurrentUserId();
  return db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, id), eq(vehicles.userId, userId)),
  });
}

export async function createVehicle(data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = vehicleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const v = parsed.data;
  const [row] = await db
    .insert(vehicles)
    .values({
      userId,
      name: v.name,
      type: v.type,
      make: v.make || null,
      model: v.model || null,
      registrationNumber: v.registrationNumber || null,
      batteryCapacityKwh: v.batteryCapacityKwh ?? null,
      fuelType: v.fuelType ?? null,
      tankCapacityLitres: v.tankCapacityLitres ?? null,
    })
    .returning();
  revalidatePath("/vehicles");
  return { success: true, data: row };
}

export async function updateVehicle(id: string, data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = vehicleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const v = parsed.data;
  const [row] = await db
    .update(vehicles)
    .set({
      name: v.name,
      type: v.type,
      make: v.make || null,
      model: v.model || null,
      registrationNumber: v.registrationNumber || null,
      batteryCapacityKwh: v.batteryCapacityKwh ?? null,
      fuelType: v.fuelType ?? null,
      tankCapacityLitres: v.tankCapacityLitres ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)))
    .returning();
  if (!row) {
    return { success: false, error: "Vehicle not found" };
  }
  revalidatePath("/vehicles");
  return { success: true, data: row };
}

export async function deleteVehicle(id: string) {
  const userId = await requireCurrentUserId();
  await db
    .delete(vehicles)
    .where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
  revalidatePath("/vehicles");
  return { success: true };
}
