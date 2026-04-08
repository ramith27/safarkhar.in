CREATE TYPE "public"."expense_category" AS ENUM('TRANSPORT', 'FOOD', 'STAY', 'FUEL', 'CHARGING', 'TOLL', 'PARKING', 'MISC');--> statement-breakpoint
CREATE TYPE "public"."expense_subcategory" AS ENUM('FLIGHT_TICKET', 'TRAIN_TICKET', 'BUS_TICKET', 'TAXI_FARE', 'AUTO_FARE', 'FERRY_TICKET', 'METRO_TICKET', 'CABLE_CAR', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DRINKS', 'CAFE', 'HOTEL', 'HOSTEL', 'AIRBNB', 'RESORT', 'CAMP', 'GUESTHOUSE', 'PETROL', 'DIESEL', 'CNG', 'EV_CHARGING', 'ENTRY_FEE', 'INTERNET', 'SIM_CARD', 'SHOPPING', 'MEDICAL', 'LUGGAGE', 'TIPS', 'INSURANCE', 'VISA', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('PETROL', 'DIESEL', 'CNG', 'LPG');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DRINKS');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('WALLET', 'CASH', 'UPI', 'CARD', 'PREPAID', 'BANK_TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."ticket_class" AS ENUM('ECONOMY', 'BUSINESS', 'FIRST', 'SLEEPER', 'AC_3T', 'AC_2T', 'AC_1T', 'CHAIR_CAR', 'GENERAL', 'PREMIUM_ECONOMY');--> statement-breakpoint
CREATE TYPE "public"."transport_mode" AS ENUM('PERSONAL_VEHICLE', 'FLIGHT', 'TRAIN', 'BUS', 'TAXI', 'AUTO', 'FERRY', 'METRO', 'WALK', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('EV', 'ICE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."wallet_tx_ref_type" AS ENUM('TOP_UP', 'TRIP_EXPENSE', 'MANUAL_ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."wallet_tx_type" AS ENUM('CREDIT', 'DEBIT');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('FASTAG', 'EV_CHARGER', 'FUEL_CARD', 'TRAVEL_CARD', 'AIRLINE_WALLET', 'TRAIN_WALLET', 'TAXI_WALLET', 'GENERAL');--> statement-breakpoint
CREATE TABLE "segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"sequence_number" integer DEFAULT 0 NOT NULL,
	"transport_mode" "transport_mode" NOT NULL,
	"from_location" text NOT NULL,
	"to_location" text,
	"start_time" text,
	"end_time" text,
	"distance_km" real,
	"vehicle_id" uuid,
	"start_odometer" integer,
	"end_odometer" integer,
	"start_battery_pct" real,
	"end_battery_pct" real,
	"start_fuel_level_litres" real,
	"end_fuel_level_litres" real,
	"carrier_name" text,
	"service_number" text,
	"ticket_class" "ticket_class",
	"pnr" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"segment_id" uuid,
	"category" "expense_category" NOT NULL,
	"subcategory" "expense_subcategory",
	"payment_method" "payment_method" DEFAULT 'CASH' NOT NULL,
	"wallet_id" uuid,
	"amount_paise" integer NOT NULL,
	"description" text,
	"vendor_name" text,
	"num_people" integer DEFAULT 1 NOT NULL,
	"meal_type" "meal_type",
	"check_in_date" text,
	"check_out_date" text,
	"num_nights" integer,
	"room_type" text,
	"litres_added" real,
	"fuel_station_name" text,
	"kwh_added" real,
	"charger_name" text,
	"toll_name" text,
	"ticket_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"balance_at_start_paise" integer NOT NULL,
	"balance_at_end_paise" integer
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_location" text NOT NULL,
	"end_location" text,
	"status" "trip_status" DEFAULT 'PLANNING' NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"total_cost_paise" integer DEFAULT 0 NOT NULL,
	"num_people" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"make" text,
	"model" text,
	"registration_number" text,
	"battery_capacity_kwh" real,
	"fuel_type" "fuel_type",
	"tank_capacity_litres" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount_paise" integer NOT NULL,
	"type" "wallet_tx_type" NOT NULL,
	"reference_type" "wallet_tx_ref_type" NOT NULL,
	"reference_id" uuid,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "wallet_type" DEFAULT 'GENERAL' NOT NULL,
	"balance_paise" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"vehicle_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_wallets" ADD CONSTRAINT "trip_wallets_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_wallets" ADD CONSTRAINT "trip_wallets_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;