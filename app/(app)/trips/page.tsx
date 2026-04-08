import Link from "next/link";
import { getTrips } from "@/lib/actions/trips";
import { formatRupees, tripStatusColor, transportModeIcon, transportModeLabel } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Map, ArrowRight, CalendarDays, Users } from "lucide-react";

const STATUS_BORDER: Record<string, string> = {
  ACTIVE: "border-l-emerald-400",
  PLANNING: "border-l-blue-400",
  COMPLETED: "border-l-gray-300",
  CANCELLED: "border-l-red-300",
};

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 space-y-5 max-w-2xl md:max-w-none mx-auto">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {trips.length} trip{trips.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/trips/new" className="hidden sm:block">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Trip
          </Button>
        </Link>
      </div>

      {/* ── Trips list ───────────────────────────────────────────── */}
      {trips.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Map className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-lg font-semibold text-foreground">No trips yet</p>
            <p className="text-sm mt-1 text-center max-w-xs">
              Plan a new trip to start tracking your travel expenses
            </p>
            <Link href="/trips/new" className="mt-5">
              <Button size="lg" className="rounded-xl px-8">
                <Plus className="mr-2 h-4 w-4" /> Create Trip
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <div
                className={`flex items-center gap-3 rounded-2xl border-l-4 border bg-card px-4 py-4 hover:bg-accent active:scale-[0.99] transition-all cursor-pointer ${STATUS_BORDER[trip.status] ?? "border-l-gray-200"}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{trip.title}</p>
                    {trip.primaryMode && (
                      <span className="text-[11px] text-muted-foreground">
                        {transportModeIcon(trip.primaryMode)} {transportModeLabel(trip.primaryMode)}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 ${tripStatusColor(trip.status)}`}
                    >
                      {trip.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {trip.startLocation}
                    {trip.endLocation ? ` → ${trip.endLocation}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {trip.startDate}
                    </span>
                    {trip.numPeople > 1 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {trip.numPeople}
                      </span>
                    )}
                    {trip.segments?.length > 0 && (
                      <span>
                        🗺 {trip.segments.length}{" "}
                        {trip.segments.length !== 1 ? "stops" : "stop"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="font-bold text-base">
                    {formatRupees(trip.totalCostPaise)}
                  </p>
                  {trip.numPeople > 1 && (
                    <p className="text-[11px] text-muted-foreground">
                      {formatRupees(
                        Math.round(trip.totalCostPaise / trip.numPeople)
                      )}{" "}
                      / person
                    </p>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Floating Action Button (mobile) ──────────────────────── */}
      <Link
        href="/trips/new"
        className="sm:hidden fixed bottom-[72px] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
        aria-label="New Trip"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
