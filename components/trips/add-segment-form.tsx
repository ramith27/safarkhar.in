"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { segmentSchema, SegmentFormValues } from "@/lib/validations/segment";
import { createSegment } from "@/lib/actions/segments";
import { Vehicle } from "@/lib/db/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Gauge, Zap, Navigation } from "lucide-react";
import { useState } from "react";

const TRANSPORT_MODES = [
  { value: "PERSONAL_VEHICLE", label: "🚗 Personal Vehicle" },
  { value: "FLIGHT", label: "✈️ Flight" },
  { value: "TRAIN", label: "🚂 Train" },
  { value: "BUS", label: "🚌 Bus" },
  { value: "TAXI", label: "🚕 Taxi / Cab" },
  { value: "AUTO", label: "🛺 Auto Rickshaw" },
  { value: "FERRY", label: "⛴ Ferry" },
  { value: "METRO", label: "🚇 Metro" },
  { value: "WALK", label: "🚶 Walk" },
  { value: "OTHER", label: "🚀 Other" },
];

const STOP_TYPES = [
  { value: "CHARGING", label: "🔌 EV Charging" },
  { value: "FUEL", label: "⛽ Fuel Fill" },
  { value: "FOOD", label: "🍽 Food / Drinks" },
  { value: "STAY", label: "🏨 Overnight Stay" },
  { value: "REST", label: "☕ Rest Break" },
  { value: "OTHER", label: "📍 Other" },
];

const TICKET_CLASSES = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First Class" },
  { value: "SLEEPER", label: "Sleeper" },
  { value: "AC_3T", label: "AC 3 Tier" },
  { value: "AC_2T", label: "AC 2 Tier" },
  { value: "AC_1T", label: "AC 1 Tier" },
  { value: "CHAIR_CAR", label: "Chair Car" },
  { value: "GENERAL", label: "General" },
];

interface LastCheckpoint {
  fromLocation: string;
  startOdometer?: number | null;
  startBatteryPct?: number | null;
  startFuelLevelLitres?: number | null;
  displayedRangeKm?: number | null;
}

interface AddSegmentFormProps {
  tripId: string;
  vehicles: Vehicle[];
  lastCheckpoint?: LastCheckpoint;
  defaultMode?: "drive" | "stop";
}

export function AddSegmentForm({
  tripId,
  vehicles,
  lastCheckpoint,
  defaultMode = "drive",
}: AddSegmentFormProps) {
  const router = useRouter();
  const [legType, setLegType] = useState<"drive" | "stop">(defaultMode);

  const hasCheckpoint =
    lastCheckpoint != null &&
    (lastCheckpoint.startOdometer != null ||
      lastCheckpoint.startBatteryPct != null ||
      lastCheckpoint.startFuelLevelLitres != null);

  const form = useForm<SegmentFormValues>({
    resolver: zodResolver(segmentSchema) as never,
    defaultValues: {
      tripId,
      transportMode: "PERSONAL_VEHICLE",
      fromLocation: lastCheckpoint?.fromLocation ?? "",
      toLocation: "",
      startTime: "",
      endTime: "",
      distanceKm: null,
      vehicleId: null,
      startOdometer: lastCheckpoint?.startOdometer ?? null,
      endOdometer: null,
      startBatteryPct: lastCheckpoint?.startBatteryPct ?? null,
      endBatteryPct: null,
      startFuelLevelLitres: lastCheckpoint?.startFuelLevelLitres ?? null,
      endFuelLevelLitres: null,
      displayedRangeKm: null,
      stopType: defaultMode === "stop" ? "CHARGING" : null,
      pnr: "",
      carrierName: "",
      serviceNumber: "",
      ticketClass: null,
      notes: "",
    },
  });

  const mode = form.watch("transportMode");
  const vehicleId = form.watch("vehicleId");
  const stopType = form.watch("stopType");
  const isPersonal = mode === "PERSONAL_VEHICLE";
  const isCarrier = !isPersonal && mode !== "WALK" && mode !== "OTHER";

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const isEV = selectedVehicle?.type === "EV";
  const isICE = selectedVehicle?.type === "ICE";
  const isHybrid = selectedVehicle?.type === "HYBRID";
  // Show battery fields if EV vehicle selected or if no vehicle but previous battery exists
  const showBattery =
    isEV || (!selectedVehicle && lastCheckpoint?.startBatteryPct != null);
  const showFuel = isICE || isHybrid;

  function handleEndOdometerChange(val: number | null) {
    const startOdo = form.getValues("startOdometer");
    if (val != null && startOdo != null && val > startOdo) {
      form.setValue("distanceKm", val - startOdo);
    }
  }

  async function onSubmit(data: SegmentFormValues) {
    if (legType === "stop") {
      // Stops: toLocation = fromLocation, no distance driven
      data.toLocation = data.fromLocation;
      data.distanceKm = null;
      data.endOdometer = data.startOdometer;
    }
    const result = await createSegment(data);
    if (result.success) {
      toast.success(legType === "stop" ? "Stop added" : "Drive added");
      router.push(`/trips/${tripId}`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  }

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/trips/${tripId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {legType === "stop" ? "Add Stop" : "Add Drive"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {legType === "stop"
              ? "Record a charging session, meal, fuel, or rest break"
              : "Record a driving leg of your journey"}
          </p>
        </div>
      </div>

      {/* Drive / Stop toggle */}
      <div className="flex gap-1 rounded-lg border p-1 bg-muted/30">
        <button
          type="button"
          onClick={() => {
            setLegType("drive");
            form.setValue("stopType", null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            legType === "drive"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Navigation className="h-4 w-4" /> Drive
        </button>
        <button
          type="button"
          onClick={() => {
            setLegType("stop");
            form.setValue("stopType", "CHARGING");
            form.setValue("transportMode", "PERSONAL_VEHICLE");
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            legType === "stop"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" /> Stop
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* ══════════════════════════════════════════════════════ STOP */}
          {legType === "stop" && (
            <>
              <FormField
                control={form.control}
                name="stopType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "CHARGING"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {(v: string | null) => v ? (STOP_TYPES.find(t => t.value === v)?.label ?? v) : "Select stop type"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STOP_TYPES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mysore Tata Power EV Station" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startOdometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Current odometer (km)
                      {hasCheckpoint && lastCheckpoint!.startOdometer != null && (
                        <span className="ml-1 font-normal text-muted-foreground text-xs">
                          — last: {lastCheckpoint!.startOdometer.toLocaleString()} km
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50150"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? e.target.valueAsNumber : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Charging session */}
              {stopType === "CHARGING" && (
                <div className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Charging Session
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="startBatteryPct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Battery before (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="22"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? e.target.valueAsNumber : null
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endBatteryPct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Battery after (%)
                            <span className="ml-1 font-normal text-muted-foreground text-xs">
                              — optional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="95"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? e.target.valueAsNumber : null
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="displayedRangeKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Displayed range after charging (km)
                          <span className="ml-1 font-normal text-muted-foreground text-xs">
                            — optional
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="330"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? e.target.valueAsNumber : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Fuel stop */}
              {stopType === "FUEL" && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startFuelLevelLitres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel before fill (L)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="8"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? e.target.valueAsNumber : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endFuelLevelLitres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel after fill (L)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="40"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? e.target.valueAsNumber : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any notes..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* ══════════════════════════════════════════════════════ DRIVE */}
          {legType === "drive" && (
            <>
              <FormField
                control={form.control}
                name="transportMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Mode *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {(v: string | null) => v ? (TRANSPORT_MODES.find(m => m.value === v)?.label ?? v) : "Select mode"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSPORT_MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fromLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From *</FormLabel>
                      <FormControl>
                        <Input placeholder="Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input placeholder="Mysore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Distance — non-PV modes only */}
              {!isPersonal && (
                <FormField
                  control={form.control}
                  name="distanceKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="350"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? e.target.valueAsNumber : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* ── Personal vehicle ─────────────────────────────── */}
              {isPersonal && (
                <>
                  {vehicles.length > 0 && (
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {(v: string | null) => {
                                    if (!v) return "Select vehicle (optional)";
                                    const veh = vehicles.find(x => x.id === v);
                                    return veh ? `${veh.name}${veh.registrationNumber ? ` (${veh.registrationNumber})` : ""}` : v;
                                  }}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {vehicles.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.name}{" "}
                                  {v.registrationNumber
                                    ? `(${v.registrationNumber})`
                                    : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Checkpoint banner */}
                  {hasCheckpoint && (
                    <div className="flex items-start gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                      <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                          Continuing from
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                          {lastCheckpoint!.startOdometer != null && (
                            <span>
                              Odo:{" "}
                              <span className="font-semibold">
                                {lastCheckpoint!.startOdometer.toLocaleString()} km
                              </span>
                            </span>
                          )}
                          {lastCheckpoint!.startBatteryPct != null && (
                            <span>
                              Battery:{" "}
                              <span className="font-semibold">
                                {lastCheckpoint!.startBatteryPct}%
                              </span>
                            </span>
                          )}
                          {lastCheckpoint!.startFuelLevelLitres != null && (
                            <span>
                              Fuel:{" "}
                              <span className="font-semibold">
                                {lastCheckpoint!.startFuelLevelLitres} L
                              </span>
                            </span>
                          )}
                          {lastCheckpoint!.displayedRangeKm != null && (
                            <span>
                              Range:{" "}
                              <span className="font-semibold">
                                {lastCheckpoint!.displayedRangeKm} km
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Start odo when no checkpoint */}
                  {!hasCheckpoint && (
                    <FormField
                      control={form.control}
                      name="startOdometer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting odometer (km)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? e.target.valueAsNumber : null
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Current / end odometer */}
                  <FormField
                    control={form.control}
                    name="endOdometer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Current odometer (km)
                          {hasCheckpoint && (
                            <span className="ml-1 font-normal text-muted-foreground text-xs">
                              — distance auto-computed
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50150"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value
                                ? e.target.valueAsNumber
                                : null;
                              field.onChange(val);
                              handleEndOdometerChange(val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="distanceKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Distance (km)
                          <span className="ml-1 font-normal text-muted-foreground text-xs">
                            {hasCheckpoint
                              ? "— auto-computed, override if needed"
                              : "— optional"}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="150"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? e.target.valueAsNumber : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* EV: battery + displayed range */}
                  {showBattery && (
                    <>
                      {!hasCheckpoint && (
                        <FormField
                          control={form.control}
                          name="startBatteryPct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Starting battery (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="85"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? e.target.valueAsNumber
                                        : null
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="endBatteryPct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Battery at destination (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="58"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? e.target.valueAsNumber
                                        : null
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="displayedRangeKm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Displayed range (km)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="205"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? e.target.valueAsNumber
                                        : null
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* ICE / Hybrid: fuel level */}
                  {showFuel && (
                    <>
                      {!hasCheckpoint && (
                        <FormField
                          control={form.control}
                          name="startFuelLevelLitres"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Starting fuel level (L)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="40"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? e.target.valueAsNumber
                                        : null
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="endFuelLevelLitres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel level at destination (L)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="25"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? e.target.valueAsNumber
                                      : null
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}

              {/* ── Carrier fields ────────────────────────────────── */}
              {isCarrier && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="carrierName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carrier / Operator</FormLabel>
                          <FormControl>
                            <Input placeholder="IndiGo / KSRTC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serviceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flight / Train / Route No.</FormLabel>
                          <FormControl>
                            <Input placeholder="6E-204 / 12628" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="ticketClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {(v: string | null) => v ? (TICKET_CLASSES.find(c => c.value === v)?.label ?? v) : "Select class"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Not specified</SelectItem>
                              {TICKET_CLASSES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pnr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PNR / Booking Ref</FormLabel>
                          <FormControl>
                            <Input placeholder="ABCDEF" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any notes..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push(`/trips/${tripId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
              {form.formState.isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />{" "}
                  {legType === "stop" ? "Add Stop" : "Add Drive"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
