import { z } from "zod";

export const TRANSPORT_MODES = [
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
] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const tripSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  numPeople: z.coerce
    .number()
    .int()
    .min(1, "At least 1 person")
    .max(100)
    .default(1),
  notes: z.string().optional().or(z.literal("")),
  walletIds: z.array(z.string().uuid()).optional().default([]),
  primaryMode: z.enum(TRANSPORT_MODES).optional().nullable(),
});

export type TripFormValues = z.infer<typeof tripSchema>;
