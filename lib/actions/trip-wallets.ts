"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tripWallets, trips, wallets } from "@/lib/db/schema";
import { requireCurrentUserId } from "@/lib/auth/server";

async function ownsTrip(userId: string, tripId: string) {
  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
    columns: { id: true },
  });
  return Boolean(trip);
}

export async function getTripWallets(tripId: string) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return [];
  }

  return db.query.tripWallets.findMany({
    where: eq(tripWallets.tripId, tripId),
    with: { wallet: true },
  });
}

export async function assignWalletToTrip(tripId: string, walletId: string) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
  });
  if (!wallet) return { success: false, error: "Wallet not found" };

  const [row] = await db
    .insert(tripWallets)
    .values({
      tripId,
      walletId,
      balanceAtStartPaise: wallet.balancePaise,
    })
    .returning();

  revalidatePath(`/trips/${tripId}`);
  return { success: true, data: row };
}

export async function removeWalletFromTrip(tripWalletId: string, tripId: string) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  await db
    .delete(tripWallets)
    .where(and(eq(tripWallets.id, tripWalletId), eq(tripWallets.tripId, tripId)));
  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
