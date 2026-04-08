"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { vehicleSchema } from "@/lib/validations/vehicle";
import { eq } from "drizzle-orm";

export async function getVehicles() {
  return db.query.vehicles.findMany({
    orderBy: (v, { desc }) => [desc(v.createdAt)],
  });
}

export async function getVehicle(id: string) {
  return db.query.vehicles.findFirst({ where: eq(vehicles.id, id) });
}

export async function createVehicle(data: unknown) {
  const parsed = vehicleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const v = parsed.data;
  const [row] = await db
    .insert(vehicles)
    .values({
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
    .where(eq(vehicles.id, id))
    .returning();
  revalidatePath("/vehicles");
  return { success: true, data: row };
}

export async function deleteVehicle(id: string) {
  await db.delete(vehicles).where(eq(vehicles.id, id));
  revalidatePath("/vehicles");
  return { success: true };
}
