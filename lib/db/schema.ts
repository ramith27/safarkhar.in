import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const vehicleTypeEnum = pgEnum("vehicle_type", ["EV", "ICE", "HYBRID"]);
export const fuelTypeEnum = pgEnum("fuel_type", [
  "PETROL",
  "DIESEL",
  "CNG",
  "LPG",
]);

export const walletTypeEnum = pgEnum("wallet_type", [
  "FASTAG",
  "EV_CHARGER",
  "FUEL_CARD",
  "TRAVEL_CARD",
  "AIRLINE_WALLET",
  "TRAIN_WALLET",
  "TAXI_WALLET",
  "GENERAL",
]);

export const walletTxTypeEnum = pgEnum("wallet_tx_type", ["CREDIT", "DEBIT"]);
export const walletTxRefTypeEnum = pgEnum("wallet_tx_ref_type", [
  "TOP_UP",
  "TRIP_EXPENSE",
  "MANUAL_ADJUSTMENT",
]);

export const tripStatusEnum = pgEnum("trip_status", [
  "PLANNING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const transportModeEnum = pgEnum("transport_mode", [
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
]);

export const ticketClassEnum = pgEnum("ticket_class", [
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
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "TRANSPORT",
  "FOOD",
  "STAY",
  "FUEL",
  "CHARGING",
  "TOLL",
  "PARKING",
  "MISC",
]);

export const expenseSubcategoryEnum = pgEnum("expense_subcategory", [
  // Transport
  "FLIGHT_TICKET",
  "TRAIN_TICKET",
  "BUS_TICKET",
  "TAXI_FARE",
  "AUTO_FARE",
  "FERRY_TICKET",
  "METRO_TICKET",
  "CABLE_CAR",
  // Food
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
  "DRINKS",
  "CAFE",
  // Stay
  "HOTEL",
  "HOSTEL",
  "AIRBNB",
  "RESORT",
  "CAMP",
  "GUESTHOUSE",
  // Fuel / Charging
  "PETROL",
  "DIESEL",
  "CNG",
  "EV_CHARGING",
  // Misc
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
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "WALLET",
  "CASH",
  "UPI",
  "CARD",
  "PREPAID",
  "BANK_TRANSFER",
]);

export const mealTypeEnum = pgEnum("meal_type", [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
  "DRINKS",
]);

// ─── Tables ────────────────────────────────────────────────────────────────────

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: vehicleTypeEnum("type").notNull(),
  make: text("make"),
  model: text("model"),
  registrationNumber: text("registration_number"),
  batteryCapacityKwh: real("battery_capacity_kwh"),
  fuelType: fuelTypeEnum("fuel_type"),
  tankCapacityLitres: real("tank_capacity_litres"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: walletTypeEnum("type").notNull().default("GENERAL"),
  balancePaise: integer("balance_paise").notNull().default(0),
  currency: text("currency").notNull().default("INR"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  amountPaise: integer("amount_paise").notNull(),
  type: walletTxTypeEnum("type").notNull(),
  referenceType: walletTxRefTypeEnum("reference_type").notNull(),
  referenceId: uuid("reference_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location"),
  status: tripStatusEnum("status").notNull().default("PLANNING"),
  startDate: text("start_date").notNull(), // ISO date string YYYY-MM-DD
  endDate: text("end_date"),
  totalCostPaise: integer("total_cost_paise").notNull().default(0),
  numPeople: integer("num_people").notNull().default(1),
  notes: text("notes"),
  primaryMode: transportModeEnum("primary_mode"),
  // Initial vehicle checkpoint (captured when starting the trip)
  initialOdometerKm: integer("initial_odometer_km"),
  initialBatteryPct: real("initial_battery_pct"),
  initialDisplayedRangeKm: real("initial_displayed_range_km"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripWallets = pgTable("trip_wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  balanceAtStartPaise: integer("balance_at_start_paise").notNull(),
  balanceAtEndPaise: integer("balance_at_end_paise"),
});

export const segments = pgTable("segments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  sequenceNumber: integer("sequence_number").notNull().default(0),
  transportMode: transportModeEnum("transport_mode").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location"),
  startTime: text("start_time"), // ISO datetime string
  endTime: text("end_time"),
  distanceKm: real("distance_km"),
  // Personal vehicle fields
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  startOdometer: integer("start_odometer"),
  endOdometer: integer("end_odometer"),
  startBatteryPct: real("start_battery_pct"),
  endBatteryPct: real("end_battery_pct"),
  startFuelLevelLitres: real("start_fuel_level_litres"),
  endFuelLevelLitres: real("end_fuel_level_litres"),
  displayedRangeKm: real("displayed_range_km"), // car display range at end of this event
  stopType: text("stop_type"), // null = driving leg; 'CHARGING'|'FUEL'|'FOOD'|'STAY'|'REST'|'OTHER' = stop
  // Carrier-based fields
  carrierName: text("carrier_name"),
  serviceNumber: text("service_number"), // flight no, train no, bus/ferry route
  ticketClass: ticketClassEnum("ticket_class"),
  pnr: text("pnr"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tripExpenses = pgTable("trip_expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  segmentId: uuid("segment_id").references(() => segments.id, {
    onDelete: "set null",
  }),
  category: expenseCategoryEnum("category").notNull(),
  subcategory: expenseSubcategoryEnum("subcategory"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("CASH"),
  walletId: uuid("wallet_id").references(() => wallets.id, {
    onDelete: "set null",
  }),
  amountPaise: integer("amount_paise").notNull(),
  description: text("description"),
  vendorName: text("vendor_name"),
  numPeople: integer("num_people").notNull().default(1),
  // FOOD
  mealType: mealTypeEnum("meal_type"),
  // STAY
  checkInDate: text("check_in_date"),
  checkOutDate: text("check_out_date"),
  numNights: integer("num_nights"),
  roomType: text("room_type"),
  // FUEL
  litresAdded: real("litres_added"),
  fuelStationName: text("fuel_station_name"),
  // CHARGING
  kwhAdded: real("kwh_added"),
  chargerName: text("charger_name"),
  // TOLL
  tollName: text("toll_name"),
  // TRANSPORT
  ticketRef: text("ticket_ref"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  wallets: many(wallets),
  segments: many(segments),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [wallets.vehicleId],
    references: [vehicles.id],
  }),
  transactions: many(walletTransactions),
  tripWallets: many(tripWallets),
  expenses: many(tripExpenses),
}));

export const walletTransactionsRelations = relations(
  walletTransactions,
  ({ one }) => ({
    wallet: one(wallets, {
      fields: [walletTransactions.walletId],
      references: [wallets.id],
    }),
  })
);

export const tripsRelations = relations(trips, ({ many }) => ({
  tripWallets: many(tripWallets),
  segments: many(segments),
  expenses: many(tripExpenses),
}));

export const tripWalletsRelations = relations(tripWallets, ({ one }) => ({
  trip: one(trips, { fields: [tripWallets.tripId], references: [trips.id] }),
  wallet: one(wallets, {
    fields: [tripWallets.walletId],
    references: [wallets.id],
  }),
}));

export const segmentsRelations = relations(segments, ({ one, many }) => ({
  trip: one(trips, { fields: [segments.tripId], references: [trips.id] }),
  vehicle: one(vehicles, {
    fields: [segments.vehicleId],
    references: [vehicles.id],
  }),
  expenses: many(tripExpenses),
}));

export const tripExpensesRelations = relations(tripExpenses, ({ one }) => ({
  trip: one(trips, { fields: [tripExpenses.tripId], references: [trips.id] }),
  segment: one(segments, {
    fields: [tripExpenses.segmentId],
    references: [segments.id],
  }),
  wallet: one(wallets, {
    fields: [tripExpenses.walletId],
    references: [wallets.id],
  }),
}));

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type TripWallet = typeof tripWallets.$inferSelect;
export type NewTripWallet = typeof tripWallets.$inferInsert;
export type Segment = typeof segments.$inferSelect;
export type NewSegment = typeof segments.$inferInsert;
export type TripExpense = typeof tripExpenses.$inferSelect;
export type NewTripExpense = typeof tripExpenses.$inferInsert;
