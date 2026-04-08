import { getTrip } from "@/lib/actions/trips";
import { TripDetailClient } from "@/components/trips/trip-detail-client";
import { notFound } from "next/navigation";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();

  return <TripDetailClient trip={trip as Parameters<typeof TripDetailClient>[0]["trip"]} />;
}
