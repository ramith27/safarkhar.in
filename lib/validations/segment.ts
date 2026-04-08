import { z } from "zod";

export const segmentSchema = z.object({
  tripId: z.string().uuid(),
  transportMode: z.enum([
    "PERSONAL_VEHICLE",
    "FLIGHT",
    "TRAIN",
    "BUS",
    "TAXI",
    "AUTO",
    "FERRY",
    "METRO",
    "WALK",
    "OTHER",
  ]),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().optional().or(z.literal("")),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal("")),
  distanceKm: z.coerce.number().positive().optional().nullable(),
  // Personal vehicle
  vehicleId: z.string().uuid().optional().nullable().or(z.literal("")),
  startOdometer: z.coerce.number().int().min(0).optional().nullable(),
  endOdometer: z.coerce.number().int().min(0).optional().nullable(),
  startBatteryPct: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  endBatteryPct: z.coerce.number().min(0).max(100).optional().nullable(),
  startFuelLevelLitres: z.coerce.number().min(0).optional().nullable(),
  endFuelLevelLitres: z.coerce.number().min(0).optional().nullable(),
  displayedRangeKm: z.coerce.number().min(0).optional().nullable(),
  stopType: z
    .enum(["CHARGING", "FUEL", "FOOD", "STAY", "REST", "OTHER"])
    .optional()
    .nullable(),
  // Carrier
  carrierName: z.string().optional().or(z.literal("")),
  serviceNumber: z.string().optional().or(z.literal("")),
  ticketClass: z
    .enum([
      "ECONOMY",
      "BUSINESS",
      "FIRST",
      "SLEEPER",
      "AC_3T",
      "AC_2T",
      "AC_1T",
      "CHAIR_CAR",
      "GENERAL",
      "PREMIUM_ECONOMY",
    ])
    .optional()
    .nullable(),
  pnr: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type SegmentFormValues = z.infer<typeof segmentSchema>;
