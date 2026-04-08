import { getTrip } from "@/lib/actions/trips";
import { getVehicles } from "@/lib/actions/vehicles";
import { AddSegmentForm } from "@/components/trips/add-segment-form";
import { notFound } from "next/navigation";

export default async function NewSegmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [trip, vehicles] = await Promise.all([getTrip(id), getVehicles()]);
  if (!trip) notFound();

  const defaultMode = sp.mode === "stop" ? "stop" : "drive";

  // ── Build last checkpoint from personal-vehicle segments ──────────────────
  const pvSegs = trip.segments.filter((s) => s.transportMode === "PERSONAL_VEHICLE");
  const lastPvSeg = pvSegs.at(-1);
  const lastSeg = trip.segments.at(-1);

  let startOdometer: number | null = trip.initialOdometerKm ?? null;
  let startBatteryPct: number | null = trip.initialBatteryPct ?? null;
  let startFuelLevelLitres: number | null = null;
  let displayedRangeKm: number | null = trip.initialDisplayedRangeKm ?? null;

  if (lastPvSeg) {
    if (lastPvSeg.stopType) {
      // At a stop: odometer = startOdometer (same location); use end battery if done
      startOdometer =
        lastPvSeg.endOdometer ?? lastPvSeg.startOdometer ?? startOdometer;
      startBatteryPct =
        lastPvSeg.endBatteryPct ?? lastPvSeg.startBatteryPct ?? startBatteryPct;
      startFuelLevelLitres =
        lastPvSeg.endFuelLevelLitres ??
        lastPvSeg.startFuelLevelLitres ??
        startFuelLevelLitres;
      displayedRangeKm = lastPvSeg.displayedRangeKm ?? displayedRangeKm;
    } else {
      // End of a drive
      startOdometer = lastPvSeg.endOdometer ?? startOdometer;
      startBatteryPct = lastPvSeg.endBatteryPct ?? startBatteryPct;
      startFuelLevelLitres = lastPvSeg.endFuelLevelLitres ?? startFuelLevelLitres;
      displayedRangeKm = lastPvSeg.displayedRangeKm ?? displayedRangeKm;
    }
  }

  // From location: last PV stop location > last drive destination > trip start
  const fromLocation = lastPvSeg?.stopType
    ? lastPvSeg.fromLocation
    : (lastPvSeg?.toLocation ?? lastSeg?.toLocation ?? trip.startLocation);

  const lastCheckpoint =
    startOdometer != null ||
    startBatteryPct != null ||
    startFuelLevelLitres != null
      ? { fromLocation, startOdometer, startBatteryPct, startFuelLevelLitres, displayedRangeKm }
      : { fromLocation, startOdometer: null, startBatteryPct: null, startFuelLevelLitres: null, displayedRangeKm: null };

  return (
    <AddSegmentForm
      tripId={id}
      vehicles={vehicles}
      lastCheckpoint={lastCheckpoint}
      defaultMode={defaultMode}
    />
  );
}
