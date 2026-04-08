"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, TripFormValues, TransportMode, TRANSPORT_MODES } from "@/lib/validations/trip";
import { createTrip } from "@/lib/actions/trips";
import { Wallet } from "@/lib/db/schema";
import { formatRupees } from "@/lib/utils/format";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Car,
  Plane,
  TrainFront,
  Bus,
  CarTaxiFront,
  Zap,
  Ship,
  CableCar,
  Footprints,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Trip Details", "Transport Mode", "Assign Wallets", "Review"] as const;

const MODE_OPTIONS: {
  value: TransportMode;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { value: "PERSONAL_VEHICLE", label: "Personal Vehicle", icon: Car, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  { value: "FLIGHT", label: "Flight", icon: Plane, color: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400" },
  { value: "TRAIN", label: "Train", icon: TrainFront, color: "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400" },
  { value: "BUS", label: "Bus", icon: Bus, color: "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400" },
  { value: "TAXI", label: "Taxi / Cab", icon: CarTaxiFront, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400" },
  { value: "AUTO", label: "Auto Rickshaw", icon: Zap, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  { value: "FERRY", label: "Ferry / Boat", icon: Ship, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400" },
  { value: "METRO", label: "Metro / Subway", icon: CableCar, color: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" },
  { value: "WALK", label: "Walk / Hike", icon: Footprints, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  { value: "OTHER", label: "Other", icon: MoreHorizontal, color: "bg-muted text-muted-foreground" },
];

interface CreateTripWizardProps {
  wallets: Wallet[];
}

export function CreateTripWizard({ wallets }: CreateTripWizardProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      startLocation: "",
      endLocation: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      numPeople: 1,
      notes: "",
      walletIds: [],
      primaryMode: null,
    },
  });

  async function handleFinalSubmit(data: TripFormValues) {
    const result = await createTrip(data);
    if (result.success && result.data) {
      toast.success("Trip created!");
      router.push(`/trips/${result.data.id}`);
    } else {
      toast.error(result.error ?? "Failed to create trip");
    }
  }

  async function handleNext() {
    if (step === 0) {
      const valid = await form.trigger([
        "title",
        "startLocation",
        "startDate",
        "numPeople",
      ]);
      if (!valid) return;
    }
    // step 1 (transport mode) — no required validation, skip ahead
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else form.handleSubmit(handleFinalSubmit)();
  }

  const values = form.watch();

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">New Trip</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2",
                i < step
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === step
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:block",
                i === step ? "font-medium" : "text-muted-foreground"
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px w-8 bg-border sm:w-16" />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form className="space-y-4">
          {/* Step 0 — Trip Details */}
          {step === 0 && (
            <>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Goa Road Trip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startLocation"
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
                  name="endLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input placeholder="Goa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="numPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of People *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Weekend getaway..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Packing list, reminders..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Step 1 — Transport Mode */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose the primary mode of transport for this trip. You can skip
                this and change it later.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {MODE_OPTIONS.map(({ value, label, icon: Icon, color }) => {
                  const selected = values.primaryMode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        form.setValue(
                          "primaryMode",
                          selected ? null : value
                        )
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all active:scale-[0.97]",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/40 hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          color
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {label}
                      </span>
                      {selected && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Assign Wallets */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select wallets to associate with this trip. Balance snapshots
                will be captured at start and end.
              </p>
              {wallets.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No wallets available. You can add wallets later from the
                  Wallets page.
                </p>
              ) : (
                wallets.map((w) => {
                  const checked = values.walletIds?.includes(w.id) ?? false;
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={`wallet-${w.id}`}
                        checked={checked}
                        onCheckedChange={(c) => {
                          const current = form.getValues("walletIds") ?? [];
                          if (c) {
                            form.setValue("walletIds", [...current, w.id]);
                          } else {
                            form.setValue(
                              "walletIds",
                              current.filter((id) => id !== w.id)
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`wallet-${w.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="font-medium">{w.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {w.type.replace(/_/g, " ")}
                        </span>
                      </Label>
                      <span className="text-sm font-medium">
                        {formatRupees(w.balancePaise)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium">{values.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">People</p>
                    <p className="font-medium">{values.numPeople}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">{values.startLocation}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">To</p>
                    <p className="font-medium">{values.endLocation || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{values.startDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">{values.endDate || "—"}</p>
                  </div>
                </div>
                {values.description && (
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p className="font-medium">{values.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Transport Mode</p>
                  <p className="font-medium">
                    {values.primaryMode
                      ? MODE_OPTIONS.find((m) => m.value === values.primaryMode)
                          ?.label ?? values.primaryMode
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Wallets</p>
                  {values.walletIds?.length ? (
                    <p className="font-medium">
                      {values.walletIds
                        .map(
                          (id) =>
                            wallets.find((w) => w.id === id)?.name ?? id
                        )
                        .join(", ")}
                    </p>
                  ) : (
                    <p className="font-medium text-muted-foreground">None</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() =>
            step === 0 ? router.push("/trips") : setStep((s) => s - 1)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={handleNext}
          disabled={form.formState.isSubmitting}
        >
          {step === STEPS.length - 1 ? (
            form.formState.isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Create Trip
              </>
            )
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
