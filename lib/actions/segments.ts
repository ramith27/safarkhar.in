"use server";

import { sql, eq, asc, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { segments, trips, vehicles } from "@/lib/db/schema";
import { segmentSchema } from "@/lib/validations/segment";
import { requireCurrentUserId } from "@/lib/auth/server";

async function ownsTrip(userId: string, tripId: string) {
  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
    columns: { id: true },
  });
  return Boolean(trip);
}

export async function getSegmentsForTrip(tripId: string) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return [];
  }

  return db.query.segments.findMany({
    where: eq(segments.tripId, tripId),
    orderBy: [asc(segments.sequenceNumber)],
    with: { vehicle: true, expenses: { with: { wallet: true } } },
  });
}

export async function createSegment(data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = segmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const s = parsed.data;
  if (!(await ownsTrip(userId, s.tripId))) {
    return { success: false, error: "Trip not found" };
  }
  if (s.vehicleId) {
    const vehicle = await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, s.vehicleId), eq(vehicles.userId, userId)),
      columns: { id: true },
    });
    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }
  }

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
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  const parsed = segmentSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const s = parsed.data;
  if (s.vehicleId) {
    const vehicle = await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, s.vehicleId), eq(vehicles.userId, userId)),
      columns: { id: true },
    });
    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }
  }

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
    .where(and(eq(segments.id, id), eq(segments.tripId, tripId)))
    .returning();
  if (!row) {
    return { success: false, error: "Segment not found" };
  }

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
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  const [row] = await db
    .update(segments)
    .set(data)
    .where(and(eq(segments.id, id), eq(segments.tripId, tripId)))
    .returning();
  if (!row) {
    return { success: false, error: "Segment not found" };
  }
  revalidatePath(`/trips/${tripId}`);
  return { success: true, data: row };
}

export async function deleteSegment(id: string, tripId: string) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  await db
    .delete(segments)
    .where(and(eq(segments.id, id), eq(segments.tripId, tripId)));
  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
