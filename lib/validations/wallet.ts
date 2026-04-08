import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "FASTAG",
    "EV_CHARGER",
    "FUEL_CARD",
    "TRAVEL_CARD",
    "AIRLINE_WALLET",
    "TRAIN_WALLET",
    "TAXI_WALLET",
    "GENERAL",
  ]),
  vehicleId: z.string().uuid().optional().nullable().or(z.literal("")),
});

export type WalletFormValues = z.infer<typeof walletSchema>;

export const topUpSchema = z.object({
  amountRupees: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(1, "Minimum top-up is ₹1"),
  description: z.string().optional().or(z.literal("")),
});

export type TopUpFormValues = z.infer<typeof topUpSchema>;
