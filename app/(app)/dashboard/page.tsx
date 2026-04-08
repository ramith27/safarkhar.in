import Link from "next/link";
import { getTrips } from "@/lib/actions/trips";
import { getWallets } from "@/lib/actions/wallets";
import { getVehicles } from "@/lib/actions/vehicles";
import { getOverallStats } from "@/lib/actions/reports";
import {
  formatRupees,
  tripStatusColor,
  transportModeIcon,
  transportModeLabel,
} from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Map,
  Car,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  CreditCard,
  MapPin,
} from "lucide-react";

export default async function DashboardPage() {
  const [trips, wallets, vehicles, stats] = await Promise.all([
    getTrips(),
    getWallets(),
    getVehicles(),
    getOverallStats(),
  ]);

  const activeTrips = trips.filter((t) => t.status === "ACTIVE");
  const recentTrips = trips.slice(0, 8);
  const totalWalletBalance = wallets.reduce((s, w) => s + w.balancePaise, 0);

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 space-y-5 max-w-7xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your travel expense overview
          </p>
        </div>
        <Link href="/trips/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Trip
          </Button>
        </Link>
      </div>

      {/* ── Stats — 2 col mobile, 4 col desktop ──────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Trips
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                <Map className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.tripCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTrips.length > 0
                ? `${activeTrips.length} active`
                : "No active trips"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Spent
              </span>
              <div className="h-8 w-8 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold leading-tight">
              {formatRupees(stats?.totalSpendPaise ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              across all trips
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Wallet Balance
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold leading-tight">
              {formatRupees(totalWalletBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Vehicles
              </span>
              <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                <Car className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">{vehicles.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              registered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main content — stacked mobile, 2-col desktop ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Left column: active trips + quick actions */}
        <div className="md:col-span-1 space-y-5">

          {/* Active trips */}
          {activeTrips.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Right Now
              </h2>
              <div className="space-y-2">
                {activeTrips.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <div className="flex items-center gap-3 rounded-2xl border-l-4 border-l-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-3 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/30 transition-colors active:scale-[0.99]">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {trip.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          <MapPin className="inline h-3 w-3 mr-0.5" />
                          {trip.startLocation}
                          {trip.endLocation ? ` → ${trip.endLocation}` : ""}
                        </p>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {formatRupees(trip.totalCostPaise)} spent
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold mb-2.5">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/trips/new" className="block">
                <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 hover:bg-accent transition-colors text-center active:scale-[0.98]">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium">New Trip</span>
                </div>
              </Link>
              <Link href="/wallets" className="block">
                <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 hover:bg-accent transition-colors text-center active:scale-[0.98]">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium">Wallets</span>
                </div>
              </Link>
              <Link href="/vehicles" className="block">
                <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 hover:bg-accent transition-colors text-center active:scale-[0.98]">
                  <div className="h-10 w-10 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <Car className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-xs font-medium">Vehicles</span>
                </div>
              </Link>
              <Link href="/trips" className="block">
                <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 hover:bg-accent transition-colors text-center active:scale-[0.98]">
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium">All Trips</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: recent trips (takes 2/3 on desktop) */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-semibold">Recent Trips</h2>
            <Link href="/trips">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                <Map className="h-12 w-12 mb-3 opacity-20" />
                <p className="font-medium">No trips yet</p>
                <p className="text-sm mt-1">Plan a new trip to get started</p>
                <Link href="/trips/new" className="mt-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Trip
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-2xl border overflow-hidden">
              {/* Desktop table header */}
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-2.5 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Trip</span>
                <span>Mode</span>
                <span>Cost</span>
                <span>Status</span>
              </div>

              <div className="divide-y">
                {recentTrips.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    {/* Mobile row */}
                    <div className="flex md:hidden items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors active:scale-[0.99]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">
                            {trip.title}
                          </p>
                          {trip.primaryMode && (
                            <span className="text-[11px] text-muted-foreground">
                              {transportModeIcon(trip.primaryMode)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {trip.startDate}
                          {trip.segments?.length
                            ? ` · ${trip.segments.length} seg`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <p className="font-semibold text-sm">
                          {formatRupees(trip.totalCostPaise)}
                        </p>
                        <Badge
                          variant={tripStatusColor(trip.status)}
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {trip.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-accent transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {trip.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {trip.startLocation}
                          {trip.endLocation ? ` → ${trip.endLocation}` : ""}
                          {" · "}
                          {trip.startDate}
                          {trip.segments?.length
                            ? ` · ${trip.segments.length} segment${trip.segments.length !== 1 ? "s" : ""}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground w-28 text-center">
                        {trip.primaryMode ? (
                          <span title={transportModeLabel(trip.primaryMode)}>
                            {transportModeIcon(trip.primaryMode)}{" "}
                            <span className="text-xs">
                              {transportModeLabel(trip.primaryMode)}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </span>
                      <span className="font-semibold text-sm w-24 text-right">
                        {formatRupees(trip.totalCostPaise)}
                      </span>
                      <Badge
                        variant={tripStatusColor(trip.status)}
                        className="text-[10px] px-1.5 py-0 h-5 w-24 justify-center"
                      >
                        {trip.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


