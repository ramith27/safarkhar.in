"use client";

import Link from "next/link";
import { useState } from "react";
import { startTrip, endTrip, deleteTrip } from "@/lib/actions/trips";
import { deleteSegment, patchSegment } from "@/lib/actions/segments";
import { deleteExpense } from "@/lib/actions/expenses";
import {
  formatRupees,
  transportModeLabel,
  transportModeIcon,
  expenseCategoryIcon,
  expenseCategoryLabel,
  paymentMethodLabel,
  tripStatusColor,
} from "@/lib/utils/format";
import { Trip, Segment, TripExpense, TripWallet, Wallet } from "@/lib/db/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  ArrowLeft,
  Play,
  CheckCircle,
  Trash2,
  Map,
  Wallet as WalletIcon,
  Receipt,
  Navigation,
  Zap,
  BatteryCharging,
  Pencil,
} from "lucide-react";
import { EditTripDialog } from "./edit-trip-dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SegmentWithExpenses = Segment & {
  vehicle?: { name: string; type?: string } | null;
  expenses?: (TripExpense & { wallet?: Wallet | null })[];
};

type TripWithRelations = Trip & {
  segments: SegmentWithExpenses[];
  expenses: (TripExpense & { wallet?: Wallet | null; segment?: Segment | null })[];
  tripWallets: (TripWallet & { wallet: Wallet })[];
};

interface TripDetailClientProps {
  trip: TripWithRelations;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const STOP_ICONS: Record<string, string> = {
  CHARGING: "🔌",
  FUEL: "⛽",
  FOOD: "🍽",
  STAY: "🏨",
  REST: "☕",
  OTHER: "📍",
};
const STOP_LABELS: Record<string, string> = {
  CHARGING: "Charging Stop",
  FUEL: "Fuel Stop",
  FOOD: "Food Break",
  STAY: "Overnight Stay",
  REST: "Rest Break",
  OTHER: "Stop",
};

// ─── Component ──────────────────────────────────────────────────────────────────

export function TripDetailClient({ trip }: TripDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Edit trip dialog
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Start Trip dialog
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [initOdometer, setInitOdometer] = useState("");
  const [initBattery, setInitBattery] = useState("");
  const [initRange, setInitRange] = useState("");

  // Charging done dialog
  const [chargingSegId, setChargingSegId] = useState<string | null>(null);
  const [afterBattery, setAfterBattery] = useState("");
  const [afterRange, setAfterRange] = useState("");
  const [chargingLoading, setChargingLoading] = useState(false);

  async function handleStartConfirm() {
    setLoading(true);
    const opts = {
      initialOdometerKm: initOdometer ? parseInt(initOdometer, 10) : null,
      initialBatteryPct: initBattery ? parseFloat(initBattery) : null,
      initialDisplayedRangeKm: initRange ? parseFloat(initRange) : null,
    };
    const result = await startTrip(trip.id, opts);
    setLoading(false);
    if (result.success) {
      setShowStartDialog(false);
      toast.success("Trip started!");
    } else {
      toast.error((result as { error?: string }).error ?? "Failed to start trip");
    }
  }

  async function handleEnd() {
    if (!confirm("End this trip? Wallet balances will be snapshotted.")) return;
    setLoading(true);
    const result = await endTrip(trip.id);
    setLoading(false);
    if (result.success) toast.success("Trip completed!");
    else toast.error((result as { error?: string }).error ?? "Failed to end trip");
  }

  async function handleDelete() {
    if (!confirm("Delete this trip and all its data?")) return;
    const result = await deleteTrip(trip.id);
    if (result.success) {
      toast.success("Trip deleted");
      router.push("/trips");
    } else {
      toast.error("Failed to delete trip");
    }
  }

  async function handleDeleteSegment(segmentId: string) {
    if (!confirm("Remove this segment?")) return;
    const result = await deleteSegment(segmentId, trip.id);
    if (result.success) toast.success("Removed");
    else toast.error("Failed to remove");
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!confirm("Remove this expense?")) return;
    const result = await deleteExpense(expenseId, trip.id);
    if (result.success) toast.success("Expense removed");
    else toast.error("Failed to remove expense");
  }

  async function handleChargingDone() {
    if (!chargingSegId) return;
    setChargingLoading(true);
    const result = await patchSegment(
      chargingSegId,
      {
        endBatteryPct: afterBattery ? parseFloat(afterBattery) : null,
        displayedRangeKm: afterRange ? parseFloat(afterRange) : null,
      },
      trip.id
    );
    setChargingLoading(false);
    if (result.success) {
      setChargingSegId(null);
      setAfterBattery("");
      setAfterRange("");
      toast.success("Charging session updated!");
    } else {
      toast.error("Failed to update");
    }
  }

  const isActive = trip.status === "ACTIVE";
  const isPlanning = trip.status === "PLANNING";
  const isCompleted = trip.status === "COMPLETED";

  return (
    <div className="flex flex-col min-h-screen max-w-2xl md:max-w-4xl mx-auto">
      {/* ── Sticky mobile header ────────────────────────────────────────── */}
      <div className="sticky top-[57px] md:top-0 z-20 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0 -ml-2" onClick={() => router.push("/trips")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base truncate">{trip.title}</h1>
              <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 h-4 ${tripStatusColor(trip.status)}`}>
                {trip.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs truncate">
              {trip.startLocation}{trip.endLocation ? ` → ${trip.endLocation}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowEditDialog(true)}
            title="Edit trip"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {isPlanning && (
            <Button size="sm" onClick={() => setShowStartDialog(true)} disabled={loading} className="h-8 text-xs">
              <Play className="mr-1 h-3.5 w-3.5" /> Start
            </Button>
          )}
          {isActive && (
            <Button size="sm" variant="outline" onClick={handleEnd} disabled={loading} className="h-8 text-xs">
              <CheckCircle className="mr-1 h-3.5 w-3.5" /> End
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 md:px-6 space-y-5">
      {/* ── Trip meta ──────────────────────────────────────────────────── */}
      <div className="text-sm text-muted-foreground space-y-0.5">
        <p>{trip.startDate}{trip.endDate ? ` – ${trip.endDate}` : ""}{trip.numPeople > 1 ? ` · ${trip.numPeople} people` : ""}</p>
        {trip.primaryMode && (
          <p className="flex items-center gap-1.5">
            <span>{transportModeIcon(trip.primaryMode)}</span>
            <span>{transportModeLabel(trip.primaryMode)}</span>
          </p>
        )}
        {(trip.initialOdometerKm != null || trip.initialBatteryPct != null) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            <span>📍 Start readings:</span>
            {trip.initialOdometerKm != null && <span>📟 {trip.initialOdometerKm.toLocaleString()} km</span>}
            {trip.initialBatteryPct != null && <span>🔋 {trip.initialBatteryPct}%</span>}
            {trip.initialDisplayedRangeKm != null && <span>🔦 {trip.initialDisplayedRangeKm} km range</span>}
          </div>
        )}
      </div>

      {/* ── Edit Trip dialog ─────────────────────────────────────────────── */}
      <EditTripDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        trip={trip}
      />

      {/* ── Start Trip dialog ───────────────────────────────────────────── */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Trip</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter current vehicle readings (optional) to track your EV or fuel journey.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Current odometer (km)</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                className="mt-1"
                value={initOdometer}
                onChange={(e) => setInitOdometer(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Battery % (EV)</label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 85"
                className="mt-1"
                value={initBattery}
                onChange={(e) => setInitBattery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Displayed range (km) (EV)</label>
              <Input
                type="number"
                placeholder="e.g. 320"
                className="mt-1"
                value={initRange}
                onChange={(e) => setInitRange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartConfirm} disabled={loading}>
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Charging Done dialog ────────────────────────────────────────── */}
      <Dialog
        open={!!chargingSegId}
        onOpenChange={(open) => !open && setChargingSegId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <BatteryCharging className="inline mr-2 h-4 w-4" />
              Charging Done
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter the readings after charging is complete.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Battery after charging (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 95"
                className="mt-1"
                value={afterBattery}
                onChange={(e) => setAfterBattery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Displayed range (km)</label>
              <Input
                type="number"
                placeholder="e.g. 330"
                className="mt-1"
                value={afterRange}
                onChange={(e) => setAfterRange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChargingSegId(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleChargingDone} disabled={chargingLoading}>
              <CheckCircle className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cost</p>
            <p className="text-xl font-bold mt-1">{formatRupees(trip.totalCostPaise)}</p>
          </CardContent>
        </Card>
        {trip.numPeople > 1 && (
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Per Person</p>
              <p className="text-xl font-bold mt-1">
                {formatRupees(Math.round(trip.totalCostPaise / trip.numPeople))}
              </p>
            </CardContent>
          </Card>
        )}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Segments</p>
            <p className="text-xl font-bold mt-1">{trip.segments.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Expenses</p>
            <p className="text-xl font-bold mt-1">{trip.expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="timeline">
        <TabsList className="w-full">
          <TabsTrigger value="timeline" className="flex-1">
            <Map className="mr-1.5 h-3.5 w-3.5" /> Timeline
            <span className="ml-1 text-[10px] opacity-70">({trip.segments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex-1">
            <Receipt className="mr-1.5 h-3.5 w-3.5" /> Expenses
            <span className="ml-1 text-[10px] opacity-70">({trip.expenses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex-1">
            <WalletIcon className="mr-1.5 h-3.5 w-3.5" /> Wallets
            <span className="ml-1 text-[10px] opacity-70">({trip.tripWallets.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Timeline tab ──────────────────────────────────────────── */}
        <TabsContent value="timeline" className="space-y-3 mt-4">
          {(isActive || isPlanning) && (
            <div className="grid grid-cols-3 gap-2">
              <Link href={`/trips/${trip.id}/segments/new`} className="block">
                <Button size="sm" variant="outline" className="w-full h-12 flex-col gap-0.5 text-[11px] py-1">
                  <Navigation className="h-4 w-4" />
                  Add Drive
                </Button>
              </Link>
              <Link href={`/trips/${trip.id}/segments/new?mode=stop`} className="block">
                <Button size="sm" variant="outline" className="w-full h-12 flex-col gap-0.5 text-[11px] py-1">
                  <Zap className="h-4 w-4" />
                  Add Stop
                </Button>
              </Link>
              <Link href={`/trips/${trip.id}/expenses/new`} className="block">
                <Button size="sm" variant="outline" className="w-full h-12 flex-col gap-0.5 text-[11px] py-1">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            </div>
          )}

          {trip.segments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Navigation className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">No segments yet</p>
              <p className="text-sm mt-1">Add a drive or stop to get started</p>
            </div>
          ) : (
            trip.segments.map((seg, i) => {
              const isStop = !!seg.stopType;
              const stopIcon = isStop ? STOP_ICONS[seg.stopType!] ?? "📍" : null;
              const stopLabel = isStop ? STOP_LABELS[seg.stopType!] ?? "Stop" : null;
              const chargingInProgress =
                seg.stopType === "CHARGING" && seg.endBatteryPct == null;
              const segExpenses = seg.expenses ?? [];

              return (
                <Card
                  key={seg.id}
                  className={`overflow-hidden rounded-2xl ${isStop ? "border-l-4 border-l-indigo-400" : "border-l-4 border-l-slate-200 dark:border-l-slate-700"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {/* Title row */}
                        <div className="flex items-center gap-2 text-sm font-medium flex-wrap">
                          <span className="text-muted-foreground">#{i + 1}</span>
                          {isStop ? (
                            <>
                              <span>{stopIcon}</span>
                              <span>{stopLabel}</span>
                              {chargingInProgress && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-orange-600 border-orange-300"
                                >
                                  In progress
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <span>{transportModeIcon(seg.transportMode)}</span>
                              <span>{transportModeLabel(seg.transportMode)}</span>
                            </>
                          )}
                        </div>

                        {/* Location */}
                        <p className="mt-1 font-semibold">
                          {isStop
                            ? seg.fromLocation
                            : `${seg.fromLocation}${seg.toLocation ? ` → ${seg.toLocation}` : ""}`}
                        </p>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          {seg.distanceKm && !isStop && (
                            <span>📏 {seg.distanceKm} km</span>
                          )}
                          {seg.vehicle && <span>🚗 {seg.vehicle.name}</span>}
                          {seg.startTime && (
                            <span>
                              🕐 {seg.startTime.replace("T", " ").slice(0, 16)}
                            </span>
                          )}
                          {seg.carrierName && <span>🏢 {seg.carrierName}</span>}
                          {seg.pnr && <span>🎫 {seg.pnr}</span>}
                        </div>

                        {/* Odometer / energy row */}
                        {(seg.startOdometer != null ||
                          seg.endOdometer != null ||
                          seg.startBatteryPct != null ||
                          seg.endBatteryPct != null ||
                          seg.startFuelLevelLitres != null ||
                          seg.endFuelLevelLitres != null ||
                          seg.displayedRangeKm != null) && (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                            {seg.startOdometer != null && (
                              <span>
                                📟{" "}
                                {isStop
                                  ? `${seg.startOdometer.toLocaleString()} km`
                                  : `${seg.startOdometer.toLocaleString()} → ${
                                      seg.endOdometer != null
                                        ? seg.endOdometer.toLocaleString()
                                        : "?"
                                    } km`}
                              </span>
                            )}
                            {seg.startBatteryPct != null && (
                              <span>
                                🔋{" "}
                                {seg.endBatteryPct != null
                                  ? `${seg.startBatteryPct}% → ${seg.endBatteryPct}%`
                                  : `${seg.startBatteryPct}%`}
                              </span>
                            )}
                            {seg.displayedRangeKm != null && (
                              <span>🔦 {seg.displayedRangeKm} km range</span>
                            )}
                            {seg.startFuelLevelLitres != null && (
                              <span>
                                ⛽{" "}
                                {seg.endFuelLevelLitres != null
                                  ? `${seg.startFuelLevelLitres} L → ${seg.endFuelLevelLitres} L`
                                  : `${seg.startFuelLevelLitres} L`}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Charging in-progress CTA */}
                        {chargingInProgress && (isActive || isPlanning) && (
                          <button
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
                            onClick={() => {
                              setChargingSegId(seg.id);
                              setAfterBattery("");
                              setAfterRange("");
                            }}
                          >
                            <BatteryCharging className="h-3.5 w-3.5" />
                            Mark Charging Done
                          </button>
                        )}

                        {/* Segment expenses */}
                        {segExpenses.length > 0 && (
                          <div className="mt-3 space-y-1.5 border-t pt-2">
                            {segExpenses.map((exp) => (
                              <div
                                key={exp.id}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="flex items-center gap-1.5 min-w-0">
                                  <span>{expenseCategoryIcon(exp.category)}</span>
                                  <span className="font-medium">
                                    {expenseCategoryLabel(exp.category)}
                                  </span>
                                  {exp.vendorName && (
                                    <span className="text-muted-foreground truncate">
                                      — {exp.vendorName}
                                    </span>
                                  )}
                                  {exp.wallet && (
                                    <span className="text-muted-foreground">
                                      💳 {exp.wallet.name}
                                    </span>
                                  )}
                                </span>
                                <span className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className="font-semibold">
                                    {formatRupees(exp.amountPaise)}
                                  </span>
                                  {(isActive || isPlanning) && (
                                    <button
                                      className="text-destructive hover:opacity-70"
                                      onClick={() => handleDeleteExpense(exp.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions column */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {(isActive || isPlanning) && (
                          <>
                            <Link
                              href={`/trips/${trip.id}/expenses/new?segmentId=${seg.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs px-2.5 rounded-xl"
                              >
                                <Plus className="mr-1 h-3 w-3" /> Expense
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive/60 hover:text-destructive"
                              onClick={() => handleDeleteSegment(seg.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ── All Expenses tab ───────────────────────────────────────── */}
        <TabsContent value="expenses" className="space-y-3 mt-4">
          {(isActive || isPlanning) && (
            <Link href={`/trips/${trip.id}/expenses/new`} className="block">
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </Link>
          )}
          {trip.expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Receipt className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">No expenses yet</p>
            </div>
          ) : (
            trip.expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{expenseCategoryIcon(exp.category)}</span>
                    <span className="font-medium text-sm">
                      {expenseCategoryLabel(exp.category)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {paymentMethodLabel(exp.paymentMethod)}
                    </Badge>
                    {exp.segment && (
                      <Badge variant="secondary" className="text-xs">
                        #{trip.segments.findIndex((s) => s.id === exp.segment?.id) + 1}
                      </Badge>
                    )}
                  </div>
                  {exp.vendorName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exp.vendorName}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-xs text-muted-foreground">{exp.description}</p>
                  )}
                  {exp.wallet && (
                    <p className="text-xs text-muted-foreground">
                      💳 {exp.wallet.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatRupees(exp.amountPaise)}</p>
                    {exp.numPeople > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {formatRupees(Math.round(exp.amountPaise / exp.numPeople))} /
                        person
                      </p>
                    )}
                  </div>
                  {(isActive || isPlanning) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteExpense(exp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {trip.expenses.length > 0 && (
            <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatRupees(trip.totalCostPaise)}</span>
              </div>
              {trip.numPeople > 1 && (
                <div className="flex justify-between text-muted-foreground mt-1">
                  <span>Per person ({trip.numPeople})</span>
                  <span>
                    {formatRupees(Math.round(trip.totalCostPaise / trip.numPeople))}
                  </span>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Wallets tab ────────────────────────────────────────────── */}
        <TabsContent value="wallets" className="space-y-3 mt-4">
          {trip.tripWallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <WalletIcon className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">No wallets linked</p>
            </div>
          ) : (
            trip.tripWallets.map((tw) => (
              <Card key={tw.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{tw.wallet.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tw.wallet.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Start: </span>
                        <span className="font-medium">
                          {formatRupees(tw.balanceAtStartPaise)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-medium">
                          {formatRupees(tw.wallet.balancePaise)}
                        </span>
                      </div>
                      {tw.balanceAtEndPaise !== null && (
                        <div>
                          <span className="text-muted-foreground">End: </span>
                          <span className="font-medium">
                            {formatRupees(tw.balanceAtEndPaise)}
                          </span>
                        </div>
                      )}
                      {isCompleted && tw.balanceAtEndPaise !== null && (
                        <div className="text-xs text-muted-foreground">
                          Spent:{" "}
                          {formatRupees(tw.balanceAtStartPaise - tw.balanceAtEndPaise)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {trip.notes && (
        <>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Notes
            </p>
            <p className="text-sm">{trip.notes}</p>
          </div>
        </>
      )}
      </div>{/* end inner padding div */}
    </div>
  );
}
