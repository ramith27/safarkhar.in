export const dynamic = "force-dynamic";

import { getTrip } from "@/lib/actions/trips";
import { getWallets } from "@/lib/actions/wallets";
import { getSegmentsForTrip } from "@/lib/actions/segments";
import { AddExpenseForm } from "@/components/trips/add-expense-form";
import { notFound } from "next/navigation";

export default async function NewExpensePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ segmentId?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [trip, wallets, segments] = await Promise.all([
    getTrip(id),
    getWallets(),
    getSegmentsForTrip(id),
  ]);
  if (!trip) notFound();

  const tripWalletIds = new Set(trip.tripWallets?.map((tw) => tw.walletId));
  const tripWallets = wallets.filter((w) => tripWalletIds.has(w.id));
  const allWallets = tripWallets.length > 0 ? tripWallets : wallets;

  return (
    <AddExpenseForm
      tripId={id}
      wallets={allWallets}
      segments={segments}
      defaultSegmentId={sp.segmentId ?? null}
    />
  );
}
