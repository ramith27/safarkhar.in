"use server";

import { sql, eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips, tripExpenses, segments, wallets } from "@/lib/db/schema";
import { requireCurrentUserId } from "@/lib/auth/server";

/** Total spend per expense category for a given trip */
export async function getTripCategoryBreakdown(tripId: string) {
  const userId = await requireCurrentUserId();
  const rows = await db
    .select({
      category: tripExpenses.category,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(tripExpenses)
    .innerJoin(trips, eq(tripExpenses.tripId, trips.id))
    .where(and(eq(tripExpenses.tripId, tripId), eq(trips.userId, userId)))
    .groupBy(tripExpenses.category);
  return rows;
}

/** Per-payment-method breakdown for a trip */
export async function getTripPaymentBreakdown(tripId: string) {
  const userId = await requireCurrentUserId();
  const rows = await db
    .select({
      paymentMethod: tripExpenses.paymentMethod,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
    })
    .from(tripExpenses)
    .innerJoin(trips, eq(tripExpenses.tripId, trips.id))
    .where(and(eq(tripExpenses.tripId, tripId), eq(trips.userId, userId)))
    .groupBy(tripExpenses.paymentMethod);
  return rows;
}

/** Per-transport-mode distance and expense stats for a trip */
export async function getTripModeStats(tripId: string) {
  const userId = await requireCurrentUserId();
  const rows = await db
    .select({
      transportMode: segments.transportMode,
      totalDistanceKm: sql<number>`SUM(${segments.distanceKm})`,
      segmentCount: sql<number>`COUNT(*)::int`,
    })
    .from(segments)
    .innerJoin(trips, eq(segments.tripId, trips.id))
    .where(and(eq(segments.tripId, tripId), eq(trips.userId, userId)))
    .groupBy(segments.transportMode);
  return rows;
}

/** Aggregated stats across all trips */
export async function getOverallStats() {
  const userId = await requireCurrentUserId();
  const [totals] = await db
    .select({
      tripCount: sql<number>`COUNT(*)::int`,
      totalSpendPaise: sql<number>`SUM(${trips.totalCostPaise})::int`,
      totalPeople: sql<number>`SUM(${trips.numPeople})::int`,
    })
    .from(trips)
    .where(eq(trips.userId, userId));

  return totals;
}

/** Monthly spend aggregation (last 12 months) */
export async function getMonthlySpend() {
  const userId = await requireCurrentUserId();
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${tripExpenses.createdAt}, 'YYYY-MM')`,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(tripExpenses)
    .innerJoin(trips, eq(tripExpenses.tripId, trips.id))
    .where(
      and(
        sql`${tripExpenses.createdAt} >= NOW() - INTERVAL '12 months'`,
        eq(trips.userId, userId)
      )
    )
    .groupBy(sql`TO_CHAR(${tripExpenses.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${tripExpenses.createdAt}, 'YYYY-MM')`);
  return rows;
}

/** Top 5 most expensive completed trips */
export async function getTopTrips() {
  const userId = await requireCurrentUserId();
  return db
    .select({
      id: trips.id,
      title: trips.title,
      totalCostPaise: trips.totalCostPaise,
      numPeople: trips.numPeople,
      startDate: trips.startDate,
      endDate: trips.endDate,
    })
    .from(trips)
    .where(and(eq(trips.status, "COMPLETED"), eq(trips.userId, userId)))
    .orderBy(desc(trips.totalCostPaise))
    .limit(5);
}

/** Wallet balance summary (all wallets) */
export async function getWalletBalanceSummary() {
  const userId = await requireCurrentUserId();
  const rows = await db
    .select({
      id: wallets.id,
      name: wallets.name,
      type: wallets.type,
      balancePaise: wallets.balancePaise,
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .orderBy(desc(wallets.balancePaise));
  return rows;
}

/** Per-category spend across all trips */
export async function getAllCategorySpend() {
  const userId = await requireCurrentUserId();
  const rows = await db
    .select({
      category: tripExpenses.category,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(tripExpenses)
    .innerJoin(trips, eq(tripExpenses.tripId, trips.id))
    .where(eq(trips.userId, userId))
    .groupBy(tripExpenses.category)
    .orderBy(sql`SUM(${tripExpenses.amountPaise}) DESC`);
  return rows;
}
