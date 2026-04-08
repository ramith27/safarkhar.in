"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tripWallets, wallets } from "@/lib/db/schema";

export async function getTripWallets(tripId: string) {
  return db.query.tripWallets.findMany({
    where: eq(tripWallets.tripId, tripId),
    with: { wallet: true },
  });
}

export async function assignWalletToTrip(tripId: string, walletId: string) {
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, walletId),
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
  await db.delete(tripWallets).where(eq(tripWallets.id, tripWalletId));
  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
