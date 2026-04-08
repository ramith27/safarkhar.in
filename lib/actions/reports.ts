"use server";

import { sql, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips, tripExpenses, segments, wallets } from "@/lib/db/schema";

/** Total spend per expense category for a given trip */
export async function getTripCategoryBreakdown(tripId: string) {
  const rows = await db
    .select({
      category: tripExpenses.category,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(tripExpenses)
    .where(eq(tripExpenses.tripId, tripId))
    .groupBy(tripExpenses.category);
  return rows;
}

/** Per-payment-method breakdown for a trip */
export async function getTripPaymentBreakdown(tripId: string) {
  const rows = await db
    .select({
      paymentMethod: tripExpenses.paymentMethod,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
    })
    .from(tripExpenses)
    .where(eq(tripExpenses.tripId, tripId))
    .groupBy(tripExpenses.paymentMethod);
  return rows;
}

/** Per-transport-mode distance and expense stats for a trip */
export async function getTripModeStats(tripId: string) {
  const rows = await db
    .select({
      transportMode: segments.transportMode,
      totalDistanceKm: sql<number>`SUM(${segments.distanceKm})`,
      segmentCount: sql<number>`COUNT(*)::int`,
    })
    .from(segments)
    .where(eq(segments.tripId, tripId))
    .groupBy(segments.transportMode);
  return rows;
}

/** Aggregated stats across all trips */
export async function getOverallStats() {
  const [totals] = await db
    .select({
      tripCount: sql<number>`COUNT(*)::int`,
      totalSpendPaise: sql<number>`SUM(${trips.totalCostPaise})::int`,
      totalPeople: sql<number>`SUM(${trips.numPeople})::int`,
    })
    .from(trips);

  return totals;
}

/** Monthly spend aggregation (last 12 months) */
export async function getMonthlySpend() {
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${tripExpenses.createdAt}, 'YYYY-MM')`,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(tripExpenses)
    .where(
      sql`${tripExpenses.createdAt} >= NOW() - INTERVAL '12 months'`
    )
    .groupBy(sql`TO_CHAR(${tripExpenses.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${tripExpenses.createdAt}, 'YYYY-MM')`);
  return rows;
}

/** Top 5 most expensive completed trips */
export async function getTopTrips() {
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
    .where(eq(trips.status, "COMPLETED"))
    .orderBy(desc(trips.totalCostPaise))
    .limit(5);
}

/** Wallet balance summary (all wallets) */
export async function getWalletBalanceSummary() {
  const rows = await db
    .select({
      id: wallets.id,
      name: wallets.name,
      type: wallets.type,
      balancePaise: wallets.balancePaise,
    })
    .from(wallets)
    .orderBy(desc(wallets.balancePaise));
  return rows;
}

/** Per-category spend across all trips */
export async function getAllCategorySpend() {
  const rows = await db
    .select({
      category: tripExpenses.category,
      totalPaise: sql<number>`SUM(${tripExpenses.amountPaise})::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(tripExpenses)
    .groupBy(tripExpenses.category)
    .orderBy(sql`SUM(${tripExpenses.amountPaise}) DESC`);
  return rows;
}
