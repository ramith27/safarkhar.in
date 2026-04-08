"use server";

import { sql, eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tripExpenses, trips, wallets, walletTransactions } from "@/lib/db/schema";
import { expenseSchema } from "@/lib/validations/expense";
import { rupeesToPaise } from "@/lib/utils/format";
import { debitWalletTx } from "@/lib/actions/wallets";
import { requireCurrentUserId } from "@/lib/auth/server";

async function ownsTrip(userId: string, tripId: string) {
  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
    columns: { id: true },
  });
  return Boolean(trip);
}

export async function getExpensesForTrip(tripId: string) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return [];
  }

  return db.query.tripExpenses.findMany({
    where: eq(tripExpenses.tripId, tripId),
    orderBy: [desc(tripExpenses.createdAt)],
    with: { wallet: true, segment: true },
  });
}

export async function createExpense(data: unknown) {
  const userId = await requireCurrentUserId();
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const e = parsed.data;
  if (!(await ownsTrip(userId, e.tripId))) {
    return { success: false, error: "Trip not found" };
  }

  const amountPaise = rupeesToPaise(e.amountRupees);
  const walletId = e.walletId || null;

  if (walletId) {
    const wallet = await db.query.wallets.findFirst({
      where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
      columns: { id: true },
    });
    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }
  }

  let row: typeof tripExpenses.$inferSelect;

  if (e.paymentMethod === "WALLET" && walletId) {
    // Atomic: insert expense + debit wallet + update trip total
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(tripExpenses)
        .values({
          tripId: e.tripId,
          segmentId: e.segmentId || null,
          category: e.category,
          subcategory: e.subcategory ?? null,
          paymentMethod: e.paymentMethod,
          walletId,
          amountPaise,
          description: e.description || null,
          vendorName: e.vendorName || null,
          numPeople: e.numPeople,
          mealType: e.mealType ?? null,
          checkInDate: e.checkInDate || null,
          checkOutDate: e.checkOutDate || null,
          numNights: e.numNights ?? null,
          roomType: e.roomType || null,
          litresAdded: e.litresAdded ?? null,
          fuelStationName: e.fuelStationName || null,
          kwhAdded: e.kwhAdded ?? null,
          chargerName: e.chargerName || null,
          tollName: e.tollName || null,
          ticketRef: e.ticketRef || null,
        })
        .returning();
      row = inserted;

      await debitWalletTx(
        tx,
        walletId,
        amountPaise,
        inserted.id,
        e.description || `${e.category} expense`
      );

      await tx.execute(
        sql`UPDATE trips SET total_cost_paise = total_cost_paise + ${amountPaise}, updated_at = NOW() WHERE id = ${e.tripId}`
      );
    });
  } else {
    const [inserted] = await db
      .insert(tripExpenses)
      .values({
        tripId: e.tripId,
        segmentId: e.segmentId || null,
        category: e.category,
        subcategory: e.subcategory ?? null,
        paymentMethod: e.paymentMethod,
        walletId,
        amountPaise,
        description: e.description || null,
        vendorName: e.vendorName || null,
        numPeople: e.numPeople,
        mealType: e.mealType ?? null,
        checkInDate: e.checkInDate || null,
        checkOutDate: e.checkOutDate || null,
        numNights: e.numNights ?? null,
        roomType: e.roomType || null,
        litresAdded: e.litresAdded ?? null,
        fuelStationName: e.fuelStationName || null,
        kwhAdded: e.kwhAdded ?? null,
        chargerName: e.chargerName || null,
        tollName: e.tollName || null,
        ticketRef: e.ticketRef || null,
      })
      .returning();
    row = inserted;

    // Update trip total cost
    await db.execute(
      sql`UPDATE trips SET total_cost_paise = total_cost_paise + ${amountPaise}, updated_at = NOW() WHERE id = ${e.tripId}`
    );
  }

  revalidatePath(`/trips/${e.tripId}`);
  revalidatePath("/trips");
  return { success: true, data: row! };
}

export async function updateExpense(
  id: string,
  data: unknown,
  tripId: string
) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  const e = parsed.data;
  const newAmountPaise = rupeesToPaise(e.amountRupees);
  if (e.walletId) {
    const wallet = await db.query.wallets.findFirst({
      where: and(eq(wallets.id, e.walletId), eq(wallets.userId, userId)),
      columns: { id: true },
    });
    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }
  }

  // Get existing expense to calculate diff
  const existing = await db.query.tripExpenses.findFirst({
    where: and(eq(tripExpenses.id, id), eq(tripExpenses.tripId, tripId)),
  });
  if (!existing) return { success: false, error: "Expense not found" };

  const diff = newAmountPaise - existing.amountPaise;

  const [row] = await db
    .update(tripExpenses)
    .set({
      category: e.category,
      subcategory: e.subcategory ?? null,
      paymentMethod: e.paymentMethod,
      walletId: e.walletId || null,
      amountPaise: newAmountPaise,
      description: e.description || null,
      vendorName: e.vendorName || null,
      numPeople: e.numPeople,
      mealType: e.mealType ?? null,
      checkInDate: e.checkInDate || null,
      checkOutDate: e.checkOutDate || null,
      numNights: e.numNights ?? null,
      roomType: e.roomType || null,
      litresAdded: e.litresAdded ?? null,
      fuelStationName: e.fuelStationName || null,
      kwhAdded: e.kwhAdded ?? null,
      chargerName: e.chargerName || null,
      tollName: e.tollName || null,
      ticketRef: e.ticketRef || null,
    })
    .where(and(eq(tripExpenses.id, id), eq(tripExpenses.tripId, tripId)))
    .returning();

  // Update trip total with the difference
  if (diff !== 0) {
    await db.execute(
      sql`UPDATE trips SET total_cost_paise = total_cost_paise + ${diff}, updated_at = NOW() WHERE id = ${tripId}`
    );
  }

  revalidatePath(`/trips/${tripId}`);
  return { success: true, data: row };
}

export async function deleteExpense(
  id: string,
  tripId: string
) {
  const userId = await requireCurrentUserId();
  if (!(await ownsTrip(userId, tripId))) {
    return { success: false, error: "Trip not found" };
  }

  const existing = await db.query.tripExpenses.findFirst({
    where: and(eq(tripExpenses.id, id), eq(tripExpenses.tripId, tripId)),
  });
  if (!existing) return { success: false, error: "Expense not found" };

  await db.transaction(async (tx) => {
    // If paid via wallet, reverse the transaction and restore the balance
    if (existing.paymentMethod === "WALLET" && existing.walletId) {
      const walletTx = await tx.query.walletTransactions.findFirst({
        where: eq(walletTransactions.referenceId, id),
      });
      if (walletTx) {
        await tx.delete(walletTransactions).where(eq(walletTransactions.id, walletTx.id));
        await tx.execute(
          sql`UPDATE wallets SET balance_paise = balance_paise + ${existing.amountPaise}, updated_at = NOW() WHERE id = ${existing.walletId}`
        );
      }
    }

    await tx.delete(tripExpenses).where(eq(tripExpenses.id, id));

    await tx.execute(
      sql`UPDATE trips SET total_cost_paise = total_cost_paise - ${existing.amountPaise}, updated_at = NOW() WHERE id = ${tripId}`
    );
  });

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/trips");
  revalidatePath("/wallets");
  revalidatePath("/activity");
  return { success: true };
}
