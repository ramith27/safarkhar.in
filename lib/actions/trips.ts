"use server";

import { sql, eq, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { trips, tripWallets, wallets } from "@/lib/db/schema";
import { tripSchema } from "@/lib/validations/trip";

export async function getTrips() {
  return db.query.trips.findMany({
    orderBy: [desc(trips.createdAt)],
    with: {
      segments: { orderBy: (s, { asc }) => [asc(s.sequenceNumber)] },
      tripWallets: { with: { wallet: true } },
    },
  });
}

export async function getTrip(id: string) {
  return db.query.trips.findFirst({
    where: eq(trips.id, id),
    with: {
      segments: {
        orderBy: (s, { asc }) => [asc(s.sequenceNumber)],
        with: { vehicle: true, expenses: { with: { wallet: true } } },
      },
      expenses: {
        orderBy: (e, { desc }) => [desc(e.createdAt)],
        with: { wallet: true, segment: true },
      },
      tripWallets: { with: { wallet: true } },
    },
  });
}

export async function createTrip(data: unknown) {
  const parsed = tripSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const t = parsed.data;

  const [trip] = await db
    .insert(trips)
    .values({
      title: t.title,
      description: t.description || null,
      startLocation: t.startLocation,
      endLocation: t.endLocation || null,
      startDate: t.startDate,
      endDate: t.endDate || null,
      numPeople: t.numPeople,
      notes: t.notes || null,
      primaryMode: t.primaryMode ?? null,
      status: "PLANNING",
    })
    .returning();

  // Assign wallets with balance snapshots
  if (t.walletIds && t.walletIds.length > 0) {
    const walletRows = await db
      .select({ id: wallets.id, balancePaise: wallets.balancePaise })
      .from(wallets)
      .where(inArray(wallets.id, t.walletIds));

    if (walletRows.length > 0) {
      await db.insert(tripWallets).values(
        walletRows.map((w) => ({
          tripId: trip.id,
          walletId: w.id,
          balanceAtStartPaise: w.balancePaise,
        }))
      );
    }
  }

  revalidatePath("/trips");
  revalidatePath("/");
  return { success: true, data: trip };
}

export async function updateTrip(id: string, data: unknown) {
  const parsed = tripSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const t = parsed.data;
  const [row] = await db
    .update(trips)
    .set({
      ...(t.title && { title: t.title }),
      ...(t.description !== undefined && { description: t.description || null }),
      ...(t.startLocation && { startLocation: t.startLocation }),
      ...(t.endLocation !== undefined && { endLocation: t.endLocation || null }),
      ...(t.startDate && { startDate: t.startDate }),
      ...(t.endDate !== undefined && { endDate: t.endDate || null }),
      ...(t.numPeople && { numPeople: t.numPeople }),
      ...(t.notes !== undefined && { notes: t.notes || null }),
      ...(t.primaryMode !== undefined && { primaryMode: t.primaryMode ?? null }),
      updatedAt: new Date(),
    })
    .where(eq(trips.id, id))
    .returning();
  revalidatePath(`/trips/${id}`);
  revalidatePath("/trips");
  return { success: true, data: row };
}

export async function startTrip(
  id: string,
  opts?: {
    initialOdometerKm?: number | null;
    initialBatteryPct?: number | null;
    initialDisplayedRangeKm?: number | null;
  }
) {
  const [row] = await db
    .update(trips)
    .set({
      status: "ACTIVE",
      updatedAt: new Date(),
      ...(opts?.initialOdometerKm != null && { initialOdometerKm: opts.initialOdometerKm }),
      ...(opts?.initialBatteryPct != null && { initialBatteryPct: opts.initialBatteryPct }),
      ...(opts?.initialDisplayedRangeKm != null && { initialDisplayedRangeKm: opts.initialDisplayedRangeKm }),
    })
    .where(eq(trips.id, id))
    .returning();
  revalidatePath(`/trips/${id}`);
  revalidatePath("/trips");
  revalidatePath("/");
  return { success: true, data: row };
}

export async function endTrip(id: string) {
  // Snapshot current wallet balances at trip end
  const tripWalletRows = await db.query.tripWallets.findMany({
    where: eq(tripWallets.tripId, id),
    with: { wallet: true },
  });

  for (const tw of tripWalletRows) {
    await db
      .update(tripWallets)
      .set({ balanceAtEndPaise: tw.wallet.balancePaise })
      .where(eq(tripWallets.id, tw.id));
  }

  const [row] = await db
    .update(trips)
    .set({
      status: "COMPLETED",
      updatedAt: new Date(),
    })
    .where(eq(trips.id, id))
    .returning();

  revalidatePath(`/trips/${id}`);
  revalidatePath("/trips");
  revalidatePath("/");
  return { success: true, data: row };
}

export async function deleteTrip(id: string) {
  await db.delete(trips).where(eq(trips.id, id));
  revalidatePath("/trips");
  revalidatePath("/");
  return { success: true };
}
