import { z } from "zod";

export const vehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["EV", "ICE", "HYBRID"]),
  make: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  registrationNumber: z.string().optional().or(z.literal("")),
  batteryCapacityKwh: z.coerce.number().positive().optional().nullable(),
  fuelType: z.enum(["PETROL", "DIESEL", "CNG", "LPG"]).optional().nullable(),
  tankCapacityLitres: z.coerce.number().positive().optional().nullable(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
