import { z } from "zod";

export const expenseSchema = z.object({
  tripId: z.string().uuid(),
  segmentId: z.string().uuid().optional().nullable().or(z.literal("")),
  category: z.enum([
    "TRANSPORT",
    "FOOD",
    "STAY",
    "FUEL",
    "CHARGING",
    "TOLL",
    "PARKING",
    "MISC",
  ]),
  subcategory: z
    .enum([
      "FLIGHT_TICKET",
      "TRAIN_TICKET",
      "BUS_TICKET",
      "TAXI_FARE",
      "AUTO_FARE",
      "FERRY_TICKET",
      "METRO_TICKET",
      "CABLE_CAR",
      "BREAKFAST",
      "LUNCH",
      "DINNER",
      "SNACK",
      "DRINKS",
      "CAFE",
      "HOTEL",
      "HOSTEL",
      "AIRBNB",
      "RESORT",
      "CAMP",
      "GUESTHOUSE",
      "PETROL",
      "DIESEL",
      "CNG",
      "EV_CHARGING",
      "ENTRY_FEE",
      "INTERNET",
      "SIM_CARD",
      "SHOPPING",
      "MEDICAL",
      "LUGGAGE",
      "TIPS",
      "INSURANCE",
      "VISA",
      "OTHER",
    ])
    .optional()
    .nullable(),
  paymentMethod: z.enum([
    "WALLET",
    "CASH",
    "UPI",
    "CARD",
    "PREPAID",
    "BANK_TRANSFER",
  ]),
  walletId: z.string().uuid().optional().nullable().or(z.literal("")),
  amountRupees: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional().or(z.literal("")),
  vendorName: z.string().optional().or(z.literal("")),
  numPeople: z.coerce.number().int().min(1).default(1),
  // Food
  mealType: z
    .enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "DRINKS"])
    .optional()
    .nullable(),
  // Stay
  checkInDate: z.string().optional().or(z.literal("")),
  checkOutDate: z.string().optional().or(z.literal("")),
  numNights: z.coerce.number().int().min(1).optional().nullable(),
  roomType: z.string().optional().or(z.literal("")),
  // Fuel
  litresAdded: z.coerce.number().positive().optional().nullable(),
  fuelStationName: z.string().optional().or(z.literal("")),
  // Charging
  kwhAdded: z.coerce.number().positive().optional().nullable(),
  chargerName: z.string().optional().or(z.literal("")),
  // Toll
  tollName: z.string().optional().or(z.literal("")),
  // Transport
  ticketRef: z.string().optional().or(z.literal("")),
  carrierName: z.string().optional().or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
