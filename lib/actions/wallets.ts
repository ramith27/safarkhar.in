"use server";

import { sql, eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { vehicles, wallets, walletTransactions } from "@/lib/db/schema";
import { walletSchema, topUpSchema } from "@/lib/validations/wallet";
import { rupeesToPaise } from "@/lib/utils/format";
import { requireCurrentUserId } from "@/lib/auth/server";

export async function getWallets() {
  const userId = await requireCurrentUserId();
  return db.query.wallets.findMany({
    where: eq(wallets.userId, userId),
    orderBy: (w, { asc }) => [asc(w.name)],
    with: { vehicle: true },
  });
}

export async function getWallet(id: string) {
  const userId = await requireCurrentUserId();
  return db.query.wallets.findFirst({
    where: and(eq(wallets.id, id), eq(wallets.userId, userId)),
    with: { vehicle: true },
  });
}

export async function createWallet(data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = walletSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const w = parsed.data;
  if (w.vehicleId) {
    const ownedVehicle = await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, w.vehicleId), eq(vehicles.userId, userId)),
      columns: { id: true },
    });
    if (!ownedVehicle) {
      return { success: false, error: "Vehicle not found" };
    }
  }

  const [row] = await db
    .insert(wallets)
    .values({
      userId,
      name: w.name,
      type: w.type,
      vehicleId: w.vehicleId || null,
    })
    .returning();
  revalidatePath("/wallets");
  return { success: true, data: row };
}

export async function updateWallet(id: string, data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = walletSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const w = parsed.data;
  if (w.vehicleId) {
    const ownedVehicle = await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, w.vehicleId), eq(vehicles.userId, userId)),
      columns: { id: true },
    });
    if (!ownedVehicle) {
      return { success: false, error: "Vehicle not found" };
    }
  }

  const [row] = await db
    .update(wallets)
    .set({
      name: w.name,
      type: w.type,
      vehicleId: w.vehicleId || null,
      updatedAt: new Date(),
    })
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
    .returning();
  if (!row) {
    return { success: false, error: "Wallet not found" };
  }
  revalidatePath("/wallets");
  return { success: true, data: row };
}

export async function deleteWallet(id: string) {
  const userId = await requireCurrentUserId();
  await db
    .delete(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)));
  revalidatePath("/wallets");
  return { success: true };
}

export async function topUpWallet(walletId: string, data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = topUpSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const amountPaise = rupeesToPaise(parsed.data.amountRupees);

  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
  });
  if (!wallet) return { success: false, error: "Wallet not found" };

  await db.transaction(async (tx) => {
    await tx.insert(walletTransactions).values({
      walletId,
      amountPaise,
      type: "CREDIT",
      referenceType: "TOP_UP",
      description: parsed.data.description || "Top-up",
    });
    await tx.execute(
      sql`UPDATE wallets SET balance_paise = balance_paise + ${amountPaise}, updated_at = NOW() WHERE id = ${walletId}`
    );
  });

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

/**
 * Internal helper — debits a wallet atomically inside an existing Drizzle transaction.
 */
export async function debitWalletTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  walletId: string,
  amountPaise: number,
  referenceId: string,
  description: string
) {
  await tx.insert(walletTransactions).values({
    walletId,
    amountPaise: -amountPaise,
    type: "DEBIT",
    referenceType: "TRIP_EXPENSE",
    referenceId,
    description,
  });
  await tx.execute(
    sql`UPDATE wallets SET balance_paise = balance_paise - ${amountPaise}, updated_at = NOW() WHERE id = ${walletId}`
  );
}

export async function getWalletTransactions(walletId: string) {
  const userId = await requireCurrentUserId();
  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
  });
  if (!wallet) return [];

  return db.query.walletTransactions.findMany({
    where: eq(walletTransactions.walletId, walletId),
    orderBy: [desc(walletTransactions.createdAt)],
  });
}

export async function getAllWalletTransactions() {
  const userId = await requireCurrentUserId();
  return db
    .select({
      id: walletTransactions.id,
      walletId: walletTransactions.walletId,
      amountPaise: walletTransactions.amountPaise,
      type: walletTransactions.type,
      referenceType: walletTransactions.referenceType,
      referenceId: walletTransactions.referenceId,
      description: walletTransactions.description,
      createdAt: walletTransactions.createdAt,
      wallet: {
        id: wallets.id,
        name: wallets.name,
        type: wallets.type,
        balancePaise: wallets.balancePaise,
        currency: wallets.currency,
        vehicleId: wallets.vehicleId,
        createdAt: wallets.createdAt,
        updatedAt: wallets.updatedAt,
        userId: wallets.userId,
      },
    })
    .from(walletTransactions)
    .innerJoin(wallets, eq(walletTransactions.walletId, wallets.id))
    .where(eq(wallets.userId, userId))
    .orderBy(desc(walletTransactions.createdAt));
}

const adjustBalanceSchema = z.object({
  newBalanceRupees: z.coerce.number().min(0),
  description: z.string().optional().or(z.literal("")),
});

export async function adjustWalletBalance(walletId: string, data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = adjustBalanceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const newBalancePaise = rupeesToPaise(parsed.data.newBalanceRupees);

  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
  });
  if (!wallet) return { success: false, error: "Wallet not found" };

  const diff = newBalancePaise - wallet.balancePaise;

  await db.transaction(async (tx) => {
    await tx.insert(walletTransactions).values({
      walletId,
      amountPaise: diff,
      type: diff >= 0 ? "CREDIT" : "DEBIT",
      referenceType: "MANUAL_ADJUSTMENT",
      description: parsed.data.description || "Manual balance adjustment",
    });
    await tx.execute(
      sql`UPDATE wallets SET balance_paise = ${newBalancePaise}, updated_at = NOW() WHERE id = ${walletId}`
    );
  });

  revalidatePath("/wallets");
  revalidatePath("/activity");
  revalidatePath("/");
  return { success: true };
}

