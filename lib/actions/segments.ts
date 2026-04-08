"use server";

import { sql, eq, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { segments, trips } from "@/lib/db/schema";
import { segmentSchema } from "@/lib/validations/segment";

export async function getSegmentsForTrip(tripId: string) {
  return db.query.segments.findMany({
    where: eq(segments.tripId, tripId),
    orderBy: [asc(segments.sequenceNumber)],
    with: { vehicle: true, expenses: { with: { wallet: true } } },
  });
}

export async function createSegment(data: unknown) {
  const parsed = segmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const s = parsed.data;

  // Auto-increment sequence number
  const existing = await db
    .select({ sequenceNumber: segments.sequenceNumber })
    .from(segments)
    .where(eq(segments.tripId, s.tripId))
    .orderBy(desc(segments.sequenceNumber))
    .limit(1);

  const nextSeq = existing.length > 0 ? existing[0].sequenceNumber + 1 : 1;

  const [row] = await db
    .insert(segments)
    .values({
      tripId: s.tripId,
      sequenceNumber: nextSeq,
      transportMode: s.transportMode,
      fromLocation: s.fromLocation,
      toLocation: s.toLocation || null,
      startTime: s.startTime || null,
      endTime: s.endTime || null,
      distanceKm: s.distanceKm ?? null,
      vehicleId: s.vehicleId || null,
      startOdometer: s.startOdometer ?? null,
      endOdometer: s.endOdometer ?? null,
      startBatteryPct: s.startBatteryPct ?? null,
      endBatteryPct: s.endBatteryPct ?? null,
      startFuelLevelLitres: s.startFuelLevelLitres ?? null,
      endFuelLevelLitres: s.endFuelLevelLitres ?? null,
      displayedRangeKm: s.displayedRangeKm ?? null,
      stopType: s.stopType ?? null,
      carrierName: s.carrierName || null,
      serviceNumber: s.serviceNumber || null,
      ticketClass: s.ticketClass ?? null,
      pnr: s.pnr || null,
      notes: s.notes || null,
    })
    .returning();

  // Update trip total distance if provided
  if (s.distanceKm) {
    await db.execute(
      sql`UPDATE trips SET updated_at = NOW() WHERE id = ${s.tripId}`
    );
  }

  revalidatePath(`/trips/${s.tripId}`);
  return { success: true, data: row };
}

export async function updateSegment(id: string, data: unknown, tripId: string) {
  const parsed = segmentSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const s = parsed.data;

  const [row] = await db
    .update(segments)
    .set({
      ...(s.transportMode && { transportMode: s.transportMode }),
      ...(s.fromLocation && { fromLocation: s.fromLocation }),
      ...(s.toLocation !== undefined && { toLocation: s.toLocation || null }),
      ...(s.startTime !== undefined && { startTime: s.startTime || null }),
      ...(s.endTime !== undefined && { endTime: s.endTime || null }),
      ...(s.distanceKm !== undefined && { distanceKm: s.distanceKm ?? null }),
      ...(s.vehicleId !== undefined && { vehicleId: s.vehicleId || null }),
      ...(s.startOdometer !== undefined && { startOdometer: s.startOdometer ?? null }),
      ...(s.endOdometer !== undefined && { endOdometer: s.endOdometer ?? null }),
      ...(s.startBatteryPct !== undefined && { startBatteryPct: s.startBatteryPct ?? null }),
      ...(s.endBatteryPct !== undefined && { endBatteryPct: s.endBatteryPct ?? null }),
      ...(s.startFuelLevelLitres !== undefined && { startFuelLevelLitres: s.startFuelLevelLitres ?? null }),
      ...(s.endFuelLevelLitres !== undefined && { endFuelLevelLitres: s.endFuelLevelLitres ?? null }),
      ...(s.displayedRangeKm !== undefined && { displayedRangeKm: s.displayedRangeKm ?? null }),
      ...(s.stopType !== undefined && { stopType: s.stopType ?? null }),
      ...(s.carrierName !== undefined && { carrierName: s.carrierName || null }),
      ...(s.serviceNumber !== undefined && { serviceNumber: s.serviceNumber || null }),
      ...(s.ticketClass !== undefined && { ticketClass: s.ticketClass ?? null }),
      ...(s.pnr !== undefined && { pnr: s.pnr || null }),
      ...(s.notes !== undefined && { notes: s.notes || null }),
    })
    .where(eq(segments.id, id))
    .returning();

  revalidatePath(`/trips/${tripId}`);
  return { success: true, data: row };
}

export async function patchSegment(
  id: string,
  data: {
    endBatteryPct?: number | null;
    endFuelLevelLitres?: number | null;
    displayedRangeKm?: number | null;
  },
  tripId: string,
) {
  const [row] = await db
    .update(segments)
    .set(data)
    .where(eq(segments.id, id))
    .returning();
  revalidatePath(`/trips/${tripId}`);
  return { success: true, data: row };
}

export async function deleteSegment(id: string, tripId: string) {
  await db.delete(segments).where(eq(segments.id, id));
  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
