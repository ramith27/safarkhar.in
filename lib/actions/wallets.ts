"use server";

import { sql, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { wallets, walletTransactions } from "@/lib/db/schema";
import { walletSchema, topUpSchema } from "@/lib/validations/wallet";
import { rupeesToPaise } from "@/lib/utils/format";

export async function getWallets() {
  return db.query.wallets.findMany({
    orderBy: (w, { asc }) => [asc(w.name)],
    with: { vehicle: true },
  });
}

export async function getWallet(id: string) {
  return db.query.wallets.findFirst({
    where: eq(wallets.id, id),
    with: { vehicle: true },
  });
}

export async function createWallet(data: unknown) {
  const parsed = walletSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const w = parsed.data;
  const [row] = await db
    .insert(wallets)
    .values({
      name: w.name,
      type: w.type,
      vehicleId: w.vehicleId || null,
    })
    .returning();
  revalidatePath("/wallets");
  return { success: true, data: row };
}

export async function updateWallet(id: string, data: unknown) {
  const parsed = walletSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const w = parsed.data;
  const [row] = await db
    .update(wallets)
    .set({
      name: w.name,
      type: w.type,
      vehicleId: w.vehicleId || null,
      updatedAt: new Date(),
    })
    .where(eq(wallets.id, id))
    .returning();
  revalidatePath("/wallets");
  return { success: true, data: row };
}

export async function deleteWallet(id: string) {
  await db.delete(wallets).where(eq(wallets.id, id));
  revalidatePath("/wallets");
  return { success: true };
}

export async function topUpWallet(walletId: string, data: unknown) {
  const parsed = topUpSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const amountPaise = rupeesToPaise(parsed.data.amountRupees);

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
  return db.query.walletTransactions.findMany({
    where: eq(walletTransactions.walletId, walletId),
    orderBy: [desc(walletTransactions.createdAt)],
  });
}

export async function getAllWalletTransactions() {
  return db.query.walletTransactions.findMany({
    orderBy: [desc(walletTransactions.createdAt)],
    with: { wallet: true },
  });
}

const adjustBalanceSchema = z.object({
  newBalanceRupees: z.coerce.number().min(0),
  description: z.string().optional().or(z.literal("")),
});

export async function adjustWalletBalance(walletId: string, data: unknown) {
  const parsed = adjustBalanceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const newBalancePaise = rupeesToPaise(parsed.data.newBalanceRupees);

  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, walletId),
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

